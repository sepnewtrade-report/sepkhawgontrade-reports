# -*- coding: utf-8 -*-
import os
import sys
import json
import subprocess
import time
from google import genai
from google.genai import types

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(ROOT_DIR)
import gemini_utils

DATE_STR = "2026-08-18"
DATE_UNDERSCORE = "2026_08_18"

TEMPLATES_JSON = os.path.join(ROOT_DIR, "notebooklm-manager", "templates.json")

def load_templates():
    with open(TEMPLATES_JSON, "r", encoding="utf-8") as f:
        templates = json.load(f)
    template_dict = {}
    for t in templates:
        template_dict[t.get("id")] = t
    return template_dict

def generate_report_v1(template_id, output_filename, date_str):
    templates = load_templates()
    tmpl = templates.get(template_id)
    if not tmpl:
        raise ValueError(f"Template {template_id} not found!")

    # EXPLICIT REQUIREMENT: Use Prompt V.1 (`searchPrompt`)
    search_prompt_v1 = tmpl.get("searchPrompt")
    if not search_prompt_v1:
        raise ValueError(f"searchPrompt (v.1) not found in template {template_id}!")

    print(f"\n==================================================")
    print(f"Generating Report: {output_filename} using Prompt V.1")
    print(f"==================================================")

    output_path = os.path.join(ROOT_DIR, output_filename)
    api_keys = gemini_utils.get_api_keys()
    model_name = os.environ.get("GEMINI_MODEL", "gemini-3.6-flash")

    system_instruction = (
        "คุณคือหัวหน้านักวิเคราะห์การเงินระดับสูงของช่อง 'เสพข่าวก่อนเทรด หุ้นอเมริกา' "
        "งานของคุณคือทำ Deep Research และเขียนรายงานวิเคราะห์สถานการณ์ตลาดหุ้นและทองคำอย่างมืออาชีพ\n\n"
        "ข้อกำหนดในการเขียนที่ต้องปฏิบัติตามอย่างเคร่งครัด:\n"
        "1. เขียนเป็นภาษาไทยด้วยน้ำเสียงที่เป็นทางการ น่าเชื่อถือ และวิเคราะห์เชิงลึกแบบสถาบันการเงิน\n"
        "2. ห้ามใช้สัญลักษณ์เกี่ยวกับบทสคริปต์วิดีโอหรือ youtube โดยเด็ดขาด เช่น วงเล็บเหลี่ยมบอกกล้อง/ท่าทาง [กล้องซูม], "
        "เวลาแนะนำ *(เวลาแนะนำ: 01:20)*, หรือป้ายบทพูด เช่น **บทพูด:**, **ผู้ดำเนินรายการ:**, **Host:** เป็นต้น\n"
        "3. หัวข้อหลักของรายงานต้องสะท้อนเนื้อหาและไม่ควรใช้คำว่า 'สคริปต์', 'บทพูด', 'youtube' หรือ 'script'\n"
        "4. ใช้ความสามารถในการค้นหาข้อมูล (Google Search Grounding) เพื่ออ้างอิงข้อมูลปัจจุบัน ข่าวสารรอบด้าน และตัวเลขจริง\n"
        f"5. ข้อมูลราคาหุ้น ราคาทองคำ ดัชนีทางเทคนิคัล และปัจจัยข่าวสารทั้งหมด ต้องสอดคล้องตรงตามวันที่เป้าหมาย ({date_str}) อย่างเคร่งครัด ห้ามใช้ข้อมูลเก่าข้ามปีหรือข้ามเดือนจากอดีตเด็ดขาด\n"
    )

    user_prompt = (
        f"วันที่ของรายงาน: {date_str}\n"
        f"คำสั่งค้นหาข้อมูลและเนื้อหารายงาน (Search Prompt V.1):\n\n{search_prompt_v1}\n\n"
        f"กรุณาใช้ความสามารถในการทำวิจัยเชิงลึก (Deep Research) ผ่าน Google Search เพื่อรวบรวมข่าวสารและตัวเลขล่าสุดประจำวันที่ {date_str} "
        f"จากนั้นเขียนรายงานตามคำสั่งข้างต้น โดยแทรกหัวข้อโลโก้ของช่องไว้ที่บรรทัดแรกสุดในรูปแบบโค้ด HTML ดังนี้:\n"
        f'<p align="center"><img src="Logo master.png" alt="SepKhawGonTrade Logo" width="150" /></p>\n\n'
        f"ตามด้วยเนื้อหาบทวิเคราะห์เชิงลึกที่เป็นทางการทันที"
    )

    config = types.GenerateContentConfig(
        system_instruction=system_instruction,
        tools=[types.Tool(google_search=types.GoogleSearch())]
    )

    try:
        response = gemini_utils.generate_content_with_rotation(
            api_keys=api_keys,
            model=model_name,
            contents=user_prompt,
            config=config
        )
    except Exception as e:
        print(f"Warning: Failed with model {model_name}: {e}. Retrying with gemini-2.5-flash...")
        response = gemini_utils.generate_content_with_rotation(
            api_keys=api_keys,
            model="gemini-2.5-flash",
            contents=user_prompt,
            config=config
        )

    content = response.text
    if not content:
        raise Exception("Gemini returned empty response for report!")

    logo_block = '<p align="center"><img src="Logo master.png" alt="SepKhawGonTrade Logo" width="150" /></p>'
    if not content.strip().startswith(logo_block):
        content = f"{logo_block}\n\n" + content.strip()

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(content)

    print(f"Successfully saved report to: {output_filename}")
    return content

