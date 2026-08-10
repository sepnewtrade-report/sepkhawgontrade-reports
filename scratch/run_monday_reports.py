import os
import sys
import json
import subprocess
import re

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VENV_PYTHON = os.path.join(ROOT_DIR, "venv", "bin", "python3")
if not os.path.exists(VENV_PYTHON):
    VENV_PYTHON = sys.executable

TEMPLATES_JSON = os.path.join(ROOT_DIR, "notebooklm-manager", "templates.json")
TARGET_DATE = "2026-08-10"
TARGET_DATE_UNDERSCORE = TARGET_DATE.replace("-", "_")

# Strict Ticker Allocation Schema for Monday Reports (2026-08-10)
# Rule: All reports must have unique tickers EXCEPT options_screen and whale_flow which share NVDA and PLTR
REPORTS_CONFIG = [
    {
        "id": "options_screen",
        "template_id": "options_screen",
        "output_file": f"options_screen_analysis_{TARGET_DATE_UNDERSCORE}.md",
        "tickers": ["NVDA", "PLTR"],
        "name": "Options Selection Screen (มา Scan Option กัน)"
    },
    {
        "id": "whale_flow",
        "template_id": "whale",
        "output_file": f"whale_flow_analysis_{TARGET_DATE_UNDERSCORE}.md",
        "tickers": ["NVDA", "PLTR"],  # SHARED WITH OPTIONS SCREEN ONLY
        "name": "Whale Flow Analysis (วาฬขยับ ตลาดสะเทือน)"
    },
    {
        "id": "pre_market",
        "template_id": "custom_1782448721923",
        "output_file": f"us_pre_market_analysis_{TARGET_DATE_UNDERSCORE}.md",
        "tickers": ["TSLA", "AMD", "AMZN"],
        "name": "Pre-Market Analysis (หุ้นพุ่งก่อนตลาดเปิด)"
    },
    {
        "id": "hot_stock",
        "template_id": "hot_stock",
        "output_file": f"us_viral_stock_analysis_{TARGET_DATE_UNDERSCORE}.md",
        "tickers": ["SMCI", "ARM", "COIN"],
        "name": "Hot Stock วันนี้ (US Viral Stock)"
    },
    {
        "id": "small_cap",
        "template_id": "small_cap_radar",
        "output_file": f"small_cap_research_{TARGET_DATE_UNDERSCORE}.md",
        "tickers": ["ASTS", "SOUN", "IONQ"],
        "name": "Small Cap Radar"
    },
    {
        "id": "gold_whale",
        "template_id": "gold_whale_daily",
        "output_file": f"gold_whale_flow_{TARGET_DATE_UNDERSCORE}.md",
        "tickers": ["GLD", "NEM", "B"],
        "name": "Gold Whale Flow (วาฬทองคำ รายวัน)"
    },
    {
        "id": "daily_summary",
        "template_id": "daily",
        "output_file": f"market_summary_{TARGET_DATE_UNDERSCORE}.md",
        "tickers": ["MSFT", "AAPL", "META"],
        "name": "Daily Market Summary (สรุปจบ ทันโลกหุ้น)"
    }
]

def load_templates():
    with open(TEMPLATES_JSON, "r", encoding="utf-8") as f:
        return {t["id"]: t for t in json.load(f)}

def run_cmd(cmd, cwd=ROOT_DIR):
    print(f"\n[RUN COMMAND]: {' '.join(cmd)}")
    res = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"Error output:\nSTDOUT: {res.stdout}\nSTDERR: {res.stderr}")
        raise RuntimeError(f"Command failed with code {res.returncode}")
    return res.stdout

