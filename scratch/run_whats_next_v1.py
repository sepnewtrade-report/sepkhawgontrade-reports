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

VENV_PYTHON = os.path.join(ROOT_DIR, "venv", "bin", "python")
TEMPLATES_JSON = os.path.join(ROOT_DIR, "notebooklm-manager", "templates.json")

DATE_STR = "2026-08-16"
DATE_UNDERSCORE = "2026_08_16"

REPORT_FILE = f"whats_next_{DATE_UNDERSCORE}.md"
SCRIPT_FILE = f"whats_next_script_{DATE_UNDERSCORE}.md"

REPORT_PATH = os.path.join(ROOT_DIR, REPORT_FILE)
SCRIPT_PATH = os.path.join(ROOT_DIR, SCRIPT_FILE)

def load_template():
    with open(TEMPLATES_JSON, "r", encoding="utf-8") as f:
        templates = json.load(f)
    for t in templates:
        if t.get("id") == "what_s_next_for_market":
            return t
    raise ValueError("Template what_s_next_for_market not found!")

def run_command(cmd_args, env=None, cwd=ROOT_DIR):
    print(f"Running command: {' '.join(cmd_args)}")
    run_env = os.environ.copy()
    if env:
        run_env.update(env)
    result = subprocess.run(cmd_args, cwd=cwd, env=run_env, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error executing command: {' '.join(cmd_args)}")
        print(f"STDOUT: {result.stdout}")
        print(f"STDERR: {result.stderr}")
        raise subprocess.CalledProcessError(result.returncode, cmd_args, result.stdout, result.stderr)
    return result.stdout

def generate_report(template):
    # Prompt v.1 is stored in `searchPrompt`
    search_prompt_v1 = template.get("searchPrompt")
    if not search_prompt_v1:
        raise ValueError("searchPrompt (v.1) not found in template!")
    
    print("\n==================================================")
    print(f"1. Generating Report: {REPORT_FILE} using Prompt v.1")
    print("==================================================")
    
    gemini_research_py = os.path.join(ROOT_DIR, "gemini_research.py")
    cmd = [
        VENV_PYTHON,
        gemini_research_py,
        "--template-id", "what_s_next_for_market",
        "--prompt", search_prompt_v1,
        "--date", DATE_STR,
        "--output", REPORT_PATH
    ]
    
    try:
        run_command(cmd)
    except subprocess.CalledProcessError:
        print("Retrying with GEMINI_MODEL=gemini-2.5-flash...")
        try:
            run_command(cmd, env={"GEMINI_MODEL": "gemini-2.5-flash"})
        except subprocess.CalledProcessError:
            print("Retrying with GEMINI_MODEL=gemini-1.5-flash...")
            run_command(cmd, env={"GEMINI_MODEL": "gemini-1.5-flash"})

    print(f"Successfully generated report: {REPORT_FILE}")

def generate_script(template):
    # Prompt v.1 for script/audio is stored in `audioPrompt`
    audio_prompt_v1 = template.get("audioPrompt")
    if not audio_prompt_v1:
        raise ValueError("audioPrompt (v.1) not found in template!")
        
    print("\n==================================================")
    print(f"2. Generating Script (ผลิตคลิป): {SCRIPT_FILE} using Audio Prompt v.1")
    print("==================================================")
    
    with open(REPORT_PATH, "r", encoding="utf-8") as f:
        report_content = f.read()
        
    api_keys = gemini_utils.get_api_keys()
    model_name = os.environ.get("GEMINI_MODEL", "gemini-2.5-pro")
    
    system_instruction = (
        "คุณคือผู้เชี่ยวชาญการผลิตบทวิดีโอ YouTube และสคริปต์การเงินระดับโลก "
        "หน้าที่ของคุณคือแปลงรายงานบทวิเคราะห์เชิงลึกที่ได้รับ ให้กลายเป็นบทพูดวิดีโอ (YouTube Script) ที่ยอดเยี่ยมและตรงตามข้อกำหนดที่กำหนดให้อย่างเคร่งครัด\n\n"
        "ข้อกำหนดในการเขียน:\n"
        "1. เขียนเป็นภาษาไทย ด้วยโทนและรูปแบบการพูดตามที่ระบุใน Audio Prompt v.1 อย่างละเอียด\n"
        "2. ห้ามตัดข้อมูลตัวเลข ดัชนี แหล่งที่มา (เช่น [ที่มา: Bloomberg]) หรือข้อมูลเชิงลึกทิ้งอย่างเด็ดขาด ให้แปลงเป็นคำพูดที่ไหลลื่นและน่าฟังแต่คงความถูกต้องครบถ้วนของข้อมูล\n"
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
        print(f"Warning: Failed to generate script with model {model_name} due to {e}. Retrying with gemini-2.5-flash...")
        try:
            response = gemini_utils.generate_content_with_rotation(
                api_keys=api_keys,
                model="gemini-2.5-flash",
                contents=user_prompt,
                config=config
            )
        except Exception as e2:
            print(f"Warning: Failed with gemini-2.5-flash. Retrying with gemini-1.5-flash...")
            response = gemini_utils.generate_content_with_rotation(
                api_keys=api_keys,
                model="gemini-1.5-flash",
                contents=user_prompt,
                config=config
            )

    script_content = response.text
    if not script_content:
        raise Exception("Gemini returned empty response for script!")
        
    logo_block = '<p align="center"><img src="Logo master.png" alt="SepKhawGonTrade Logo" width="150" /></p>'
    if not script_content.strip().startswith(logo_block):
        script_content = f"{logo_block}\n\n" + script_content.strip()
        
    with open(SCRIPT_PATH, "w", encoding="utf-8") as f:
        f.write(script_content)
        
    print(f"Successfully saved script to: {SCRIPT_FILE}")

    # Also update 2026_08_15 versions for backward compatibility
    report_15 = os.path.join(ROOT_DIR, "whats_next_2026_08_15.md")
    script_15 = os.path.join(ROOT_DIR, "whats_next_script_2026_08_15.md")
    with open(report_15, "w", encoding="utf-8") as f:
        f.write(report_content)
    with open(script_15, "w", encoding="utf-8") as f:
        f.write(script_content)
    print(f"Updated 2026_08_15 report and script files as well.")

def main():
    template = load_template()
    generate_report(template)
    generate_script(template)
    
    # Re-index for album.html
    print("\nUpdating reports-index.json...")
    try:
        run_command(["node", "generate-index.js"])
        print("Successfully updated reports-index.json")
    except Exception as e:
        print(f"Warning: Failed to run generate-index.js: {e}")

if __name__ == "__main__":
    main()
