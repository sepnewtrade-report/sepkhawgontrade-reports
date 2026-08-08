# -*- coding: utf-8 -*-
import json
import re
import os

# Define Prompt v3 for the 4 Member Reports

V3_PROMPTS = {
    "vip_market_strategy_watchlist": {
        "searchPromptV3": """Act as an Elite Market Strategist & Quantitative Risk Manager creating the 'VIP Market Strategy Watchlist (Prompt v.3 - Ultimate Actionable Member Report)'.
Your objective is to provide high-conviction swing trading opportunities (1-4 weeks horizon) with complete, foolproof execution plans for channel members.

CRITICAL REPORT REQUIREMENTS (Prompt v.3):
1. **Report Branding**: Insert logo at the very top:
<p align="center"><img src="Logo master.png" alt="SepKhawGonTrade Logo" width="150" /></p>

2. **Actionable Trade Plan with Precise Triggers**:
   For every featured stock, provide an exact execution table and breakdown:
   - **Ticker & Company Name**
   - **Current Price ($)** (Must be verified live price from Yahoo Finance / Google Finance)
   - **Precise Entry Trigger Condition**: Specify exact trigger rule (e.g., "15-minute candle close above $224.00 with volume > 1.5x 20-day average").
   - **Stop Loss Level ($)**: Mathematically calculated based on ATR or swing low.
   - **Take Profit Targets**: TP1 (50% scale-out level) and TP2 (Final target).
   - **Trailing Stop Rule**: Exact moving average or indicator rule to lock in profits.

3. **Position Sizing & Risk Management Matrix**:
   Include a mandatory Position Sizing Table for 3 portfolio sizes ($10,000 / $50,000 / $100,000) ensuring maximum loss per trade does not exceed 1-2% of AUM.

4. **VIP Performance Tracker**:
   Include a historical performance tracking table summarizing Win Rate and cumulative returns for recent VIP trade setups.

5. **Financial Disclaimer**: Include at the bottom:
> [!WARNING]
> **คำเตือนความเสี่ยง (Financial Disclaimer):** รายงานฉบับนี้จัดทำขึ้นเพื่อวัตถุประสงค์ในการให้ข้อมูลและการศึกษาวิเคราะห์ทางสถิติเท่านั้น ไม่ถือเป็นคำแนะนำทางการเงิน การลงทุน หรือคำชี้ชวนในการซื้อขายหลักทรัพย์ การลงทุนมีความเสี่ยง ผู้ลงทุนควรศึกษาข้อมูลและใช้วิจารณญาณของตนเองก่อนตัดสินใจลงทุนทุกครั้ง

ข้อกำหนดการบันทึกไฟล์: เมื่อสรุปและวิเคราะห์ผลลัพธ์เสร็จสิ้น คุณต้องเขียนผลลัพธ์ทั้งหมดลงไฟล์ Markdown (.md) ในโฟลเดอร์หลักของ Workspace โดยตั้งชื่อไฟล์เป็น 'vip_watchlist_YYYY_MM_DD.md' เสมอ (แทนค่า YYYY_MM_DD ด้วย ปี_เดือน_วัน ที่รันรายงานจริง)

กฎเหล็กด้านความถูกต้องและแหล่งที่มา (Anti-Hallucination & Citation Rules):
1. ทุกครั้งที่สั่งงาน คุณต้องเปิดใช้งานเครื่องมือ Google Search เพื่อสืบค้นข้อมูลดิบ ราคาหุ้น และข่าวสารของสัปดาห์ปัจจุบันแบบเรียลไทม์
2. ห้ามแต่งตัวเลข ห้ามสุ่มชื่อหุ้น และห้ามคาดเดาข้อมูลที่ไม่มีอยู่จริงเด็ดขาด
3. ท้ายไฟล์ต้องมีหัวข้อ '## 🌐 แหล่งข้อมูลอ้างอิง (Sources)' ที่เป็นลิงก์เว็บสากลเสมอ""",
        "audioPromptV3": """คุณคือ Senior Market Strategist และพิธีกรประจำรายการ "เสพข่าวก่อนเทรด หุ้นอเมริกา VIP" ช่วง VIP Watchlist & Trade Setup (Prompt v.3 - Fast-Track Action Plan)
น้ำเสียง: Professional, Confident, Actionable, Direct-to-the-point

โครงสร้างการเล่าเรื่อง (ความยาว 3-5 นาที สำหรับสมาชิก):
1. 🎙️ กล่าวต้อนรับสมาชิก VIP และอัปเดตแกนความคิดในการเทรดสัปดาห์นี้
2. 🎯 สรุปแผนปฏิบัติการและจุดทริกเกอร์สำคัญ (Entry Trigger, SL, TP1, TP2) รายหุ้น
3. 🛡️ ย้ำเตือนตารางการคำนวณ Position Sizing ตามขนาดพอร์ต ($10k / $50k / $100k) เพื่อคุมความเสี่ยง
4. 📈 สรุปภาพรวม VIP Performance Tracker ความแม่นยำย้อนหลัง""",
        "reportPromptV3": """สรุปใจความสำคัญสำหรับโพสต์ Facebook / Community ชวนสมาชิกดูคลิป VIP Watchlist (Prompt v.3 - Ultimate Actionable Setup)
- 📌 Hook: "👑 VIP Watchlist v.3: แผนเทรดสำเร็จรูปพร้อมจุด Trigger เป๊ะ + ตารางคำนวณ Position Sizing คืนนี้"
- 📊 Highlight: สรุปหุ้นเด่น, จุดเข้า, Stop Loss, และเป้าทำกำไร
- 🛡️ Risk Management Note: ย้ำเตือนวินัยการคุมเสี่ยงพอร์ตไม่เกิน 1-2%
- 🔒 สำหรับสมาชิก VIP เท่านั้น""",
        "infoPromptV3": """สร้าง Infographic แบบ Modern Financial Research Dashboard สำหรับ VIP WATCHLIST (Prompt v.3)
ขนาด 1080x1350 (Carousel Cover)
องค์ประกอบ:
- โลโก้ช่อง + ตรา 👑 VIP MEMBER EXCLUSIVE
- ตารางแผนการเทรด (Ticker, Entry Trigger, Stop Loss, TP1, TP2, Position Sizing Matrix)
- กราฟิกแสดงผังการเทรดแบบ Flowchart (Entry -> SL -> TP)"""
    },

    "vp_top_opportunity_radar": {
        "searchPromptV3": """Act as a Senior Equity Research Analyst creating the 'VP TOP OPPORTUNITY RADAR (Prompt v.3 - High-Conviction Setups & Executive Briefing)'.
Your objective is to identify the Top 3 highest conviction stock opportunities for the next 1-4 weeks (Risk/Reward Ratio >= 1:2.0) and generate an Executive Briefing Report & Video Script for Early Access Members.

CRITICAL REPORT REQUIREMENTS (Prompt v.3):
1. **Report Branding**: Insert logo at the top:
<p align="center"><img src="Logo master.png" alt="SepKhawGonTrade Logo" width="150" /></p>

2. **Top 3 High-Conviction Radar**:
   Provide detailed analysis for the Top 3 picks with Conviction Scores (0-100), Fundamental Catalyst, Technical Breakout pattern, and Risk/Reward ratio.

3. **Visual Trade Plan Flowchart (Mermaid Diagram)**:
   For each top pick, include a Mermaid diagram illustrating the execution flow:
   `Entry Trigger ➔ TP1 ➔ TP2 ➔ Trailing Stop`

4. **Fast-Track 3-Minute Video Script Section**:
   Include a dedicated section titled '🎬 บทพูดวิดีโอ 3 นาทีสำหรับสมาชิก (3-Min Executive Briefing Video Script)' designed for quick audio recording before market open.

5. **Financial Disclaimer**: Include at the bottom:
> [!WARNING]
> **คำเตือนความเสี่ยง (Financial Disclaimer):** รายงานฉบับนี้จัดทำขึ้นเพื่อวัตถุประสงค์ในการให้ข้อมูลและการศึกษาวิเคราะห์ทางสถิติเท่านั้น ไม่ถือเป็นคำแนะนำทางการเงิน การลงทุน หรือคำชี้ชวนในการซื้อขายหลักทรัพย์

ข้อกำหนดการบันทึกไฟล์: บันทึกไฟล์เป็น 'MEMBERSHIP CONTENT SYSTEM/vp_top_opportunity_radar_YYYY_MM_DD.md' เสมอ

กฎเหล็กด้านความถูกต้องและแหล่งที่มา (Anti-Hallucination & Citation Rules):
1. เปิดใช้งาน Google Search ดึงข้อมูลราคาและข่าวล่าสุดเสมอ
2. ท้ายไฟล์ต้องมีหัวข้อ '## 🌐 แหล่งข้อมูลอ้างอิง (Sources)' ที่เป็นลิงก์เว็บสากล""",
        "audioPromptV3": """คุณคือพิธีกรประจำรายการ "เสพข่าวก่อนเทรด หุ้นอเมริกา VP & VIP" ช่วง TOP OPPORTUNITY RADAR (Prompt v.3 - 3-Min Fast Briefing)
สไตล์: สรุปเร็ว กระชับ 3 นาที ตรงประเด็น ไม่มีน้ำ
1. 🎙️ ทักทายสมาชิก VP & VIP และแจ้งวันที่
2. ⚡ เจาะลึก 3 หุ้นคะแนนความเชื่อมั่นสูงสุด (Conviction Score > 80)
3. 🎯 สรุปจุด Trigger, SL, TP และ Risk/Reward Ratio ชัดเจน""",
        "reportPromptV3": """โพสต์โซเชียลสำหรับรายการ VP TOP OPPORTUNITY RADAR (Prompt v.3)
- 📌 Hook: "🚀 VP TOP OPPORTUNITY RADAR v.3: เรดาร์สแกน 3 หุ้นความเชื่อมั่นสูงสุดคืนนี้ พร้อมคลิปสรุป 3 นาที"
- 📈 Highlights: สรุปหุ้นเด่น, R/R Ratio, และจุดเบรกเอาต์
- 🔒 สิทธิพิเศษเฉพาะสมาชิก VP & VIP""",
        "infoPromptV3": """สร้าง Infographic สไตล์ Bloomberg Intelligence สำหรับ VP TOP OPPORTUNITY RADAR (Prompt v.3)
ขนาด 1080x1350
ประกอบด้วย:
- 👑 ตราสัญลักษณ์ VP & VIP HIGH CONVICTION
- ตาราง 3 หุ้นเด่น + Conviction Score (0-100) + R/R Ratio
- ผัง Flowchart การเทรดแบบภาพมินิมอล"""
    },

    "vp_whalezoomkephoonarai": {
        "searchPromptV3": """Act as an Elite Institutional Flow Analyst creating the 'VP WHALEZOOM: Premium Institutional Flow Radar (Prompt v.3 - Dark Pool VWAP & Options Flow)'.
Your objective is to track footprints of institutional smart money (Dark Pool Block Trades & Unusual Options Sweeps) and provide members with institutional cost basis and low-risk credit spread strategies.

CRITICAL REPORT REQUIREMENTS (Prompt v.3):
1. **Report Branding**: Insert logo at the top:
<p align="center"><img src="Logo master.png" alt="SepKhawGonTrade Logo" width="150" /></p>

2. **Cross-Linkage Requirement**: Insert link at line 5:
🔗 อ่านบทวิเคราะห์กลยุทธ์ออปชันที่สอดคล้องกับพฤติกรรมวาฬได้ที่: 🔗[Options Selection Screen](options_screen_analysis_YYYY_MM_DD.md)

3. **Dark Pool Cost Basis (VWAP Analysis)**:
   For every featured stock, calculate and display the estimated Dark Pool Cost Basis (ราคาต้นทุนเฉลี่ยของวาฬ) and Accumulation Volume.

4. **Unusual Options Flow Details**:
   Provide exact Option Strike Prices, Expiration Dates, Sweep Volumes, and Option Greeks (Delta 0.30 - 0.40, IV Percentile).

5. **Member-Only Low-Risk Credit Spread Strategies**:
   Recommend specific Options Income strategies (Bull Put Spread / Cash-Secured Put) with statistical probability of profit.

6. **VP De-duplication Rule (0% Overlap)**: Ensure the list of tickers featured in VP WHALEZOOM is 100% unique and has 0% overlap with the tickers featured in VP TOP OPPORTUNITY RADAR on the same day.

7. **Financial Disclaimer**: Include standard warning at the bottom.

ข้อกำหนดการบันทึกไฟล์: บันทึกไฟล์เป็น 'MEMBERSHIP CONTENT SYSTEM/vp_whalezoomkephoonarai_YYYY_MM_DD.md' เสมอ

กฎเหล็ก: ค้นหาข้อมูลราคาจริงผ่าน Google Search และใส่ลิงก์ Sources สากลท้ายไฟล์เสมอ""",
        "audioPromptV3": """คุณคือผู้เชี่ยวชาญด้าน Institutional Flow ประจำช่วง "VP WHALEZOOM: วาฬซุ่มเก็บหุ้นอะไร (Prompt v.3)"
1. 🎙️ อัปเดตทิศทางเงินสถาบัน (Smart Money Flow) ประจำสัปดาห์
2. 🐋 เผยราคาต้นทุนเฉลี่ยของวาฬบน Dark Pool (VWAP Cost Basis)
3. 📊 แนะนำกลยุทธ์ Options Credit Spread ความเสี่ยงต่ำสำหรับสมาชิก""",
        "reportPromptV3": """โพสต์สรุปรายการ VP WHALEZOOM (Prompt v.3)
- 📌 Hook: "🐳 VP WHALEZOOM v.3: ถอดรหัสราคาต้นทุนวาฬบน Dark Pool + กลยุทธ์ Options เก็บพรีเมียม"
- 📊 สรุปหุ้นที่สถาบันกว้านซื้อหนาแน่นประจำสัปดาห์
- 🔒 เฉพาะสมาชิก VIP เท่านั้น""",
        "infoPromptV3": """สร้าง Infographic สไตล์ Institutional Options & Flow Dashboard สำหรับ VP WHALEZOOM (Prompt v.3)
ขนาด 1080x1350
- แสดงโลโก้ช่อง + ตรา VP WHALEZOOM RADAR
- ตารางราคาต้นทุน Dark Pool VWAP + Options Sweep Volume"""
    },

    "custom_1782454904186": {
        "searchPromptV3": """คุณคือนักวิเคราะห์หุ้นระดับมืออาชีพ สร้างรายงานเจาะลึกประจำซีรีส์ 'หุ้นในดวงใจ / ขอมา...จัดให้ (Prompt v.3 - Member Request Deep Dive Series)'
วัตถุประสงค์: วิเคราะห์หุ้น 1 ตัวตามคำขอของสมาชิกช่องแบบ 360 องศา ทั้งด้านพื้นฐาน ประเมินมูลค่า (DCF / P/E Band) และแผนเทรดทางเทคนิคอล 1 ปี

CRITICAL REPORT REQUIREMENTS (Prompt v.3):
1. **Report Branding**: ใส่โลโก้ด้านบนสุด:
<p align="center"><img src="Logo master.png" alt="SepKhawGonTrade Logo" width="150" /></p>

2. **Company Snapshot & Valuation Model**:
   - ธุรกิจหลัก, Segment รายได้, Market Cap, Sector, Industry
   - ประเมินมูลค่าที่เหมาะสม (DCF Fair Value vs Current Market Price), P/E Band ย้อนหลัง 5 ปี, และ 3-Year CAGR Target

3. **Timeline & Catalyst Roadmap (1 Year)**:
   - สรุปข่าวสาร 7 วันย้อนหลัง และตัวเร่งปฏิกิริยา (Catalysts) สำคัญในรอบ 12 เดือนข้างหน้า

4. **Detailed Technical Roadmap & Action Plan**:
   - แนวรับ-แนวต้านหลัก, จุดซื้อสะสมระยะยาว (DCA Zone), จุดสวิงเทรดระยะสั้น, Stop Loss, และเป้าหมายทำกำไร

5. **Financial Disclaimer**: ใส่กล่องคำเตือนความเสี่ยงท้ายไฟล์

ข้อกำหนดการบันทึกไฟล์: บันทึกไฟล์เป็น '[TICKER]_ขอมา_จัดให้_YYYY_MM_DD.md' เสมอ

กฎเหล็ก: ค้นหาข้อมูลราคาจริงผ่าน Google Search และใส่ลิงก์ Sources สากลท้ายไฟล์เสมอ""",
        "audioPromptV3": """คุณคือพิธีกรรายการ "หุ้นในดวงใจ / ขอมา...จัดให้ (Prompt v.3)"
1. 🎙️ ทักทายสมาชิกและเปิดประเด็นวิเคราะห์หุ้นที่สมาชิกโหวต/ขอเข้ามามากที่สุด
2. 📊 สรุปประเมินมูลค่า Fair Value (DCF vs ราคาปัจจุบัน)
3. 🎯 แนะนำแผนการสะสมระยะยาว (DCA Zone) และจุดสวิงเทรด""",
        "reportPromptV3": """โพสต์สรุปรายการ หุ้นในดวงใจ / ขอมา...จัดให้ (Prompt v.3)
- 📌 Hook: "💖 หุ้นในดวงใจ v.3: เจาะลึก [TICKER] ตามคำขอสมาชิก มูลค่า Fair Value + แผนสะสม 1 ปี"
- 🔒 สิทธิพิเศษสำหรับสมาชิกช่อง""",
        "infoPromptV3": """สร้าง Infographic สไตล์ Deep-Dive Stock Analysis สำหรับรายการ หุ้นในดวงใจ (Prompt v.3)
ขนาด 1080x1350
- โลโก้ช่อง + ชาร์ต Fair Value vs Market Price + แผนจุดสะสม DCA"""
    }
}


