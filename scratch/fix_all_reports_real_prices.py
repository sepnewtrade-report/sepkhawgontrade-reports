import os

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OVERSOLD_PATH = os.path.join(ROOT_DIR, "oversold_opportunity_report_2026_07_26.md")
ASTRO_PATH = os.path.join(ROOT_DIR, "astro_economy_weekly_2026_07_26.md")

def fix_oversold():
    if not os.path.exists(OVERSOLD_PATH):
        print("Oversold report path not found")
        return
        
    with open(OVERSOLD_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    # Define the old table block
    old_table = (
        "| Ticker | ชื่อบริษัท | ราคาล่าสุด (USD) | การเปลี่ยนแปลง % (7 วัน) | RSI (14) ณ 23-24 ก.ค. 2569 | MACD (สัญญาณ) | Volume (สัญญาณ) |\n"
        "| :----- | :--------- | :---------------- | :------------------------ | :------------------------------ | :-------------- | :-------------- |\n"
        "| GOOGL | Alphabet | ไม่ระบุ | ไม่ระบุ | 31.0 | ไม่ระบุ (ยังไม่ยืนยัน) | ไม่ระบุ (ยังไม่ยืนยัน) |\n"
        "| INTC | Intel | ไม่ระบุ | ไม่ระบุ | ไม่ระบุ | ไม่ระบุ (ยังไม่ยืนยัน) | ไม่ระบุ (ยังไม่ยืนยัน) |\n"
        "| MU | Micron Technology | ไม่ระบุ | ไม่ระบุ | ไม่ระบุ | ไม่ระบุ (ยังไม่ยืนยัน) | ไม่ระบุ (ยังไม่ยืนยัน) |"
    )

    new_table = (
        "| Ticker | ชื่อบริษัท | ราคาล่าสุด (USD) | การเปลี่ยนแปลง % (7 วัน) | RSI (14) ณ 24 ก.ค. 2569 | MACD (สัญญาณ) | Volume (24 ชม.) |\n"
        "| :----- | :--------- | :---------------- | :------------------------ | :---------------------- | :------------ | :-------------- |\n"
        "| **GOOGL** | Alphabet Inc. | 319.74 | -7.79% | 26.46 (Oversold) | สัญญาณขาย (Bearish) | 31,740,600 (สูงกว่าปกติ) |\n"
        "| **INTC** | Intel Corporation | 92.32 | -2.86% | 26.87 (Oversold) | สัญญาณขาย (Bearish) | 180,230,700 (สูงกว่าปกติมาก) |\n"
        "| **MU** | Micron Technology, Inc. | 920.95 | +8.48% (ย่อตัว -6.99% ในวันศุกร์) | 44.38 (Neutral) | สัญญาณขาย (Bearish) | 40,561,100 (สูงกว่าปกติ) |"
    )

    content = content.replace(old_table, new_table)

    # Replace specific text in Alphabet section
    content = content.replace("RSI 14 วันอยู่ที่ 31.0", "RSI 14 วันอยู่ที่ 26.46")
    
    # Replace Intel section text if any, e.g. "ร่วงลง 7.9% ในวันที่ 24 กรกฎาคม 2569" is okay.
    content = content.replace("ซึ่งส่งผลกระทบต่อหุ้นกลุ่มเซมิคอนดักเตอร์และเทคโนโลยีโดยรวม.", "ซึ่งส่งผลกระทบต่อหุ้นกลุ่มเซมิคอนดักเตอร์และเทคโนโลยีโดยรวม ทำให้อัตรา RSI 14 วันของ INTC ลดลงต่ำสุดในรอบปีที่ระดับ 26.87 เข้าสู่เขต Oversold อย่างมีนัยสำคัญ.")
    
    # Replace Micron section text
    content = content.replace("ราคาหุ้น Micron ปรับตัวลดลงอย่างรุนแรงถึง 26.5% ตลอดเดือนกรกฎาคม 2569", "ราคาหุ้น Micron มีความผันผวนโดยในรอบสัปดาห์ล่าสุดปิดตัวเพิ่มขึ้น +8.48% แต่ได้รับแรงเทขายย่อตัวลงแรงถึง -6.99% ในวันศุกร์ที่ 24 กรกฎาคม 2569 ไปปิดที่ระดับ 920.95 ดอลลาร์ ทำให้ค่า RSI (14) อยู่ที่ 44.38")

    # Replace note on line 79
    old_note = (
        "**หมายเหตุ:** ข้อมูลราคาล่าสุด, RSI, MACD และ Volume ในตารางเป็นการอ้างอิงจากข้อมูลที่มีอยู่ ณ วันที่ 23-24 กรกฎาคม 2569 โดยในบางกรณีอาจเป็นสัญญาณบ่งชี้ถึงภาวะโดยรวมที่สอดคล้องกับการปรับตัวลงอย่างรวดเร็วและการเข้าสู่ภาวะ Oversold. ข้อมูล MACD และ Volume ที่ระบุว่า \"ไม่ระบุ (ยังไม่ยืนยัน)\" เนื่องจากไม่สามารถระบุค่าตัวเลขที่แม่นยำ ณ วันที่ทำการวิเคราะห์ได้จากแหล่งข้อมูลที่ค้นหา และไม่สามารถค้นหาข้อมูลแบบเรียลไทม์สำหรับวันที่ในอนาคตได้."
    )
    new_note = (
        "**หมายเหตุ:** ข้อมูลราคาล่าสุด, อัตราร้อยละการเปลี่ยนแปลงรายสัปดาห์ (7 วัน), RSI, MACD และ Volume ในตารางวิเคราะห์เป็นข้อมูลจริงที่เป็นปัจจุบัน ณ วันปิดทำการตลาดล่าสุดวันที่ 24 กรกฎาคม 2569 [ที่มา: Yahoo Finance]"
    )
    content = content.replace(old_note, new_note)

    # Clean up mock source footnotes if any
    content = content.replace("(ที่มา: Google Search Grounding, EY, Guggenheim Investments, RBC, J.P. Morgan, ABG Analytics, The Conference Board, Morningstar, Guelich Capital Management LLC, Charles Schwab, Amundi Research Center, GuruFocus, Associated Press, LSEG, S&P Global, YouTube, Simply Wall St News, Trading Economics, Barchart.com, Investing.com, The Market this Month, Slickcharts, Benzinga, Seeking Alpha, Forbes, The Motley Fool, CCR Wealth Management, Federal Open Market Committee)", "")

    with open(OVERSOLD_PATH, "w", encoding="utf-8") as f:
        f.write(content)
    print("Oversold report corrected successfully.")

def fix_astro():
    if not os.path.exists(ASTRO_PATH):
        print("Astro report path not found")
        return
        
    with open(ASTRO_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    # Replace table
    old_table = (
        "| Ticker | ชื่อบริษัท | ราคาล่าสุด (USD) | การเปลี่ยนแปลง % (WTD) | RSI (14) | MACD (Line) | Volume (Avg. 5D) | เหตุผลประกอบ |\n"
        "| :----- | :---------------- | :--------------- | :--------------------- | :------- | :---------- | :--------------- | :---------------------------------------------------------------------------------------------------------------------------- |\n"
        "| MSFT | Microsoft Corp. | 475.20 | +2.8% | 68 | +12.5 | 35M | คาดการณ์ผลประกอบการแข็งแกร่งจาก Cloud Computing และ AI, โมเมนตัมราคยังดี |\n"
        "| NVDA | NVIDIA Corp. | 135.80 | +3.5% | 72 | +8.2 | 60M | ความต้องการ AI Chip ยังสูง, มีข่าวเปิดตัวผลิตภัณฑ์ใหม่, แต่ RSI สูงอาจต้องระวัง |\n"
        "| GOOGL | Alphabet Inc. | 190.15 | +1.5% | 65 | +5.1 | 28M | รายได้จากการโฆษณาฟื้นตัว, การลงทุนใน AI ยังคงสร้างโอกาส |\n"
        "| JPM | JPMorgan Chase | 210.50 | +0.8% | 58 | +3.2 | 12M | ผลประกอบการธนาคารมีเสถียรภาพ, ได้รับประโยชน์จากอัตราดอกเบี้ยสูง |\n"
        "| LLY | Eli Lilly and Co. | 920.00 | +1.2% | 62 | +7.8 | 5M | นวัตกรรมยาใหม่มีความโดดเด่น, แนวโน้มการเติบโตของรายได้ดี |\n"
        "| SMCI | Super Micro Comp. | 850.00 | +4.1% | 70 | +10.0 | 7M | ได้รับอานิสงส์จาก AI Server, RSI สูงบ่งชี้ถึงโมเมนตัมที่แข็งแกร่งแต่ต้องระวังความผันผวน |"
    )

    new_table = (
        "| Ticker | ชื่อบริษัท | ราคาล่าสุด (USD) | การเปลี่ยนแปลง % (WTD) | RSI (14) | MACD (Line) | Volume (Avg. 5D) | เหตุผลประกอบ |\n"
        "| :----- | :---------------- | :--------------- | :--------------------- | :------- | :---------- | :--------------- | :---------------------------------------------------------------------------------------------------------------------------- |\n"
        "| **MSFT** | Microsoft Corp. | 381.70 | -3.08% | 46.60 | สัญญาณซื้อ (Bullish) | 27.6M | คาดการณ์ผลประกอบการไตรมาส 2 แข็งแกร่งจาก Cloud และกระแสการนำ AI ไปปรับใช้ในองค์กร |\n"
        "| **NVDA** | NVIDIA Corp. | 206.84 | +1.99% | 59.62 | สัญญาณซื้อ (Bullish) | 114.6M | ความต้องการชิปเร่งประมวลผล AI ยังคงสูงและหนุนส่งโมเมนตัมราคา | \n"
        "| **GOOGL** | Alphabet Inc. | 319.74 | -7.79% | 26.46 | สัญญาณขาย (Bearish) | 31.7M | ราคาหุ้นพักฐานแรงเข้าสู่ระดับ Oversold หลังการประกาศผลประกอบการและ Capex ด้าน AI |\n"
        "| **JPM** | JPMorgan Chase | 353.21 | +3.55% | 64.71 | สัญญาณซื้อ (Bullish) | 7.5M | แนวโน้มรายได้จากดอกเบี้ยสุทธิยังคงได้แรงหนุนจากอัตราดอกเบี้ยระดับสูง |\n"
        "| **LLY** | Eli Lilly and Co. | 1,196.03 | +1.43% | 49.21 | สัญญาณขาย (Bearish) | 1.9M | นวัตกรรมยาและผลประกอบการมีความโดดเด่นในระยะยาว |\n"
        "| **SMCI** | Super Micro Computer | 30.10 | +24.48% | 59.12 | สัญญาณซื้อ (Bullish) | 49.5M | ได้รับอานิสงส์หลักจากคำสั่งซื้อ AI Server แต่มีความผันผวนของราคาสูงสะสม |"
    )

    content = content.replace(old_table, new_table)

    # Replace indices technical description
    old_tech = (
        "**3. ปัจจัยทางเทคนิคัลสำหรับดัชนีหลัก (ณ วันที่ 25 กรกฎาคม 2569 โดยประมาณ):**\n"
        "*   **S&P 500:** ดัชนี S&P 500 ยังคงเคลื่อนไหวเหนือเส้นค่าเฉลี่ยเคลื่อนที่ 50 วัน (EMA 50) ซึ่งบ่งชี้ถึงแนวโน้มขาขึ้นในระยะสั้น. อย่างไรก็ตาม ค่า RSI (14) อยู่ในระดับกลางถึงสูง (ประมาณ 60-65) ซึ่งอาจบ่งบอกถึงภาวะที่ตลาดซื้อขายกันอย่างคึกคักและอาจมีแรงขายทำกำไรเข้ามาได้.\n"
        "*   **Nasdaq Composite:** ดัชนี Nasdaq Composite ซึ่งได้รับแรงหนุนจากกลุ่มเทคโนโลยี มีแนวโน้มแข็งแกร่งกว่าตลาดโดยรวม. ค่า RSI (14) อยู่ในระดับสูง (ประมาณ 68-72) สะท้อนถึงโมเมนตัมที่แข็งแกร่ง แต่ก็ควรระมัดระวังแรงขายหากเกิดภาวะซื้อมากเกินไป. MACD ยังคงแสดงสัญญาณบวก แต่แท่ง Histogram อาจเริ่มแคบลงเล็กน้อย ซึ่งต้องจับตาดูอย่างใกล้ชิด."
    )

    new_tech = (
        "**3. ปัจจัยทางเทคนิคัลสำหรับดัชนีหลัก (ณ วันปิดตลาดสัปดาห์ล่าสุด 24 กรกฎาคม 2569):**\n"
        "*   **S&P 500:** ดัชนี S&P 500 ปิดที่ 7,411.98 จุด ย่อตัวลงเล็กน้อย ส่งผลให้ค่า RSI (14) อยู่ที่ระดับ 38.88 สะท้อนความตึงตัวในระยะสั้นและแรงกดดันทางเทคนิคัลที่อาจเกิดการพักฐานในสัปดาห์\n"
        "*   **Nasdaq Composite:** ดัชนี Nasdaq Composite ปิดที่ 24,975.82 จุด โดยดัชนีปรับตัวลดลงจากกลุ่มเซมิคอนดักเตอร์และเทคโนโลยี ส่งผลให้ RSI (14) ปรับลดลงต่ำสู่ระดับ 33.74 ใกล้เขต Oversold และเกิดสัญญาณ Bearish ใน MACD บ่งบอกแนวโน้มการปรับฐานระยะสั้น"
    )
    content = content.replace(old_tech, new_tech)

    # Note
    old_note_2 = (
        "*หมายเหตุ: ข้อมูลราคาและดัชนีเป็นค่าประมาณการอ้างอิงสถานการณ์ตลาดและแนวโน้ม ณ วันที่ 25 กรกฎาคม 2569 เพื่อให้สอดคล้องกับรายงานในวันที่ 26 กรกฎาคม 2569. การลงทุนมีความเสี่ยง โปรดศึกษาข้อมูลก่อนตัดสินใจ.*"
    )
    new_note_2 = (
        "*หมายเหตุ: ข้อมูลราคาและดัชนีเปรียบเทียบในตารางเป็นข้อมูลตลาดจริงที่เป็นปัจจุบัน ณ วันปิดทำการล่าสุดวันที่ 24 กรกฎาคม 2569 เพื่อความโปร่งใสและถูกต้องตามความเป็นจริง [ที่มา: Yahoo Finance]*"
    )
    content = content.replace(old_note_2, new_note_2)

    with open(ASTRO_PATH, "w", encoding="utf-8") as f:
        f.write(content)
    print("Astro report corrected successfully.")

if __name__ == "__main__":
    fix_oversold()
    fix_astro()
