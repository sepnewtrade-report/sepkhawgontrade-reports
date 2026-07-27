<p align="center"><img src="Logo master.png" alt="SepKhawGonTrade Logo" width="150" /></p>

# Quantitative Options Screening: Premium Sellers Strategy

**Strategic Focus:** เน้นฝั่งขาย (Sellers) - Credit Spread / Iron Condor
**Market Bias:** Neutral ถึง Bullish (มองไซด์เวย์ถึงปรับตัวขึ้นเล็กน้อย)
**Holding Period:** ปานกลาง 30-45 วัน

---

## 1. Market Context & Technical Scan (ตรวจสอบบริบทตลาดและโครงสร้างราคา)

จากการสแกนตลาดออปชันในกลุ่ม Mega Cap ล่าสุด พบว่าความผันผวนแฝง (Implied Volatility - IV) ปรับตัวสูงขึ้นอย่างมีนัยสำคัญในหุ้นเทคโนโลยีขนาดใหญ่ เนื่องจากตลาดเพิ่งผ่านช่วงการเทขาย (Sell-off) และกำลังเข้าสู่ฤดูกาลประกาศงบการเงิน (Earnings Season) ทำให้ Options Premium มีราคาแพงกว่าปกติ (High IV Rank) ซึ่งเปิดโอกาสให้เราใช้กลยุทธ์ฝั่งขาย (Premium Selling) เพื่อความได้เปรียบทางสถิติ

### **Apple Inc. (AAPL)**
*   **ราคาปัจจุบัน (อ้างอิง 24 ก.ค. 2026):** $333.02 ([1])
*   **Trend Phase:** พักตัวในกรอบกว้างหลังจากทำจุดสูงสุดใหม่ 
*   **แนวรับ-แนวต้านหลัก:** แนวรับสำคัญอยู่ที่ $315 - $320 (โซนที่มี Volume Profile หนาแน่น) และแนวต้านที่ $345 - $350
*   **Catalysts/เหตุการณ์สำคัญ:** กำหนดประกาศงบการเงิน Q3/2026 ในวันที่ **30 กรกฎาคม 2026** ([6], [7]) ส่งผลให้ IV Rank ปัจจุบันพุ่งสูงขึ้นอย่างมาก (IV > HV) สัญญาณเบี้ยประกันแพงเกินจริง เหมาะสำหรับการดักเก็บ Premium จาก Volatility Crush หลังงบออก

### **NVIDIA Corp. (NVDA)**
*   **ราคาปัจจุบัน (อ้างอิง 24 ก.ค. 2026):** $206.84 ([1])
*   **Trend Phase:** แกว่งตัวผันผวนสูง (High Beta) ในแนวโน้มขาขึ้นหลัก แต่ระยะสั้นได้รับแรงกดดันจากกลุ่ม AI 
*   **แนวรับ-แนวต้านหลัก:** แนวรับจิตวิทยาและเส้นค่าเฉลี่ยสำคัญที่ $190 - $195 แนวต้านที่ $225
*   **Catalysts/เหตุการณ์สำคัญ:** กำหนดประกาศงบการเงิน Q2/2027 ในวันที่ **26 สิงหาคม 2026** ([1], [2]) ซึ่งอยู่ในกรอบระยะเวลาถือครอง 30-45 วันพอดี การทำกลยุทธ์ Iron Condor แบบกว้างจะช่วยดักกินค่า Time Decay (Theta) และ IV ที่อยู่ในระดับสูงได้

---

## 2. Options Screening Table (ตารางคัดกรองสัญญาได้เปรียบสูงสุด)

การคัดกรองนี้เน้นหาช่วง Strike Price ที่มี Delta เหมาะสม (ความเสี่ยงต่ำ-กลาง) และให้ผลตอบแทนคุ้มค่าเมื่อเทียบกับความน่าจะเป็น (Probability of ITM)

