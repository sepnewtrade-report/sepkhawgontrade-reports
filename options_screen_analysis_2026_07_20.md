<p align="center"><img src="Logo master.png" alt="SepKhawGonTrade Logo" width="150" /></p>

# 📊 Options Selection Screen: Statistical Edge Analysis

**ประจำวันที่:** 20 กรกฎาคม 2026
**Strategic Focus:** เน้นฝั่งขาย Sellers (Credit Spread/Iron Condor) และป้องกันความเสี่ยง (Hedging)
**Market Bias:** Bearish to Sideway Down (โหมด Risk-off)
**Holding Period:** สั้นมาก 1-5 วัน / ปานกลาง 30-45 วัน

---

## 1. Market Context & Technical Scan (ขั้นตอนที่ 2: การตรวจสอบความปลอดภัย)

สภาวะตลาดปัจจุบันอยู่ภายใต้แรงกดดันอย่างหนักจากปัจจัยภูมิรัฐศาสตร์ ทำให้ความผันผวนพุ่งสูงขึ้นอย่างรวดเร็ว:

*   **Macro & VIX Context:** ดัชนี VIX มีการปรับตัวพุ่งขึ้นอย่างมีนัยสำคัญ แตะระดับ **18.77** (+12.19% จากช่วงกลางสัปดาห์ก่อน) [1] ตลาดหุ้นสหรัฐฯ เข้าสู่โหมด **Risk-off** ชัดเจนจากสถานการณ์ตึงเครียดของสงครามสหรัฐฯ-อิหร่าน และราคาน้ำมันที่ทะยานทะลุ $90/บาร์เรล [2]
*   **SPY (SPDR S&P 500 ETF) - สภาวะ Bearish / Hedging:** 
    *   **Context:** โครงสร้างตลาดเป็น Sideway Down กราฟหลุดแนวรับย่อย ทำให้ค่า IV Rank ดีดตัวสูงขึ้นจากภาวะปกติ เบี้ยประกัน (Premium) สำหรับฝั่ง Put Options มีราคาแพงขึ้นจากการแห่ซื้อเพื่อป้องกันความเสี่ยง (Hedging)
    *   **Risk Validation:** มีความเสี่ยงที่ความผันผวนจะพุ่งสูงขึ้นต่อเนื่อง (Volatility Expansion) หากมีข่าวสงครามที่รุนแรงขึ้น แนะนำหลีกเลี่ยงการทำกำไรฝั่งขาขึ้นชั่วคราว
*   **AAPL (Apple Inc.) - กลยุทธ์ฝั่ง Sellers (Bearish/Neutral):** 
    *   **Context:** ปัจจุบัน AAPL มีค่า IV Percentile อยู่ที่ระดับประมาณ **67%** [3] พรีเมียมอยู่ในระดับที่ค่อนข้างแพงจากความกังวลของตลาดโดยรวม โครงสร้างราคาอาจถูกกดดันจากภาพรวมตลาด ทำให้การเด้งขึ้นมีจำกัด
    *   **Risk Validation:** เหมาะสำหรับการขายพรีเมียมแนวต้าน (Call Credit Spread) เพื่อใช้ประโยชน์จากเบี้ยที่แพงและ upside ที่จำกัด แต่ต้องระวังการประกาศงบการเงินที่อาจเข้ามาแทรกแซงทิศทาง

---

## 2. Options Screening Table (ขั้นตอนที่ 1: ค้นหาสัญญาได้เปรียบสูง)

ตารางเปรียบเทียบสัญญา Option ที่ประเมินจากสภาวะตลาด Risk-off และค่า Greeks ที่เหมาะสม (ข้อมูลตัวเลขเป็นการประเมินเบื้องต้นจากโครงสร้าง IV ปัจจุบัน เพื่อสะท้อนกลยุทธ์ ต้องตรวจสอบราคาจริงในตลาดอีกครั้งก่อนเทรด):

