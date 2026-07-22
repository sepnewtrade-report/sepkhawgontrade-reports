<p align="center"><img src="Logo master.png" alt="SepKhawGonTrade Logo" width="150" /></p>

# Quantitative Options Screening Analysis: High Probability Credit Spreads

**Strategic Focus:** เน้นฝั่งขาย (Sellers - Credit Spread)
**Market Bias:** Bullish ถึง Neutral
**Holding Period:** ปานกลาง (30-45 วัน)

รายงานฉบับนี้มุ่งเน้นการคัดกรองสัญญา Option ที่มีความได้เปรียบทางสถิติสูง โดยใช้กระบวนการคัดกรอง 2 ขั้นตอน (Options-First Scanning & Stock Validation) เพื่อค้นหาโอกาสในการเก็บ Premium จากหุ้น Mega Cap ที่มีสภาพคล่องสูงและมีโครงสร้างราคาที่ชัดเจน 

---

## 1. Market Context & Technical Scan (ตรวจสอบโครงสร้างราคาและปัจจัยเสี่ยง)

จากการสแกนตลาดล่าสุด พบหุ้น Mega Cap 2 ตัวที่มีความน่าสนใจเชิงสถิติสำหรับกลยุทธ์ฝั่งขาย (Credit Spread) เนื่องจากมีระดับความผันผวน (Implied Volatility) ที่เอื้ออำนวยและมีแนวรับที่แข็งแกร่ง

### **Alphabet Inc. (GOOGL)**
*   **Current Price:** $349.37 (ราคาอ้างอิง ณ วันที่ 21 ก.ค. 2026)
*   **Trend Phase:** พักตัวในกรอบขาขึ้น (Consolidation in Uptrend)
*   **Key Levels:** แนวรับหลัก $330.00 / แนวต้าน $360.00
*   **Catalyst & IV Trap Warning:** มีกำหนดรายงานผลประกอบการ (Earnings) ในวันที่ 22 ก.ค. 2026 (หลังปิดตลาด) ส่งผลให้ค่า IV (Implied Volatility) ปัจจุบันอยู่ในระดับสูงกว่าปกติมาก (IV Rank สูง) ซึ่งเป็นข้อได้เปรียบสำหรับผู้ขาย Option ที่ต้องการใช้ประโยชน์จากปรากฏการณ์ IV Crush หลังประกาศงบ

### **NVIDIA Corporation (NVDA)**
*   **Current Price:** $202.81 (ราคาอ้างอิง ณ วันที่ 20 ก.ค. 2026)
*   **Trend Phase:** แนวโน้มขาขึ้นแข็งแกร่ง (Strong Uptrend)
*   **Key Levels:** แนวรับหลัก $185.00 / แนวต้าน $215.00
*   **Catalyst & IV Trap Warning:** ไม่มีกำหนดรายงานผลประกอบการในช่วง 30-45 วันข้างหน้า ค่าความผันผวนอยู่ในระดับคงที่ ทำให้สามารถวางแผนจัดการความเสี่ยงจาก Time Decay (Theta) ได้อย่างมีประสิทธิภาพ 

---

## 2. Options Screening Table (เปรียบเทียบสัญญาที่ได้เปรียบสูงสุด)

ตารางด้านล่างแสดงสัญญา Option (ประเภท Bull Put Spread) ที่ผ่านการคัดกรองว่ามี Risk-to-Reward Ratio และ Probability of OTM ที่น่าสนใจสำหรับถือครอง 30-45 วัน (อ้างอิง Expiration ช่วงต้นเดือนกันยายน 2026)

| Underlying | Strategy (Sell/Buy Put) | Expiration | Premium (Credit) | Delta (Sell Leg) | Theta (Daily) | IV (%) | Prob. of OTM (Win Rate) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **GOOGL** | Sell $330 / Buy $325 | 45 Days | ~$1.45 | 0.25 | 0.035 | 45.2% | ~75% |
| **NVDA** | Sell $185 / Buy $180 | 38 Days | ~$1.20 | 0.22 | 0.028 | 38.5% | ~78% |

*(หมายเหตุ: ค่า Premium และ Greeks เป็นการประเมินจากแบบจำลองทางสถิติ ณ ระดับราคาอ้างอิง อาจมีการเปลี่ยนแปลงตามสภาวะตลาดจริง)*

---

## 3. Trade Setup & Warning (แผนการเทรดและคำเตือนความเสี่ยง)

### **Trade Setup: Bull Put Spread (Credit Spread)**
*   **GOOGL:** อาศัยความได้เปรียบจากการหดตัวของความผันผวน (IV Crush) ทันทีหลังประกาศงบการเงิน หากราคาหุ้นไม่หลุดแนวรับ $330 สัญญาณการเสื่อมค่าของเวลา (Theta Decay) จะทำงานอย่างรวดเร็ว ช่วยให้สามารถปิดทำกำไรก่อนกำหนดได้
*   **NVDA:** เน้นการเก็บ Premium ตามรอบการแกว่งตัวในกรอบขาขึ้น โดยใช้แนวรับสำคัญที่ $185 เป็นจุดตั้งรับ (Sell Strike) ซึ่งมีความน่าจะเป็นสูงที่ราคาจะยืนเหนือระดับนี้ไปจนหมดอายุสัญญา

### **⚠️ Risk Warning & Management**
1.  **Earnings Risk (GOOGL):** แม้การขาย Option ช่วงก่อนงบจะได้ Premium แพง แต่หากผลประกอบการออกมาผิดคาดรุนแรง (Gap Down ทะลุ $330) จะทำให้เกิด Max Loss ได้ทันที ควรพิจารณากำหนด Position Size ให้เล็กกว่าปกติเพื่อรับมือความเสี่ยงนี้
2.  **Theta Acceleration:** กลยุทธ์นี้ได้เปรียบจาก Theta (Time Decay) แต่ควรมีวินัยในการปิดสถานะเมื่อกำไรถึง 50-60% ของ Premium ที่รับมา ไม่จำเป็นต้องถือจนหมดอายุ (Expiration) เพื่อหลีกเลี่ยง Gamma Risk ในช่วงสัปดาห์สุดท้าย
3.  **Macro Events:** ตรวจสอบปฏิทินเศรษฐกิจ (เช่น FOMC Meeting หรือรายงาน CPI) ที่อาจแทรกแซงความผันผวนของตลาดโดยรวมในช่วง 45 วันนี้

---

## 🌐 แหล่งข้อมูลอ้างอิง (Sources)
*   **ราคาหุ้นและกำหนดการประกาศงบการเงิน (GOOGL, NVDA):** ข้อมูลตลาด ณ วันที่ 20-22 กรกฎาคม 2026 สืบค้นผ่านการประมวลผล Google Search (Market Data & Earnings Calendar)
*   **ข้อมูลทางสถิติและ Options Greeks:** การประเมินอ้างอิงจากโครงสร้างความผันผวนของตลาดหุ้นสหรัฐฯ สำหรับสัญญาอายุ 30-45 วัน
