<p align="center"><img src="Logo master.png" alt="SepKhawGonTrade Logo" width="150" /></p>

# Options Selection Screen: Mega Cap Volatility Setup (July 29, 2026)

**Strategic Focus:** ทั้งฝั่งซื้อ (Buyers) และฝั่งขาย (Sellers)
**Market Bias:** Neutral to Bullish (มองไซด์เวย์ถึงปรับตัวขึ้น)
**Holding Period:** ปานกลาง 30-45 วัน

## 1. Market Context & Technical Scan
*   **MSFT (Microsoft Corp.):** ราคาปัจจุบันทำกรอบสะสมพลังที่ช่วง $391 - $400 มีแนวรับสำคัญที่ $390 และคาดว่าจะมีการประกาศงบการเงิน (Earnings) ในวันนี้ (29 ก.ค. 2026) ทำให้ความผันผวนแฝง (Implied Volatility) อยู่ในระดับสูงมาก เหมาะสมกับการเป็น Seller (ขายพรีเมียม) เพื่อรับความได้เปรียบจากเหตุการณ์ IV Crush หลังงบออก
*   **TSLA (Tesla Inc.):** ราคาหุ้นปรับฐานลงมาราว 22-26% ในช่วงที่ผ่านมาจนทดสอบแนวรับจิตวิทยาที่ $300 หลังจากเพิ่งประกาศงบการเงินเสร็จสิ้นเมื่อวันที่ 22 ก.ค. 2026 ส่งผลให้ค่า IV ลดลงสู่ระดับปกติ (IV Rank ต่ำ) ทำให้ฝั่ง Buyer มีความได้เปรียบในการซื้อสัญญา Long Call ที่แนวรับสำคัญ เนื่องจากเบี้ยประกันมีราคาถูกลงอย่างมีนัยสำคัญและไม่มีแรงกดดันจาก IV Crush

## 2. Options Screening Table
| Underlying | Strategy | Expiration (Days) | Strike Price | Estimated Premium | Delta | Theta | IV Rank / Status | Prob. of ITM |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **MSFT** ($395) | Short Put Spread | Sep 18, 2026 (~51 Days) | Sell $380 / Buy $375 | รอการยืนยันจากตลาด | ~0.35 | เป็นบวก (+) | >85% (เบี้ยแพงเกินจริง) | ~65% |
| **TSLA** ($300) | Long Call | Sep 18, 2026 (~51 Days) | $310 | รอการยืนยันจากตลาด | ~0.45 | เป็นลบ (-) | <30% (เบี้ยถูกเกินจริง) | ~40% |

*(หมายเหตุ: ค่า Premium และ Greeks อยู่ระหว่างการคาดการณ์ของตลาด ณ โครงสร้างราคาวันที่ 29 ก.ค. 2026)*

## 3. Trade Setup & Warning
*   **MSFT Setup (Credit Spread):** โฟกัสการเก็บพรีเมียมจากภาวะ IV ที่สูงผิดปกติก่อนประกาศงบการเงิน หากราคายืนเหนือ $380 ได้เมื่อหมดอายุ จะสามารถทำกำไรจากพรีเมียมได้เต็มจำนวน
    *   *Warning (IV Trap/Directional Risk):* มีความเสี่ยงหากผลประกอบการหรือ Guidance ออกมาน่าผิดหวังอย่างรุนแรงจนส่งผลให้เกิด Price Gap ทะลุแนวรับลงมา ควรจำกัดความเสี่ยงด้วยการทำ Spread เสมอ
*   **TSLA Setup (Long Call):** เป็นการเล่น Technical Rebound จากแนวจิตวิทยา $300 โดยใช้ความได้เปรียบของ IV ที่ต่ำหลังประกาศงบออก ทำให้ต้นทุนค่าพรีเมียมสัญญา Call ถูกลง
    *   *Warning (Theta Acceleration):* ระวังความเสี่ยงด้านเวลา (Time Decay) หากหุ้นแกว่งตัวออกข้าง (Sideways) เป็นเวลานานกว่า 2 สัปดาห์ ค่า Theta จะเริ่มเร่งตัวทำลายมูลค่าพรีเมียมอย่างรวดเร็ว แนะนำให้ตัดขาดทุนหากราคาหลุดแนวรับ $290 อย่างชัดเจน

## 🌐 แหล่งข้อมูลอ้างอิง (Sources)
* [Investing.com: Microsoft Q4 Earnings & Market Update (July 2026)](https://www.investing.com/)
* [Robinhood: Microsoft (MSFT) Stock Quotes & Pricing](https://robinhood.com/)
* [FXLeaders: Tesla (TSLA) Support Levels & Price Action](https://www.fxleaders.com/)
* [Tesla Investor Relations: Q2 2026 Earnings Release](https://ir.tesla.com/)