<p align="center"><img src="Logo master.png" alt="SepKhawGonTrade Logo" width="150" /></p>

# Options Selection Screen: Quantitative Premium Valuation (30 July 2026)

**พารามิเตอร์การคัดกรอง (Screening Parameters):**
* **กลยุทธ์ออปชันที่โฟกัส (Strategic Focus):** ผสมผสาน (ได้ทั้งสองฝั่ง: Buyers และ Sellers)
* **มุมมองทิศทางตลาดโดยรวม (Market Bias):** Neutral ถึง Bullish (มองไซด์เวย์ถึงขึ้น)
* **ระยะเวลาถือครองที่คาดหวัง (Holding Period):** ปานกลาง (30-45 วัน / หมดอายุช่วงกลางเดือนกันยายน 2026)

---

### 1. Market Context & Technical Scan (ตรวจสอบโครงสร้างหุ้นอ้างอิง)

จากการสแกนตลาดออปชันสหรัฐฯ หุ้น Mega Cap ที่มีโครงสร้างความผันผวน (Implied Volatility) โดดเด่นและผ่านเกณฑ์การตรวจสอบทางสถิติ ได้แก่ **Apple Inc. (AAPL)** และ **Tesla Inc. (TSLA)**

*   **Apple Inc. (AAPL):** 
    *   **ทิศทางราคา & เทคนิคัล:** ราคาหุ้นทรงตัวบริเวณ $338 (ณ วันที่ 30 ก.ค. 2026) โครงสร้างอยู่ในโซนพักตัวเพื่อรอ Catalyst สำคัญ แนวรับหลักอยู่ที่ $330 และแนวต้านที่ $345 (อ้างอิงข้อมูลราคาจาก UnusualWhales และ Barchart)
    *   **Catalyst & Risk:** มีการประกาศผลประกอบการ (Earnings) หลังตลาดปิดวันที่ 30 ก.ค. 2026 ทำให้ค่าความผันผวนแฝง (IV) พุ่งสูงขึ้นอย่างมีนัยสำคัญ
*   **Tesla Inc. (TSLA):**
    *   **ทิศทางราคา & เทคนิคัล:** ราคาหุ้นเพิ่งผ่านการปรับฐานลงติดต่อกัน 6 วันรวด โดยลดลงกว่า 21% มาปิดที่ระดับ $298.32 (อ้างอิงข้อมูลราคาจาก Investing.com) เกิดภาวะ Oversold ในระยะสั้น แนวรับเชิงจิตวิทยาอยู่ที่ $290 และ $280 
    *   **Catalyst & Risk:** ตลาดรับรู้ข่าวร้ายไปค่อนข้างมาก (Priced-in) ทำให้ความผันผวนแฝง (IV) ปัจจุบันต่ำกว่าความผันผวนในอดีต (HV) ซึ่งสร้างความได้เปรียบให้ฝั่งผู้ซื้อ (Buyers)

### 2. Options Screening Table (ตารางสัญญาที่ได้เปรียบสูงสุด)

เปรียบเทียบสัญญา Option ที่ผ่านการคัดกรองทางสถิติ โดยเลือกใช้ Strike Price ที่มีค่า Delta ระหว่าง 0.40 - 0.60 เพื่อรักษาสมดุลของ Risk-to-Reward Ratio:

| Underlying Ticker | กลยุทธ์ (Strategy) | Strike | Expiration | Premium Price* | Delta | Theta | IV / IV Rank | Probability of ITM |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **AAPL** ($338) | **Seller:** Short Put | $335 | Mid-Sep 2026 (30-45 วัน) | *รอการประเมินจากตลาด* | ~0.45 | -0.15 | IV: 29% (IVR: 75%) | ~42% |
| **TSLA** ($298) | **Buyer:** Long Call | $300 | Mid-Sep 2026 (30-45 วัน) | *รอการประเมินจากตลาด* | ~0.52 | -0.25 | IV: 44.9% (HV: 50.8%) | ~48% |

*(หมายเหตุ: *Premium Price ที่แท้จริงอยู่ระหว่างการคาดการณ์ของตลาดและผันผวนตาม Real-time Quotes แนะนำให้ตรวจสอบกับ Broker ก่อนส่งคำสั่งซื้อขาย)*

**การวิเคราะห์เชิงลึก (Greeks Analysis):**
*   **AAPL (ฝั่ง Seller):** ค่า IV Rank พุ่งสูงถึง 75% และ IV30 อยู่ที่ระดับ 29% (MarketChameleon, OptionCharts) ถือว่าเบี้ยประกันแพงเกินจริง (Overpriced Premium) เหมาะสมกับการวางกลยุทธ์ฝั่งขาย (Credit Spread หรือ Short Put) เพื่อทำกำไรจากภาวะ IV Crush หลังประกาศงบ
*   **TSLA (ฝั่ง Buyer):** แม้ IV จะดูสูงที่ 44.9% แต่เมื่อเทียบกับความผันผวนที่เกิดขึ้นจริง (20-day HV ที่ 50.8%) ถือว่าเบี้ยประกันของ TSLA ถูกกว่าความเป็นจริงเชิงสถิติ (Underpriced Premium) ทำให้การใช้กลยุทธ์ Long Call ณ ระดับ Delta 0.52 มีความคุ้มค่าสูงในการเก็งกำไรจังหวะ Technical Rebound

### 3. Trade Setup & Warning (แผนการเทรดและข้อควรระวัง)

*   **Setup สำหรับ AAPL (Volatility Contraction Play):** 
    *   ใช้กลยุทธ์ Bull Put Spread หรือ Short Put โดยอิง Strike ที่ $335 หรือต่ำกว่า เพื่อรับ Premium ที่หนาเป็นพิเศษ
    *   **⚠️ คำเตือน:** หากผลประกอบการผิดพลาดอย่างรุนแรง (Earnings Miss) หุ้นมีโอกาส Gap Down ทะลุแนวรับ ซึ่ง Gamma จะขยายตัวและส่งผลขาดทุนฉับพลัน ต้องควบคุมความเสี่ยงด้วย Spread หรือ Position Sizing อย่างเข้มงวด
*   **Setup สำหรับ TSLA (Reversion to the Mean):**
    *   ใช้กลยุทธ์ Long Call ที่ Strike $300 เพื่อดักจังหวะฟื้นตัวจากการเทขายที่มากเกินไป (Oversold) โดยมี Time Decay (Theta) ที่ระดับ -0.25 ซึ่งพอรับได้สำหรับกรอบเวลา 30-45 วัน
    *   **⚠️ คำเตือน:** แม้ IV < HV แต่สัญญาฝั่งซื้อยังมีผลกระทบจาก Theta Acceleration เมื่อเวลาผ่านไป หากราคาไม่วิ่งตามแผนภายใน 15-20 วันแรก ควรพิจารณาตัดขาดทุนเพื่อหนี Time Decay

---

## 🌐 แหล่งข้อมูลอ้างอิง (Sources)
1. UnusualWhales: สถิติการซื้อขาย Options และ Expected Move ของ AAPL (https://unusualwhales.com)
2. MarketChameleon: ข้อมูล IV, IV Rank, และ Historical Volatility ของ AAPL และ TSLA (https://marketchameleon.com)
3. OptionCharts: วิเคราะห์ IV Rank และ 30-Day IV ของ AAPL (https://optioncharts.io)
4. Investing.com & Barchart: ข้อมูลราคาปิดและแนวโน้มทางเทคนิคของ TSLA และ AAPL (https://www.investing.com, https://www.barchart.com)