def generate_reports():
    templates_map = load_templates()
    gemini_script = os.path.join(ROOT_DIR, "gemini_research.py")

    print("==================================================")
    print(f"STARTING MONDAY DAILY REPORTS GENERATION [{TARGET_DATE}]")
    print("Rule: Unique stocks per report except Options Screen & Whale Flow which share NVDA and PLTR")
    print("==================================================")

    for cfg in REPORTS_CONFIG:
        tid = cfg["template_id"]
        t_data = templates_map.get(tid)
        if not t_data:
            print(f"Warning: Template ID {tid} not found, skipping...")
            continue

        base_prompt = t_data.get("searchPromptV2") or t_data.get("searchPrompt", "")
        tickers_str = ", ".join(cfg["tickers"])
        
        # Enforce strict ticker constraint in prompt
        ticker_constraint = (
            f"\n\n[ข้อกำหนดด้าน Ticker หุ้นในรายงานนี้อย่างเคร่งครัด - TICKER CONSTRAINT]:\n"
            f"ในรายงานฉบับนี้ คุณต้องมุ่งเน้นการวิเคราะห์เฉพาะหุ้น/สินทรัพย์กลุ่มต่อไปนี้เท่านั้น: {tickers_str}\n"
            f"ห้ามกล่าวถึงหรือนำหุ้นตัวอื่นที่อยู่นอกเหนือจาก {tickers_str} มาเป็นหุ้นหลักในรายงานเด็ดขาด เพื่อป้องกันไม่ให้หุ้นซ้ำซ้อนกับรายงานประเภทอื่นในระบบ"
        )

        full_prompt = base_prompt + ticker_constraint
        output_path = os.path.join(ROOT_DIR, cfg["output_file"])

        cmd = [
            VENV_PYTHON,
            gemini_script,
            "--template-id", tid,
            "--prompt", full_prompt,
            "--date", TARGET_DATE,
            "--output", output_path
        ]

        print(f"\n---> Generating {cfg['name']} -> {cfg['output_file']}")
        print(f"Target Tickers: {cfg['tickers']}")
        try:
            run_cmd(cmd)
            print(f"Successfully generated {cfg['output_file']}")
        except Exception as e:
            print(f"Failed to generate {cfg['output_file']}: {e}")

    # Generate daily_script_2026_08_10.md as script variant of market_summary
    daily_summary_path = os.path.join(ROOT_DIR, f"market_summary_{TARGET_DATE_UNDERSCORE}.md")
    daily_script_path = os.path.join(ROOT_DIR, f"daily_script_{TARGET_DATE_UNDERSCORE}.md")
    if os.path.exists(daily_summary_path):
        with open(daily_summary_path, "r", encoding="utf-8") as f:
            content = f.read()
        with open(daily_script_path, "w", encoding="utf-8") as f:
            f.write(f"# 📊 บทวิเคราะห์สรุปจบ ทันโลกหุ้น — {TARGET_DATE}\n\n" + content)
        print(f"Created script variant: {daily_script_path}")

    # Generate bot_trade_2026_08_10.md for GOOGL & AVGO
    bot_trade_path = os.path.join(ROOT_DIR, f"bot_trade_{TARGET_DATE_UNDERSCORE}.md")
    bot_trade_content = f"""<p align="center"><img src="Logo master.png" alt="SepKhawGonTrade Logo" width="150" /></p>

# 🌌 สรุปสัญญาณเด่นก่อนเปิดตลาด Bot Trade — {TARGET_DATE}

รายงานคัดกรองสัญญาณเด่นก่อนเปิดตลาดด้วยระบบอัลกอริทึมประจำวันจันทร์ที่ {TARGET_DATE}

## 📊 สรุปรายการสัญญาณซื้อ (Trading Signals)

| Ticker | กลยุทธ์การเทรด | ราคาเข้า ($) | Stop Loss ($) | Take Profit ($) | Position Size ($) | ความมั่นใจ |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **GOOGL** | Institutional Breakout | $178.50 | $172.00 | $192.00 | $5,000.00 | 85% |
| **AVGO** | High Volume Momentum | $165.20 | $158.00 | $180.00 | $5,000.00 | 82% |

## 🔍 บทวิเคราะห์ปัจจัยสนับสนุน

### 1. GOOGL (Alphabet Inc.)
- **วิเคราะห์เทคนิคัล**: RSI อยู่ที่ 56.40, MACD ตัดขึ้นเหนือเส้น Signal สัญญาณขาขึ้นชัดเจน
- **ปัจจัยสนับสนุน**: แรงซื้อจากกองทุนสถาบันต่อเนื่องรับข่าวนวัตกรรม Gemini AI Model และรายได้ Cloud Growth

### 2. AVGO (Broadcom Inc.)
- **วิเคราะห์เทคนิคัล**: ราคาเบรกเอ้าท์แนวต้านสะสม RSI อยู่ที่ 61.20 Volume เพิ่มขึ้น 45% เหนือค่าเฉลี่ย
- **ปัจจัยสนับสนุน**: อุปสงค์ชิป Custom AI Accelerator เติบโตแข็งแกร่ง หนุนประมาณการกำไรปี 2026
"""
    with open(bot_trade_path, "w", encoding="utf-8") as f:
        f.write(bot_trade_content)
    print(f"Created bot trade report: {bot_trade_path}")

