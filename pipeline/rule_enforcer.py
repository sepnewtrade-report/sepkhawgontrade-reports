# -*- coding: utf-8 -*-
"""
SepKhawGonTrade Rule Enforcer & Auto-Corrector
Enforces branding, sanitizes video scripts cues, verifies prices against live data, 
checks for overlaps, and ensures information sourcing in reports.
"""

import sys
import os
import re
import json
import argparse
from datetime import datetime
import yfinance as yf

# Excluded keywords that match ticker patterns but are technical terms or organizations
EXCLUDED_TICKERS = {
    'RSI', 'EMA', 'MACD', 'FED', 'CPI', 'PPI', 'NFP', 'ADP', 'PCE', 'ISM', 'PMI', 'JOLTS',
    'USD', 'GDP', 'FOMC', 'SEC', 'ETF', 'USA', 'PE', 'EPS', 'CEO', 'IPO', 'AI', 'NYSE', 'AMEX', 
    'BATS', 'VWAP', 'SMA', 'WACC', 'THB', 'EUR', 'GBP', 'JPY', 'CNY', 'BLS',
    'NASDAQ', 'SPY', 'QQQ', 'DIA', 'IWM', 'QC', 'XLE', 'FCF', 'ROI',
    'IV', 'P', 'C', 'ITM', 'OTM', 'ATM', 'ATH', 'ATL', 'T', 'Q', 'Y', 'M',
    'AIP', 'FAA', 'GPU', 'CME', 'COMEX', 'NYMEX', 'ICE', 'CBOE', 'EIA', 'IEA', 'ECB', 'BOJ', 'BOE',
    'ARPAC', 'GMV', 'ARR', 'BMO', 'AMC', 'EUV', 'HBM', 'NPL', 'X', 'ATS', 'WGC', 'GDX', 'GDXJ', 'DXY', 'ICT', 'OI', 'COT', 'AEM', 'KGC', 'AU', 'SGE', 'LBMA', 'GOLD', 'PBOC', 'RBI', 'CROSS', 'FINAL', 'MEGA', 'TOP', 'RISK', 'SMART', 'IAM', 'WHAT', 'BIG', 'SAAR'
}

TICKER_MAP = {
    "DJIA": "^DJI",
    "DXY": "DX-Y.NYB",
    "VIX": "^VIX",
    "SPX": "^GSPC",
    "NDX": "^IXIC",
    "RUT": "^RUT",
    "BTC": "BTC-USD",
    "OIL": "BZ=F",
    "WTI": "CL=F",
    "BRENT": "BZ=F",
}

def extract_tickers(content):
    """
    Extracts potential stock tickers from markdown text.
    """
    candidates = set()
    # 1. Parentheses: (NVDA)
    candidates.update(re.findall(r'\(([A-Z]{1,5})\)', content))
    # 2. Table columns: | NVDA | or | **NVDA** |
    candidates.update(re.findall(r'\|\s*\**\*?([A-Z]{1,5})\**\*?\s*\|', content))
    # 3. Bold tickers: **NVDA**
    candidates.update(re.findall(r'\*\*([A-Z]{1,5})\*\*', content))
    # 4. Heading patterns: ### 1. NVDA or ### NVDA
    candidates.update(re.findall(r'###\s*(?:\d+\.\s*)?([A-Z]{1,5})\b', content))
    
    return sorted(list({t for t in candidates if t not in EXCLUDED_TICKERS}))

def get_live_data(ticker):
    """
    Fetches real-time price and daily change percentage from yfinance.
    Calculates percentage change relative to previous close (not open price).
    """
    yf_symbol = TICKER_MAP.get(ticker.upper(), ticker)
    try:
        t = yf.Ticker(yf_symbol)
        info = t.info or {}
        price = info.get("currentPrice") or info.get("regularMarketPrice")
        prev_close = info.get("previousClose") or info.get("regularMarketPreviousClose")
        change_pct = info.get("regularMarketChangePercent")
        
        # Fallback to 5-day history if info is missing fields
        if price is None or prev_close is None or change_pct is None:
            hist = t.history(period="5d")
            if len(hist) >= 1:
                price = price or hist["Close"].iloc[-1]
                if len(hist) >= 2:
                    prev_close = prev_close or hist["Close"].iloc[-2]
                    if prev_close and prev_close != 0:
                        change_pct = ((price - prev_close) / prev_close) * 100.0
                elif "Open" in hist and hist["Open"].iloc[-1] != 0:
                    change_pct = ((price - hist["Open"].iloc[-1]) / hist["Open"].iloc[-1]) * 100.0
                    
        if price is not None:
            return {
                "price": float(price),
                "change_pct": float(change_pct) if change_pct is not None else 0.0
            }
    except Exception as e:
        print(f"Error fetching live data for {ticker} ({yf_symbol}): {e}")
    return None

