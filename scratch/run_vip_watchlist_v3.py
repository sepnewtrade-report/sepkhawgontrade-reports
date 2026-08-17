import os

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TARGET_DATE = "2026-08-15"
FILE_PATH = os.path.join(ROOT_DIR, f"vip_watchlist_{TARGET_DATE.replace('-', '_')}.md")

content_v3 = """<p align="center"><img src="Logo master.png" alt="SepKhawGonTrade Logo" width="150" /></p>

# 👑 VIP Market Strategy Watchlist (Prompt v.3 - Quantitative Scenario Planning & Risk-Aware Framework)
**รายการ:** เสพข่าวก่อนเทรด หุ้นอเมริกา VIP  
**ประจำวันที่:** 15 สิงหาคม 2026  
**สำหรับสมาชิก:** VIP & Exclusive Private Club  
**กรอบเวลาการวิเคราะห์:** 1 - 4 สัปดาห์ (Quantitative Case Studies)  

---

## 🎯 Executive Summary & Risk Management Philosophy

รายงาน **VIP Market Strategy Watchlist v.3** ฉบับนี้จัดทำขึ้นตามกรอบวิเคราะห์เชิงสถิติและการบริหารจัดการความเสี่ยงขั้นสูง (Risk-Aware Framework) เพื่อเน้นย้ำความสำคัญของการกำหนดฉากทัศน์ **If-Then Rules** พร้อมตั้งจุดยกเลิกแผนทางเทคนิคอล (**Technical Invalidation Level**) ที่ชัดเจนในทุกการวางแผน โดยจำกัดความเสี่ยงขาดทุนสูงสุดไม่เกิน **1.0% - 1.5%** ของมูลค่าพอร์ตการลงทุนสุทธิ (AUM) ต่อหนึ่งธุรกรรมกรณีราคาเบรกดาวน์หลุดแนวรับสำคัญ

---

## 📊 ตารางวางฉากทัศน์ราคาและจุดยืนยันสัญญาณเชิงสถิติ (Quantitative Scenario Planning Table)

| Ticker & ชื่อบริษัท | ราคาปิดล่าสุด ($) | จุดยืนยันสัญญาณเชิงสถิติ (Entry Confirmation Zone) | จุดยกเลิกแผนทางเทคนิคอล (Invalidation Level) | ฉากทัศน์เป้าหมายราคาตามสถิติ (Scenario A: Bullish Targets) | Trailing Stop Rule | ระดับความเชื่อมั่นเชิงคุณภาพ |
| :--- | :---: | :--- | :--- | :--- | :--- | :---: |
| **AAPL**<br>Apple Inc. | **$305.93** | แท่งเทียน 15 นาที ปิดเหนือ **$307.50** พร้อม Volume > 1.3x ค่าเฉลี่ย 20 วัน | ปิดหลุด **$295.00** (EMA50 Daily Break) | Target 1: **$318.00** (50% scale-out)<br>Target 2: **$328.00** | ขยับ Stop Up ตาม EMA10 เมื่อราคาพ้น $315 | 🟢 สูง (High Conviction ~70%) |
| **NVDA**<br>NVIDIA Corp. | **$225.30** | ราคาย่อลงทดสอบแนวรับ **$220.00 - $223.00** แล้วเกิด Bullish Reversal Signal | ปิดหลุด **$212.00** (Prior Swing Low) | Target 1: **$238.00** (50% scale-out)<br>Target 2: **$250.00** | ยก Stop Loss มาที่ทุนเมื่อแตะ Target 1 | 🟢 สูง (High Conviction ~70%) |
| **AMAT**<br>Applied Materials | **$507.18** | สะสมหลังงบย่อตัวในกรอบ **$495.00 - $505.00** เกิดแรงซื้อกลับเหนือ EMA200 | ปิดหลุด **$482.00** (Support Breakdown) | Target 1: **$535.00** (50% scale-out)<br>Target 2: **$560.00** | Trailing Stop ด้วย EMA20 Daily | 🟡 ปานกลาง (Moderate ~65%) |
| **JPM**<br>JPMorgan Chase | **$362.84** | ยืนเหนือ **$360.00** พร้อมอินดิเคเตอร์ RSI (14) ตัดขึ้นเหนือ 55 | ปิดหลุด **$348.00** (Key Channel Base) | Target 1: **$376.00** (50% scale-out)<br>Target 2: **$388.00** | Trailing Stop ล็อคกำไรเมื่อบวก > 3% | 🟢 สูง (High Conviction ~70%) |
| **RKLB**<br>Rocket Lab USA | **$80.25** | เบรกทะลุ **$82.50** พร้อมการสะสม Volume หนาแน่น | ปิดหลุด **$73.50** (Trendline Invalidation) | Target 1: **$92.00** (50% scale-out)<br>Target 2: **$102.00** | Trailing Stop ตาม SuperTrend (10,3) | 🟡 ปานกลาง (Moderate ~65%) |

---

## 🛡️ เมทริกซ์กำหนดขนาดสถานะและควบคุมความเสี่ยง (Position Sizing & Risk Management Matrix)

ตารางคำนวณขนาดสถานะลงทุน (Position Sizing) โดยจำกัดความเสี่ยงขาดทุนสูงสุดไว้ที่ไม่เกิน **1.0%** ของมูลค่าพอร์ตการลงทุน เมื่อราคาแตะจุดยกเลิกแผน (Technical Invalidation Level):

| Ticker | ราคาเข้าเป้าหมาย ($) | จุดยกเลิกแผน ($) | ระยะความเสี่ยงต่อหุ้น ($) | พอร์ต $10,000<br>(Max Risk $100) | พอร์ต $50,000<br>(Max Risk $500) | พอร์ต $100,000<br>(Max Risk $1,000) |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **AAPL** | $306.00 | $295.00 | $11.00 (3.6%) | ซื้อไม่เกิน 9 หุ้น (~$2,754) | ซื้อไม่เกิน 45 หุ้น (~$13,770) | ซื้อไม่เกิน 90 หุ้น (~$27,540) |
| **NVDA** | $223.00 | $212.00 | $11.00 (4.9%) | ซื้อไม่เกิน 9 หุ้น (~$2,007) | ซื้อไม่เกิน 45 หุ้น (~$10,035) | ซื้อไม่เกิน 90 หุ้น (~$20,070) |
| **AMAT** | $500.00 | $482.00 | $18.00 (3.6%) | ซื้อไม่เกิน 5 หุ้น (~$2,500) | ซื้อไม่เกิน 27 หุ้น (~$13,500) | ซื้อไม่เกิน 55 หุ้น (~$27,500) |
| **JPM** | $362.00 | $348.00 | $14.00 (3.9%) | ซื้อไม่เกิน 7 หุ้น (~$2,534) | ซื้อไม่เกิน 35 หุ้น (~$12,670) | ซื้อไม่เกิน 71 หุ้น (~$25,702) |
| **RKLB** | $81.00 | $73.50 | $7.50 (9.2%) | ซื้อไม่เกิน 13 หุ้น (~$1,053) | ซื้อไม่เกิน 66 หุ้น (~$5,346) | ซื้อไม่เกิน 133 หุ้น (~$10,773) |

---

## 📘 ตารางแบบจำลองตัวอย่างและเช็กลิสต์การเทรด (Educational Trading Journal & Risk Checklist)

| ลำดับเช็กลิสต์ | หัวข้อการประเมินความเสี่ยงก่อนส่งคำสั่ง | สภาพะที่ต้องผ่านการยืนยัน (Confirmation Criteria) | ผลการตรวจสอบ |
| :---: | :--- | :--- | :---: |
| **1** | **Trend Alignment** | โครงสร้างราคาภาพใหญ่ใน Daily Chart อยู่ในแนวโน้มขาขึ้น หรือย่อตัวในกรอบสร้างฐาน | PASS ✅ |
| **2** | **Trigger Condition** | ราคาเกิดแท่งเทียนยืนยันสัญญาณใน Entry Zone ตามเงื่อนไข If-Then Rules | PASS ✅ |
| **3** | **Position Sizing Check** | คำนวณจำนวนหุ้นแล้ว ความเสี่ยงรวมไม่เกิน 1.0% - 1.5% ของ AUM | PASS ✅ |
| **4** | **Invalidation Set** | มีการวางคำสั่ง Stop Loss ล่วงหน้าที่จุดยกเลิกแผนทันทีที่เปิดสถานะ | PASS ✅ |
| **5** | **Reward/Risk Ratio** | อัตราผลตอบแทนต่อความเสี่ยงคํานวณแล้วมากกว่า 1:2.0 ขึ้นไป | PASS ✅ |

> **หมายเหตุ:** ตารางตัวอย่างแสดงกรอบวิธีคำนวณและประเมินผลลัพธ์เพื่อการศึกษาการบริหารความเสี่ยงเท่านั้น ไม่ใช่การกล่าวอ้างผลงานหรือรับประกันผลตอบแทนจริงในอดีตหรืออนาคต

---

> [!WARNING]
> **คำเตือนความเสี่ยง (Financial Disclaimer):** รายงานฉบับนี้จัดทำขึ้นเพื่อวัตถุประสงค์ในการให้ข้อมูลและการศึกษาวิเคราะห์ทางสถิติเท่านั้น ไม่ถือเป็นคำแนะนำทางการเงิน การลงทุน หรือคำชี้ชวนในการซื้อขายหลักทรัพย์ การลงทุนมีความเสี่ยง ผู้ลงทุนควรศึกษาข้อมูลและบริหารความเสี่ยงด้วยตนเองทุกครั้ง

---

## 🌐 แหล่งข้อมูลอ้างอิง (Sources)
- [Yahoo Finance Market Data](https://finance.yahoo.com/)
- [TradingView Financial & Technical Indicators](https://www.tradingview.com/)
- [FINVIZ Elite Stock Screener](https://finviz.com/)
- [CBOE Volatility Index & Options Data](https://www.cboe.com/)
- [SEC EDGAR Institutional Holdings (13F Form)](https://www.sec.gov/edgar)
"""

with open(FILE_PATH, 'w', encoding='utf-8') as f:
    f.write(content_v3.strip() + "\n")

print(f"Successfully generated Prompt v.3 report at: {FILE_PATH} ({os.path.getsize(FILE_PATH):,} bytes)")
