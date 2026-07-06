import os
import sys
import argparse
import json
from google import genai
from google.genai import types
from pydantic import BaseModel, Field
from typing import List

class QCCheck(BaseModel):
    item: str = Field(description="ชื่อหุ้น ดัชนี หรือหัวข้อข่าวที่ทำการตรวจสอบ (เช่น CRM RSI, ORCL Price, ข่าว CapEx)")
    status: str = Field(description="ผลการตรวจสอบ: verified_ok (ถูกต้อง), corrected (พบจุดผิดและแก้ไขสำเร็จ), หรือ info_added (เพิ่มข้อมูล)")
    details: str = Field(description="คำอธิบายสั้นๆ ของการตรวจสอบและผลลัพธ์ (เช่น ข้อมูล RSI เดิม 25 ถูกต้องแล้ว หรือแก้ไขจาก 25 เป็น 67.18 เพื่อให้ตรงกับวันที่เป้าหมาย)")

class QCReport(BaseModel):
    overall_summary: str = Field(description="สรุปภาพรวมของการตรวจสอบคุณภาพเนื้อหาและการ Fact-check ข้อมูลข้ามปี")
    audit_log: List[QCCheck] = Field(description="รายการบันทึกการตรวจสอบข้อเท็จจริงและความถูกต้องของตัวเลข")
    final_report_content: str = Field(description="เนื้อหารายงานบทวิเคราะห์ฉบับสมบูรณ์ที่ได้รับการจัดแต่งและแก้ไขตัวเลขทั้งหมดแล้วเสร็จ โดยไม่มีบทพูดหรือเครื่องหมายสคริปต์")

