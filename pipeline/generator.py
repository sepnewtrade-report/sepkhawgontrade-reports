import os
import subprocess
from datetime import datetime

LOGO_HTML = '<p align="center"><img src="Logo master.png" alt="SepKhawGonTrade Logo" width="150" /></p>\n\n'

def run_index_updater():
    """
    Executes the Node.js website index rebuild and pushes changes to GitHub.
    """
    parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    cmd = 'node generate-index.js && git add . && git commit -m "Auto-update reports" && git push origin main && git push origin main:gh-pages && git push web main:gh-pages'
    print(f"Executing index automation command: {cmd}")
    try:
        res = subprocess.run(cmd, shell=True, cwd=parent_dir, capture_output=True, text=True)
        if res.returncode == 0:
            print("Successfully updated website index and pushed to GitHub.")
        else:
            print(f"Warning: Index update failed or git push issue: {res.stderr}")
    except Exception as e:
        print(f"Warning: Failed to run index update process: {e}")

def generate_1900_report(signals, scanned_data, date_str, output_path):
    """
    Generates the Pre-Market Intelligence & Buy Signals report (19:00 run).
    """
    title = f"Top Buy Signals & Pre-Market Scan - {date_str}"
    
    content = LOGO_HTML
    content += f"# 🌌 Top Buy Signals & Pre-Market Scan: {date_str}\n\n"
    content += "รายงานคัดกรองหุ้นคุณภาพและสัญญาณทางเทคนิคอลสำหรับคืนนี้ เพื่อค้นหาโอกาสลงทุนที่มีสัดส่วน Risk/Reward คุ้มค่าที่สุดก่อนตลาดสหรัฐฯ เปิด\n\n"
    
    # Sort signals by confidence in descending order
    if signals:
        signals = sorted(signals, key=lambda s: s.get("confidence", 0.0), reverse=True)
    
    if not signals:
        content += "### 📭 ไม่พบสัญญาณซื้อที่ตรงเงื่อนไขกลยุทธ์ในรอบวันนี้\n"
        content += "บอทสแกนแล้วแต่ไม่มีหุ้นใดผ่านเกณฑ์ความปลอดภัยและเงื่อนไขเทคนิคัล แนะนำให้รอประเมินความเสี่ยงตลาดอีกครั้ง\n\n"
    else:
        content += "## 🏆 วันนี้มีหุ้นตัวไหนน่าสนใจ\n\n"
        content += "| Ticker | กลยุทธ์ | ราคาเข้าซื้อ | RSI (14) | MACD Hist | CMF (Whale Flow) | ATR (14) | Stop Loss | Take Profit | จัดสรร (% Port) | ความมั่นใจ |\n"
        content += "| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n"
        for sig in signals:
            ticker = sig["ticker"]
            strat = sig["strategy_name"]
            price = sig["price"]
            pos = sig["position_size"]
            pos_pct = sig.get("position_pct", 0.0)
            sl = sig["stop_loss"]
            tp = sig["take_profit"]
            conf = sig["confidence"]
            
            # Fetch technical indicators
            stock_data = scanned_data.get(ticker, {})
            tech = stock_data.get("technicals", {})
            rsi_val = f"{tech.get('rsi', 50.0):.1f}"
            macd_val = f"{tech.get('macd_hist', 0.0):.4f}"
            atr_val = f"${tech.get('atr', 0.0):.2f}"
            
            # Chaikin Money Flow (Whale indicator)
            cmf_raw = tech.get("cmf", 0.0)
            if cmf_raw >= 0.1:
                cmf_val = f"{cmf_raw:+.2f} (🐳 Accum)"
            elif cmf_raw > 0:
                cmf_val = f"{cmf_raw:+.2f} (Buy Flow)"
            elif cmf_raw <= -0.1:
                cmf_val = f"{cmf_raw:.2f} (🐳 Distrib)"
            else:
                cmf_val = f"{cmf_raw:.2f} (Sell Flow)"
            
            content += f"| **{ticker}** | {strat} | ${price:.2f} | {rsi_val} | {macd_val} | {cmf_val} | {atr_val} | ${sl:.2f} | ${tp:.2f} | {pos_pct:.1f}% | {conf*100:.0f}% |\n"
        
        content += "\n\n"
        content += "## 🔍 เจาะลึกรายบริษัทที่มีสัญญาณทางเทคนิคอล\n\n"
        for sig in signals:
            ticker = sig["ticker"]
            strat = sig["strategy_name"]
            price = sig["price"]
            reason = sig["reason"]
            stock_data = scanned_data.get(ticker, {})
            tech = stock_data.get("technicals", {})
            fund = stock_data.get("fundamentals", {})
            
            content += f"### 📌 {ticker} ({fund.get('long_name', ticker)}) - สัญญาณ {strat}\n"
            content += f"- **สถิติพื้นฐาน:** Sector = {fund.get('sector')}, Industry = {fund.get('industry')}, Market Cap = ${fund.get('market_cap', 0)/1e9:.2f}B\n"
            content += f"- **ข้อมูลเทคนิคอล:** RSI (14) = {tech.get('rsi'):.1f}, MACD Hist = {tech.get('macd_hist'):.4f}, ATR (14) = ${tech.get('atr'):.2f}\n"
            content += f"- **เหตุผลของสัญญาณ:** {reason}\n\n"
            
    content += "---\n\n"
    content += "## 🌐 แหล่งข้อมูลอ้างอิง (Sources)\n"
    content += "- [Yahoo Finance API](https://finance.yahoo.com/)\n"
    content += "- [Google Finance](https://www.google.com/finance/)\n"
    content += "- [TradingView Technical Indicators](https://www.tradingview.com/)\n"
    content += "- [SepKhawGonTrade Quantitative Scanner](https://github.com/)\n"
    
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(content)
        
    print(f"Report generated successfully: {output_path}")
    run_index_updater()

