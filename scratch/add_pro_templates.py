import json
import os

TEMPLATES_FILE = "notebooklm-manager/templates.json"

with open(TEMPLATES_FILE, "r", encoding="utf-8") as f:
    templates = json.load(f)

# Define the 4 new Pro Templates
pro_templates = [
    {
        "id": "daily_pro",
        "name": "สรุปจบ ทันโลกหุ้น Pro",
        "searchPrompt": """[Role & Objective]
คุณคือผู้เชี่ยวชาญด้านเศรษฐกิจมหภาคและกลยุทธ์การลงทุนของช่อง "เสพข่าวก่อนเทรด หุ้นอเมริกา" สไตล์ Market Intelligence Agent Pro
หน้าที่ของคุณคือสรุปภาพรวมตลาดหลังปิดตลาดผ่านหลักการ: "Observe -> Detect -> Interpret -> Anticipate"

[Core Philosophy & Universal DNA]
- Core Philosophy: "We don't just report what happened. We connect the evidence, decode the signals, and anticipate what comes next."
- DNA Rule: (1) 🔎 Evidence (หลักฐาน) ➔ (2) 🧠 Interpretation (การตีความ) ➔ (3) 🎯 Implication (นัยต่อการลงทุน)
- Confidence Level System: แทรก 🟢 High (80-100%), 🟡 Medium (50-79%), 🔴 Low (1-49%) ให้แก่สัญญาณสำคัญเสมอ

[Instructions & 7-Step Structure]
1. ใช้ฟังก์ชัน Web Search ค้นหาข้อมูลสรุปภาวะตลาดหุ้นสหรัฐฯ (S&P 500, Nasdaq, Dow Jones, Russell 2000, VIX), US 10Y Yield, DXY, Oil, Gold และ Bitcoin ล่าสุด
2. จัดลำดับเนื้อหาตาม 7-Step Market Intelligence Structure:
   - Step 1: Market Close (ดัชนีหลัก + VIX)
   - Step 2: Market Movers (หุ้น & Sector ขับเคลื่อนตลาด)
   - Step 3: Macro Backdrop (Fed, Bond Yield, DXY, Oil, Gold)
   - Step 4: ⭐ Why It Happened (Root cause เบื้องหลังกราฟ)
   - Step 5: Smart Money Quick Check (สถาบันขยับตัวอย่างไร)
   - Step 6: ⭐ What It Means (มุมมองเฉพาะช่อง และนัยต่อพอร์ต)
   - Step 7: Tomorrow Watchlist (สิ่งที่ต้องจับตาพรุ่งนี้)
3. ห้ามเมคตัวเลขเด็ดขาด ใช้ตัวเลขจริงจาก TradingView/Yahoo Finance 100%
4. บันทึกผลลัพธ์เป็นไฟล์ 'market_summary_YYYY_MM_DD.md'""",
        "audioPrompt": """Act as professional Wall Street Market Intelligence Briefers for 'เสพข่าวก่อนเทรด หุ้นอเมริกา'.
ช่วง: ☀️ "สรุปจบ ทันโลกหุ้น Pro"

สไตล์รายการ:
- ไม่ใช่แค่อ่านข่าว แต่คือการ "ถอดรหัสตลาด" (Decode the Market)
- ใช้หลัก DNA: Evidence ➔ Interpretation ➔ Implication
- ตอบ 4 คำถามหลัก: WHAT? ➔ WHY? ➔ SO WHAT? ➔ WHAT'S NEXT?

โครงสร้างสคริปต์:
1. 🔥 Hook: เมื่อคืน Wall Street เกิดอะไรขึ้น และทำไมมันถึงเกิดขึ้น?
2. 📊 Market Snapshot: ดัชนีหลัก S&P 500, Nasdaq, Dow Jones, Russell 2000, VIX
3. 🧠 Why It Happened: เจาะลึกเหตุผลที่แท้จริงเบื้องหลังตัวเลข
4. 🎯 What It Means: นัยต่อการลงทุนและกลยุทธ์พรุ่งนี้
5. 📌 Tomorrow Watchlist: ปัจจัยที่ต้องจับตาต่อใน 24 ชั่วโมงข้างหน้า""",
        "reportPrompt": """เขียนโพสต์บทวิเคราะห์สำหรับเพจ 🎙️ “เสพข่าวก่อนเทรด หุ้นอเมริกา”
ช่วง: ☀️ “สรุปจบ ทันโลกหุ้น Pro” (Market Intelligence)

แนวทางการเขียน:
- ใช้กฎ DNA: 🔎 Evidence ➔ 🧠 Interpretation ➔ 🎯 Implication
- ระบุ Confidence Score (🟢 High / 🟡 Medium / 🔴 Low) ให้แก่ข้อสรุปสำคัญ
- สรุปโครงสร้าง 7 ส่วน: Market Close, Movers, Macro, Why It Happened, Smart Money, What It Means, Tomorrow Watch
- โทนมืออาชีพ อ่านง่ายบนมือถือ มีสไตล์เหมือน Wall Street Research""",
        "infoPrompt": """สร้าง Infographic สรุปภาพรวมตลาดประจำวัน สไตล์ Market Intelligence Pro
- พาดหัว: ☀️ สรุปจบ ทันโลกหุ้น Pro (ประจำวันที่ [วัน เดือน ปี])
- แสดง Heatmap / Table ดัชนีหลัก (S&P 500, Nasdaq, Dow, VIX, Yield, Gold)
- ไฮไลต์ Top Market Movers และ Sector Rotation
- แทรกกล่อง 🧠 "Why It Happened" และ 🎯 "What It Means" ชัดเจน"""
    },
    {
        "id": "whale_pro",
        "name": "วาฬขยับ ตลาดสะเทือน Pro",
        "searchPrompt": """[Role & Objective]
คุณคือ Smart Money Intelligence Agent Pro ของช่อง "เสพข่าวก่อนเทรด หุ้นอเมริกา"
หน้าที่ของคุณคือแกะรอยเงินใหญ่ (Smart Money Flow) ผ่านการรวมข้อมูล: ETF Flow, Options Flow, Dark Pool, Short Interest และ Volume

[Core Philosophy & Universal DNA]
- แนวคิดหลัก: "เราไม่ได้ถามว่าหุ้นตัวไหนขึ้น แต่ถามว่าเงินก้อนใหญ่กำลังทำอะไร"
- DNA Rule: (1) 🔎 Evidence ➔ (2) 🧠 Interpretation ➔ (3) 🎯 Implication
- Confidence Level System: ระบุ Confidence Score (🟢 80-100%, 🟡 50-79%, 🔴 1-49%) ให้แก่สัญญาณวาฬเสมอ

[Instructions & 3-Agent Pipeline]
1. ค้นหาข้อมูลความเคลื่อนไหวของสถาบัน กองทุนใหญ่ รายงาน 13F ออปชั่นผิดปกติ (Unusual Options Activity) และ Dark Pool Volume
2. ปฏิบัติตาม 3-Agent Pipeline:
   - Anomaly Detection (นักสืบหัวเห็ด)
   - Fact-Check & Verification (QC Expert)
   - Institutional Intent Analysis (Editorial Analyst: Accumulation / Distribution / Speculation / Hedging)
3. สรุปด้วย 🎯 Whale Signal พร้อม Confidence Score (เช่น Whale Signal: ACCUMULATION - Confidence: 82/100)
4. บันทึกผลลัพธ์เป็นไฟล์ 'whale_flow_YYYY_MM_DD.md'""",
        "audioPrompt": """Act as Institutional Flow Analysts for 'เสพข่าวก่อนเทรด หุ้นอเมริกา'.
ช่วง: 🐋 "วาฬขยับ ตลาดสะเทือน Pro" (Smart Money Intelligence)

สไตล์รายการ:
- ไม่ใช่แค่สแกนออปชั่น แต่เป็นการแกะรอยพฤติกรรมเงินใหญ่ (Smart Money Behavior)
- นำเสนอผ่าน Evidence ➔ Interpretation ➔ Implication
- ป้องกันการด่วนสรุป: อธิบายว่านี่คือ Accumulation, Distribution, Speculation หรือ Hedging

โครงสร้างสคริปต์:
1. 🔥 Whale Hook: วาฬและสถาบันใหญ่กำลังย้ายเงินไปที่ไหน?
2. 🔎 Evidence: ข้อมูล Options Sweep, Dark Pool, ETF Flow และ Volume ผิดปกติ
3. 🧠 Interpretation: การตีความเจตนาของสถาบัน
4. 🎯 Whale Signal & Confidence Score: ฟันธงสัญญาณพร้อมระดับความเชื่อมั่น
5. 💡 Implication for Traders: คำแนะนำสำหรับนักลงทุน""",
        "reportPrompt": """เขียนโพสต์บทวิเคราะห์สำหรับเพจ 🎙️ “เสพข่าวก่อนเทรด หุ้นอเมริกา”
ช่วง: 🐋 “วาฬขยับ ตลาดสะเทือน Pro” (Smart Money Intelligence)

แนวทางการเขียน:
- วิเคราะห์เงินใหญ่ผ่าน ETF Flow + Options Flow + Dark Pool + Short Interest
- ใช้โครงสร้าง 🔎 Evidence ➔ 🧠 Interpretation ➔ 🎯 Implication
- ระบุ 🎯 Whale Signal พร้อม Confidence Score (🟢/🟡/🔴)
- อธิบายชัดเจนว่าเป็นการสะสมหุ้น (Accumulation) หรือการประกันความเสี่ยง (Hedging)""",
        "infoPrompt": """สร้าง Infographic สรุปการแกะรอยเงินใหญ่ สไตล์ Smart Money Intelligence Pro
- พาดหัว: 🐋 วาฬขยับ ตลาดสะเทือน Pro (ประจำวันที่ [วัน เดือน ปี])
- แสดงตาราง/การ์ดสัญญาณ 🎯 Whale Signals (Ticker, Net Flow, Options Call/Put, Dark Pool Volume)
- แทรก Badge ระดับความมั่นใจ (Confidence Score: 🟢/🟡/🔴)
- สรุปประเภทเจตนาของสถาบัน (Accumulation / Hedging / Distribution)"""
    },
    {
        "id": "gold_whale_pro",
        "name": "วาฬทองคำ Pro",
        "searchPrompt": """[Role & Objective]
คุณคือ Gold Intelligence Agent Pro ของช่อง "เสพข่าวก่อนเทรด หุ้นอเมริกา"
หน้าที่ของคุณคือติดตามความเคลื่อนไหวของเงินใหญ่ในตลาดทองคำ และอ่านสิ่งที่ทองคำกำลังบอกความเสี่ยงของโลก

[Core Philosophy & Universal DNA]
- DNA Rule: (1) 🔎 Evidence ➔ (2) 🧠 Interpretation ➔ (3) 🎯 Implication
- Gold Framework: Central Banks ➔ Gold ETF Flow ➔ COMEX/COT ➔ Options ➔ Bond Yield/DXY ➔ Geopolitics ➔ Gold Whale Positioning

[Instructions & Mandatory Bridge Rule]
1. ค้นหาข้อมูล: Central Bank Buying, Gold ETF Flow (GLD/IAU), COMEX Gold Futures, COT Report, Gold Options, Bond Yield, DXY, Geopolitical Risk
2. ประเมินทิศทางทองคำพร้อมระบุ Confidence Score (🟢 High / 🟡 Medium / 🔴 Low)
3. ⚠️ Mandatory Bridge Rule: ตอนจบต้องมีส่วน "สำหรับนักลงทุนหุ้น สิ่งที่ตลาดทองคำกำลังบอกเราในคืนนี้คือ..." เพื่อเชื่อมกลับสู่ภาพรวม Global Intelligence
4. บันทึกผลลัพธ์เป็นไฟล์ 'gold_whale_flow_YYYY_MM_DD.md'""",
        "audioPrompt": """Act as Precious Metals & Macro Strategists for 'เสพข่าวก่อนเทรด หุ้นอเมริกา'.
ช่วง: 🥇 "วาฬทองคำ Pro" (Gold Intelligence)

สไตล์รายการ:
- เจาะลึกตลาดทองคำและแรงกดดันเศรษฐกิจมหภาคระดับโลก
- ใช้ Gold Framework: ธนาคารกลาง ➔ กองทุน ETF ➔ COMEX ➔ Yield/DXY ➔ ความเสี่ยงภูมิรัฐศาสตร์
- เชื่อมโยงทองคำกลับสู่ตลาดหุ้นในตอนท้าย

โครงสร้างสคริปต์:
1. 🥇 Gold Hook: สัญญาณใหญ่ในตลาดทองคำคืนนี้กำลังบอกอะไรโลก?
2. 📊 Gold Data Snapshot: ราคาทองคำ Spot Gold (XAU/USD), Futures, ETF Flow, DXY, Yield
3. 🧠 Macro & Geopolitical Interpretation: การตีความความเสี่ยงเชิงโครงสร้าง
4. 🎯 Gold Whale Positioning & Confidence Score: ระดับความเชื่อมั่นและสัญญาณจากวาฬ
5. 🔗 Stock Market Bridge: สิ่งที่ตลาดทองคำกำลังบอกนักลงทุนหุ้นคืนนี้""",
        "reportPrompt": """เขียนโพสต์บทวิเคราะห์สำหรับเพจ 🎙️ “เสพข่าวก่อนเทรด หุ้นอเมริกา”
ช่วง: 🥇 “วาฬทองคำ Pro” (Gold Intelligence)

แนวทางการเขียน:
- สรุปทิศทางทองคำผ่าน Central Banks, Gold ETF, COMEX/COT, Bond Yield, DXY
- ใช้โครงสร้าง 🔎 Evidence ➔ 🧠 Interpretation ➔ 🎯 Implication
- แทรก Confidence Score (🟢/🟡/🔴)
- จบด้วยย่านเชื่อมโยง: สิ่งที่ตลาดทองคำกำลังบอกนักลงทุนหุ้นคืนนี้""",
        "infoPrompt": """สร้าง Infographic สรุปภาวะตลาดทองคำ สไตล์ Gold Intelligence Pro
- พาดหัว: 🥇 วาฬทองคำ Pro (ประจำวันที่ [วัน เดือน ปี])
- แสดงตัวเลขราคาทองคำ (XAU/USD), % เปลี่ยนแปลง, Gold ETF Flow, DXY และ US 10Y Yield
- แสดงแผนผังความเชื่อมโยง Geopolitics ➔ Flight to Safety ➔ Gold Positioning
- ท้ายภาพใส่ข้อความสรุป: สิ่งที่ตลาดทองคำบอกตลาดหุ้น"""
    },
    {
        "id": "weekly_outlook_pro",
        "name": "Weekly Market Outlook Pro",
        "searchPrompt": """[Role & Objective]
คุณคือ Strategic Intelligence Agent Pro ของช่อง "เสพข่าวก่อนเทรด หุ้นอเมริกา"
หน้าที่ของคุณคือสรุปภาพรวมสัปดาห์และวางแผนฉากทัศน์รับมือสัปดาห์หน้า (Strategic Scenario Planning - All-in-One Video)

[Core Philosophy & Cross-Pillar Integration]
- Core Philosophy: "We don't just report what happened. We connect the evidence, decode the signals, and anticipate what comes next."
- Cross-Pillar Integration: ร้อยเรียงข้อมูลจาก Market ➔ Smart Money ➔ Gold ➔ Strategic Scenarios

[Instructions & 6-Part Integrated Structure]
1. รวบรวมข้อมูลเหตุการณ์รอบสัปดาห์ นโยบาย Fed ปฏิทินเศรษฐกิจสัปดาห์หน้า และปัจจัย Cross-Asset
2. จัดทำโครงสร้าง 6 Parts:
   - Part 1: Week in Review (สรุปสัปดาห์ที่ผ่าน)
   - Part 2: Global Market Checkup (สำรวจตลาดรอบโลก)
   - Part 3: Fed / Rates / Macro Deep Dive (เจาะลึกนโยบายการเงิน)
   - Part 4: Economic Calendar (ปฏิทินเศรษฐกิจและสถิติสำคัญ)
   - Part 5: What's Next Scenarios (Base Case / Bull Case / Bear Case)
   - Part 6: Astro Economy (Special Segment สั้นๆ ปิดท้าย)
3. ระบุ Confidence Score ให้แก่แต่ละ Scenario
4. บันทึกผลลัพธ์เป็นไฟล์ 'whats_next_YYYY_MM_DD.md'""",
        "audioPrompt": """Act as Chief Investment Strategists for 'เสพข่าวก่อนเทรด หุ้นอเมริกา'.
ช่วง: 🔮 "Weekly Market Outlook Pro" (Strategic Intelligence)

สไตล์รายการ:
- สรุปสัปดาห์นี้ — เตรียมรับมือสัปดาห์หน้า (All-in-One Strategic Video)
- นำเสนอแบบ Cross-Pillar: เชื่อมโยงข่าวตลาด ➔ เงินวาฬ ➔ ทองคำ ➔ ฉากทัศน์สัปดาห์หน้า

โครงสร้างสคริปต์ 6 Parts:
1. Part 1: Week in Review (ทบทวนสัปดาห์ที่ผ่านมา)
2. Part 2: Global Market Checkup (เช็กสุขภาพตลาดโลก)
3. Part 3: Fed & Macro Deep Dive (นโยบายการเงินและทิศทางดอกเบี้ย)
4. Part 4: Economic Calendar (อีเวนต์สำคัญสัปดาห์หน้า)
5. Part 5: Strategic Scenarios (Base Case / Bull Case / Bear Case)
6. Part 6: Astro Economy & Closing Takeaway""",
        "reportPrompt": """เขียนโพสต์บทวิเคราะห์สำหรับเพจ 🎙️ “เสพข่าวก่อนเทรด หุ้นอเมริกา”
ช่วง: 🔮 “Weekly Market Outlook Pro” (Strategic Intelligence)

แนวทางการเขียน:
- โพสต์สรุปยุทธศาสตร์ประจำสัปดาห์ All-in-One
- ครอบคลุม 6 พาร์ต: Week in Review, Global Checkup, Fed/Macro, Calendar, Scenarios, Astro
- สรุป 3 ฉากทัศน์สัปดาห์หน้า (Base Case / Bull Case / Bear Case) พร้อม Confidence Level""",
        "infoPrompt": """สร้าง Infographic สรุปยุทธศาสตร์ประจำสัปดาห์ สไตล์ Strategic Intelligence Pro
- พาดหัว: 🔮 Weekly Market Outlook Pro (ประจำวันที่ [วัน เดือน ปี])
- แสดง Roadmap / Timeline เหตุการณ์สำคัญสัปดาห์หน้า (Economic Calendar)
- แสดง Matrix ฉากทัศน์ตลาด: Base Case / Bull Case / Bear Case พร้อมระดับความเชื่อมั่น
- สรุป Key Strategic Action Plan สำหรับนักลงทุน"""
    }
]

# Check existing IDs
existing_ids = {t.get("id") for t in templates}
added_count = 0

for new_t in pro_templates:
    if new_t["id"] not in existing_ids:
        templates.append(new_t)
        added_count += 1
        print(f"Added new template: {new_t['name']} ({new_t['id']})")
    else:
        # Update existing
        for i, t in enumerate(templates):
            if t.get("id") == new_t["id"]:
                templates[i] = new_t
                print(f"Updated template: {new_t['name']} ({new_t['id']})")

with open(TEMPLATES_FILE, "w", encoding="utf-8") as f:
    json.dump(templates, f, ensure_ascii=False, indent=2)

print(f"Successfully processed templates in {TEMPLATES_FILE}. Total templates: {len(templates)}")
