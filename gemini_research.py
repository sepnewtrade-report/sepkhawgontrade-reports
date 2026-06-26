import os
import sys
import argparse
from google import genai
from google.genai import types

def main():
    parser = argparse.ArgumentParser(description="Gemini Deep Research and Report Writer")
    parser.add_argument("--template-id", required=True, help="daily, weekly, whale")
    parser.add_argument("--prompt", required=True, help="Search query prompt")
    parser.add_argument("--date", required=True, help="YYYY-MM-DD")
    parser.add_argument("--output", required=True, help="Output markdown file path")
    args = parser.parse_args()

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY environment variable not set.", file=sys.stderr)
        sys.exit(1)

    model_name = os.environ.get("GEMINI_MODEL", "gemini-2.5-pro")
    
    # Initialize modern Gemini client
    client = genai.Client(api_key=api_key)

    # Base System Instruction for financial report style compliance
    system_instruction = (
        "คุณคือหัวหน้านักวิเคราะห์การเงินระดับสูงของช่อง 'เสพข่าวก่อนเทรด หุ้นอเมริกา' "
        "งานของคุณคือทำ Deep Research และเขียนรายงานวิเคราะห์สถานการณ์ตลาดหุ้นสหรัฐฯ อย่างมืออาชีพ\n\n"
        "ข้อกำหนดในการเขียนที่ต้องปฏิบัติตามอย่างเคร่งครัด:\n"
        "1. เขียนเป็นภาษาไทยด้วยน้ำเสียงที่เป็นทางการ น่าเชื่อถือ และวิเคราะห์เชิงลึกแบบสถาบันการเงิน\n"
        "2. ห้ามใช้สัญลักษณ์เกี่ยวกับบทสคริปต์วิดีโอหรือ youtube โดยเด็ดขาด เช่น วงเล็บเหลี่ยมบอกกล้อง/ท่าทาง [กล้องซูม], "
        "เวลาแนะนำ *(เวลาแนะนำ: 01:20)*, หรือป้ายบทพูด เช่น **บทพูด:**, **ผู้ดำเนินรายการ:**, **Host:** เป็นต้น\n"
        "3. หัวข้อหลักของรายงานต้องสะท้อนเนื้อหาและไม่ควรใช้คำว่า 'สคริปต์', 'บทพูด', 'youtube' หรือ 'script'\n"
        "4. ใช้แหล่งข้อมูลจากการค้นหาผ่านเครื่องมือ Google Search Grounding ที่กำหนดให้ เพื่ออ้างอิงข้อมูลปัจจุบัน ข่าวสารรอบด้าน และตัวเลขจริง\n"
    )

    if args.template_id == "daily":
        show_type_instr = (
            "เขียนรายงานสรุปภาวะตลาดหุ้นประจำวัน (Daily Market Summary)\n"
            "เน้นประเด็นเศรษฐกิจมหภาค ข้อมูลผลประกอบการบริษัท และดัชนีสำคัญ S&P 500, Nasdaq, Dow Jones ในรอบ 24 ชั่วโมงที่ผ่านมา"
        )
    elif args.template_id == "weekly":
        show_type_instr = (
            "เขียนรายงานบทวิเคราะห์เชิงลึกรายสัปดาห์ (Weekly Global Market Recap)\n"
            "เน้นสรุปเหตุการณ์ตลาดและนโยบายการเงินรอบสัปดาห์ที่ผ่านมา สัญญาณเงินเฟ้อ และแนวโน้มปัจจัยเชิงกลยุทธ์ที่จะมีผลต่อดัชนีสหรัฐฯ ในสัปดาห์ถัดไป"
        )
    elif args.template_id == "whale":
        show_type_instr = (
            "เขียนรายงานวิเคราะห์กระแสเงินทุนสถาบันและกองทุนขนาดใหญ่ (Whale Flow Analysis)\n"
            "เน้นความเคลื่อนไหวการเก็บของหรือเทขายหุ้นของวาฬ/สถาบัน รายงาน 13F ล่าสุด และข้อมูล Insider Trading"
        )
    else:
        show_type_instr = f"เขียนรายงานบทวิเคราะห์เชิงลึกในหัวข้อ {args.template_id}"

    user_prompt = (
        f"ประเภทรายงานที่ต้องการสร้าง: {show_type_instr}\n"
        f"วันที่ของรายงาน: {args.date}\n"
        f"คำสั่งค้นหาข้อมูลและเนื้อหาข่าว: {args.prompt}\n\n"
        f"กรุณาใช้ความสามารถในการทำวิจัยเชิงลึก (Deep Research) ผ่าน Google Search เพื่อรวบรวมข่าวสารและตัวเลขล่าสุด "
        f"จากนั้นเขียนรายงานตามคำสั่งข้างต้น โดยต้องแทรกหัวข้อโลโก้ของช่องไว้ที่บรรทัดแรกสุดของผลลัพธ์ในรูปแบบโค้ด HTML ดังนี้:\n"
        f'<p align="center"><img src="Logo master.png" alt="SepKhawGonTrade Logo" width="150" /></p>\n\n'
        f"ตามด้วยเนื้อหาบทวิเคราะห์เชิงลึกที่เป็นทางการทันที"
    )

    try:
        print(f"Generating Gemini report using model: {model_name}...")
        
        # Configure model and tools in new google-genai style
        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            tools=[types.Tool(google_search=types.GoogleSearch())]
        )
        
        response = client.models.generate_content(
            model=model_name,
            contents=user_prompt,
            config=config
        )
        
        content = response.text
        if not content:
            raise Exception("Gemini returned empty response")

        # Make sure directory exists
        os.makedirs(os.path.dirname(os.path.abspath(args.output)), exist_ok=True)
        
        with open(args.output, "w", encoding="utf-8") as f:
            f.write(content)
            
        print(f"Report successfully saved to: {args.output}")
        sys.exit(0)
    except Exception as e:
        print(f"Error during Gemini generation: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