def enforce_branding(content):
    """
    Ensures the channel logo is at the very beginning of the file with proper spacing.
    """
    logo_tag = '<p align="center"><img src="Logo master.png" alt="SepKhawGonTrade Logo" width="150" /></p>'
    stripped = content.strip()
    modified = False
    
    if not stripped.startswith(logo_tag):
        # Remove any existing instance of the logo tag to avoid duplicate copies
        clean_content = content.replace(logo_tag, "")
        content = f"{logo_tag}\n\n" + clean_content.strip() + "\n"
        modified = True
    else:
        # Standardize whitespace after logo tag
        pattern = r"^" + re.escape(logo_tag) + r"\s*\n+"
        new_content = re.sub(pattern, logo_tag + "\n\n", stripped)
        if new_content != content:
            content = new_content
            modified = True
            
    return content, modified

def sanitize_script_tags(content):
    """
    Strips out video directions, speaking times, and speaker labels.
    """
    modified = False
    
    # 1. Remove speak times: *(เวลาแนะนำ: ...)* or [เวลาแนะนำ: ...]
    time_patterns = [
        r'\*?\(\s*เวลาแนะนำ:\s*[^)]*\s*\)\*?',
        r'\*?\[\s*เวลาแนะนำ:\s*[^\]]*\s*\]\*?',
        r'\*?เวลาแนะนำ:\s*\d+:\d+\s*\*?',
    ]
    for pattern in time_patterns:
        new_content, count = re.subn(pattern, "", content, flags=re.IGNORECASE)
        if count > 0:
            content = new_content
            modified = True
            
    # 2. Remove speaker / script tags: e.g. **บทพูด:** or **Host:** or **ผู้ดำเนินรายการ:**
    script_tags = [
        r'\*\*บทพูด:\*\*', r'\*\*บทพูด\*\*:',
        r'\*\*ผู้ดำเนินรายการ:\*\*', r'\*\*ผู้ดำเนินรายการ\*\*:',
        r'\*\*Host:\*\*', r'\*\*Host\*\*:',
        r'\*\*Presenter:\*\*', r'\*\*Presenter\*\*:',
        r'\*\*พิธีกร:\*\*', r'\*\*พิธีกร\*\*:',
    ]
    for pattern in script_tags:
        new_content, count = re.subn(pattern, "", content, flags=re.IGNORECASE)
        if count > 0:
            content = new_content
            modified = True
            
    # 3. Remove general brackets that contain camera directions, but keep [ที่มา: ...] and reference tags like [1]
    bracket_pattern = r'(\*\*?\[([^\]]+)\]\*\*?)'
    direction_keywords = [
        "กล้อง", "พูด", "บรรยาย", "ซูม", "ภาพ", "ขึ้นตัวอักษร", "สไลด์", 
        "กราฟิก", "ตัดภาพ", "แสดงภาพ", "หัวเราะ", "ยิ้ม", "จ้องกล้อง", 
        "พยักหน้า", "มือ", "ทำท่าทาง", "ทำท่า"
    ]
    
    def bracket_replacer(match):
        full_match = match.group(1)
        inside_text = match.group(2)
        if any(kw in inside_text for kw in direction_keywords):
            return ""  # Remove
        return full_match  # Keep
        
    new_content, count = re.subn(bracket_pattern, bracket_replacer, content)
    if count > 0:
        content = new_content
        modified = True
        
    return content, modified

