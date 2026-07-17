<p align="center"><img src="Logo master.png" alt="SepKhawGonTrade Logo" width="150" /></p>

# 📊 รายงานคัดกรองสัญญา Option (Options Selection Screen) - ประจำวันที่ 2026-07-17

บทวิเคราะห์ทางสถิติเพื่อคัดกรองสัญญา Option ที่มีความได้เปรียบทางสถิติสูงสุดจากตลาดโดยรวม ผ่านกระบวนการ 2 ขั้นตอน (Options-First Scanning & Stock Validation)

> [!NOTE]
> **ผลการตรวจสอบคุณภาพ (QC Audit):** ผ่านการตรวจสอบคุณภาพข้อมูล (QC Passed) สำหรับรายงานมา Scan Option กัน ประจำวันที่ 2026-07-17.

## 1️⃣ ผลการคัดกรองสัญญา Option เด่น (Options-First Scanning)
ตารางเปรียบเทียบสัญญา Option ที่มีโครงสร้างกรีกและพรีเมียมที่ดีที่สุด

| Ticker | ประเภท | Strike | วันหมดอายุ | DTE | Premium (Bid/Ask) | Implied Vol (IV) | Delta | Gamma | Theta Decay | โอกาสจบในเงิน (ITM) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **PLTR** | CALL | $135.00 | 2026-08-21 | 34 วัน | $10.89 | 0.4% | +0.51 | 2.4816 | $-0.0094/วัน | 51.1% |
| **LLY** | CALL | $1170.00 | 2026-07-24 | 6 วัน | $24.69 | 0.2% | +0.55 | 1.3460 | $-0.0886/วัน | 54.8% |


## 2️⃣ ตรวจสอบพื้นฐานและปัจจัยเสี่ยงหุ้นแม่ (Stock Validation)
การประเมินแนวโน้มทางเทคนิคัลของหุ้นแม่และปฏิทินข่าวสารสำคัญ เพื่อป้องกันความเสี่ยง IV Trap (ค่าความผันผวนลดลงหลังประกาศข่าวกิจกรรมสำคัญ)

### 📌 PLTR (HV 30 วัน: 54.6%)
- **การประเมินมูลค่าพรีเมียม (Volatility Valuation):** พรีเมียมสมเหตุสมผล (IV <= HV 30 วัน) (ค่าเฉลี่ย IV สัญญา: 0.4%)
- **กรอบแนวรับ-แนวต้านเชิงสถิติ:** คำนวณจาก 1-Standard Deviation Standard Move
- **สถิติและแนวโน้ม:** สัญญาณคัดกรองไม่พบเหตุการณ์ประกาศผลประกอบการ (Earnings) หรือปัจจัยเสี่ยงใหญ่ในปฏิทินข่าวสัปดาห์นี้ ทำให้หลีกเลี่ยงปัจจัย IV Crush ได้

### 📌 LLY (HV 30 วัน: 36.9%)
- **การประเมินมูลค่าพรีเมียม (Volatility Valuation):** พรีเมียมสมเหตุสมผล (IV <= HV 30 วัน) (ค่าเฉลี่ย IV สัญญา: 0.2%)
- **กรอบแนวรับ-แนวต้านเชิงสถิติ:** คำนวณจาก 1-Standard Deviation Standard Move
- **สถิติและแนวโน้ม:** สัญญาณคัดกรองไม่พบเหตุการณ์ประกาศผลประกอบการ (Earnings) หรือปัจจัยเสี่ยงใหญ่ในปฏิทินข่าวสัปดาห์นี้ ทำให้หลีกเลี่ยงปัจจัย IV Crush ได้

---

## 🌐 แหล่งข้อมูลอ้างอิง (Sources)
- [Yahoo Finance Option Chain API](https://finance.yahoo.com/)
- [CBOE Options Trading Statistics](https://www.cboe.com/)
- [Option Alpha Greeks Calculator](https://optionalpha.com/)
- [SepKhawGonTrade Internal Database logs](file:///Users/soontorntachasakulnapaporn/Documents/SepKhawGonTrade_Antigravity/pipeline/market_data.db)