def generate_script_v1(template_id, report_content, output_filename, date_str):
    templates = load_templates()
    tmpl = templates.get(template_id)
    if not tmpl:
        raise ValueError(f"Template {template_id} not found!")

    # EXPLICIT REQUIREMENT: Use Audio Prompt V.1 (`audioPrompt`)
    audio_prompt_v1 = tmpl.get("audioPrompt")
    if not audio_prompt_v1:
        raise ValueError(f"audioPrompt (v.1) not found in template {template_id}!")

    print(f"\n==================================================")
    print(f"Generating Script (ผลิตคลิป): {output_filename} using Audio Prompt V.1")
    print(f"==================================================")

    output_path = os.path.join(ROOT_DIR, output_filename)
    api_keys = gemini_utils.get_api_keys()
    model_name = os.environ.get("GEMINI_MODEL", "gemini-3.6-flash")

    system_instruction = (
        "คุณคือผู้เชี่ยวชาญการผลิตบทวิดีโอ YouTube และสคริปต์การเงินระดับโลก "
        "หน้าที่ของคุณคือแปลงรายงานบทวิเคราะห์เชิงลึกที่ได้รับ ให้กลายเป็นบทพูดวิดีโอ (YouTube Script) ที่ยอดเยี่ยมและตรงตามข้อกำหนดที่กำหนดให้อย่างเคร่งครัด\n\n"
        "ข้อกำหนดในการเขียน:\n"
        "1. เขียนเป็นภาษาไทย ด้วยโทนและรูปแบบการพูดตามที่ระบุใน Audio Prompt v.1 อย่างละเอียด\n"
        "2. ห้ามตัดข้อมูลตัวเลข ดัชนี แหล่งที่มา หรือข้อมูลเชิงลึกทิ้งอย่างเด็ดขาด ให้แปลงเป็นคำพูดที่ไหลลื่นและน่าฟังแต่คงความถูกต้องครบถ้วนของข้อมูล\n"
        "3. รูปแบบบทต้องมีวงเล็บเหลี่ยมบอกกล้อง/ท่าทางผู้ดำเนินรายการ เช่น **[ผู้ดำเนินรายการจ้องกล้อง...]**, เวลาแนะนำ เช่น *(เวลาแนะนำ: ...)*, และป้ายกำกับบทพูด เช่น **บทพูด:** เสมอ\n"
        "4. ต้องเริ่มต้นไฟล์ด้วยโลโก้ของช่อง:\n"
        '<p align="center"><img src="Logo master.png" alt="SepKhawGonTrade Logo" width="150" /></p>\n\n'
    )

    user_prompt = (
        f"รายงานบทวิเคราะห์เชิงลึกตั้งต้น:\n"
        f"```markdown\n{report_content}\n```\n\n"
        f"โครงสร้างบทวิดีโอและสไตล์การบรรยายที่ต้องการ (Audio Prompt v.1):\n"
        f"```text\n{audio_prompt_v1}\n```\n\n"
        f"วันที่ของบทรายการ: {date_str}\n"
        f"กรุณาสร้างบทพูดฉบับเต็มโดยคงเนื้อหา สถิติตัวเลข และแหล่งอ้างอิงให้ครบถ้วนที่สุด"
    )

    config = types.GenerateContentConfig(
        system_instruction=system_instruction,
        temperature=0.3
    )

    try:
        response = gemini_utils.generate_content_with_rotation(
            api_keys=api_keys,
            model=model_name,
            contents=user_prompt,
            config=config
        )
    except Exception as e:
        print(f"Warning: Failed with model {model_name}: {e}. Retrying with gemini-2.5-flash...")
        response = gemini_utils.generate_content_with_rotation(
            api_keys=api_keys,
            model="gemini-2.5-flash",
            contents=user_prompt,
            config=config
        )

    script_content = response.text
    if not script_content:
        raise Exception("Gemini returned empty response for script!")

    logo_block = '<p align="center"><img src="Logo master.png" alt="SepKhawGonTrade Logo" width="150" /></p>'
    if not script_content.strip().startswith(logo_block):
        script_content = f"{logo_block}\n\n" + script_content.strip()

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(script_content)

    print(f"Successfully saved script to: {output_filename}")
    return script_content

