import os
import subprocess
from datetime import datetime

LOGO_HTML = '<p align="center"><img src="Logo master.png" alt="SepKhawGonTrade Logo" width="150" /></p>\n\n'

def run_index_updater():
    """
    Executes the Node.js website index rebuild and pushes changes to GitHub.
    """
    parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    cmd = 'node generate-index.js && git add . && git commit -m "Auto-update reports" && git push'
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
    
    if not signals:
        content += "### 📭 ไม่พบสัญญาณซื้อที่ตรงเงื่อนไขกลยุทธ์ในรอบวันนี้\n"
        content += "บอทสแกนแล้วแต่ไม่มีหุ้นใดผ่านเกณฑ์ความปลอดภัยและเงื่อนไขเทคนิคัล แนะนำให้รอประเมินความเสี่ยงตลาดอีกครั้ง\n\n"
    else:
        content += "## 🏆 สัญญาณซื้อเด่นประจำวันนี้ (Top Buy Signals)\n\n"
        content += "| Ticker | กลยุทธ์ | ราคาเข้าซื้อ | RSI (14) | MACD Hist | CMF (Whale Flow) | ATR (14) | Stop Loss | Take Profit | สัดส่วนจัดสรร | ความมั่นใจ |\n"
        content += "| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n"
        for sig in signals:
            ticker = sig["ticker"]
            strat = sig["strategy_name"]
            price = sig["price"]
            pos = sig["position_size"]
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
            
            content += f"| **{ticker}** | {strat} | ${price:.2f} | {rsi_val} | {macd_val} | {cmf_val} | {atr_val} | ${sl:.2f} | ${tp:.2f} | ${pos:,.2f} | {conf*100:.0f}% |\n"
        
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
    content += "- [SepKhawGonTrade Internal Database logs](file:///Users/soontorntachasakulnapaporn/Documents/SepKhawGonTrade_Antigravity/pipeline/market_data.db)\n"
    
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(content)
        
    print(f"Performance report generated successfully: {output_path}")
    run_index_updater()
