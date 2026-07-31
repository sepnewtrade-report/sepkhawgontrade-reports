<p align="center"><img src="Logo master.png" alt="SepKhawGonTrade Logo" width="150" /></p>

# Options Selection Screen: Quantitative Premium Valuation (31 July 2026)

**พารามิเตอร์การคัดกรอง (Screening Parameters):**
* **กลยุทธ์ออปชันที่โฟกัส (Strategic Focus):** ผสมผสาน (ได้ทั้งสองฝั่ง: Buyers และ Sellers)
* **มุมมองทิศทางตลาดโดยรวม (Market Bias):** Bullish (มองขึ้น)
* **ระยะเวลาถือครองที่คาดหวัง (Holding Period):** ปานกลาง (30-45 วัน / หมดอายุช่วงกลางเดือนกันยายน 2026)

---

### 1. Market Context & Technical Scan (ตรวจสอบโครงสร้างหุ้นอ้างอิง)

จากการสแกนโมเดลเชิงสถิติของตลาดออปชันในวันที่ 31 ก.ค. 2026 โฟกัสไปที่กลุ่ม Tech ที่มี Catalyst ชัดเจน ได้แก่ **Amazon (AMZN)** และ **NVIDIA (NVDA)**

*   **Amazon (AMZN):** 
    *   **ทิศทางราคา & เทคนิคัล:** ราคาหุ้นพุ่งขึ้นกว่า 9% ทะลุ $257 รับผลประกอบการที่ยอดเยี่ยม (AWS โต 37%) เกิดเป็น Breakout เหนือแนวต้านสำคัญ 
    *   **Catalyst & Risk:** เนื่องจากงบออกไปแล้วเรียบร้อย ตลาดจึงเผชิญกับภาวะ **"IV Crush"** หรือการยุบตัวของความผันผวนอย่างรวดเร็ว ทำให้เบี้ยประกัน (Premium) ของ AMZN กลับมาอยู่ในโซน "ราคาถูก" เอื้อประโยชน์ให้ฝั่งผู้ซื้อ (Option Buyers) 
*   **NVIDIA (NVDA):**
    *   **ทิศทางราคา & เทคนิคัล:** ราคาหุ้นทรงตัวสร้างฐานแน่นบริเวณ $174.40 โดยมีแนวรับที่แข็งแกร่งบริเวณ $170
    *   **Catalyst & Risk:** ความผันผวนแฝง (IV) ประเมินอยู่ที่ระดับ 48% และ IV Rank สูงถึง 70% ซึ่งสะท้อนว่าเบี้ยประกันของ NVDA ในขณะนี้ "แพงเกินจริง" (Overpriced Premium) เมื่อเทียบกับราคาที่วิ่งออกข้าง จึงเป็นโอกาสทองของฝั่งผู้ขาย (Option Sellers) ที่จะกินค่า Time Decay

### 2. Options Screening Table (ตารางสัญญาที่ได้เปรียบสูงสุด)

เปรียบเทียบสัญญา Option ที่ผ่านการคัดกรองทางสถิติ โดยเลือกใช้ Strike Price ที่มีค่า Delta ระหว่าง 0.40 - 0.60 เพื่อรักษาสมดุลของ Risk-to-Reward Ratio:

| Underlying Ticker | กลยุทธ์ (Strategy) | Strike | Expiration | Premium Price* | Delta | Theta | IV / IV Rank | Probability of ITM |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **AMZN** ($257) | **Buyer:** Long Call | $260 | Mid-Sep 2026 (30-45 วัน) | *รอการประเมินจากตลาด* | ~0.55 | -0.12 | IV: ต่ำลง (IV Crush) | ~45% |
| **NVDA** ($174) | **Seller:** Short Put | $170 | Mid-Sep 2026 (30-45 วัน) | *รอการประเมินจากตลาด* | ~0.35 | +0.18 | IV: 48% (IVR: 70%) | ~35% |

*(หมายเหตุ: *Premium Price ที่แท้จริงอยู่ระหว่างการคาดการณ์ของตลาดและผันผวนตาม Real-time Quotes แนะนำให้ตรวจสอบกับ Broker ก่อนส่งคำสั่งซื้อขาย)*

**การวิเคราะห์เชิงลึก (Greeks Analysis):**
*   **AMZN (ฝั่ง Buyer):** การทำ Long Call หลังเกิดภาวะ IV Crush ถือเป็นแต้มต่อทางสถิติที่สำคัญ เพราะนักลงทุนไม่ต้องแบกรับต้นทุนค่าความผันผวนที่สูงเกินจริงอีกต่อไป (IV < HV) และมีค่า Delta ที่ 0.55 ช่วยให้สัญญาตอบสนองต่อราคาหุ้นขาขึ้นได้อย่างเต็มที่
*   **NVDA (ฝั่ง Seller):** การทำ Short Put (หรือ Bull Put Spread) ที่ Strike $170 อาศัยความได้เปรียบจาก IV Rank ที่สูงถึง 70% หมายความว่าผู้ขายจะได้รับ Premium คุ้มค่ากว่าปกติ และได้รับประโยชน์จาก Theta ที่เป็นบวกทุกวันตราบใดที่หุ้นไม่หลุด $170

### 3. Trade Setup & Warning (แผนการเทรดและข้อควรระวัง)

*   **Setup สำหรับ AMZN (Post-Earnings Momentum Play):** 
    *   ใช้กลยุทธ์ Long Call (หรือ Bull Call Spread เพื่อลดต้นทุน) อิง Strike $260 โดยอาศัยโมเมนตัมผลประกอบการดันราคาขึ้นต่อ
    *   **⚠️ คำเตือน:** หากเกิดแรงเทขายทำกำไร (Profit Taking) หุ้นอาจปรับฐานลงมาปิด Gap ที่เปิดไว้ แม้ค่า IV จะต่ำแล้ว แต่ผู้ถือสัญญา Call ยังคงต้องระวังผลกระทบของ Time Decay (Theta) หากราคาหุ้นพักตัวนานเกินไป
*   **Setup สำหรับ NVDA (Volatility Premium Selling):**
    *   ใช้กลยุทธ์ Bull Put Spread หรือ Short Put โดยอิง Strike ใต้โซน $170 เพื่อกินเปล่าค่าพรีเมียมในขณะที่ราคาไซด์เวย์ออกข้าง (เชื่อมโยงกับพฤติกรรมสะสมหุ้นของสถาบันในรายงาน 🔗[Whale Flow Analysis](whale_flow_analysis_2026_07_31.md) ที่ระดับ $174)
    *   **⚠️ คำเตือน:** ความผันผวนอาจกระชากกลับได้ทุกเมื่อ หากมีข่าวเชิงลบเกี่ยวกับอุตสาหกรรมชิป การตั้งจุดตัดขาดทุน (Stop Loss) หรือบังคับใช้ Spread จะช่วยจำกัดความเสี่ยงจาก Gamma Risk ได้ดีที่สุด

---

## 🌐 แหล่งข้อมูลอ้างอิง (Sources)
1. OptionCharts & MarketBeat: สถิติ Implied Volatility (IV), IV Rank และโครงสร้างสัญญาของ NVDA (https://optioncharts.io, https://www.marketbeat.com)
2. UnusualWhales: คาดการณ์ Implied Move และพฤติกรรม IV Crush หลังการประกาศงบของ AMZN (https://unusualwhales.com)
3. FXLeaders: การรายงานข่าวราคาหุ้น AMZN พุ่งทะยานกว่า 9% ทะลุ $257 หลังผลประกอบการ (https://www.fxleaders.com)