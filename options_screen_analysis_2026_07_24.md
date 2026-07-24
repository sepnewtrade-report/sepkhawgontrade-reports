<p align="center"><img src="Logo master.png" alt="SepKhawGonTrade Logo" width="150" /></p>

# บทวิเคราะห์คัดกรองสัญญา Options เชิงสถิติ (Options Selection Screen)

**รายงานประจำวันที่:** 24 กรกฎาคม 2026
**กลยุทธ์หลัก (Strategic Focus):** เน้นฝั่งขาย Sellers (Credit Spread) เพื่อรับประทานค่าพรีเมียม
**มุมมองตลาด (Market Bias):** Neutral ถึง Bullish (มองไซด์เวย์ถึงปรับตัวขึ้นในกรอบ)
**ระยะเวลาถือครอง (Holding Period):** ปานกลาง 30-45 วัน

## 1. Market Context & Technical Scan
สภาพตลาดหุ้นสหรัฐฯ ในช่วงปลายเดือนกรกฎาคม 2026 กำลังเผชิญกับความผันผวนที่สูงขึ้นอย่างมีนัยสำคัญ โดยดัชนี S&P 500 และ Nasdaq 100 มีการย่อตัวแรงจากการเทขายในกลุ่มเทคโนโลยีขนาดใหญ่และปัจจัยกดดันจากราคาน้ำมันและอัตราผลตอบแทนพันธบัตรที่พุ่งสูงขึ้น (อ้างอิงจากข้อมูลตลาด ณ วันที่ 23 ก.ค. 2026) 
ส่งผลให้ดัชนีความผันผวน (VIX) ปรับตัวสูงขึ้นกว่า 16% (อ้างอิงจากข้อมูลดัชนี CBOE Volatility Index ล่าสุด) ซึ่งในเชิงคณิตศาสตร์ของออปชัน การที่ VIX พุ่งสูงขึ้นแปลว่าราคาพรีเมียมของสัญญาออปชันโดยรวมแพงขึ้น (IV > HV) จึงเป็นจังหวะที่ได้เปรียบเชิงสถิติสำหรับกลยุทธ์ "การขายพรีเมียม" (Option Selling)

จากการสแกนหาหุ้น Mega/Large Cap ที่มีค่า Implied Volatility (IV) Rank อยู่ในระดับสูงผิดปกติเมื่อเทียบกับค่าเฉลี่ยในอดีต (Premium Valuation แพงเกินจริง) หุ้นที่ผ่านเกณฑ์ทางสถิติและน่าสนใจสำหรับการทำกลยุทธ์ Put Credit Spread เพื่อดักกินค่าเสื่อมเวลา (Theta) ได้แก่:
- **NVIDIA (NVDA):** ราคาปัจจุบัน $208.76 (อ้างอิงจากราคาปิดวันที่ 23 ก.ค. 2026) ยังคงมีค่า IV สูงจากรอบการลงทุน AI
- **Palantir Technologies (PLTR):** ราคาปัจจุบัน $122.14 (อ้างอิงจากราคาปิดวันที่ 23 ก.ค. 2026) เป็นหุ้นที่มี IV Rank สูงทะลุเกณฑ์จากการเตรียมประกาศงบ

## 2. Options Screening Table
ตารางเปรียบเทียบสัญญา Option ฝั่งขาย (Short Put Credit Spread) ระยะเวลา 35 วัน ที่มีความได้เปรียบทางสถิติสูงสุด:

| Underlying Ticker | Target Strike (Short Put) | Expiration Date | Premium Price (Est.) | Delta | Theta (Time Decay) | Implied Volatility (IV) | Probability of ITM |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **NVDA** ($208.76) | $190.00 | 28 Aug 2026 (35 Days) | ~$4.50 | -0.40 | -0.08 / day | สูง (IV > HV) | ~35% |
| **PLTR** ($122.14) | $110.00 | 28 Aug 2026 (35 Days) | ~$3.20 | -0.42 | -0.06 / day | สูงมาก (Earnings IV) | ~38% |

*(หมายเหตุ: ตัวเลข Premium, Delta, Theta และ Prob. ITM เป็นค่าประมาณการเชิงสถิติจากโครงสร้างความผันผวนปัจจุบันของตลาด ณ วันที่ 24 ก.ค. 2026)*

## 3. Trade Setup & Warning
**แผนการเทรด (Trade Setup):**
กลยุทธ์ที่ได้เปรียบที่สุดในสภาวะตลาดที่ IV Rank พุ่งสูงเช่นนี้ คือการใช้ **Put Credit Spread** โดยการขาย Put ที่ Strike Price แนวรับ (เช่น NVDA ที่ $190 และ PLTR ที่ $110) และซื้อ Put ป้องกันความเสี่ยงที่ Strike ต่ำกว่า เพื่อจำกัดความเสี่ยง (Defined Risk) 
- อัตรา Risk-to-Reward Ratio ควรถูกควบคุมไว้ที่ไม่เกิน 1:2 ถึง 1:3 
- การวาง Delta ไว้ที่ระดับประมาณ 0.40 ให้ความสมดุลระหว่างโอกาสทำกำไร (Probability of OTM > 60%) และมูลค่าพรีเมียมที่ได้รับ
- Time Decay (Theta) จะเริ่มเร่งตัวขึ้น (Theta Acceleration) เมื่อสัญญาเข้าสู่วันหมดอายุที่น้อยกว่า 21 วัน ดังนั้นสามารถวางแผนปิดทำกำไรล่วงหน้าเมื่อได้รับพรีเมียมเกิน 50% ของเป้าหมาย

**ข้อควรระวังสำคัญ (IV Trap & Catalysts Warning):**
- **PLTR Earnings:** มีกำหนดการรายงานผลประกอบการในวันที่ 3 สิงหาคม 2026 (อ้างอิงจากประกาศของบริษัทและ Nasdaq)
- **NVDA Earnings:** มีกำหนดการรายงานผลประกอบการในวันที่ 26 สิงหาคม 2026 (อ้างอิงจาก Wall Street Horizon)
การถือสัญญากลยุทธ์ขายคร่อมช่วงวันประกาศงบ (Earnings Date) อาจต้องเผชิญกับความเสี่ยงจากราคาหุ้นที่กระโดด (Gap Risk) แม้ว่าจะได้รับประโยชน์จากสภาวะ IV Crush (ความผันผวนลดฮวบหลังงบออก) ก็ตาม แนะนำให้จัดสรรเงินทุน (Position Sizing) อย่างระมัดระวัง และหลีกเลี่ยงการใช้ Leverage มากเกินไป (Overleverage) ในช่วงสัปดาห์ Earnings

## 🌐 แหล่งข้อมูลอ้างอิง (Sources)
- ราคาหุ้นและดัชนีภาพรวมตลาด: [Nasdaq Market Data](https://www.nasdaq.com/) (ราคาอ้างอิง ณ วันที่ 23 ก.ค. 2026)
- กำหนดการผลประกอบการ Palantir (PLTR): [Palantir Investor Relations](https://investors.palantir.com/) / [Nasdaq Earnings Calendar](https://www.nasdaq.com/)
- กำหนดการผลประกอบการ NVIDIA (NVDA): [Wall Street Horizon](https://www.wallstreethorizon.com/)
- ข้อมูลความผันผวนรวม (VIX) และสถานการณ์ตลาด: CBOE Volatility Index, Reuters และ Bloomberg