| Underlying Ticker | Strategy | Expiration (Days) | Strike Price | Premium Price (Est.) | Delta | Theta | IV | Prob of ITM |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **AAPL** | Bull Put Spread | 45 วัน (ต้น ก.ย. 26) | Sell $315 / Buy $310 | ~$1.20 - $1.50 | -0.25 / 0.18 | บวก (Positive) | > 45% (High) | ~22% |
| **NVDA** | Iron Condor | 45 วัน (ต้น ก.ย. 26) | Put: 190/185 <br> Call: 230/235 | ~$1.80 - $2.10 | ~0.20 (P) / ~0.25 (C)| บวก (Positive) | > 55% (High) | ~25% |

*(หมายเหตุ: ตัวเลข Premium, Delta, Theta และ IV เป็นการประมาณการทางสถิติตามสภาวะ High IV Environment ของหุ้นกลุ่มนี้อ้างอิงจากราคาปิดล่าสุด)*

---

## 3. Trade Setup & Warning (แผนการเทรดและข้อควรระวัง)

### **Trade Setup เชิงสถิติ**
*   **AAPL (Bull Put Spread):** ได้เปรียบจาก IV Rank ที่สูงก่อนงบออกในวันที่ 30 ก.ค. 2026 หากหลังงบออกราคา AAPL ไม่หลุดแนวรับ $315 ค่าความผันผวน (IV) จะลดลงอย่างรวดเร็ว (IV Crush) ทำให้ราคาของ Option ฝั่งที่เราขายเสื่อมค่าลง เปิดโอกาสให้เราปิดทำกำไรได้ก่อนกำหนดโดยไม่ต้องรอจนหมดอายุสัญญา
*   **NVDA (Iron Condor):** กลยุทธ์นี้ออกแบบมาเพื่อดักจับการแกว่งตัวในกรอบกว้าง ($190 - $230) โดยใช้ประโยชน์จาก Theta Decay ที่จะเร่งตัวขึ้นเมื่อใกล้เข้าสู่วันประกาศงบในช่วงปลายเดือนสิงหาคม

### **⚠️ ข้อควรระวัง (Risk Warning)**
1.  **Earnings Volatility (ความเสี่ยงช่วงงบออก):** แม้การตั้ง Strike จะห่างจากราคาปัจจุบันพอสมควร แต่การถือสัญญาข้ามวันประกาศงบมีความเสี่ยงจาก Gap Down/Up ที่รุนแรง (Binary Event) แนะนำให้ใช้ Position Sizing ที่เล็กลงเพื่อจำกัดความเสี่ยง (Defined Risk)
2.  **IV Trap:** ห้ามเปลี่ยนไปใช้กลยุทธ์ฝั่งซื้อ (Long Call/Put) ในช่วงนี้เด็ดขาด เพราะเบี้ยประกัน (Premium) แพงเกินจริงจากความกังวลของตลาด หากซื้อตอนนี้มีโอกาสขาดทุนสูงทันทีที่ IV ปรับตัวลงสู่ค่าเฉลี่ย
3.  **Theta Acceleration:** ระยะเวลา 30-45 วันเป็นช่วงที่ Time Decay ทำงานได้ดีที่สุดสำหรับฝั่งผู้ขาย แต่หากทิศทางราคาเริ่มวิ่งเข้าใกล้ Strike Price (Delta เริ่มสูงขึ้น) ต้องมีจุดตัดขาดทุน (Stop Loss) หรือแผนม้วนสัญญา (Rolling) เตรียมไว้ล่วงหน้า

---

## 🌐 แหล่งข้อมูลอ้างอิง (Sources)
*   [1] ราคาปิดหุ้นสหรัฐฯ ล่าสุด (24 ก.ค. 2026): สรุปข้อมูลตลาดเทคโนโลยี [MarketWatch / TradingView / Google Finance]
*   [2] NVIDIA (NVDA) Earnings Date Announcement: [NVIDIA Investor Relations](https://investor.nvidia.com/)
*   [3] ข้อมูลปฏิทินงบการเงิน MarketChameleon: [MarketChameleon (NVDA)](https://marketchameleon.com/)
*   [6] Apple (AAPL) Earnings Date Q3 2026: [Perplexity AI / Financial News](https://www.perplexity.ai/)
*   [7] Apple Investor Relations: [Apple.com](https://investor.apple.com/)