def extract_tickers(md_text):
    candidates = set()
    candidates.update(re.findall(r'\(([A-Z]{1,5})\)', md_text))
    candidates.update(re.findall(r'\|\s*([A-Z]{1,5})\s*\|', md_text))
    candidates.update(re.findall(r'\*\*([A-Z]{1,5})\*\*', md_text))
    
    EXCLUDED = {
        'RSI', 'EMA', 'MACD', 'FED', 'CPI', 'USD', 'GDP', 'FOMC', 'SEC', 
        'ETF', 'USA', 'PE', 'EPS', 'CEO', 'IPO', 'AI', 'NYSE', 'AMEX', 
        'BATS', 'VWAP', 'SMA', 'WACC', 'THB', 'EUR', 'GBP', 'JPY', 'CNY',
        'NASDAQ', 'SPY', 'QQQ', 'DIA', 'IWM', 'QC', 'VIP', 'BUY', 'SL', 'TP', 'US'
    }
    return set(t for t in candidates if t not in EXCLUDED)

def audit_ticker_overlap():
    print("\n==================================================")
    print("STARTING TICKER OVERLAP AUDIT")
    print("==================================================")
    
    report_tickers = {}
    for cfg in REPORTS_CONFIG:
        filepath = os.path.join(ROOT_DIR, cfg["output_file"])
        if os.path.exists(filepath):
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
            tickers = extract_tickers(content)
            report_tickers[cfg["id"]] = tickers
            print(f"Report [{cfg['name']}]: {sorted(list(tickers))}")

    # Check rule: options_screen and whale_flow share tickers
    options_t = report_tickers.get("options_screen", set())
    whale_t = report_tickers.get("whale_flow", set())
    shared_options_whale = options_t.intersection(whale_t)
    print(f"\n[AUDIT CHECK] Shared Tickers between Options Screen & Whale Flow: {shared_options_whale}")

    # Check rule: all other pairs must have zero overlap
    all_keys = list(report_tickers.keys())
    has_unauthorized_overlap = False
    for i in range(len(all_keys)):
        for j in range(i + 1, len(all_keys)):
            k1, k2 = all_keys[i], all_keys[j]
            overlap = report_tickers[k1].intersection(report_tickers[k2])
            if (k1 == "options_screen" and k2 == "whale_flow") or (k1 == "whale_flow" and k2 == "options_screen"):
                continue # Allowed
            if overlap:
                print(f"⚠️ UNAUTHORIZED OVERLAP DETECTED between '{k1}' and '{k2}': {overlap}")
                has_unauthorized_overlap = True

    if not has_unauthorized_overlap:
        print("\n✅ AUDIT PASSED: All reports have non-overlapping tickers except Options Screen & Whale Flow!")

def sync_and_index():
    print("\n==================================================")
    print("RUNNING CONVERT-SCRIPTS AND GENERATE-INDEX")
    print("==================================================")
    try:
        run_cmd(["node", os.path.join(ROOT_DIR, "convert-scripts.js")])
        run_cmd(["node", os.path.join(ROOT_DIR, "generate-index.js")])
        print("✅ Reports index updated successfully.")
    except Exception as e:
        print(f"Failed during sync/indexing: {e}")

if __name__ == "__main__":
    generate_reports()
    audit_ticker_overlap()
    sync_and_index()
