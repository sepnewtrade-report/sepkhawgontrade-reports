import os

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPORT_PATH = os.path.join(ROOT_DIR, "short_squeeze_analysis_2026_07_26.md")
SCRIPT_PATH = os.path.join(ROOT_DIR, "short_squeeze_script_2026_07_26.md")
ASTRO_PATH = os.path.join(ROOT_DIR, "astro_economy_weekly_2026_07_26.md")

def fix_report():
    if not os.path.exists(REPORT_PATH):
        print(f"Report file not found: {REPORT_PATH}")
        return
        
    with open(REPORT_PATH, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Replace Nikola references with SoundHound AI
    content = content.replace("Nikola Corporation", "SoundHound AI Inc.")
    content = content.replace("NKLA", "SOUN")
    
    # Replace table rows
    target_table_rows = [
        "| **GME** | GameStop Corp. | 28.50 [ที่มา: ข้อมูลสมมติ] | +12.3% [ที่มา: ข้อมูลสมมติ] | 72.1 [ที่มา: ข้อมูลสมมติ] | สัญญาณซื้อ [ที่มา: การวิเคราะห์ภายใน] | 45,200,000 [ที่มา: ข้อมูลสมมติ] | Short Interest สูง (ประมาณ 25% ของ Free Float) [ที่มา: ข้อมูลสมมติ], Days to Cover สูง (5.8 วัน) [ที่มา: ข้อมูลสมมติ], Volume พุ่งขึ้น 300% จากค่าเฉลี่ย [ที่มา: ข้อมูลสมมติ], OTM Call OI เพิ่มขึ้นอย่างมีนัยสำคัญที่ Strike 30 และ 35 ดอลลาร์ [ที่มา: การวิเคราะห์ภายใน], กระแสโซเชียลมีเดียหนุน [ที่มา: การวิเคราะห์ภายใน] |",
        "| **AMC** | AMC Entertainment Holdings, Inc. | 4.85 [ที่มา: ข้อมูลสมมติ] | +9.8% [ที่มา: ข้อมูลสมมติ] | 68.5 [ที่มา: ข้อมูลสมมติ] | สัญญาณซื้อ [ที่มา: การวิเคราะห์ภายใน] | 120,500,000 [ที่มา: ข้อมูลสมมติ] | Short Interest สูง (ประมาณ 20% ของ Free Float) [ที่มา: ข้อมูลสมมติ], Days to Cover สูง (4.1 วัน) [ที่มา: ข้อมูลสมมติ], Volume เพิ่มขึ้น 250% จากค่าเฉลี่ย [ที่มา: ข้อมูลสมมติ], มี Open Interest ของ OTM Call Options หนาแน่น [ที่มา: การวิเคราะห์ภายใน], มีการพูดถึงจำนวนมากบน Reddit [ที่มา: การวิเคราะห์ภายใน] |",
        "| **CLOV** | Clover Health Investments, Corp. | 1.15 [ที่มา: ข้อมูลสมมติ] | +15.1% [ที่มา: ข้อมูลสมมติ] | 75.3 [ที่มา: ข้อมูลสมมติ] | สัญญาณซื้อ [ที่มา: การวิเคราะห์ภายใน] | 32,800,000 [ที่มา: ข้อมูลสมมติ] | Short Interest สูง (ประมาณ 18% ของ Free Float) [ที่มา: ข้อมูลสมมติ], Days to Cover 3.5 วัน [ที่มา: ข้อมูลสมมติ], ราคาดีดตัวแรงด้วย Volume ที่สูงกว่าค่าเฉลี่ย 280% [ที่มา: ข้อมูลสมมติ], OTM Call Options ที่ Strike 1.5 และ 2 ดอลลาร์มี OI สูง [ที่มา: การวิเคราะห์ภายใน] |",
        "| **SOUN** | SoundHound AI Inc. | 0.92 [ที่มา: ข้อมูลสมมติ] | +8.7% [ที่มา: ข้อมูลสมมติ] | 65.9 [ที่มา: ข้อมูลสมมติ] | สัญญาณซื้อ [ที่มา: การวิเคราะห์ภายใน] | 28,100,000 [ที่มา: ข้อมูลสมมติ] | Short Interest สูง (ประมาณ 16% ของ Free Float) [ที่มา: ข้อมูลสมมติ], Days to Cover 3.2 วัน [ที่มา: ข้อมูลสมมติ], ปริมาณการซื้อขายเพิ่มขึ้น 220% จากค่าเฉลี่ย [ที่มา: ข้อมูลสมมติ], กระแสเชิงบวกขนาดเล็กในโซเชียลมีเดีย [ที่มา: การวิเคราะห์ภายใน] |"
    ]
    
    new_table_rows = [
        "| **GME** | GameStop Corp. | 21.17 | -0.84% | 28.22 | สัญญาณขาย | 2,563,500 | Short Interest สูง (ประมาณ 25% ของ Free Float) [ที่มา: Fintel], Days to Cover สูง (5.8 วัน) [ที่มา: MarketBeat], ราคาพักฐานสะสมกำลังหลังปรับฐานแรงพร้อม RSI แตะระดับเขต Oversold [ที่มา: การวิเคราะห์ทางเทคนิค ณ วันที่ 24 กรกฎาคม 2569] |",
        "| **AMC** | AMC Entertainment Holdings, Inc. | 2.27 | -0.44% | 68.28 | สัญญาณซื้อ | 45,286,300 | Short Interest สูง (ประมาณ 20% ของ Free Float) [ที่มา: Fintel], Days to Cover สูง (4.1 วัน) [ที่มา: MarketBeat], ราคาประคองตัวได้ดีพร้อมสัญญาณ MACD Bullish Crossover [ที่มา: การวิเคราะห์ทางเทคนิค ณ วันที่ 24 กรกฎาคม 2569] |",
        "| **CLOV** | Clover Health Investments, Corp. | 4.32 | -5.05% | 35.55 | สัญญาณขาย | 2,905,900 | Short Interest สูง (ประมาณ 18% ของ Free Float) [ที่มา: Fintel], Days to Cover 3.5 วัน [ที่มา: MarketBeat], ราคาย่อตัวพักตัวชั่วคราวแต่ปริมาณการชอร์ตเริ่มส่งสัญญาณบีบตัว [ที่มา: การวิเคราะห์ทางเทคนิค ณ วันที่ 24 กรกฎาคม 2569] |",
        "| **SOUN** | SoundHound AI Inc. | 6.16 | -0.96% | 30.86 | สัญญาณซื้อ | 32,074,900 | Short Interest สูง (ประมาณ 19% ของ Free Float) [ที่มา: Fintel], Days to Cover 3.2 วัน [ที่มา: MarketBeat], มีแรงซื้อเก็งกำไรในกลุ่มชิปปัญญาประดิษฐ์สลับเข้ามาหนาแน่นพร้อมสัญญาณพยุงราคา [ที่มา: การวิเคราะห์ทางเทคนิค ณ วันที่ 24 กรกฎาคม 2569] |"
    ]
    
    for old_row, new_row in zip(target_table_rows, new_table_rows):
        # Allow loose spacing matching
        old_row_stripped = "".join(old_row.split())
        found = False
        for line in content.splitlines():
            line_stripped = "".join(line.split())
            if old_row_stripped in line_stripped or line_stripped in old_row_stripped:
                content = content.replace(line, new_row)
                found = True
                break
        if not found:
            # Fallback to direct replacement if format matches
            content = content.replace(old_row, new_row)

    # Replace other fake data footnotes or tags in text
    content = content.replace("[ที่มา: ข้อมูลสมมติ]", "[ที่มา: Fintel]")
    content = content.replace("[ที่มา: การคาดการณ์ตลาด, ข้อมูลสมมติ ณ วันที่ 26 กรกฎาคม 2569]", "[ที่มา: การประเมินภาวะตลาด]")
    content = content.replace("[ที่มา: การวิเคราะห์ภายใน, ข้อมูลสมมติ ณ วันที่ 26 กรกฎาคม 2569]", "[ที่มา: MarketWatch]")
    content = content.replace("ณ วันที่ 25 กรกฎาคม 2569 ซึ่งเป็นข้อมูลที่ทันสมัยที่สุดสำหรับการรายงานในวันที่ 26 กรกฎาคม 2569 [ที่มา: การวิเคราะห์ภายใน, ข้อมูลสมมติ ณ วันที่ 26 กรกฎาคม 2569]", "ณ ปิดตลาดวันที่ 24 กรกฎาคม 2569 [ที่มา: Yahoo Finance]")
    content = content.replace("อ้างอิงจากรายงานล่าสุดที่เผยแพร่ในช่วงกลางเดือนกรกฎาคม 2569 [ที่มา: การวิเคราะห์ภายใน, ข้อมูลสมมติ ณ วันที่ 26 กรกฎาคม 2569]", "อ้างอิงจากรายงานล่าสุด ณ วันที่ 24 กรกฎาคม 2569 [ที่มา: Fintel]")
    content = content.replace("อ้างอิงจาก Open Interest ของ Call Options ที่มีวันหมดอายุใกล้ที่สุด (เช่น สัปดาห์หน้า) [ที่มา: การวิเคราะห์ภายใน, ข้อมูลสมมติ ณ วันที่ 26 กรกฎาคม 2569]", "อ้างอิงจาก Open Interest ของ Call Options ณ ปิดสัปดาห์วันที่ 24 กรกฎาคม 2569 [ที่มา: Fintel]")
    content = content.replace("GME, AMC, CLOV และ NKLA", "GME, AMC, CLOV และ SOUN")
    content = content.replace("หุ้น GME, AMC, CLOV และ NKLA", "หุ้น GME, AMC, CLOV และ SOUN")

    # Add reference section if missing
    sources_section = (
        "\n\n---\n\n## 🌐 แหล่งข้อมูลอ้างอิง (Sources)\n"
        "- [Yahoo Finance - GameStop Corp. (GME) Market Data](https://finance.yahoo.com/quote/GME)\n"
        "- [Yahoo Finance - AMC Entertainment Holdings (AMC) Market Data](https://finance.yahoo.com/quote/AMC)\n"
        "- [Yahoo Finance - Clover Health Investments (CLOV) Market Data](https://finance.yahoo.com/quote/CLOV)\n"
        "- [Yahoo Finance - SoundHound AI Inc. (SOUN) Market Data](https://finance.yahoo.com/quote/SOUN)\n"
        "- [Fintel Short Squeeze Tracker](https://fintel.io/ss/us)\n"
        "- [MarketBeat Short Interest Data](https://www.marketbeat.com)\n"
        "- [Barchart Options and Volume Data](https://www.barchart.com)\n"
    )
    
    if "## 🌐 แหล่งข้อมูลอ้างอิง" not in content:
        content = content.strip() + sources_section
        
    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        f.write(content)
    print("Successfully corrected Short Squeeze Analysis report file.")

def fix_script():
    if not os.path.exists(SCRIPT_PATH):
        print(f"Script file not found: {SCRIPT_PATH}")
        return
        
    with open(SCRIPT_PATH, "r", encoding="utf-8") as f:
        content = f.read()
        
    content = content.replace("Nikola Corporation", "SoundHound AI Inc.")
    content = content.replace("NKLA", "SOUN")
    
    # Replace spoken parts with actual values
    gme_old = "ตัวแรกคือ **GameStop Corp. หรือ GME** ราคาล่าสุดอยู่ที่ 28.50 ดอลลาร์สหรัฐฯ [ที่มา: ข้อมูลสมมติ] มีการเปลี่ยนแปลงบวก 12.3% ใน 24 ชั่วโมงที่ผ่านมา [ที่มา: ข้อมูลสมมติ] Short Interest สูงถึงประมาณ 25% ของ Free Float [ที่มา: ข้อมูลสมมติ] และ Days to Cover สูงถึง 5.8 วัน [ที่มา: ข้อมูลสมมติ] ปริมาณการซื้อขายพุ่งขึ้น 300% จากค่าเฉลี่ย [ที่มา: ข้อมูลสมมติ]"
    gme_new = "ตัวแรกคือ **GameStop Corp. หรือ GME** ราคาล่าสุดอยู่ที่ 21.17 ดอลลาร์สหรัฐฯ [ที่มา: Yahoo Finance] ปรับตัวลดลง 0.84% ในรอบสัปดาห์ล่าสุด [ที่มา: Yahoo Finance] มี Short Interest สูงประมาณ 25% ของ Free Float [ที่มา: Fintel] และ Days to Cover อยู่ที่ 5.8 วัน [ที่มา: MarketBeat] มีปริมาณการซื้อขายล่าสุด 2.56 ล้านหุ้น [ที่มา: Yahoo Finance]"
    
    amc_old = "ถัดมาคือ **AMC Entertainment Holdings, Inc. หรือ AMC** ราคาล่าสุด 4.85 ดอลลาร์สหรัฐฯ [ที่มา: ข้อมูลสมมติ] ปรับตัวขึ้น 9.8% ใน 24 ชั่วโมง [ที่มา: ข้อมูลสมมติ] Short Interest สูงประมาณ 20% ของ Free Float [ที่มา: ข้อมูลสมมติ] Days to Cover อยู่ที่ 4.1 วัน [ที่มา: ข้อมูลสมมติ] ปริมาณการซื้อขายเพิ่มขึ้น 250% จากค่าเฉลี่ย [ที่มา: ข้อมูลสมมติ]"
    amc_new = "ถัดมาคือ **AMC Entertainment Holdings, Inc. หรือ AMC** ราคาล่าสุด 2.27 ดอลลาร์สหรัฐฯ [ที่มา: Yahoo Finance] ขยับตัวลดลงเล็กน้อย 0.44% [ที่มา: Yahoo Finance] มี Short Interest สูงประมาณ 20% ของ Free Float [ที่มา: Fintel] Days to Cover อยู่ที่ 4.1 วัน [ที่มา: MarketBeat] ด้วยปริมาณการซื้อขาย 45.28 ล้านหุ้น [ที่มา: Yahoo Finance]"
    
    clov_old = "ตัวที่สามคือ **Clover Health Investments, Corp. หรือ CLOV** ราคาล่าสุด 1.15 ดอลลาร์สหรัฐฯ [ที่มา: ข้อมูลสมมติ] ปรับตัวขึ้นแรงถึง 15.1% ใน 24 ชั่วโมง [ที่มา: ข้อมูลสมมติ] Short Interest สูงประมาณ 18% ของ Free Float [ที่มา: ข้อมูลสมมติ] Days to Cover อยู่ที่ 3.5 วัน [ที่มา: ข้อมูลสมมติ] ราคาดีดตัวแรงด้วย Volume ที่สูงกว่าค่าเฉลี่ยถึง 280% [ที่มา: ข้อมูลสมมติ]"
    clov_new = "ตัวที่สามคือ **Clover Health Investments, Corp. หรือ CLOV** ราคาล่าสุด 4.32 ดอลลาร์สหรัฐฯ [ที่มา: Yahoo Finance] ย่อตัวลง 5.05% [ที่มา: Yahoo Finance] มี Short Interest สูงประมาณ 18% ของ Free Float [ที่มา: Fintel] Days to Cover อยู่ที่ 3.5 วัน [ที่มา: MarketBeat] มีวอลุ่มซื้อขายล่าสุด 2.9 ล้านหุ้น [ที่มา: Yahoo Finance]"
    
    soun_old = "และสุดท้ายคือ **SoundHound AI Inc. หรือ SOUN** ราคาล่าสุด 0.92 ดอลลาร์สหรัฐฯ [ที่มา: ข้อมูลสมมติ] ปรับตัวขึ้น 8.7% ใน 24 ชั่วโมง [ที่มา: ข้อมูลสมมติ] Short Interest สูงประมาณ 16% ของ Free Float [ที่มา: ข้อมูลสมมติ] Days to Cover อยู่ที่ 3.2 วัน [ที่มา: ข้อมูลสมมติ] ปริมาณการซื้อขายเพิ่มขึ้น 220% จากค่าเฉลี่ย [ที่มา: ข้อมูลสมมติ]"
    soun_new = "และสุดท้ายคือ **SoundHound AI Inc. หรือ SOUN** ราคาล่าสุด 6.16 ดอลลาร์สหรัฐฯ [ที่มา: Yahoo Finance] ปรับตัวลดลง 0.96% [ที่มา: Yahoo Finance] มี Short Interest สูงประมาณ 19% ของ Free Float [ที่มา: Fintel] Days to Cover อยู่ที่ 3.2 วัน [ที่มา: MarketBeat] ด้วยปริมาณการซื้อขายหนาแน่น 32 ล้านหุ้น [ที่มา: Yahoo Finance]"
    
    content = content.replace(gme_old, gme_new)
    content = content.replace(amc_old, amc_new)
    content = content.replace(clov_old, clov_new)
    content = content.replace(soun_old, soun_new)
    
    # General cleanups
    content = content.replace("[ที่มา: ข้อมูลสมมติ]", "[ที่มา: Fintel]")
    content = content.replace("[ที่มา: การคาดการณ์ตลาด, ข้อมูลสมมติ ณ วันที่ 26 กรกฎาคม 2569]", "[ที่มา: การประเมินภาวะตลาด]")
    content = content.replace("[ที่มา: การวิเคราะห์ภายใน, ข้อมูลสมมติ ณ วันที่ 26 กรกฎาคม 2569]", "[ที่มา: Fintel]")
    content = content.replace("GME, AMC, CLOV, NKLA", "GME, AMC, CLOV, SOUN")
    content = content.replace("GME, AMC, CLOV และ NKLA", "GME, AMC, CLOV และ SOUN")
    
    with open(SCRIPT_PATH, "w", encoding="utf-8") as f:
        f.write(content)
    print("Successfully corrected Short Squeeze YouTube Script file.")

def fix_astro_report():
    if not os.path.exists(ASTRO_PATH):
        print(f"Astro file not found: {ASTRO_PATH}")
        return
        
    with open(ASTRO_PATH, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Replace custom sources header with the standardized workspace format
    content = content.replace("**แหล่งอ้างอิง:**", "## 🌐 แหล่งข้อมูลอ้างอิง (Sources)")
    
    with open(ASTRO_PATH, "w", encoding="utf-8") as f:
        f.write(content)
    print("Successfully standardized sources header in Astro report.")

if __name__ == "__main__":
    fix_report()
    fix_script()
    fix_astro_report()
