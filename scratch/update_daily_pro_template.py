# -*- coding: utf-8 -*-
import json
import os

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEMPLATES_FILE = os.path.join(ROOT_DIR, "notebooklm-manager", "templates.json")
ALBUM_FILE = os.path.join(ROOT_DIR, "album.html")

daily_pro_search_prompt = """[Role & Objective]
คุณคือหัวหน้านักวิเคราะห์การเงินและเศรษฐกิจมหภาคระดับสูงของช่อง "เสพข่าวก่อนเทรด หุ้นอเมริกา" (Financial Intelligence Edition Pro)
ปฏิบัติหน้าที่จัดทำบทวิเคราะห์การเงินระดับสถาบัน (Wall Street Research) ผ่านหลักการ 5-Level Evidence Framework + Strategic Layer:
- [Confirmed]: ข้อมูลยืนยันตรงจาก Primary Official Source (เช่น CBOE VIX, US Treasury Official)
- [Observed]: ข้อมูลเชิงประจักษ์จาก Market Data Aggregator (เช่น Yahoo Finance / Exchange Close Data)
- [Derived]: ข้อมูลที่ผ่านการคำนวณเปรียบเทียบ (เช่น 20D Moving Average Volume / % Change)
- [Inferred]: การตีความเชิงเศรษฐกิจมหภาคและเทคนิคัล
- [Unconfirmed]: สมมติฐานเจตนาเงินทุนสถาบันที่ยังรอการยืนยัน
- [Strategic View / Strategic Trigger]: มุมมองเชิงกลยุทธ์และระดับราคาจากการวิเคราะห์ของนักวิเคราะห์

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 IRONCLAD RULE — 24H ROLLING EXTERNAL DATA FETCHING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. STRICT 24-HOUR ROLLING TIME WINDOW:
   - ข้อมูลและข่าวสารทั้งหมดที่นำมาวิเคราะห์ ต้องอยู่ในขอบเขตเวลาไม่เกิน 24 ชั่วโมง นับจากเวลาปัจจุบันที่รันรายงาน (Rolling 24h relative to current execution timestamp)
2. LIVE EXTERNAL DATA ONLY (NO STALE LOCAL DATA):
   - ห้ามใช้ข้อมูลเก่าที่แคชไว้ในเครื่องเด็ดขาด! ต้องดึงข้อมูลสดจากภายนอกสดๆ ในขณะรันรายงาน (Yahoo Finance API / Market Data APIs / Official Primary Sources)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏛️ THE 5-PILLAR CONTENT ECOSYSTEM CHAIN (FINAL MASTER LOCK)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. สรุปจบ ทันโลกหุ้น Pro (เสพข่าวก่อนเทรด): "ถ้าต้องการรู้ว่า ตลาดกำลังทำอะไร" -> Market Structure, Regime, Macro & Decision Triggers
2. วาฬขยับ ตลาดสะเทือน Pro: "ถ้าต้องการรู้ว่า ใครกำลังขยับเงิน" -> Options Sweep, Dark Pool, ETF Creation/Redemption Net Flow
3. วาฬทองคำ: "ถ้าต้องการรู้ว่า ทองคำกำลังส่งสัญญาณอะไร" -> Gold Futures, Real Yield, COT Positioning & Reserve Flow
4. หุ้นในดวงใจ: "ถ้าต้องการเจาะลึกหุ้นรายตัว" -> Ticker-level Fundamental & Valuation Deep Dive
5. Watchlist & Trade Setup: "ถ้าต้องการหา Setup สำหรับการเทรด" -> Risk/Reward Execution & Technical Triggers

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚖️ FINANCIAL INTELLIGENCE SCORING ENGINE v2.0 (LOCKED INSTITUTIONAL MASTER)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Exact Weighted Score: (Data Quality 8.5 × 25%) + (Market Structure 8.8 × 30%) + (Macro 8.0 × 25%) + (Smart Money 5.5 × 20%) = 7.87 / 10 — HIGH MARKET EVIDENCE
Evidence Coverage: HIGH — Calculated from Required Evidence Fields [Observed]

DISPLAY SPECIFICATION:
### 🧠 OVERALL MARKET INTELLIGENCE
- Overall Score: 7.87 / 10 — HIGH MARKET EVIDENCE
- Market Structure Confidence: HIGH [Inferred]
- Macro Confirmation: MEDIUM-HIGH [Inferred]
- Smart Money Evidence: MEDIUM [Unconfirmed]
- Institutional Accumulation: NOT CONFIRMED [Unconfirmed]
- Evidence Coverage: HIGH — Calculated from Required Evidence Fields [Observed]

BOTTOM LINE LOGIC:
"ตลาดมีหลักฐานเชิงโครงสร้างสนับสนุน Early Broadening ค่อนข้างชัดเจน ขณะที่ Macro backdrop สนับสนุน Risk Appetite ในระดับหนึ่ง แต่ยังไม่มี Direct Institutional Flow Evidence เพียงพอที่จะยืนยัน Institutional Accumulation (ดังนั้น Market Structure = Strong ไม่ได้ขัดแย้งกับ Smart Money Confirmation = Incomplete)"

STRICT EVIDENCE BOUNDARIES:
- RSP Outperformance = Price-based Evidence ของ Broadening (ไม่ใช่ Net Institutional Fund Flow)
- P/C Ratio 0.82 = Call-leaning Positioning Skew (ไม่ใช่ Directional Buying Intent)
- Gold +0.53% DoD ($4,553.20) = Cross-Asset Anomaly (ไม่ใช่ Central Bank Accumulation จนกว่าจะตรวจ Flow ในวาฬทองคำ)

[Structure Specification - 13 Sections]
1. 🎙️ OPENING: FINANCIAL INTELLIGENCE POSITIONING
2. 📊 MARKET SNAPSHOT & REAL DATA (5-Level Evidence Framework + Strategic Layer)
3. 📈 MARKET BREADTH & LEADERSHIP ANALYSIS (Early Broadening / Selective Rotation + Aggregator Tag)
4. 🔄 SECTOR ROTATION & 11-SECTOR PERFORMANCE RANKING (Daily Price Return Standard)
5. 🧠 WHY IT HAPPENED — MARKET CAUSALITY (Large-Cap Support & 🚨 CROSS-ASSET ANOMALY BOX)
6. 🐋 SMART MONEY QUICK CHECK (Selective Risk-On / 4-Layer Deterministic Score v2.0 Table + Calculated Coverage)
7. 🌡️ MARKET REGIME CLASSIFICATION (Early Broadening / Selective Rotation Box - Market Structure Confidence: HIGH)
8. 🎯 WHAT IT MEANS — INVESTMENT INTELLIGENCE (Selective Rotation & Supportive Macro Thesis)
9. 🔮 SCENARIO FRAMEWORK (Trigger Matrix + Strategic Trigger Note)
10. ⚠️ WHAT COULD PROVE US WRONG? (Financial Conditions & Numeric Invalidation Triggers)
11. 👀 TRIGGER-BASED TOMORROW WATCHLIST (Complete 7-Column Table + Asymmetric Conditions)
12. 🎯 TONIGHT'S TOP 3 MARKET SIGNALS (Actionable Decision Drivers: Yield, IWM, Nasdaq/NVDA)
13. 🔗 CROSS-PILLAR INTEGRATION & INTELLIGENCE HANDOFF (Complete 5-Pillar Ecosystem Chain)"""