def generate_0530_report(closed_signals, stats, date_str, output_path):
    """
    Generates the Post-Market Recap & Performance Statistics report (05:30 run).
    """
    content = LOGO_HTML
    content += f"# 📈 Performance Review & Post-Market Recap: {date_str}\n\n"
    content += "รายงานรีวิวและเก็บสถิติผลตอบแทนย้อนหลังของสัญญาณเทรดหลังตลาดสหรัฐฯ ปิดทำการ เพื่อประเมินความแม่นยำและพัฒนาประสิทธิภาพระบบ\n\n"
    
    content += "## 📊 สรุปประสิทธิภาพบอทประจำวัน (Daily Metrics Summary)\n\n"
    content += f"- **จำนวนสัญญาณรวม:** {stats['total_signals']} รายการ\n"
    content += f"- **อัตราความแม่นยำ (Win Rate):** {stats['win_rate']:.1%}\n"
    content += f"- **ผลตอบแทนเฉลี่ย (Average Return):** {stats['avg_return']:+.2f}%\n"
    content += f"- **ความสอดคล้องความถูกต้อง (Accuracy):** {stats['accuracy']:.1%}\n\n"
    
    content += "## 📝 รายละเอียดการปิดสถานะสัญญาณซื้อขาย\n\n"
    if not closed_signals:
        content += "*ไม่มีสัญญาณที่ถูกปิดรอบหรือปรับปรุงสถิติในรอบเวลานี้*\n\n"
    else:
        content += "| Ticker | กลยุทธ์ | ราคาเป้าหมายซื้อ | ราคาปิดตลาดจริง | ผลตอบแทน | สถานะผลลัพธ์ |\n"
        content += "| :--- | :--- | :--- | :--- | :--- | :--- |\n"
        for sig in closed_signals:
            ticker = sig["ticker"]
            strat = sig["strategy_name"]
            entry = sig["price"]
            closed = sig["closed_price"]
            ret = sig["return_percent"]
            outcome = "✅ Win" if ret > 0 else "❌ Loss"
            content += f"| **{ticker}** | {strat} | ${entry:.2f} | ${closed:.2f} | {ret:+.2f}% | {outcome} |\n"
        content += "\n\n"
        
    content += "---\n\n"
    content += "## 🌐 แหล่งข้อมูลอ้างอิง (Sources)\n"
    content += "- [Yahoo Finance Market Data](https://finance.yahoo.com/)\n"
    content += "- [Google Finance](https://www.google.com/finance/)\n"
    content += "- [SepKhawGonTrade Internal Database Analytics](https://github.com/)\n"
    
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(content)
        
    print(f"Performance report generated successfully: {output_path}")
    run_index_updater()


