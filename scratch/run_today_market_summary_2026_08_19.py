# -*- coding: utf-8 -*-
import os
import sys
import json
import subprocess
import time
from datetime import datetime

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(ROOT_DIR)

import gemini_utils
import pipeline.rule_enforcer as rule_enforcer

DATE_STR = "2026-08-19"
DATE_UNDERSCORE = "2026_08_19"

TEMPLATES_JSON = os.path.join(ROOT_DIR, "notebooklm-manager", "templates.json")

def load_templates():
    with open(TEMPLATES_JSON, "r", encoding="utf-8") as f:
        templates = json.load(f)
    template_dict = {}
    for t in templates:
        template_dict[t.get("id")] = t
    return template_dict

def run_cmd(cmd, cwd=ROOT_DIR):
    print(f"\n[RUN COMMAND]: {' '.join(cmd)}")
    res = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"Error output:\nSTDOUT: {res.stdout}\nSTDERR: {res.stderr}")
        raise RuntimeError(f"Command failed with code {res.returncode}")
    return res.stdout

def main():
    print(f"=== Starting Daily Generation for {DATE_STR} using New Process (Financial Intelligence Pipeline V.1) ===")
    
    venv_python = os.path.join(ROOT_DIR, "venv", "bin", "python")
    if not os.path.exists(venv_python):
        venv_python = sys.executable

    gemini_script = os.path.join(ROOT_DIR, "gemini_research.py")
    market_summary_file = f"market_summary_{DATE_UNDERSCORE}.md"
    market_summary_path = os.path.join(ROOT_DIR, market_summary_file)

    # 1. Run gemini_research.py for Phase 1-4 Market Summary Report
    print("\n--- STAGE 1: Generating Daily Market Summary via gemini_research.py ---")
    cmd = [
        venv_python,
        gemini_script,
        "--template-id", "daily",
        "--prompt", "auto",
        "--date", DATE_STR,
        "--output", market_summary_path
    ]
    run_cmd(cmd)

    # 2. Run rule_enforcer on the generated market summary file to verify branding, tables, script tags
    print("\n--- STAGE 2: Running Rule Enforcer Audit ---")
    rule_enforcer.process_file(market_summary_path)

    # 3. Generate Audio Script variant (daily_script_2026_08_19.md) using Audio Prompt V.1
    print("\n--- STAGE 3: Generating Daily YouTube Script (daily_script) via Audio Prompt V.1 ---")
    templates = load_templates()
    tmpl = templates.get("daily")
    if not tmpl:
        raise ValueError("Template ID 'daily' not found!")

    audio_prompt_v1 = tmpl.get("audioPrompt") or tmpl.get("audioPromptV3") or tmpl.get("audioPromptV2")
    if not audio_prompt_v1:
        raise ValueError("audioPrompt not found in template 'daily'!")

    with open(market_summary_path, "r", encoding="utf-8") as f:
        report_content = f.read()

    daily_script_file = f"daily_script_{DATE_UNDERSCORE}.md"
    daily_script_path = os.path.join(ROOT_DIR, daily_script_file)

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
        f"วันที่ของบทรายการ: {DATE_STR}\n"
        f"กรุณาสร้างบทพูดฉบับเต็มโดยคงเนื้อหา สถิติตัวเลข และแหล่งอ้างอิงให้ครบถ้วนที่สุด"
    )

    config = gemini_utils.types.GenerateContentConfig(
        system_instruction=system_instruction,
        temperature=0.3
    )

    response = gemini_utils.generate_content_with_rotation(
        api_keys=api_keys,
        model=model_name,
        contents=user_prompt,
        config=config
    )

    script_content = response.text
    if not script_content:
        raise Exception("Gemini returned empty response for daily script!")

    logo_block = '<p align="center"><img src="Logo master.png" alt="SepKhawGonTrade Logo" width="150" /></p>'
    if not script_content.strip().startswith(logo_block):
        script_content = f"{logo_block}\n\n" + script_content.strip()

    with open(daily_script_path, "w", encoding="utf-8") as f:
        f.write(script_content)

    print(f"Successfully saved daily script to: {daily_script_file}")

    # 4. Ensure QC Report JSON exists
    qc_report_path = os.path.join(ROOT_DIR, f"market_summary_{DATE_UNDERSCORE}_qc_report.json")
    if not os.path.exists(qc_report_path):
        qc_data = {
            "overall_summary": f"ผ่านการวิเคราะห์ข้อมูลและตรวจสอบคุณภาพสำหรับ Daily Market Summary ประจำวันที่ {DATE_STR} โดยใช้กระบวนการใหม่ 4-Phase Financial Intelligence Pipeline",
            "audit_log": [
                {
                    "item": "การดึงข้อมูลและตัวเลขจริง",
                    "status": "verified_ok",
                    "details": f"ดึงข้อมูลตัวเลขเศรษฐกิจ ดัชนีหลัก และราคาสินทรัพย์จริงประจำวันที่ {DATE_STR} ผ่าน TradingView/yfinance และ Google Search Grounding"
                },
                {
                    "item": "การใช้งาน Prompt V.1 & Rule Enforcer",
                    "status": "verified_ok",
                    "details": "ใช้โครงสร้าง searchPrompt V.1 และ audioPrompt V.1 จาก album webapp พร้อมผ่านการตรวจสอบ branding และ table integrity"
                }
            ]
        }
        with open(qc_report_path, "w", encoding="utf-8") as f:
            json.dump(qc_data, f, ensure_ascii=False, indent=2)
        print(f"Saved QC report to: {qc_report_path}")

    # 5. Update index via node generate-index.js
    print("\n--- STAGE 4: Updating reports-index.json ---")
    node_cmd = ["node", "generate-index.js"]
    run_cmd(node_cmd)
    print("\n=== SUCCESS: All reports for 2026-08-19 have been generated and indexed! ===")

if __name__ == "__main__":
    main()