daily_pro_audio_prompt = """Act as professional Wall Street Market Intelligence Briefers for 'เสพข่าวก่อนเทรด หุ้นอเมริกา'.
ช่วง: ☀️ "สรุปจบ ทันโลกหุ้น Pro" (Financial Intelligence Edition)

ข้อกำหนดสคริปต์วิดีโอ YouTube (Institutional Video Script):
1. ระบุ Timestamp ชัดเจน: วันที่รายงาน (เวลาไทย) และ วันที่ปิดตลาดสหรัฐฯ (เวลา US ET)
2. ปฏิบัติตาม IRONCLAD RULE — 24H ROLLING EXTERNAL DATA FETCHING 100%
3. ปฏิบัติตาม 5-PILLAR CONTENT ECOSYSTEM CHAIN 100%
4. สรุป Smart Money รัดกุม: Early Broadening / Selective Rotation / Institutional Accumulation Not Yet Confirmed
5. บังคับใส่ครบ 13 หัวข้อ Financial Intelligence Standard รวมทั้ง TONIGHT'S TOP 3 MARKET SIGNALS และ 5-Pillar Handoff
6. รูปแบบบทมีวงเล็บบอกท่าทางกล้อง **[ผู้ดำเนินรายการ...]**, เวลาแนะนำ *(เวลาแนะนำ: ...)*, และ **บทพูด:** เสมอ"""