def update_tables(content, ticker, live_data):
    """
    Updates price and change percentage for a ticker if present in markdown tables.
    Uses table header inspection to avoid corrupting non-price columns (RSI, Short Interest, P/E, etc.).
    """
    price = live_data["price"]
    change_pct = live_data["change_pct"]
    change_str = f"+{change_pct:.2f}%" if change_pct >= 0 else f"{change_pct:.2f}%"
    
    modified = False
    lines = content.split("\n")
    
    for i, line in enumerate(lines):
        if "|" in line and ticker in line:
            cols = [c.strip() for c in line.split("|")]
            if len(cols) >= 3:
                ticker_idx = -1
                for idx, col in enumerate(cols):
                    clean_col = col.replace("**", "").replace("*", "").strip()
                    if ticker == clean_col:
                        ticker_idx = idx
                        break
                        
                if ticker_idx != -1:
                    # Find header line above this table
                    header_cols = []
                    for h_idx in range(i - 1, -1, -1):
                        h_line = lines[h_idx]
                        if "|" in h_line and not h_line.strip().startswith("|---") and not h_line.strip().startswith("| :---"):
                            header_cols = [c.strip().lower() for c in h_line.split("|")]
                            break
                        if not h_line.strip().startswith("|") and h_line.strip() != "":
                            break
                            
                    row_modified = False
                    for idx in range(ticker_idx + 1, len(cols)):
                        col_val = cols[idx]
                        col_header = header_cols[idx] if idx < len(header_cols) else ""
                        
                        # Skip RSI, Short Interest, Days, Volume, P/E, Score, Market Cap, IV, Prob of ITM, etc.
                        skip_keywords = ["rsi", "short", "day", "days", "cover", "vol", "volume", "cap", "score", "p/e", "pe", "target", "sl", "tp", "stop", "iv", "implied", "prob", "itm", "decay", "theta", "delta", "greeks", "strike", "premium", "type"]
                        if any(kw in col_header for kw in skip_keywords):
                            continue
                            
                        # Price column match (e.g., ราคาล่าสุด, ราคาหุ้น, Current Price)
                        price_keywords = ["ราคาล่าสุด", "ราคาหุ้น", "current price", "ราคาปิด"]
                        if any(kw in col_header for kw in price_keywords):
                            if re.match(r'^\$?\d+(?:\.\d+)?$', col_val) or col_val.startswith("$") or col_val.strip().upper() in ["N/A", "NA", "-", "NONE", "NULL", ""]:
                                cols[idx] = f"${price:.2f}"
                                row_modified = True
                                
                        # Change % column match (e.g., การเปลี่ยนแปลง, % Change)
                        change_keywords = ["การเปลี่ยนแปลง", "change %", "% change"]
                        if any(kw in col_header for kw in change_keywords) and not any(kw in col_header for kw in ["short", "float", "interest", "rsi", "iv", "implied", "prob", "itm"]):
                            if re.match(r'^[+-]?\d+(?:\.\d+)?%?$', col_val) or col_val.endswith("%") or col_val.strip().upper() in ["N/A", "NA", "-", "NONE", "NULL", ""]:
                                cols[idx] = change_str
                                row_modified = True
                                
                    if row_modified:
                        lines[i] = " | ".join(cols)
                        modified = True
                        
    if modified:
        return "\n".join(lines), True
    return content, False


def update_text_block_prices(content, ticker, live_data):
    """
    Updates prices and percentages in descriptive list blocks under ticker sections.
    """
    price = live_data["price"]
    change_pct = live_data["change_pct"]
    change_str = f"+{change_pct:.2f}%" if change_pct >= 0 else f"{change_pct:.2f}%"
    modified = False
    
    lines = content.split('\n')
    ticker_pattern = re.compile(rf'\b{ticker}\b')
    
    i = 0
    while i < len(lines):
        if ticker_pattern.search(lines[i]):
            # Scan forward until the next heading or horizontal rule
            for j in range(i + 1, len(lines)):
                sub_line = lines[j]
                # Break if we hit a new section, another heading, or a horizontal rule
                if sub_line.startswith('### ') or sub_line.startswith('## ') or sub_line.startswith('---'):
                    if not ticker_pattern.search(sub_line):
                        break
                
                price_patterns = [
                    (r'^(\s*-\s*\*\*ราคาปัจจุบัน\s*(?:\(อ้างอิง[^)]*\))?:\*\*\s*\$?)\d+(?:\.\d+)?', r'\g<1>' + f"{price:.2f}"),
                    (r'^(\s*-\s*\*\*ราคาล่าสุด\s*(?:\(อ้างอิง[^)]*\))?:\*\*\s*\$?)\d+(?:\.\d+)?', r'\g<1>' + f"{price:.2f}"),
                    (r'^(\s*-\s*\*\*ราคา\s*(?:\(อ้างอิง[^)]*\))?:\*\*\s*\$?)\d+(?:\.\d+)?', r'\g<1>' + f"{price:.2f}"),
                ]
                
                for pat, repl in price_patterns:
                    new_line, count = re.subn(pat, repl, sub_line)
                    if count > 0:
                        lines[j] = new_line
                        modified = True
                        break
                
                pct_pattern = r'^(\s*-\s*\*\*%\s*การเปลี่ยนแปลง(?:ใน\s*Pre-Market|ราคา)?:\*\*\s*)([+-]?\d+(?:\.\d+)?%?)'
                new_line, count = re.subn(pct_pattern, r'\g<1>' + change_str, lines[j])
                if count > 0:
                    lines[j] = new_line
                    modified = True
                else:
                    desc_pattern = r'^(\s*-\s*\*\*%\s*การเปลี่ยนแปลง(?:ใน\s*Pre-Market|ราคา)?:\*\*\s*)([^\n\[]+)'
                    match = re.search(desc_pattern, lines[j])
                    if match:
                        text_val = match.group(2).strip()
                        if not re.match(r'^[+-]?\d+(?:\.\d+)?%', text_val):
                            lines[j] = re.sub(desc_pattern, r'\g<1>' + change_str + f" ({text_val})", lines[j])
                            modified = True
        i += 1
        
    if modified:
        return "\n".join(lines), True
    return content, False

