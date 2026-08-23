# 🇺🇸 OPERATING SPECIFICATION: FINANCIAL INTELLIGENCE PIPELINE
## รายการ “เสพข่าวก่อนเทรด หุ้นอเมริกา”

เอกสารนี้คือ **Standard Operating Procedure (SOP)** สำหรับกระบวนการผลิตรายงานและบทวิเคราะห์ก่อนตลาดสหรัฐฯ เปิด ของช่อง **เสพข่าวก่อนเทรด หุ้นอเมริกา** โดยยึดหลักการ:

> **“ค้นให้กว้าง → ตรวจให้ลึก → ตัดให้เหลือสิ่งสำคัญ → เชื่อมโยงตลาด → ค่อยเผยแพร่”**

---

## 🏗️ สายพานข่าว (FINANCIAL INTELLIGENCE PIPELINE)

```text
                    🌎 WORLD FINANCIAL DATA
                             │
                             ▼
                    🎬 WEB APP ALBUM (v.1)
               [templates.json / album.html]
                             │
                             │ (โหลด searchPrompt ตาม Template ID)
                             ▼
                  🔎 นักสืบหัวเห็ด
             Global Financial Intelligence (Phase 1)
                             │
                 ค้นข่าว / ค้นข้อมูล Primary Sources
                 ค้น Market Data & Cross-Asset
                             │
                             ▼
                    📦 RAW INTELLIGENCE PACK
                             │
                             ▼
                     🛡️ QC EXPERT
               Fact & Data Verification (Phase 2)
                             │
               ┌─────────────┴─────────────┐
               │                           │
          🟢 VERIFIED                 🔴 REJECTED
               │                           │
               │                      ❌ ทิ้ง
               ▼
                🧠 CHIEF FINANCIAL EDITOR
               Final Intelligence Synthesis (Phase 3)
               │
               ├── จัดอันดับข่าว Top 8
               ├── เชื่อมโยงตลาด (Macro → Asset Impact)
               ├── Cross-Asset Engine (วิเคราะห์เงินไหล)
               ├── Market Regime & Market Expectation Gap
               └── หา What’s Next & Key Takeaways
               │
               ▼
              📰 FINAL REPORT (Single Source of Truth)
        “เสพข่าวก่อนเทรด หุ้นอเมริกา” (Phase 4)
               │
               ├── 🎙️ Audio Overview (NotebookLM Script)
               ├── 📊 Infographic Prompt & Layout
               ├── 📝 Social Media Post
               └── 🎬 YouTube Content Script
```

---

## 📌 4 PHASES DETAILED WORKFLOW

### 1️⃣ PHASE 1 — DISCOVERY: 🌎 นักสืบหัวเห็ด
- **หน้าที่**: หน่วยข่าวกรองการเงิน ค้นหาข่าวและตัวเลขให้กว้างที่สุด
- **แหล่ง Prompt**: โหลด `searchPrompt` / `searchPromptV3` ของแต่ละรายการจาก **Web App Album ผลิตคลิป v.1** (`notebooklm-manager/templates.json`)
- **ขอบเขตการค้น**:
  1. U.S. Market (S&P 500, Nasdaq, Dow, Russell 2000, VIX, Futures, Premarket)
  2. Macro (Fed, CPI, PCE, NFP, GDP, Retail Sales, ISM, Jobless Claims)
  3. Rates / FX (2Y, 10Y, 30Y, Real Yield, DXY)
  4. Commodities & Metals (Oil, Gas, Uranium, Gold, Silver)
  5. Crypto (Bitcoin, Ethereum, ETF Flow, Whale Flow)
  6. Corporate (Earnings, Guidance, M&A, FDA, SEC filings, Analyst Rating changes)
  7. Geopolitics (U.S.–China, Middle East, Russia–Ukraine, Tariffs, Sanctions)
- **Output**: **RAW INTELLIGENCE PACK** (ระบุ Headline, Source, Primary Source, Time, Asset, Potential Impact, Confidence, Notes)

---

### 2️⃣ PHASE 2 — FACT CHECK & DATA VERIFICATION: 🛡️ QC EXPERT
- **หน้าที่**: ผู้ตรวจสอบข้อเท็จจริง (Claim-by-Claim Verification)
- **หลักการ**: QC ไม่ได้ถามว่าข่าวนี้น่าสนใจไหม แต่ถามว่า **"ข่าวนี้จริงไหม?"**
- **สถานะการตรวจ**:
  - `🟢 VERIFIED`: ข้อมูลถูกต้อง ได้รับการยืนยันจาก Primary Source
  - `🟡 PARTIALLY VERIFIED`: ข้อมูลจริงบางส่วน
  - `🟠 NEED MORE EVIDENCE`: หลักฐานยังไม่เพียงพอ
  - `🔴 INCORRECT`: ข้อมูลตัวเลขหรือรายละเอียดผิด
  - `⚫ REJECTED`: ข้อมูลเท็จ ข่าวลือที่ไม่มีมูล ห้ามนำไปใช้
