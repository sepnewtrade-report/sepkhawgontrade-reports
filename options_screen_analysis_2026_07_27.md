<p align="center"><img src="Logo master.png" alt="SepKhawGonTrade Logo" width="150" /></p>

# Quantitative Options Screening: Premium Sellers Strategy

**Strategic Focus:** เน้นฝั่งขาย (Sellers) - Credit Spread / Iron Condor
**Market Bias:** Neutral ถึง Bullish (มองไซด์เวย์ถึงปรับตัวขึ้นเล็กน้อย)
**Holding Period:** ปานกลาง 30-45 วัน (แต่มีแผน Exit ก่อนกำหนด)

---

## 1. Market Context & Technical Scan (ตรวจสอบบริบทตลาดและโครงสร้างราคา)

จากการสแกนตลาดออปชันในกลุ่ม Mega Cap พบว่าความผันผวนแฝง (Implied Volatility - IV) ปรับตัวสูงขึ้นอย่างมีนัยสำคัญในหุ้นเทคโนโลยีขนาดใหญ่ เนื่องจากกำลังเข้าสู่ฤดูกาลประกาศงบการเงิน (Earnings Season) ทำให้ Options Premium มีราคาแพงกว่าปกติ (IV Rank > 40-50) ซึ่งเปิดโอกาสให้เราใช้กลยุทธ์ฝั่งขาย (Premium Selling) เพื่อเก็บรอบ IV Mean Reversion

### **Apple Inc. (AAPL)**
*   **ราคาปัจจุบัน (อ้างอิง 24 ก.ค. 2026):** $333.02 ([1])
*   **Trend Phase:** พักตัวในกรอบกว้างหลังจากทำจุดสูงสุดใหม่ 
*   **แนวรับ-แนวต้านหลัก:** แนวรับสำคัญอยู่ที่ $315 - $320 และแนวต้านที่ $345 - $350
*   **Catalysts/เหตุการณ์สำคัญ:** ประกาศงบ Q3/2026 ในวันที่ **30 กรกฎาคม 2026** ([6], [7]) ส่งผลให้ IV Rank ปัจจุบันพุ่งสูงขึ้น 

### **NVIDIA Corp. (NVDA)**
*   **ราคาปัจจุบัน (อ้างอิง 24 ก.ค. 2026):** $206.84 ([1])
*   **Trend Phase:** แกว่งตัวผันผวนสูง (High Beta) 
*   **แนวรับ-แนวต้านหลัก:** แนวรับจิตวิทยาที่ $190 - $195 แนวต้านที่ $225 - $230
*   **Catalysts/เหตุการณ์สำคัญ:** ประกาศงบ Q2/2027 ในวันที่ **26 สิงหาคม 2026** ([1], [2])

---

## 2. Options Screening Table (ตารางคัดกรองสัญญาได้เปรียบสูงสุด)

วางแผน Strike ให้อยู่นอกกรอบ **Expected Move** ($ S \times IV \times \sqrt{t} $) เพื่อเพิ่มความน่าจะเป็นในการทำกำไร (Probability of OTM > 70%)

| Underlying Ticker | Strategy | Expiration (Days) | Strike Price | Premium Price (Est.) | Delta | Probability of ITM |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **AAPL** | Bull Put Spread | 45 วัน (ต้น ก.ย. 26) | Sell $315 / Buy $310 | ~$1.20 - $1.50 | ~-0.20 | ~22% |
| **NVDA** | Iron Condor (Bullish Skew) | 45 วัน (ต้น ก.ย. 26) | Put: 195/190 <br> Call: 235/240 | ~$1.80 - $2.10 | ~0.20 (P) / 0.15 (C)| ~25% |

---

## 3. Trade Setup & Quant Enhancements (แผนการเทรดขั้นสูง)

### **AAPL: Pre-Earnings IV Crush Play**
*   **การเข้าทำกำไร (Entry):** สร้างฐาน 10-14 วันก่อนวันประกาศงบ (ขณะที่ IV กำลังเร่งตัวขึ้น)
*   **จุดออก (Exit Strategy):** **"ห้ามถือจนหมดอายุสัญญา (Expiration)"** ให้รีบปิดสถานะทำกำไรทันทีภายใน 1-3 วันหลังประกาศงบเสร็จสิ้น เพื่อรับประโยชน์จากการหดตัวของความผันผวนอย่างรุนแรง (IV Crush)

### **NVDA: Skewed Iron Condor (Range + High IV Harvest)**
*   **การปรับสมดุล (Refinement):** เนื่องจากตลาดมีทิศทาง Bias ไปทาง Bullish และ Put Premium มักจะแพงกว่า Call จึงทำการปรับ Skew ให้ฝั่ง Put อยู่ใกล้ราคาปัจจุบันมากกว่าฝั่ง Call เล็กน้อย (Put: 195, Call: 235) เพื่อรับเครดิตชดเชยความเสี่ยงขาลงได้ดีขึ้น
*   **การเก็บกิน Theta (Decay):** การกางปีกกว้างทั้งสองฝั่งช่วยลดความเสี่ยงด้าน Gamma ลง ทำให้สามารถทนทานต่อการแกว่งตัวได้ดี

### **กฎเหล็กด้านความเสี่ยง (High Impact Rules)**
1.  **Profit-Taking Rule:** ปิดทำกำไรทันทีที่ระดับ **50-70% ของ Max Profit** เพื่อลดความเสี่ยงด้าน Gamma ที่มักจะเร่งตัวขึ้นในช่วงปลายอายุสัญญา (หลีกเลี่ยงการโดนลากในช่วง 21 วันสุดท้าย)
2.  **Stop-Loss Rule:** ตัดขาดทุนเมื่อราคา Premium วิ่งสวนทางจนถึงระดับ **1.5x - 2.0x ของเครดิตที่ได้รับมา**
3.  **Correlation Risk:** ระวังความเสี่ยงพอร์ตโฟลิโอ เนื่องจาก AAPL และ NVDA เป็นหุ้นกลุ่มเทคโนโลยีขนาดใหญ่ทั้งคู่ การทำกลยุทธ์ฝั่ง Bullish 2 ตัวพร้อมกัน เท่ากับเป็นการทุ่มน้ำหนักเดิมพันไปในทิศทางเดียวกันทั้งหมด แนะนำให้ปรับลด Position Size หรือกระจายความเสี่ยงไปใน Sector อื่นเพิ่มเติม

---

## 🌐 แหล่งข้อมูลอ้างอิง (Sources)
*   [1] ราคาปิดหุ้นสหรัฐฯ ล่าสุด (24 ก.ค. 2026): สรุปข้อมูลตลาดเทคโนโลยี [MarketWatch / TradingView / Google Finance]
*   [2] NVIDIA (NVDA) Earnings Date Announcement: [NVIDIA Investor Relations](https://investor.nvidia.com/)
*   [6] Apple (AAPL) Earnings Date Q3 2026: [Perplexity AI / Financial News](https://www.perplexity.ai/)
*   [7] Apple Investor Relations: [Apple.com](https://investor.apple.com/)