def enforce_sourcing(content):
    """
    Ensures that a Sources section is present at the end of the file.
    """
    modified = False
    if "## 🌐 แหล่งข้อมูลอ้างอิง" not in content and "## Sources" not in content:
        content = content.strip() + "\n\n---\n\n## 🌐 แหล่งข้อมูลอ้างอิง (Sources)\n- [Yahoo Finance](https://finance.yahoo.com/)\n- [TradingView](https://www.tradingview.com/)\n"
        modified = True
    return content, modified

def process_file(file_path, auto_correct=True):
    """
    Processes a single file to enforce all rules.
    """
    if not os.path.exists(file_path):
        print(f"Error: File not found at {file_path}")
        return False, []
        
    print(f"\n[Rule Enforcer] Processing file: {os.path.basename(file_path)}")
    
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    original_content = content
    errors = []
    
    # 1. Branding check
    content, brand_mod = enforce_branding(content)
    if brand_mod:
        errors.append("Branding/Logo was missing or formatted incorrectly.")
        
    # 2. Script cues check
    content, script_mod = sanitize_script_tags(content)
    if script_mod:
        errors.append("Banned YouTube script cues or camera instructions were removed.")
        
    # 3. Sources block check
    content, source_mod = enforce_sourcing(content)
    if source_mod:
        errors.append("Information Sourcing section was missing and added.")
        
    # 4. Tickers and Prices check
    tickers = extract_tickers(content)
    if tickers:
        print(f"Found tickers for price verification: {tickers}")
        for ticker in tickers:
            live_data = get_live_data(ticker)
            if live_data:
                print(f"  - {ticker}: Live Price = ${live_data['price']:.2f}, Daily Change = {live_data['change_pct']:.2f}%")
                # Update tables
                content, tab_mod = update_tables(content, ticker, live_data)
                # Update text blocks
                content, txt_mod = update_text_block_prices(content, ticker, live_data)
                # Fix nan% HV
                if "nan%" in content and ticker in content:
                    try:
                        import yfinance as yf, numpy as np, math
                        h_hv = yf.Ticker(ticker).history(period="2mo")['Close'].dropna()
                        if len(h_hv) >= 15:
                            log_r = np.log(h_hv / h_hv.shift(1)).dropna()
                            val = float(log_r.std() * np.sqrt(252) * 100.0)
                            if not math.isnan(val) and val > 0:
                                content = re.sub(rf'({ticker}.*?HV 30 วัน\): )\s*nan%', rf'\g<1>{val:.1f}%', content, flags=re.DOTALL)
                                content = content.replace("HV 30 วัน): nan%", f"HV 30 วัน): {val:.1f}%")
                    except Exception:
                        pass
                
                if tab_mod or txt_mod:
                    errors.append(f"Prices/percentage metrics for ticker {ticker} were updated to live values.")
            else:
                print(f"  - {ticker}: Warning - Could not retrieve live data for verification.")
                
    # Save file back if modified and auto-correct is True
    if content != original_content:
        if auto_correct:
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"Successfully auto-corrected rules for: {os.path.basename(file_path)}")
        else:
            print(f"Rule violations found in {os.path.basename(file_path)} (Check-only mode).")
        return True, errors
        
    print(f"File {os.path.basename(file_path)} complies with all rules.")
    return False, []