- **Fast-Track QC**: สำหรับข่าวใหญ่ระดับ Market Moving (เช่น Fed Emergency, Major Bank Failure, Oil Supply Shock) สามารถลัดขั้นตอนเข้า Fast-Track เพื่ออัปเดตเฉพาะ Section ที่ได้รับผลกระทบ

---

### 3️⃣ PHASE 3 — EDITORIAL INTELLIGENCE: 🧠 CHIEF FINANCIAL EDITOR
- **หน้าที่**: เปลี่ยนข่าวที่ผ่าน QC แล้ว ให้กลายเป็น **Market Intelligence**
- **Editorial Filter**: คัดเลือกเฉพาะ **Top 8 Stories** ที่มีอิทธิพลต่อตลาดสูงสุด
- **Cross-Asset Impact Engine**: วิเคราะห์การไหลของเงิน (Causality Chain):
  $$\text{Oil} \uparrow \longrightarrow \text{Inflation Expectations} \uparrow \longrightarrow \text{Fed Cut} \downarrow \longrightarrow \text{Yield} \uparrow \longrightarrow \text{Growth Stocks} \downarrow$$
- **Market Regime**: ระบุสภาวะตลาดปัจจุบัน (`🟢 Risk-On`, `🔴 Risk-Off`, `🟡 Inflationary`, `🔵 Liquidity Driven`)
- **Market Expectation Gap**: วิเคราะห์ **Actual vs Expected** เพื่อหาว่าตลาด Price-In ข่าวไปแล้วหรือไม่

---

### 4️⃣ PHASE 4 — REPORT GENERATION: 📰 FINAL REPORT
- **โครงสร้าง 12 Sections**:
  1. 🔥 1. THE BIG PICTURE
  2. 📊 2. MARKET SNAPSHOT
  3. 🏦 3. FED & MACRO
  4. 🧠 4. BIG TECH / AI
  5. 🚀 5. HOT STOCKS
  6. 🐋 6. INSTITUTIONAL / WHALE
  7. 🛢️ 7. OIL
  8. 🥇 8. GOLD
  9. ₿ 9. BITCOIN
  10. 🌎 10. GLOBAL MACRO
  11. ⚔️ 11. GEOPOLITICS
  12. 🔭 12. WHAT TO WATCH TONIGHT
- **ส่วนปิดท้าย**: **FINAL MARKET MAP** และ **🎯 MARKET TAKEAWAYS 5 ข้อ**
- **Single Source of Truth Policy**: ห้ามให้สคริปต์เสียง (Audio), Infographic, หรือ Social Post ไปค้นข่าวเพิ่มเติมเพื่อป้องกันปัญหา **Source Drift**

---

## ⏰ DAILY OPERATING CYCLE (T-6 Hours to Market Open)

| เวลา | กิจกรรม |
| --- | --- |
| **T-6 ชั่วโมง** | 🌎 นักสืบเริ่ม Scan ข่าวด้วย Prompt จาก Web App Album v.1 |
| **T-4 ชั่วโมง** | 🛡️ QC Audit รอบแรก ตรวจสอบความถูกต้อง |
| **T-3 ชั่วโมง** | 🌎 นักสืบค้น Follow-up ข่าว Premarket ล่าสุด |
| **T-2 ชั่วโมง** | 🛡️ QC Audit รอบสอง สรุป Verified Claims |
| **T-90 นาที** | 🧠 Chief Editor ทำการ Finalize บทวิเคราะห์เชิงลึก |
| **T-60 นาที** | 📰 บันทึก **Final Report** ฉบับสมบูรณ์ |
| **T-45 นาที** | 🎙️ สร้าง NotebookLM Audio Overview Script จาก Final Report |
| **T-30 นาที** | 📊 สร้าง Infographic Layout & Summary จาก Final Report |
| **T-15 นาที** | 📝 โพสต์เนื้อหาลง Facebook / X / YouTube Community |
| **Market Open** | 🇺🇸 รายการพร้อมส่งมอบบทวิเคราะห์ให้นักลงทุน |

---

## 📚 FEEDBACK LOOP (LEARNING DATABASE)
หลังตลาดปิด ทำการเปรียบเทียบ **Before Market vs After Market** เพื่อบันทึกปฏิกิริยาของตลาดต่อ Catalyst ต่าง ๆ ลงใน Learning Database พัฒนาความแม่นยำของระบบให้สูงขึ้นเรื่อย ๆ