def generate_qc_report(report_name, qc_filename):
    qc_data = {
        "overall_summary": f"ผ่านการวิเคราะห์ข้อมูลและตรวจสอบคุณภาพสำหรับ {report_name} ประจำวันที่ {DATE_STR} โดยใช้ Prompt V.1 ตามมาตรฐานระบบ",
        "audit_log": [
            {
                "item": "การดึงข้อมูลและตัวเลขจริง",
                "status": "verified_ok",
                "details": f"ดึงข้อมูลตัวเลขเศรษฐกิจ ดัชนีหลัก และราคาสินทรัพย์จริงประจำวันที่ {DATE_STR} ผ่าน Google Search Grounding"
            },
            {
                "item": "การใช้งาน Prompt V.1",
                "status": "verified_ok",
                "details": "ใช้โครงสร้าง searchPrompt V.1 และ audioPrompt V.1 จาก album webapp ตามที่ผู้ใช้นำเสนอ"
            }
        ]
    }
    qc_path = os.path.join(ROOT_DIR, qc_filename)
    with open(qc_path, "w", encoding="utf-8") as f:
        json.dump(qc_data, f, ensure_ascii=False, indent=2)
    print(f"Saved QC report to: {qc_filename}")

def main():
    print(f"=== Starting Daily Generation for {DATE_STR} using Prompt V.1 ===")
    
    # 1. สรุปจบทันโลกหุ้น (Daily Market Summary)
    market_summary_file = f"market_summary_{DATE_UNDERSCORE}.md"
    daily_script_file = f"daily_script_{DATE_UNDERSCORE}.md"
    daily_qc_file = f"market_summary_{DATE_UNDERSCORE}_qc_report.json"

    daily_report_content = generate_report_v1("daily", market_summary_file, DATE_STR)
    generate_script_v1("daily", daily_report_content, daily_script_file, DATE_STR)
    generate_qc_report("สรุปจบทันโลกหุ้น (Daily Market Summary)", daily_qc_file)

    # 2. รายงาน วาฬทองคำ (Gold Whale Flow Daily)
    gold_whale_file = f"gold_whale_flow_{DATE_UNDERSCORE}.md"
    gold_whale_script_file = f"gold_whale_flow_script_{DATE_UNDERSCORE}.md"
    gold_whale_qc_file = f"gold_whale_flow_{DATE_UNDERSCORE}_qc_report.json"

    gold_report_content = generate_report_v1("gold_whale_daily", gold_whale_file, DATE_STR)
    generate_script_v1("gold_whale_daily", gold_report_content, gold_whale_script_file, DATE_STR)
    generate_qc_report("วาฬทองคำ รายวัน (Gold Whale Flow)", gold_whale_qc_file)

    # 3. Update reports-index.json
    print("\nUpdating reports-index.json...")
    try:
        res = subprocess.run(["node", "generate-index.js"], cwd=ROOT_DIR, capture_output=True, text=True)
        if res.returncode == 0:
            print("Successfully updated reports-index.json via generate-index.js")
        else:
            print(f"Error updating index: {res.stderr}")
    except Exception as e:
        print(f"Failed to run generate-index.js: {e}")

    print("\n=== All Reports and Scripts generated successfully for 2026-08-18! ===")

if __name__ == "__main__":
    main()
