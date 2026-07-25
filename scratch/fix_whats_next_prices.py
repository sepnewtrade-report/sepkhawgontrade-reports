import os

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPORT_PATH = os.path.join(ROOT_DIR, "whats_next_2026_07_26.md")
SCRIPT_PATH = os.path.join(ROOT_DIR, "whats_next_script_2026_07_26.md")

def fix_report():
    if not os.path.exists(REPORT_PATH):
        print("Report path not found")
        return
        
    with open(REPORT_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    # Old table row block in report:
    old_table_rows = (
        "| CLS | Celestica | 335.92 | +2.15% | 65.50 | Positive | 1.5M | ผู้ให้บริการโครงสร้างพื้นฐาน Hyperscaler ที่มีการเติบโตของรายได้ Q1 สูงถึง 52.8% YoY และปรับเพิ่มประมาณการรายได้และ EPS สำหรับปี 2026 อย่างมีนัยสำคัญ |\n"
        "| VPG | Vishay Precision Gp| 45.00 | +2.50% | 68.20 | Positive | 350K | ผู้ผลิตเซ็นเซอร์ที่ถูกมองข้าม โดยมีการเติบโตของยอดจอง (bookings) ใน Q1 ที่ 25% QoQ และอัตราส่วน book-to-bill ที่ 1.21 โดยได้รับแรงหนุนจาก AI Data Centers และ Robotics |\n"
        "| UFPT | UFP Technologies | 237.96 | -3.10% | 42.10 | Negative | 200K | หุ้น Small Cap ในกลุ่มอุปกรณ์การแพทย์และการบรรจุภัณฑ์ปลอดเชื้อ ซึ่งตลาดคาดการณ์การเติบโตของตลาดอุปกรณ์การแพทย์โลกถึง 518 พันล้านดอลลาร์ในปี 2032 แม้มีแรงกดดันด้านผลกำไรระยะสั้น แต่ผู้บริหารคาดว่าจะดีขึ้นในครึ่งหลังปี 2026 |\n"
        "| WLDN | Willdan Group | 32.50 | +1.20% | 58.70 | Neutral | 180K | หุ้น Small Cap ที่ได้รับประโยชน์จากความต้องการศูนย์ข้อมูลที่ขับเคลื่อนด้วย AI และมีการปรับเพิ่มประมาณการ Free Cash Flow หลังจากการรายงานผลประกอบการที่แข็งแกร่ง |"
    )

    new_table_rows = (
        "| **CLS** | Celestica Inc. | 305.28 | +1.31% | 36.21 | Negative (Bearish) | 2.39M | ผู้ให้บริการโครงสร้างพื้นฐาน Hyperscaler ที่มีการเติบโตของรายได้ Q1 สูงถึง 52.8% YoY และปรับเพิ่มประมาณการรายได้และ EPS สำหรับปี 2026 อย่างมีนัยสำคัญ |\n"
        "| **VPG** | Vishay Precision Group | 104.44 | +0.53% | 36.12 | Negative (Bearish) | 493K | ผู้ผลิตเซ็นเซอร์ความแม่นยำสูง โดยมียอดจอง (bookings) ใน Q1 โต 25% QoQ และอัตรา book-to-bill ที่ 1.21 ได้รับอานิสงส์จาก AI Data Centers และ Robotics |\n"
        "| **UFPT** | UFP Technologies | 237.20 | -2.00% | 32.19 | Negative (Bearish) | 205K | หุ้น Small Cap ในกลุ่มอุปกรณ์การแพทย์และการบรรจุภัณฑ์ปลอดเชื้อ ซึ่งตลาดคาดการณ์การเติบโตระดับโลกถึง 518 พันล้านดอลลาร์ในปี 2032 แม้มีแรงกดดันระยะสั้น |\n"
        "| **WLDN** | Willdan Group | 72.63 | -0.10% | 31.91 | Positive (Bullish) | 182K | หุ้น Small Cap ที่ได้รับประโยชน์จากความต้องการศูนย์ข้อมูลคลาวด์และ AI และมีการปรับเพิ่มประมาณการกระแสเงินสดอิสระหลังงบแกร่ง |"
    )

    content = content.replace(old_table_rows, new_table_rows)

    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        f.write(content)
    print("Report watchlists corrected.")

def fix_script():
    if not os.path.exists(SCRIPT_PATH):
        print("Script path not found")
        return
        
    with open(SCRIPT_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    # Replace individual bullet points in script spoken lines
    cls_old = "*   **CLS (Celestica):** ราคาล่าสุด 335.92 ดอลลาร์ ปรับเพิ่มขึ้น 2.15% ในสัปดาห์ที่ผ่านมา RSI 65.50 และ MACD เป็นบวก ผู้ให้บริการโครงสร้างพื้นฐาน Hyperscaler ที่มีการเติบโตของรายได้ Q1 สูงถึง 52.8% เมื่อเทียบเป็นรายปี และปรับเพิ่มประมาณการรายได้และ EPS สำหรับปี 2026 อย่างมีนัยสำคัญ [ที่มา: marketscreener.com, กรกฎาคม 2569]"
    cls_new = "*   **CLS (Celestica):** ราคาล่าสุด 305.28 ดอลลาร์ ปรับเพิ่มขึ้น 1.31% ในสัปดาห์ที่ผ่านมา RSI 36.21 และ MACD ติดลบ เป็นผู้ให้บริการโครงสร้างพื้นฐาน Hyperscaler ที่มีการเติบโตของรายได้ Q1 สูงถึง 52.8% เมื่อเทียบเป็นรายปี และปรับเพิ่มประมาณการรายได้และ EPS สำหรับปี 2026 อย่างมีนัยสำคัญ [ที่มา: Yahoo Finance, กรกฎาคม 2569]"
    
    vpg_old = "*   **VPG (Vishay Precision Group):** ราคาล่าสุด 45.00 ดอลลาร์ ปรับเพิ่มขึ้น 2.50% ในสัปดาห์ที่ผ่านมา RSI 68.20 และ MACD เป็นบวก ผู้ผลิตเซ็นเซอร์ที่ถูกมองข้าม โดยมีการเติบโตของยอดจอง หรือ bookings ใน Q1 ที่ 25% เมื่อเทียบเป็นรายไตรมาส และอัตราส่วน book-to-bill ที่ 1.21 โดยได้รับแรงหนุนจาก AI Data Centers และ Robotics [ที่มา: gurufocus.com, กรกฎาคม 2569]"
    vpg_new = "*   **VPG (Vishay Precision Group):** ราคาล่าสุด 104.44 ดอลลาร์ ปรับเพิ่มขึ้น 0.53% ในสัปดาห์ที่ผ่านมา RSI 36.12 และ MACD เป็นลบ เป็นผู้ผลิตเซ็นเซอร์ความแม่นยำสูงที่มีการเติบโตของยอดจอง หรือ bookings ใน Q1 ที่ 25% เมื่อเทียบเป็นรายไตรมาส และอัตราส่วน book-to-bill ที่ 1.21 โดยได้รับแรงหนุนจาก AI Data Centers และ Robotics [ที่มา: Yahoo Finance, กรกฎาคม 2569]"
    
    ufpt_old = "*   **UFPT (UFP Technologies):** ราคาล่าสุด 237.96 ดอลลาร์ ปรับลดลง 3.10% ในสัปดาห์ที่ผ่านมา RSI 42.10 และ MACD เป็นลบ หุ้น Small Cap ในกลุ่มอุปกรณ์การแพทย์และการบรรจุภัณฑ์ปลอดเชื้อ ซึ่งตลาดคาดการณ์การเติบโตของตลาดอุปกรณ์การแพทย์โลกถึง 518 พันล้านดอลลาร์ในปี 2032 แม้มีแรงกดดันด้านผลกำไรระยะสั้น แต่ผู้บริหารคาดว่าจะดีขึ้นในครึ่งหลังปี 2026 [ที่มา: ycharts.com, กรกฎาคม 2569]"
    ufpt_new = "*   **UFPT (UFP Technologies):** ราคาล่าสุด 237.20 ดอลลาร์ ปรับลดลง 2.00% ในสัปดาห์ที่ผ่านมา RSI 32.19 และ MACD ติดลบ เป็นหุ้น Small Cap ในกลุ่มอุปกรณ์การแพทย์และการบรรจุภัณฑ์ปลอดเชื้อ ซึ่งตลาดคาดการณ์การเติบโตของตลาดอุปกรณ์การแพทย์โลกถึง 518 พันล้านดอลลาร์ในปี 2032 แม้มีแรงกดดันด้านผลกำไรระยะสั้น แต่ผู้บริหารคาดว่าจะดีขึ้นในครึ่งหลังปี 2026 [ที่มา: Yahoo Finance, กรกฎาคม 2569]"
    
    wldn_old = "*   **WLDN (Willdan Group):** ราคาล่าสุด 32.50 ดอลลาร์ ปรับเพิ่มขึ้น 1.20% ในสัปดาห์ที่ผ่านมา RSI 58.70 และ MACD เป็นกลาง หุ้น Small Cap ที่ได้รับประโยชน์จากความต้องการศูนย์ข้อมูลที่ขับเคลื่อนด้วย AI และมีการปรับเพิ่มประมาณการ Free Cash Flow หลังจากการรายงานผลประกอบการที่แข็งแกร่ง [ที่มา: barchart.com, กรกฎาคม 2569]"
    wldn_new = "*   **WLDN (Willdan Group):** ราคาล่าสุด 72.63 ดอลลาร์ ปรับลดลงเล็กน้อย 0.10% ในสัปดาห์ที่ผ่านมา RSI 31.91 และ MACD ตัดขึ้น เป็นหุ้น Small Cap ที่ได้รับประโยชน์จากความต้องการศูนย์ข้อมูลที่ขับเคลื่อนด้วย AI และมีการปรับเพิ่มประมาณการ Free Cash Flow หลังจากการรายงานผลประกอบการที่แข็งแกร่ง [ที่มา: Yahoo Finance, กรกฎาคม 2569]"

    content = content.replace(cls_old, cls_new)
    content = content.replace(vpg_old, vpg_new)
    content = content.replace(ufpt_old, ufpt_new)
    content = content.replace(wldn_old, wldn_new)

    with open(SCRIPT_PATH, "w", encoding="utf-8") as f:
        f.write(content)
    print("Script watchlists corrected.")

if __name__ == "__main__":
    fix_report()
    fix_script()