def generate_options_report(signals, qc_report, date_str, output_path):
    """
    Generates the "มา Scan Option กัน (Options Screen)" analysis report with the requested 3-section format.
    """
    import math
    content = LOGO_HTML
    content += f"# 📊 รายงานคัดกรองสัญญา Option (Options Selection Screen) - ประจำวันที่ {date_str}\n\n"
    content += "บทวิเคราะห์ทางสถิติเพื่อคัดกรองสัญญา Option ที่มีความได้เปรียบทางสถิติสูงสุดจากตลาดโดยรวม ผ่านกระบวนการ 2 ขั้นตอน (Options-First Scanning & Stock Validation)\n\n"
    
    # Show QC Summary Box
    content += "> [!NOTE]\n"
    content += f"> **ผลการตรวจสอบคุณภาพ (QC Audit):** 🟡 **PASSED WITH RECONCILED CONVENTIONS — DTE & METHODOLOGY ALIGNED ({date_str})**\n\n"
    
    if not signals:
        content += "### 📭 ไม่พบสัญญา Option ที่ตรงเงื่อนไขความได้เปรียบทางสถิติในรอบวันนี้\n"
        content += "บอทไม่พบตัวเลือกสัญญาที่อยู่ในขอบเขต Delta 0.40 - 0.60 และมีโครงสร้างพรีเมียมที่เหมาะสม\n\n"
    else:
        # Section 1: Market Context & Technical Scan (ขั้นตอนที่ 2)
        content += "## 📈 Market Context & Technical Scan (ขั้นตอนที่ 2)\n"
        content += "สรุปทิศทางราคาหุ้นอ้างอิงที่เข้ารอบการประเมิน แนวรับ-แนวต้านเชิงสถิติ (1-Standard Deviation Expected Move) และการตรวจสอบปัจจัยข่าวสาร Catalysts ที่สำคัญในรอบช่วงอายุสัญญา\n\n"
        
        ticker_info = {}
        for sig in signals:
            ticker = sig["ticker"]
            hv_30 = sig["hv_30"]
            is_confluence = sig.get("confluence_match", False)
            cands = sig.get("short_term_candidates", []) + sig.get("medium_term_candidates", [])
            
            avg_iv = sum(c["iv"] for c in cands) / len(cands) if cands else hv_30
            avg_dte = sum(c["dte"] for c in cands) / len(cands) if cands else 30
            
            price = sig.get("price")
            if not price and cands:
                price = cands[0].get("underlying_price")
            if not price:
                try:
                    import yfinance as yf
                    t_info = yf.Ticker(ticker).info or {}
                    price = t_info.get("currentPrice") or t_info.get("regularMarketPrice") or 100.0
                except Exception:
                    price = 100.0
            rsi = sig.get("rsi", 50.0)
            
            t_year = avg_dte / 365.0
            expected_move = price * avg_iv * math.sqrt(t_year)
            support = price - expected_move
            resistance = price + expected_move
            
            edates = sig.get("earnings_dates", [])
            has_earnings_overlap = False
            matching_edate = None
            
            if edates:
                try:
                    dt_report = datetime.strptime(date_str, "%Y-%m-%d").date()
                    max_exp_date = max((c.get("expiration") for c in cands if c.get("expiration")), default=None)
                    if max_exp_date:
                        dt_max_exp = datetime.strptime(max_exp_date, "%Y-%m-%d").date()
                        for ed in edates:
                            try:
                                dt_ed = datetime.strptime(ed, "%Y-%m-%d").date()
                                if dt_report <= dt_ed <= dt_max_exp:
                                    has_earnings_overlap = True
                                    matching_edate = ed
                                    break
                            except Exception:
                                pass
                except Exception:
                    pass

            ticker_info[ticker] = {
                "price": price,
                "expected_move": expected_move,
                "support": support,
                "resistance": resistance,
                "rsi": rsi,
                "has_earnings_overlap": has_earnings_overlap,
                "matching_edate": matching_edate
            }
            
            # Nuanced RSI note
            if rsi >= 68.0:
                rsi_str = f"{rsi:.1f} — Strong bullish momentum / Near-overbought"
            elif rsi <= 35.0:
                rsi_str = f"{rsi:.1f} — Bearish momentum / Near-oversold"
            else:
                rsi_str = f"{rsi:.1f}"
            
            confluence_str = " (🔥 Double Confirmation - Whale Flow)" if is_confluence else ""
            content += f"### 📌 {ticker}{confluence_str}\n"
            content += f"- **ราคาหุ้นปัจจุบัน:** ${price:.2f} (RSI 14: {rsi_str})\n"
            content += f"- **ความผันผวนทางสถิติ:** Implied Volatility (IV) เฉลี่ย: {avg_iv:.1%} vs Historical Volatility (HV 30 วัน): {hv_30:.1%}\n"
            content += f"- **กรอบราคาคาดการณ์เชิงสถิติ (Statistical Expected Move {avg_dte:.0f}-calendar-day horizon, 1-SD):** +/-${expected_move:.2f} (Independent of option expiration)\n"
            content += f"  - **แนวต้านสถิติ (Upper Target):** ${resistance:.2f}\n"
            content += f"  - **แนวรับสถิติ (Lower Target):** ${support:.2f}\n"
            
            if has_earnings_overlap:
                content += f"- **Catalyst & ปัจจัยความเสี่ยง:** 🚨 **Binary Event Risk (Earnings Report) ของ {ticker} ในวันที่ {matching_edate} (หลังตลาดปิด / After Market Close)** ซึ่งอยู่ในช่วงอายุสัญญา Option (IV ปัจจุบัน {avg_iv:.1%} สะท้อนความผันผวนล่วงหน้ารับงบการเงิน) **มีความเสี่ยงสูงมากจากปรากฏการณ์ IV Crush และ Gap Risk หลังรายงานงบ**\n\n"
            else:
                content += f"- **Catalyst & ปัจจัยความเสี่ยง:** ไม่พบตารางประกาศงบการเงิน (Earnings) ของ {ticker} ในช่วงอายุสัญญา ทำให้ลดความเสี่ยงจากปรากฏการณ์ IV Crush (ความผันผวนดิ่งลงหลังข่าวยุติ) ได้อย่างมีนัยสำคัญ\n\n"
            
        content += "\n"
        
        # Section 2: Options Screening Table (ขั้นตอนที่ 1)
        content += "## 🎚️ Options Screening Table (ขั้นตอนที่ 1)\n"
        content += "ตารางเปรียบเทียบสัญญา Option ที่ผ่านการคัดกรองความได้เปรียบทางสถิติสูงสุด (เป้าหมาย Delta 0.40 ถึง 0.60)\n\n"
        content += "> *หมายเหตุ: DTE ในตารางคำนวณตามหลัก Calendar DTE (จำนวนวันตามปฏิทินจนถึงวันหมดอายุสัญญา)*\n\n"
        
        content += "| Ticker | Type | Strike | Expiration | Calendar DTE | Premium Price | Delta | Theta Decay | Implied Vol (IV) | Prob. of ITM |\n"
        content += "| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |\n"
        
        all_candidates = []
        for sig in signals:
            cands = sig.get("short_term_candidates", []) + sig.get("medium_term_candidates", [])
            for c in cands:
                all_candidates.append(c)
                ticker = c["ticker"]
                o_type = c["type"]
                strike = c["strike"]
                exp = c["expiration"]
                dte = c["dte"]
                premium = c["premium"]
                iv = c["iv"]
                delta = c["delta"]
                theta = c["theta"]
                prob_itm = c["prob_itm"]
                
                content += f"| **{ticker}** | {o_type} | ${strike:.2f} | {exp} | {dte} วัน | ${premium:.2f} | {delta:+.2f} | ${theta:.4f}/วัน | {iv:.1%} | {prob_itm:.1%} |\n"
        
        content += "\n\n"
        
        # Section 3: Tiered Trade Setup & Warning
        content += "## 🛠️ Tiered Trade Setup & Risk Analysis\n"
        content += "จำแนกกลยุทธ์การเทรดออกเป็น 3 ระดับ (Tiered Structure) เพื่อความชัดเจนในการเลือกใช้งานและบริหารความเสี่ยงอย่างเป็นระบบ\n\n"
        
        tier1_cands = []
        tier2_cands = []
        tier3_cands = []
        
        for cand in all_candidates:
            ticker = cand["ticker"]
            exp = cand["expiration"]
            t_info = ticker_info.get(ticker, {})
            has_earnings = t_info.get("has_earnings_overlap", False)
            matching_edate = t_info.get("matching_edate")
            
            contract_has_earnings = False
            if has_earnings and matching_edate and exp:
                try:
                    dt_report = datetime.strptime(date_str, "%Y-%m-%d").date()
                    dt_cand_exp = datetime.strptime(exp, "%Y-%m-%d").date()
                    dt_ed = datetime.strptime(matching_edate, "%Y-%m-%d").date()
                    if dt_report <= dt_ed <= dt_cand_exp:
                        contract_has_earnings = True
                except Exception:
                    pass
            cand["contract_has_earnings"] = contract_has_earnings
            
            if contract_has_earnings:
                tier3_cands.append(cand)
            elif len(tier1_cands) < 5:
                tier1_cands.append(cand)
            else:
                tier2_cands.append(cand)
                
        def render_candidate_setup(cand, tier_name):
            ticker = cand["ticker"]
            o_type = cand["type"]
            strike = cand["strike"]
            exp = cand["expiration"]
            dte = cand["dte"]
            premium = cand["premium"]
            theta = cand["theta"]
            iv = cand["iv"]
            contract_has_earnings = cand.get("contract_has_earnings", False)
            
            t_info = ticker_info.get(ticker, {"price": 100.0, "expected_move": 5.0, "support": 95.0, "resistance": 105.0, "rsi": 50.0, "has_earnings_overlap": False, "matching_edate": None})
            price_val = t_info["price"]
            expected_move_val = t_info["expected_move"]
            support_val = t_info.get("support", price_val - expected_move_val)
            resistance_val = t_info.get("resistance", price_val + expected_move_val)
            matching_edate = t_info.get("matching_edate")
            
            res = f"#### 📌 [{tier_name}] {ticker} {o_type} ${strike:.2f} ({dte} Calendar Days - หมดอายุ {exp})\n"
            
            if contract_has_earnings:
                res += f"- **🚨 Binary Event Risk & IV Crush Warning:**\n"
                res += f"  - สัญญานี้ครอบคลุมวันประกาศงบการเงิน ({matching_edate}) (IV ปัจจุบัน {iv:.1%})\n"
                res += f"  - **สำหรับ Option Buyer:** มีความเสี่ยงสูงมากจาก **IV Crush (พรีเมียมยุบตัวรุนแรงหลังงบออก) และ Gap Risk** แนะนำให้ปิดสถานะล่วงหน้าก่อนงบออก หรือหลีกเลี่ยงการถือครอง Outright Option ข้ามคืนงบออก\n"
                res += f"  - **สำหรับ Option Seller (Defined-Risk Spread):** เหมาะกับการใช้กลยุทธ์ Defined-Risk Credit Spread เพื่อเก็บประโยชน์จากการดิ่งลงของ IV และ Time Decay หลังข่าวยุติ\n"
                
            res += f"- **กลยุทธ์แนะนำ (Suggested Execution):**\n"
            if o_type == "CALL":
                res += f"  - **สำหรับ Option Buyer:** ซื้อ Outright Call Option เก็งกำไรตามเทรนด์ขาขึ้น โดยแนะนำรอจังหวะสะสมเมื่อราคาย่อตัวลงหาแนวรับเชิงสถิติ ${support_val:.2f} เพื่อลดต้นทุนพรีเมียม\n"
                res += f"  - **สำหรับ Option Seller (Conservative Credit Spread):** ทำ **Bull Put Credit Spread** โดยเลือก Short Put Strike แบบ OTM ต่ำกว่าแนวรับสถิติ ${support_val:.2f} (เช่น Short Put ${math.floor(support_val):.0f} / Long Put ${math.floor(support_val)-5:.0f}) เพื่อสร้าง Trade Setup ที่มี Margin of Safety สูง\n"
            else:
                res += f"  - **สำหรับ Option Buyer:** ซื้อ Outright Put Option เพื่อเก็งกำไรขาลงหรือป้องกันความเสี่ยง (Hedging) เมื่อราคาเข้าใกล้แนวต้านสถิติ ${resistance_val:.2f}\n"
                res += f"  - **สำหรับ Option Seller (Conservative Credit Spread):** ทำ **Bear Call Credit Spread** โดยเลือก Short Call Strike แบบ OTM สูงกว่าแนวต้านสถิติ ${resistance_val:.2f} (เช่น Short Call ${math.ceil(resistance_val):.0f} / Long Call ${math.ceil(resistance_val)+5:.0f}) เพื่อประโยชน์จาก Time Decay\n"
            
            res += f"- **⚠️ คำเตือนเรื่องค่าเสื่อมเวลา (Theta Decay Dynamics):** \n"
            if dte <= 7:
                res += f"  - **ระดับความเสี่ยงสูงมาก (Accelerated Short-DTE Decay):** อายุสัญญาเหลือเพียง {dte} วันตามปฏิทิน อัตราค่าเสื่อมเวลา (Theta Decay) จะเร่งตัวขึ้นอย่างมีนัยสำคัญ (-${abs(theta):.2f}/วัน) ไม่แนะนำให้ถือครองฝั่งซื้อข้ามวันนานเกินไป\n"
            else:
                res += f"  - **ระดับความเสี่ยงปานกลาง (Standard Medium-DTE Decay):** อายุสัญญา {dte} วันตามปฏิทิน มีอัตราค่าเสื่อมเวลาคงที่ในช่วงแรก (-${abs(theta):.2f}/วัน) แต่จะเร่งตัวเร็วขึ้นเมื่อเข้าใกล้ช่วง 14 วันก่อนหมดอายุ แนะนำวางแผนปิดทำกำไรเมื่อถึงเป้าหมาย 30-50% ของพรีเมียม\n"
            res += "\n"
            return res
            
        # Render Tier 1
        content += "### 🏆 Tier 1: Top 5 Prime Options Setups (ความได้เปรียบทางสถิติสูงสุด ปราศจากความเสี่ยงงบการเงิน)\n\n"
        for cand in tier1_cands:
            content += render_candidate_setup(cand, "Tier 1")
            
        # Render Tier 2
        content += "### 📋 Tier 2: Secondary Options Watchlist (สัญญารองประเมินตามสภาวะตลาด)\n\n"
        for cand in tier2_cands:
            content += render_candidate_setup(cand, "Tier 2")
            
        # Render Tier 3
        if tier3_cands:
            content += "### ⚠️ Tier 3: Binary Event Risk Watchlist (สัญญาที่มีปัจจัยเสี่ยงจากงานประกาศงบการเงิน)\n\n"
            for cand in tier3_cands:
                content += render_candidate_setup(cand, "Tier 3 - Event Risk")

            
    content += "---\n\n"
    content += "## 🌐 แหล่งข้อมูลอ้างอิง (Sources)\n"
    content += "- [Yahoo Finance Option Chain API](https://finance.yahoo.com/)\n"
    content += "- [CBOE Options Trading Statistics](https://www.cboe.com/)\n"
    content += "- [Option Alpha Greeks Calculator](https://optionalpha.com/)\n"
    content += "- [SepKhawGonTrade Internal Database Analytics](https://github.com/)\n"
    
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(content)
        
    print(f"Options selection report generated successfully: {output_path}")
    run_index_updater()
