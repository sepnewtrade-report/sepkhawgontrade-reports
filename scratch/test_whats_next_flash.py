import os
import sys
from google import genai
from google.genai import types

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import gemini_utils

def main():
    api_keys = gemini_utils.get_api_keys()
    
    date_str = "2026-07-26"
    system_instruction = (
        "คุณคือหัวหน้านักวิเคราะห์การเงินระดับสูงของช่อง 'เสพข่าวก่อนเทรด หุ้นอเมริกา' "
        "งานของคุณคือทำ Deep Research และเขียนรายงานวิเคราะห์สถานการณ์ตลาดหุ้นสหรัฐฯ อย่างมืออาชีพ\n\n"
        "ข้อกำหนดในการเขียนที่ต้องปฏิบัติตามอย่างเคร่งครัด:\n"
        "1. เขียนเป็นภาษาไทยด้วยน้ำเสียงที่เป็นทางการ น่าเชื่อถือ และวิเคราะห์เชิงลึกแบบสถาบันการเงิน\n"
        "2. ห้ามใช้สัญลักษณ์เกี่ยวกับบทสคริปต์วิดีโอหรือ youtube โดยเด็ดขาด เช่น วงเล็บเหลี่ยมบอกกล้อง/ท่าทาง [กล้องซูม], "
        "เวลาแนะนำ *(เวลาแนะนำ: 01:20)*, หรือป้ายบทพูด เช่น **บทพูด:**, **ผู้ดำเนินรายการ:**, **Host:** เป็นต้น\n"
        "3. หัวข้อหลักของรายงานต้องสะท้อนเนื้อหาและไม่ควรใช้คำว่า 'สคริปต์', 'บทพูด', 'youtube' หรือ 'script'\n"
        "4. ใช้แหล่งข้อมูลจากการค้นหาผ่านเครื่องมือ Google Search Grounding ที่กำหนดให้ เพื่ออ้างอิงข้อมูลปัจจุบัน ข่าวสารรอบด้าน และตัวเลขจริง\n"
        f"5. ข้อมูลราคาหุ้น ดัชนีทางเทคนิคัล (เช่น RSI, EMA) และปัจจัยข่าวสารทั้งหมด ต้องสอดคล้องตรงตามปีและเดือน ณ วันที่เป้าหมายของรายงาน ({date_str}) อย่างเคร่งครัด ห้ามใช้ข้อมูลเก่าข้ามปีหรือข้ามเดือนจากอดีตเด็ดขาด เพื่อความแม่นยำสูงสุดของบทวิเคราะห์\n"
        "6. หากมีการแสดงตารางรายชื่อหุ้นที่มีสัญญาณซื้อ (BUY/Watchlist) หรือคัดกรองหุ้นเด่น ให้แสดงในรูปแบบตาราง Markdown โดยต้องมีคอลัมน์ดัชนีชี้วัดทางเทคนิคัลหลักอย่างชัดเจน ได้แก่ Ticker, ชื่อบริษัท, ราคาล่าสุด, การเปลี่ยนแปลง %, RSI (14), MACD, Volume, และ เหตุผลประกอบ เสมอ\n"
    )
    
    prompt = (
        "คุณคือ Global Market Strategist หน้าที่ของคุณคือจัดทำรายงาน 'มองทิศทางไปข้างหน้า (Forward-Looking)' เพื่อวิเคราะห์แนวโน้มตลาดหุ้นสหรัฐในสัปดาห์ถัดไป:\n"
        "1. วิเคราะห์จุดกลับตัวทางเทคนิค แนวรับแนวต้านสำคัญ และค่าความผันผวน (VIX, Put/Call Ratio) ของดัชนีหลัก\n"
        "2. ประเมินแนวโน้มกระแสเงินทุนของสถาบัน (Smart Money Outlook) และสัญญาณจากตลาด Options\n"
        "3. วิเคราะห์ทิศทางและกลยุทธ์ของเซ็กเตอร์ & ธีมการลงทุนหลัก (เช่น AI, Semiconductors, Small Caps)\n"
        "4. ประเมิน Risk Scenario และเหตุการณ์ Black Swan ที่อาจส่งผลกระทบต่อจิตวิทยาการลงทุนในสัปดาห์หน้า\n\n"
        "ข้อกำหนดการบันทึกไฟล์: เมื่อสรุปและวิเคราะห์ผลลัพธ์เสร็จสิ้น คุณต้องเขียนผลลัพธ์ทั้งหมดลงไฟล์ Markdown (.md) ในโฟลเดอร์หลักของ Workspace โดยตั้งชื่อไฟล์เป็น 'whats_next_YYYY_MM_DD.md' เสมอ (แทนค่า YYYY_MM_DD ด้วย ปี_เดือน_วัน ที่รันรายงานจริง ตัวอย่าง: หากรันวันที่ 13 กรกฎาคม 2026 ให้บันทึกไฟล์เป็น 'whats_next_2026_07_13.md')\n\n"
        "กฎเหล็กด้านความถูกต้องและแหล่งที่มา (Anti-Hallucination & Citation Rules):\n"
        "1. ทุกครั้งที่สั่งงาน คุณต้องเปิดใช้งานเครื่องมือ Google Search เพื่อสืบค้นข้อมูลดิบ ราคาหุ้น และข่าวสารของสัปดาห์ปัจจุบันแบบเรียลไทม์\n"
        "2. ห้ามแต่งตัวเลข ห้ามสุ่มชื่อหุ้น และห้ามคาดเดาข้อมูลที่ไม่มีอยู่จริงเด็ดขาด หากข้อมูลส่วนใดไม่ชัดเจน ให้ระบุว่า “อยู่ระหว่างการคาดการณ์ของตลาด” หรือ “ยังไม่มีการยืนยันอย่างเป็นทางการ”\n"
        "3. ในทุกหัวข้อและทุกตัวเลขสำคัญ (เช่น ดัชนี, % การเปลี่ยนแปลง, ข่าวสาร, หุ้นรายตัว) คุณต้องใส่วงเล็บระบุแหล่งที่มาของข้อมูลเสมอ (เช่น [ที่มา: SET, สำนักข่าวอินโฟเควสท์, Bloomberg, ข้อมูลตลาด ณ วันที่...]) เพื่อให้สามารถตรวจสอบย้อนหลังได้"
    )
    
    show_type_instr = "เขียนรายงานบทวิเคราะห์เชิงลึกในหัวข้อ what_s_next_for_market"
    user_prompt = (
        f"ประเภทรายงานที่ต้องการสร้าง: {show_type_instr}\n"
        f"วันที่ของรายงาน: {date_str}\n"
        f"คำสั่งค้นหาข้อมูลและเนื้อหาข่าว: {prompt}\n\n"
        f"กรุณาใช้ความสามารถในการทำวิจัยเชิงลึก (Deep Research) ผ่าน Google Search เพื่อรวบรวมข่าวสารและตัวเลขล่าสุด "
        f"จากนั้นเขียนรายงานตามคำสั่งข้างต้น โดยต้องแทรกหัวข้อโลโก้ของช่องไว้ที่บรรทัดแรกสุดของผลลัพธ์ in รูปแบบโค้ด HTML ดังนี้:\n"
        f'<p align="center"><img src="Logo master.png" alt="SepKhawGonTrade Logo" width="150" /></p>\n\n'
        f"ตามด้วยเนื้อหาบทวิเคราะห์เชิงลึกที่เป็นทางการทันที"
    )
    
    print("Testing gemini-2.5-flash with exact inputs...")
    config = types.GenerateContentConfig(
        system_instruction=system_instruction,
        tools=[types.Tool(google_search=types.GoogleSearch())]
    )
    
    try:
        response = gemini_utils.generate_content_with_rotation(
            api_keys=api_keys,
            model="gemini-2.5-flash",
            contents=user_prompt,
            config=config
        )
        print("Success! Response candidates:")
        if response.candidates:
            for i, cand in enumerate(response.candidates):
                print(f"Candidate {i}: finish_reason={cand.finish_reason}")
                if cand.content:
                     print(f"Parts length: {len(cand.content.parts)}")
        print("\nResponse text preview:")
        print(response.text[:200] if response.text else "None")
    except Exception as e:
        print(f"Failed with exception: {e}")

if __name__ == "__main__":
    main()