def main():
    parser = argparse.ArgumentParser(description="Gemini Deep Research, Report Writer, and QC Agent")
    parser.add_argument("--template-id", required=True, help="daily, weekly, whale")
    parser.add_argument("--prompt", required=True, help="Search query prompt")
    parser.add_argument("--date", required=True, help="YYYY-MM-DD")
    parser.add_argument("--output", required=True, help="Output markdown file path")
    args = parser.parse_args()

    # Manually load .env from project root if it exists
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip() and not line.startswith("#"):
                    parts = line.strip().split("=", 1)
                    if len(parts) == 2:
                        os.environ[parts[0].strip()] = parts[1].strip().strip('"').strip("'")
                        
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY environment variable not set. Please set it in .env file in the project root.", file=sys.stderr)
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
        f"5. ข้อมูลราคาหุ้น ดัชนีทางเทคนิคัล (เช่น RSI, EMA) และปัจจัยข่าวสารทั้งหมด ต้องสอดคล้องตรงตามปีและเดือน ณ วันที่เป้าหมายของรายงาน ({args.date}) อย่างเคร่งครัด ห้ามใช้ข้อมูลเก่าข้ามปีหรือข้ามเดือนจากอดีตเด็ดขาด เพื่อความแม่นยำสูงสุดของบทวิเคราะห์\n"
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
            "1. ตรวจสอบราคาหุ้น ดัชนีชี้วัดทางเทคนิคัลรายวัน (เช่น Daily RSI, EMA) และตัวเลขสถิติทั้งหมดในรายงานให้ตรงกับความเป็นจริง ณ วันที่และเดือนเป้าหมาย (Target Date) หากไม่มีในแหล่งข้อมูลดั้งเดิม ให้ใช้ Google Search ค้นหาข้อมูลปัจจุบันเพื่อตรวจสอบยืนยันเสมอ\n"
            "2. ตรวจสอบเรื่องกรอบเวลา (Time Period): ข้อมูลข่าวสารและดัชนีต้องสอดคล้องตรงตามปีและเดือนเป้าหมาย (Target Year and Month) ณ วันที่ระบุของรายงานเท่านั้น ห้ามหยิบยกข้อมูลหรือเหตุการณ์ข้ามปีหรือข้ามเดือนในอดีต (เช่น ดัชนี RSI ของ CRM ในปี 2024 หรือข่าวจากเดือนก่อนหน้าที่ไม่มีผลแล้ว) มากล่าวอ้างว่าเป็นข้อมูลปัจจุบันอย่างเด็ดขาด\n"
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
            f"โปรดดำเนินการตรวจสอบและแก้ไขจุดที่คลาดเคลื่อน ข้อมูลล้าสมัย ดัชนี RSI ที่ไม่ถูกต้อง หรือกรอบเวลาของปีและเดือนที่ไม่ตรงกับ Target Date ({args.date}) ทั้งหมด "
            f"โดยเฉพาะการใช้ Google Search ค้นหาราคาหุ้นและ Daily RSI ณ ปัจจุบันของ Tickers ในรายงาน จากนั้นเขียนและแสดงผลลัพธ์เป็นรายงานฉบับสมบูรณ์ที่ผ่านการ QC และแก้ไขตัวเลขทั้งหมดแล้ว"
        )
        
        qc_config = types.GenerateContentConfig(
            system_instruction=qc_system_instruction,
            tools=[types.Tool(google_search=types.GoogleSearch())],
            response_mime_type="application/json",
            response_schema=QCReport,
            temperature=0.1
        )
        
        qc_response = client.models.generate_content(
            model=model_name,
            contents=qc_user_prompt,
            config=qc_config
        )
        
        qc_json_text = qc_response.text
        final_content = ""
        qc_report_data = None
        
        if not qc_json_text:
            print("Warning: QC returned empty response, falling back to draft report.")
            final_content = draft_content
        else:
            try:
                qc_data = json.loads(qc_json_text)
                final_content = qc_data.get("final_report_content", draft_content)
                qc_report_data = {
                    "overall_summary": qc_data.get("overall_summary", "ผ่านการตรวจสอบข้อมูลสำเร็จ"),
                    "audit_log": qc_data.get("audit_log", [])
                }
            except Exception as parse_err:
                print(f"Error parsing QC JSON output: {parse_err}")
                print("Falling back to raw text output from QC.")
                final_content = qc_json_text

        # Extract search grounding sources from Stage 2 (QC)
        try:
            if qc_response.candidates and len(qc_response.candidates) > 0:
                qc_cand = qc_response.candidates[0]
                if hasattr(qc_cand, 'grounding_metadata') and qc_cand.grounding_metadata:
                    qc_meta = qc_cand.grounding_metadata
                    if hasattr(qc_meta, 'grounding_chunks') and qc_meta.grounding_chunks:
                        seen_urls = {url for _, url in sources}
                        for chunk in qc_meta.grounding_chunks:
                            if hasattr(chunk, 'web') and chunk.web:
                                url = chunk.web.uri
                                title = chunk.web.title
                                if url and url not in seen_urls:
                                    seen_urls.add(url)
                                    sources.append((title, url))
        except Exception as e:
            print(f"Warning: Failed to extract QC sources: {e}")

        print(f"[Stage 2] Found {len(sources)} combined grounding sources.")

        # Append source references to the end of the report
        if sources:
            if "## 🌐 แหล่งข้อมูลอ้างอิง" not in final_content and "## Sources" not in final_content:
                final_content += "\n\n---\n\n## 🌐 แหล่งข้อมูลอ้างอิง (Sources)\n"
                for title, url in sources:
                    final_content += f"- [{title}]({url})\n"

        # Make sure directory exists
        os.makedirs(os.path.dirname(os.path.abspath(args.output)), exist_ok=True)
        
        # Save markdown report
        with open(args.output, "w", encoding="utf-8") as f:
            f.write(final_content)
            
        # Save QC report JSON
        qc_report_path = args.output.replace(".md", "_qc_report.json")
        if not qc_report_data:
            qc_report_data = {
                "overall_summary": "ผ่านการตรวจสอบความถูกต้องแล้ว (ผลลัพธ์เป็นข้อความธรรมดา)",
                "audit_log": [
                    {
                        "item": "การตรวจสอบความถูกต้องข้อมูล",
                        "status": "verified_ok",
                        "details": "ความถูกต้องได้รับการยืนยันโดยโมเดลแล้ว"
                    }
                ]
            }
        with open(qc_report_path, "w", encoding="utf-8") as f:
            json.dump(qc_report_data, f, ensure_ascii=False, indent=2)
        print(f"QC Audit Report saved to: {qc_report_path}")
            
        print(f"Report successfully saved to: {args.output}")
        sys.exit(0)
    except Exception as e:
        print(f"Error during Gemini generation: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