def update_album_html():
    album_path = 'album.html'
    if not os.path.exists(album_path):
        print("album.html not found!")
        return

    with open(album_path, 'r', encoding='utf-8') as f:
        content = f.read()

    modified = False
    for item_id, prompts in V3_PROMPTS.items():
        # Match JSON block containing "id": "item_id"
        pattern = re.compile(rf'(\{{\s*"id":\s*"{item_id}".*?\n\s*\}})', re.DOTALL)
        match = pattern.search(content)
        if match:
            block = match.group(1)
            # Add or update V3 keys in block
            for v3_key, v3_val in prompts.items():
                escaped_val = json.dumps(v3_val, ensure_ascii=False)
                if f'"{v3_key}":' in block:
                    # Update existing key
                    sub_pat = re.compile(rf'"{v3_key}":\s*".*?"(?=\s*[,}}])', re.DOTALL)
                    block = sub_pat.sub(f'"{v3_key}": {escaped_val}', block)
                else:
                    # Insert before closing brace of JSON object
                    block = block.rstrip()
                    if block.endswith('}'):
                        block = block[:-1].rstrip()
                        if not block.endswith(','):
                            block += ','
                        block += f'\n        "{v3_key}": {escaped_val}\n    }}'
            content = content.replace(match.group(1), block)
            modified = True
            print(f"Updated album.html for {item_id}")

    if modified:
        with open(album_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Successfully updated album.html with Prompt v.3!")


def update_sidecars():
    sidecar_map = {
        "vip_market_strategy_watchlist": "/Users/soontorntachasakulnapaporn/.gemini/config/sidecars/vip-watchlist/sidecar.json",
        "vp_top_opportunity_radar": "/Users/soontorntachasakulnapaporn/.gemini/config/sidecars/vip_investor_briefing/sidecar.json",
        "vp_whalezoomkephoonarai": "/Users/soontorntachasakulnapaporn/.gemini/config/sidecars/vp-whalezoomkephoonarai/sidecar.json"
    }

    for item_id, spath in sidecar_map.items():
        if os.path.exists(spath) and item_id in V3_PROMPTS:
            v3_prompt = V3_PROMPTS[item_id]["searchPromptV3"]
            with open(spath, 'r', encoding='utf-8') as f:
                data = json.load(f)

            if "args" in data and isinstance(data["args"], list):
                # Update the prompt argument (usually index 3 or last string arg)
                for i in range(len(data["args"])):
                    if isinstance(data["args"][i], str) and ("You are" in data["args"][i] or "Act as" in data["args"][i] or "ข้อกำหนด" in data["args"][i]):
                        data["args"][i] = v3_prompt
                        break

            with open(spath, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"Updated sidecar.json for {item_id} at {spath}")


if __name__ == "__main__":
    update_album_html()
    update_sidecars()
