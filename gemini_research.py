import os
import sys
import argparse
from google import genai
from google.genai import types

def main():
    parser = argparse.ArgumentParser(description="Gemini Deep Research, Report Writer, and QC Agent")
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
        print(f"[Stage 1] Generating draft report using model: {model_name}...")
        
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
        
        draft_content = response.text
        if not draft_content:
            raise Exception("Gemini returned empty response in Stage 1")

        # Extract search grounding sources
        sources = []
        try:
            if response.candidates and len(response.candidates) > 0:
                cand = response.candidates[0]
                if hasattr(cand, 'grounding_metadata') and cand.grounding_metadata:
                    meta = cand.grounding_metadata
                    if hasattr(meta, 'grounding_chunks') and meta.grounding_chunks:
                        seen_urls = set()
                        for chunk in meta.grounding_chunks:
                            if hasattr(chunk, 'web') and chunk.web:
                                url = chunk.web.uri
                                title = chunk.web.title
                                if url and url not in seen_urls:
                                    seen_urls.add(url)
                                    sources.append((title, url))
        except Exception as e:
            print(f"Warning: Failed to extract sources: {e}")

        print(f"[Stage 1] Found {len(sources)} grounding sources.")

        # Stage 2: Quality Control (QC) Step
        print(f"[Stage 2] Starting Quality Control (QC) Step...")
        
        qc_system_instruction = (
            "คุณคือหัวหน้าฝ่ายตรวจสอบคุณภาพข้อมูล (QC Inspector) และบรรณาธิการข่าวการเงินระดับสูงของช่อง 'เสพข่าวก่อนเทรด หุ้นอเมริกา'\n"
            "หน้าที่ของคุณคือตรวจสอบความถูกต้องของข้อมูล (Fact-check) และกรอบเวลา (Timeline) ของรายงานที่ได้รับ\n\n"
            "เกณฑ์การตรวจสอบคุณภาพอย่างเข้มงวด:\n"
            "1. ตรวจสอบว่าข่าวสาร เหตุการณ์ ราคาหุ้น และตัวเลขทั้งหมดในรายงานมีความถูกต้องตรงตามข้อมูลจริงจากแหล่งข่าวที่อ้างอิง\n"
            "2. ตรวจสอบเรื่องกรอบเวลา (Time Period): ข้อมูลข่าวสารจะต้องอยู่ในช่วงเวลาที่กำหนดใน prompt เท่านั้น (ห้ามนำข่าวเก่าข้ามปีหรือข้ามเดือนที่หมดอายุแล้วมาใส่เด็ดขาด)\n"
            "3. หากตรวจพบข้อมูลที่ไม่ถูกต้อง ข่าวเก่าล้าสมัย หรือข้อมูลคลาดเคลื่อน ให้แก้ไขข้อมูลดังกล่าวให้ถูกต้องและเป็นปัจจุบันตามความเป็นจริงทันที (ค้นหาผ่าน Google Search เพิ่มเติมเพื่อยืนยันข้อมูลปัจจุบัน)\n"
            "4. รักษารูปแบบและโครงสร้างภาษาเขียนแบบมืออาชีพทางการเงิน ห้ามมีสัญลักษณ์เกี่ยวกับบทสคริปต์วิดีโอหรือ YouTube เช่น วงเล็บเหลี่ยมบอกกล้อง/ป้ายบทพูดเด็ดขาด\n"
            "5. ห้ามใส่ข้อความเกริ่นนำ ข้อความอธิบายขั้นตอนการตรวจสอบ หรือคำชี้แจงเกี่ยวกับการ QC (เช่น 'ในฐานะฝ่ายตรวจสอบ...', 'ได้ตรวจสอบภาวะตลาด...', 'รายงานผ่านการตรวจสอบแล้ว') ให้แสดงผลเป็นรายงานตัวจริงทันที โดยเริ่มต้นที่โลโก้ช่อง HTML ที่อยู่ในฉบับร่างดั้งเดิม\n"
            "6. ผลลัพธ์สุดท้ายต้องเป็นเนื้อหารายงานฉบับสมบูรณ์ที่ผ่านการ QC และปรับปรุงเรียบร้อยแล้วเท่านั้น"
        )
        
        sources_text = "\n".join([f"- {title}: {url}" for title, url in sources]) if sources else "ไม่มีแหล่งข้อมูลอ้างอิง"
        
        qc_user_prompt = (
            f"รายงานที่ต้องทำการตรวจสอบ (Draft Report):\n"
            f"======================================\n"
            f"{draft_content}\n"
            f"======================================\n\n"
            f"วันที่กำหนดสำหรับรายงานนี้ (Target Date): {args.date}\n"
            f"คำสั่งค้นหาเดิม: {args.prompt}\n\n"
            f"แหล่งอ้างอิงข้อมูลเว็บของฉบับร่าง:\n"
            f"{sources_text}\n\n"
            f"โปรดดำเนินการตรวจสอบและแก้ไขจุดที่คลาดเคลื่อน ข้อมูลล้าสมัย หรือกรอบเวลาที่ไม่ถูกต้องทั้งหมด "
            f"จากนั้นเขียนและแสดงผลลัพธ์เป็นรายงานฉบับสมบูรณ์ที่ผ่านการ QC แล้ว"
        )
        
        qc_config = types.GenerateContentConfig(
            system_instruction=qc_system_instruction,
            tools=[types.Tool(google_search=types.GoogleSearch())]
        )
        
        qc_response = client.models.generate_content(
            model=model_name,
            contents=qc_user_prompt,
            config=qc_config
        )
        
        final_content = qc_response.text
        if not final_content:
            print("Warning: QC returned empty response, falling back to draft report.")
            final_content = draft_content

        # Append source references to the end of the report
        if sources:
            final_content += "\n\n---\n\n## 🌐 แหล่งข้อมูลอ้างอิง (Sources)\n"
            for title, url in sources:
                final_content += f"- [{title}]({url})\n"

        # Make sure directory exists
        os.makedirs(os.path.dirname(os.path.abspath(args.output)), exist_ok=True)
        
        with open(args.output, "w", encoding="utf-8") as f:
            f.write(final_content)
            
        print(f"Report successfully saved to: {args.output}")
        sys.exit(0)
    except Exception as e:
        print(f"Error during Gemini generation: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