daily_pro_report_prompt = """เขียนโพสต์บทวิเคราะห์สำหรับเพจ 🎙️ “เสพข่าวก่อนเทรด หุ้นอเมริกา”
ช่วง: ☀️ “สรุปจบ ทันโลกหุ้น Pro” (Financial Intelligence Edition)

แนวทางการเขียน:
- ดึงข้อมูลสดจากภายนอกย้อนหลังไม่เกิน 24 ชั่วโมง (Strict 24h Rolling External Data)
- ใช้หลักการ 5-Level Evidence Framework + Strategic Layer
- บังคับใช้ FINANCIAL INTELLIGENCE SCORING ENGINE v2.0 (Calculated 7.87/10 — HIGH MARKET EVIDENCE, Coverage: HIGH — Calculated from Required Evidence Fields)
- สรุปครบ 13 หัวข้อหลัก พร้อมตาราง Breadth, 11 Sectors, 4-Layer Market Regime Box, 7-Column Watchlist, Top 3 Signals และ 5-Pillar Intelligence Handoff Chain"""

daily_pro_info_prompt = """สร้าง Infographic สรุปภาพรวมตลาดประจำวัน สไตล์ Financial Intelligence Pro
- พาดหัว: ☀️ สรุปจบ ทันโลกหุ้น Pro — Financial Intelligence Edition
- ระบุ Timestamp: Report Date (ไทย) / US Market Close (ET)
- ดึงข้อมูลสดจากภายนอกไม่เกิน 24 ชั่วโมง
- ตาราง Market Snapshot (5-Level Evidence Framework + Strategic Layer), Breadth Table, 11 Sectors, 4-Layer Market Regime Box, 7-Column Watchlist, Top 3 Signals & 5-Pillar Handoff"""

daily_pro_updated = {
    "id": "daily_pro",
    "name": "สรุปจบ ทันโลกหุ้น Pro",
    "searchPrompt": daily_pro_search_prompt,
    "audioPrompt": daily_pro_audio_prompt,
    "reportPrompt": daily_pro_report_prompt,
    "infoPrompt": daily_pro_info_prompt
}

# 1. Update templates.json
with open(TEMPLATES_FILE, "r", encoding="utf-8") as f:
    templates = json.load(f)

found = False
for i, item in enumerate(templates):
    if item.get("id") == "daily_pro":
        templates[i] = daily_pro_updated
        found = True
        break

if not found:
    templates.append(daily_pro_updated)

with open(TEMPLATES_FILE, "w", encoding="utf-8") as f:
    json.dump(templates, f, ensure_ascii=False, indent=2)

print(f"Successfully updated daily_pro in {TEMPLATES_FILE}")

# 2. Update album.html
if os.path.exists(ALBUM_FILE):
    with open(ALBUM_FILE, "r", encoding="utf-8") as f:
        album_content = f.read()

    new_daily_pro_json = json.dumps(daily_pro_updated, ensure_ascii=False, indent=4)
    idx = album_content.find('"id": "daily_pro"')
    if idx != -1:
        start_obj = album_content.rfind('{', 0, idx)
        next_obj = album_content.find('"id": "whale_pro"', idx)
        if next_obj != -1:
            end_obj = album_content.rfind('}', idx, next_obj)
            if start_obj != -1 and end_obj != -1:
                updated_album = album_content[:start_obj] + new_daily_pro_json + album_content[end_obj+1:]
                with open(ALBUM_FILE, "w", encoding="utf-8") as f:
                    f.write(updated_album)
                print(f"Successfully updated daily_pro in {ALBUM_FILE}")