| Underlying Ticker | Strategy (Setup) | Strike Price | Expiration | Premium Price | Delta | Theta (Time Decay) | IV / IV Rank | Probability of ITM |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **SPY** | Bearish Put Debit Spread (Buyer) | ATM / OTM | ~1-5 Days | ปานกลางถึงสูง | ~0.40 - 0.50 | ลบ (เสียมูลค่าเวลา) | VIX Spike | ~45-50% |
| **AAPL** | Bear Call Credit Spread (Seller)| OTM (แนวต้านหลัก) | ~30-45 Days | ค่อนข้างสูง | ~0.15 - 0.20 | บวก (เข้าข้างผู้ขาย) | IV% ~67% | ~15-20% |

*หมายเหตุ: ในสภาวะตลาดที่มีความผันผวนสูงจากปัจจัยมหภาค ค่า Premium ฝั่ง Put มักจะเกิดภาวะ Skew (แพงกว่า Call) อย่างมีนัยสำคัญ*

---

## 3. Trade Setup & Warning

### 📈 แผนการเทรดที่ได้เปรียบทางสถิติ
*   **SPY (Short-term Bearish/Hedging):** ในภาวะสงครามที่ตลาดยังไม่ซึมซับข่าวร้ายทั้งหมด การใช้ **Put Debit Spread** ระยะสั้น (1-5 วัน) จะช่วยจำกัดต้นทุนค่า Premium ที่กำลังแพงขึ้นจาก VIX ที่ระดับ 18.77 ได้ดีกว่าการซื้อ Long Put เพียวๆ และใช้ทำกำไร/ป้องกันความเสี่ยงจาก downside ที่อาจเกิดขึ้นฉับพลัน
*   **AAPL (Seller Setup):** การใช้ **Bear Call Credit Spread** โดยเลือก Strike Price ของขา Short Call ให้อยู่เหนือแนวต้านสำคัญ (Delta < 0.20) จะได้เปรียบจากค่าพรีเมียมที่สูง (IV Percentile 67%) และหากตลาดซึมลงหรือไซด์เวย์ตามภาพรวม จะสามารถเก็บกำไรจาก Time Decay (Theta) ได้เต็มเม็ดเต็มหน่วย

### ⚠️ คำเตือนปัจจัยเสี่ยง (CRITICAL)
*   **Volatility Expansion (การระเบิดของความผันผวน):** เนื่องจากปัจจัยสงครามเป็นเหตุการณ์ที่คาดเดาไม่ได้ (Black Swan-like event) หากความขัดแย้งรุนแรงขึ้นกะทันหัน VIX อาจพุ่งทะลุ 25-30 ได้อย่างรวดเร็ว การทำกลยุทธ์ฝั่งขาย (Sellers) ต้องมีจุดตัดขาดทุน (Stop Loss) หรือการทำ Spread แบบจำกัดความเสี่ยง (Defined Risk) เสมอ **ห้ามขาย Naked Options เด็ดขาด**
*   **Pricing Reality Check:** ราคา Premium และค่า Greeks ในตารางเป็นการประเมินโครงสร้างความน่าจะเป็น **ผู้เทรดต้องตรวจสอบค่า IV และ VIX ล่าสุดบนแพลตฟอร์มเทรดจริง (เช่น thinkorswim, Interactive Brokers) ทุกครั้งก่อนส่งคำสั่ง** เพื่อป้องกันการประเมินความผันผวนต่ำกว่าความเป็นจริง (Underestimate Risk)

---

## 🌐 แหล่งข้อมูลอ้างอิง (Sources)
*   [1] CBOE: Volatility Index (VIX) Data (https://www.cboe.com/tradable_products/vix/)
*   [2] ข่าวสารภูมิรัฐศาสตร์และราคาน้ำมัน: Reuters / Bloomberg Markets (https://www.reuters.com/markets)
*   [3] MarketChameleon: AAPL Implied Volatility and IV Percentile (https://marketchameleon.com)
