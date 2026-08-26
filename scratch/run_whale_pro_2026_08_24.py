# -*- coding: utf-8 -*-
import os
import sys
import json
import subprocess
import time

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(ROOT_DIR)

from google import genai
import gemini_utils
import pipeline.rule_enforcer as rule_enforcer

DATE_STR = "2026-08-24"
DATE_UNDERSCORE = "2026_08_24"

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
    print(f"STDOUT:\n{res.stdout}")
    if res.returncode != 0:
        print(f"STDERR:\n{res.stderr}")
        raise RuntimeError(f"Command failed with exit code {res.returncode}")
    return res.stdout

def main():
    print(f"=== Starting Whale Flow Pro Report Generation for {DATE_STR} ===")
    
    venv_python = os.path.join(ROOT_DIR, "fresh_venv", "bin", "python")
    if not os.path.exists(venv_python):
        venv_python = os.path.join(ROOT_DIR, "venv", "bin", "python")
    if not os.path.exists(venv_python):
        venv_python = sys.executable

    gemini_script = os.path.join(ROOT_DIR, "gemini_research.py")
    whale_report_file = f"whale_flow_analysis_{DATE_UNDERSCORE}.md"
    whale_report_path = os.path.join(ROOT_DIR, whale_report_file)

    # 1. Run gemini_research.py with --template-id whale_pro
    print("\n--- STAGE 1: Generating Whale Flow Pro Report via gemini_research.py ---")
    cmd = [
        venv_python,
        gemini_script,
        "--template-id", "whale_pro",
        "--prompt", "auto",
        "--date", DATE_STR,
        "--output", whale_report_path
    ]
    run_cmd(cmd)

    # 2. Run rule_enforcer on the generated report file
    print("\n--- STAGE 2: Running Rule Enforcer Audit on whale_flow_analysis ---")
    rule_enforcer.process_file(whale_report_path, auto_correct=True)

    # 3. Generate Audio Script variant (whale_flow_script_2026_08_24.md)
    print("\n--- STAGE 3: Generating Whale Flow YouTube Script via Audio Prompt ---")
    templates = load_templates()
    tmpl = templates.get("whale_pro")
    if not tmpl:
        raise ValueError("Template ID 'whale_pro' not found in templates.json!")

    audio_prompt = tmpl.get("audioPromptV2") or tmpl.get("audioPrompt")
    if not audio_prompt:
        raise ValueError("audioPrompt not found in template 'whale_pro'!")

    with open(whale_report_path, "r", encoding="utf-8") as f:
        report_content = f.read()

    whale_script_file = f"whale_flow_script_{DATE_UNDERSCORE}.md"
    whale_script_path = os.path.join(ROOT_DIR, whale_script_file)

    api_keys = gemini_utils.get_api_keys()
    model_name = os.environ.get("GEMINI_MODEL", "gemini-2.5-pro")

    system_instruction = (
        "คุณคือผู้เชี่ยวชาญการผลิตบทวิดีโอ YouTube และสคริปต์การเงินระดับโลก "
        "หน้าที่ของคุณคือแปลงรายงานบทวิเคราะห์เชิงลึกที่ได้รับ ให้กลายเป็นบทพูดวิดีโอ (YouTube Script) ที่ยอดเยี่ยมและตรงตามข้อกำหนดอย่างเคร่งครัด\n\n"
        "ข้อกำหนดในการเขียน:\n"
        "1. เขียนเป็นภาษาไทย ด้วยโทนและรูปแบบการพูดตามที่ระบุใน Audio Prompt ของรายการอย่างละเอียด\n"
        "2. ห้ามตัดข้อมูลตัวเลข ดัชนี สัญญาณออปชัน หรือข้อมูลเชิงลึกทิ้งอย่างเด็ดขาด ให้แปลงเป็นคำพูดที่ไหลลื่นและน่าฟังแต่คงความถูกต้องครบถ้วนของข้อมูล\n"
        "3. รูปแบบบทต้องมีวงเล็บเหลี่ยมบอกกล้อง/ท่าทางผู้ดำเนินรายการ เช่น **[ผู้ดำเนินรายการจ้องกล้อง...]**, เวลาแนะนำ เช่น *(เวลาแนะนำ: ...)*, และป้ายกำกับบทพูด เช่น **บทพูด:** เสมอ\n"
        "4. ต้องเริ่มต้นไฟล์ด้วยโลโก้ของช่อง:\n"
        '<p align="center"><img src="Logo master.png" alt="SepKhawGonTrade Logo" width="150" /></p>\n\n'
    )

    user_prompt = (
        f"รายงานบทวิเคราะห์เชิงลึกตั้งต้น:\n"
        f"```markdown\n{report_content}\n```\n\n"
        f"โครงสร้างบทวิดีโอและสไตล์การบรรยายที่ต้องการ (Audio Prompt):\n"
        f"```text\n{audio_prompt}\n```\n\n"
        f"วันที่ของบทรายการ: {DATE_STR}\n"
        f"กรุณาสร้างบทพูดฉบับเต็มโดยคงเนื้อหา สถิติตัวเลข และสัญญาณวาฬให้ครบถ้วนที่สุด"
    )

    print(f"[Audio Script Generation] Calling Gemini API using model {model_name}...")
    config = genai.types.GenerateContentConfig(
        system_instruction=system_instruction,
        temperature=0.2
    )

    response = gemini_utils.generate_content_with_rotation(
        api_keys=api_keys,
        model=model_name,
        contents=user_prompt,
        config=config
    )

    script_content = response.text
    if not script_content:
        raise RuntimeError("Failed to generate audio script content from Gemini")

    if '<p align="center"><img src="Logo master.png"' not in script_content:
        script_content = '<p align="center"><img src="Logo master.png" alt="SepKhawGonTrade Logo" width="150" /></p>\n\n' + script_content

    with open(whale_script_path, "w", encoding="utf-8") as f:
        f.write(script_content)

    print(f"Whale flow script saved to: {whale_script_path}")

    # 4. Run rule_enforcer on the script file
    print("\n--- STAGE 4: Running Rule Enforcer Audit on whale_flow_script ---")
    rule_enforcer.process_file(whale_script_path, auto_correct=True)

    print("\n=== Whale Flow Pro Pipeline Completed Successfully! ===")

if __name__ == "__main__":
    main()
