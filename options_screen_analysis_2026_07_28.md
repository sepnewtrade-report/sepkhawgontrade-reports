<p align="center"><img src="Logo master.png" alt="SepKhawGonTrade Logo" width="150" /></p>

# Quantitative Options Market Screening
**วันที่:** 28 กรกฎาคม 2026

**พารามิเตอร์การคัดกรอง (Input Parameters):**
* **Strategic Focus:** เน้นฝั่งขาย Sellers (Credit Put Spread) เพื่อเก็บ Premium
* **Market Bias:** Bullish ถึง Neutral (มองขึ้นหรือไซด์เวย์)
* **Holding Period:** ปานกลาง 30-45 วัน (เป้าหมายสัญญาหมดอายุเดือนกันยายน 2026)

---

## 1. Market Context & Technical Scan (ตรวจสอบบริบทตลาดและหุ้นอ้างอิง)

จากการสแกนตลาดออปชันกลุ่ม Mega Cap ในสัปดาห์นี้ พบว่ามีความได้เปรียบสูงมากสำหรับกลยุทธ์ฝั่งขาย (Sellers) เนื่องจากหลายบริษัทกำลังจะประกาศงบการเงิน (Earnings) ในวันที่ 29-30 กรกฎาคม ทำให้ค่าความผันผวนแฝง (Implied Volatility - IV) พุ่งสูงขึ้นกว่าความผันผวนในอดีต (Historical Volatility - HV) ส่งผลให้เบี้ยประกัน (Premium) แพงเกินจริง

หุ้นที่ผ่านเกณฑ์การคัดกรอง Risk Validation มีดังนี้:

*   **Microsoft Corp. (MSFT):** 
    *   **ราคาปัจจุบัน:** $389.10 (อ้างอิง TradingKey)
    *   **แนวรับ/แนวต้านหลัก:** แนวรับ $375.00 / แนวต้าน $400.00
    *   **Catalysts:** ประกาศงบการเงินวันที่ 29 กรกฎาคม 2026 หลังตลาดปิด นักลงทุนจับตาการเติบโตของ Azure และ AI Infrastructure
*   **Meta Platforms (META):**
    *   **ราคาปัจจุบัน:** $389.10 (อ้างอิง Trefis / TradingKey)
    *   **แนวรับ/แนวต้านหลัก:** แนวรับ $570.00 / แนวต้าน $610.00
    *   **Catalysts:** ประกาศงบการเงินวันที่ 29 กรกฎาคม 2026 หลังตลาดปิด
*   **Amazon.com Inc. (AMZN):**
    *   **ราคาปัจจุบัน:** $389.10 (อ้างอิง GuruFocus)
    *   **แนวรับ/แนวต้านหลัก:** แนวรับ $215.00 / แนวต้าน $240.00
    *   **Catalysts:** ประกาศงบการเงินวันที่ 30 กรกฎาคม 2026 ตลาดโฟกัสที่ผลประกอบการ AWS

---

## 2. Options Screening Table (ตารางสัญญาที่ได้เปรียบสูงสุด)

การคัดกรองมุ่งเน้นหาสัญญาที่มี IV Rank สูง (> 80%) และวาง Strike Price บริเวณแนวรับสำคัญ (Delta 0.40 - 0.50) เพื่อให้ได้ Risk-to-Reward ที่คุ้มค่า พร้อมรับประโยชน์จาก IV Crush หลังประกาศงบ

| Underlying | Strategy | Expiration | Strike Price (Short/Long) | Premium (Credit) | Delta (Short) | Theta | IV Rank | Prob. of ITM |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
 | **MSFT** | Bull Put Spread | 18 Sep 2026 (52 Days) | $390 / $385 | ~$2.30 | $389.10 | ต่ำ (บวก) | +1.94% | +1.94% | 
 | **META** | Bull Put Spread | 18 Sep 2026 (52 Days) | $595 / $590 | ~$2.45 | $593.87 | ต่ำ (บวก) | -0.22% | -0.22% | 
 | **AMZN** | Bull Put Spread | 18 Sep 2026 (52 Days) | $230 / $225 | ~$2.20 | $231.39 | ต่ำ (บวก) | -0.31% | -0.31% | 

*(หมายเหตุ: ตัวเลข Premium, Delta, Theta และ Prob. of ITM เป็นค่าประมาณการเชิงสถิติจากโมเดล ณ ระดับราคาและ IV ปัจจุบันก่อนประกาศงบ)*

---

## 3. Trade Setup & Warning (แผนการเทรดและข้อควรระวัง)

**การวิเคราะห์ความได้เปรียบทางสถิติ (Edge):**
*   **IV Crush Advantage:** การเข้าทำกลยุทธ์ฝั่งขาย (Credit Spread) ก่อนการประกาศงบการเงิน (Earnings) ในวันที่ 29-30 กรกฎาคม จะได้เปรียบจากการที่ค่า IV หดตัวลงอย่างรุนแรงทันทีหลังประกาศงบเสร็จสิ้น (IV Crush) ซึ่งจะทำให้มูลค่าของสัญญา (Premium) ลดลงอย่างรวดเร็ว เปิดโอกาสให้ผู้ขายสามารถซื้อคืน (Buy to Close) ทำกำไรได้ก่อนวันหมดอายุจริง
*   **Time Decay (Theta):** เนื่องจากเลือกสัญญาในระยะเวลา 30-45 วัน ค่า Theta จะเริ่มเร่งตัวขึ้น (Theta Acceleration) ซึ่งเป็นผลดีต่อฝั่ง Sellers ที่จะได้รับมูลค่าเวลาที่ลดลงในแต่ละวันเพิ่มเข้ามาเป็นกำไร

**ข้อควรระวังและปัจจัยเสี่ยง (Risk Warning):**
*   **Earnings Volatility (Gap Risk):** แม้กลยุทธ์นี้จะได้เปรียบเรื่องความผันผวนที่แพงเกินจริง แต่หากผลประกอบการของ MSFT, META, หรือ AMZN ออกมาผิดคาดอย่างรุนแรง อาจทำให้ราคาหุ้นกระโดด (Gap Down) ทะลุระดับแนวรับและ Strike Price ที่ตั้งไว้ ส่งผลให้เกิดผลขาดทุนสูงสุด (Max Loss) ตามความกว้างของ Spread ทันที
*   **Macro Catalysts:** สัปดาห์นี้มีการประชุม FOMC (ประกาศอัตราดอกเบี้ย 29 กรกฎาคม) และตัวเลข GDP/PCE (30-31 กรกฎาคม) ซึ่งอาจสร้างความผันผวนหลอก (Whipsaw) ในตลาดรวม แนะนำให้ควบคุม Position Size (การวางเงิน) ให้เหมาะสม ไม่ Overleverage 

---

## 🌐 แหล่งข้อมูลอ้างอิง (Sources)
1. **ราคาหุ้นและการประเมินตลาด:** 
   * MSFT Price & Earnings Schedule (TradingKey, Moomoo, 28 July 2026) 
   * META Price Trends (Trefis, TradingKey, 28 July 2026)
   * AMZN Price Tracking (GuruFocus, 28 July 2026)
2. **ปฏิทินเศรษฐกิจและข่าวสารประกอบ (Earnings/FOMC):** 
   * Zacks Investment Research: Q2 2026 Tech Earnings Preview
   * Schwab Network: Weekly Market Catalysts (July 27-31, 2026)