def check_overlaps(date_str, folder_path):
    """
    Checks for 0% ticker overlap between Pre-Market and Viral stock analyses on the same day.
    """
    date_underscore = date_str.replace("-", "_")
    premarket_file = os.path.join(folder_path, f"us_pre_market_analysis_{date_underscore}.md")
    viral_file = os.path.join(folder_path, f"us_viral_stock_analysis_{date_underscore}.md")
    
    if not os.path.exists(premarket_file) or not os.path.exists(viral_file):
        print(f"Overlap check skipped: both reports for {date_str} must exist.")
        return []
        
    with open(premarket_file, "r", encoding="utf-8") as f:
        pre_content = f.read()
    with open(viral_file, "r", encoding="utf-8") as f:
        vir_content = f.read()
        
    pre_tickers = set(extract_tickers(pre_content))
    vir_tickers = set(extract_tickers(vir_content))
    
    overlap = pre_tickers.intersection(vir_tickers)
    if overlap:
        print(f"\n[CRITICAL OVERLAP ERROR] Found overlapping tickers for {date_str}: {overlap}")
        return list(overlap)
        
    print(f"\nOverlap check passed: 0% overlap between Pre-Market and Viral Stock reports for {date_str}.")
    return []

def main():
    parser = argparse.ArgumentParser(description="SepKhawGonTrade Rule Enforcer")
    parser.add_argument("--file", help="Absolute path to a specific markdown file to enforce rules on")
    parser.add_argument("--date", help="Target date YYYY-MM-DD to check rules and overlaps for all reports of the day")
    parser.add_argument("--check-only", action="store_true", help="Perform checks only without modifying files")
    parser.add_argument("--skip-ai-qc", action="store_true", help="Skip Groq AI Quality Audit step")
    args = parser.parse_args()
    
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    auto_correct = not args.check_only
    
    has_violations = False
    processed_files = []
    
    if args.file:
        modified, errors = process_file(args.file, auto_correct=auto_correct)
        processed_files.append(args.file)
        if modified and not auto_correct:
            has_violations = True
            print("Rule Violations:")
            for err in errors:
                print(f"  - {err}")
                
    elif args.date:
        date_str = args.date
        date_underscore = date_str.replace("-", "_")
        
        # List of potential files for the date
        report_patterns = [
            f"market_summary_{date_underscore}.md",
            f"global_market_recap_{date_underscore}.md",
            f"global_market_recap_thai_{date_underscore}.md",
            f"whale_flow_analysis_{date_underscore}.md",
            f"us_pre_market_analysis_{date_underscore}.md",
            f"us_viral_stock_analysis_{date_underscore}.md",
            f"options_screen_analysis_{date_underscore}.md",
            f"whats_next_{date_underscore}.md",
            f"short_squeeze_analysis_{date_underscore}.md",
            f"oversold_opportunity_report_{date_underscore}.md",
            f"astro_economy_weekly_{date_underscore}.md",
            f"vip_market_strategy_watchlist_{date_underscore}.md",
        ]
        
        for pattern in report_patterns:
            file_path = os.path.join(root_dir, pattern)
            if os.path.exists(file_path):
                modified, errors = process_file(file_path, auto_correct=auto_correct)
                processed_files.append(file_path)
                if modified and not auto_correct:
                    has_violations = True
                    print(f"Violations in {pattern}:")
                    for err in errors:
                        print(f"  - {err}")
                        
        # Perform cross-file overlap checks
        overlaps = check_overlaps(date_str, root_dir)
        if overlaps:
            has_violations = True
            
    else:
        print("Please provide either --file or --date parameter.")
        sys.exit(1)

    # Automatic Groq AI QC Audit step (Runs by default unless --skip-ai-qc is passed)
    if not args.skip_ai_qc and processed_files:
        try:
            try:
                from pipeline.groq_validator import audit_report_with_ai
            except ImportError:
                from groq_validator import audit_report_with_ai
            print("\n🤖 Initiating Automatic Groq AI Quality Control Audit on verified reports...")
            for fpath in processed_files:
                audit_report_with_ai(fpath)
        except Exception as e:
            print(f"⚠️ Could not execute AI QC audit: {e}")
        
    if has_violations:
        sys.exit(1)
    else:
        sys.exit(0)

if __name__ == "__main__":
    main()
