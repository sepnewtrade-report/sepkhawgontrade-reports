import os

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASTRO_PATH = os.path.join(ROOT_DIR, "astro_economy_weekly_2026_07_26.md")

def main():
    if not os.path.exists(ASTRO_PATH):
        print("Astro report path not found")
        return
        
    with open(ASTRO_PATH, "r", encoding="utf-8") as f:
        lines = f.read().splitlines()

    # Find the table header
    table_start = -1
    for i, line in enumerate(lines):
        if "| Ticker | ชื่อบริษัท |" in line and "WTD" in line:
            table_start = i
            break

    if table_start != -1:
        new_table_lines = [
            "| Ticker | ชื่อบริษัท | ราคาล่าสุด (USD) | การเปลี่ยนแปลง % (WTD) | RSI (14) | MACD (Line) | Volume (Avg. 5D) | เหตุผลประกอบ |",
            "| :----- | :---------------- | :--------------- | :--------------------- | :------- | :---------- | :--------------- | :---------------------------------------------------------------------------------------------------------------------------- |",
            "| **MSFT** | Microsoft Corp. | 381.70 | -3.08% | 46.60 | สัญญาณซื้อ (Bullish) | 27.6M | คาดการณ์ผลประกอบการไตรมาส 2 แข็งแกร่งจาก Cloud และกระแสการนำ AI ไปปรับใช้ในองค์กร |",
            "| **NVDA** | NVIDIA Corp. | 206.84 | +1.99% | 59.62 | สัญญาณซื้อ (Bullish) | 114.6M | ความต้องการชิปเร่งประมวลผล AI ยังคงสูงและหนุนส่งโมเมนตัมราคา |",
            "| **GOOGL** | Alphabet Inc. | 319.74 | -7.79% | 26.46 | สัญญาณขาย (Bearish) | 31.7M | ราคาหุ้นพักฐานแรงเข้าสู่ระดับ Oversold หลังการประกาศผลประกอบการและ Capex ด้าน AI |",
            "| **JPM** | JPMorgan Chase | 353.21 | +3.55% | 64.71 | สัญญาณซื้อ (Bullish) | 7.5M | แนวโน้มรายได้จากดอกเบี้ยสุทธิยังคงได้แรงหนุนจากอัตราดอกเบี้ยระดับสูง |",
            "| **LLY** | Eli Lilly and Co. | 1,196.03 | +1.43% | 49.21 | สัญญาณขาย (Bearish) | 1.9M | นวัตกรรมยาและผลประกอบการมีความโดดเด่นในระยะยาว |",
            "| **SMCI** | Super Micro Computer | 30.10 | +24.48% | 59.12 | สัญญาณซื้อ (Bullish) | 49.5M | ได้รับอานิสงส์หลักจากคำสั่งซื้อ AI Server แต่มีความผันผวนของราคาสูงสะสม |"
        ]
        
        # Replace the 8 lines of the table
        lines[table_start:table_start+8] = new_table_lines
        print("Table replaced successfully in list.")
        
        # Join lines back
        content = "\n".join(lines)
        
        # Also replace the introductory sentence for the table (around line 36)
        old_intro = "ตารางด้านล่างนี้แสดงรายชื่อหุ้นเด่นที่มีสัญญาณทางเทคนิคัลที่น่าสนใจ หรือมีปัจจัยพื้นฐานรองรับในช่วงปลายเดือนกรกฎาคม 2569 โดยข้อมูลราคาและดัชนีเป็นค่าประมาณการ ณ วันที่ 25 กรกฎาคม 2569 เพื่อสะท้อนภาพรวมก่อนรายงาน:"
        new_intro = "ตารางด้านล่างนี้แสดงรายชื่อหุ้นเด่นที่มีสัญญาณทางเทคนิคัลที่น่าสนใจ หรือมีปัจจัยพื้นฐานรองรับ ณ วันปิดทำการล่าสุดวันที่ 24 กรกฎาคม 2569:"
        content = content.replace(old_intro, new_intro)

        # Replace another potential variant
        content = content.replace("ดัชนีเป็นค่าประมาณการ ณ วันที่ 25 กรกฎาคม 2569", "ดัชนีเป็นข้อมูลตลาดจริง ณ วันปิดตลาดล่าสุด 24 กรกฎาคม 2569")
        
        with open(ASTRO_PATH, "w", encoding="utf-8") as f:
            f.write(content + "\n")
        print("Astro report written successfully.")
    else:
        print("Table header not found in file.")

if __name__ == "__main__":
    main()
