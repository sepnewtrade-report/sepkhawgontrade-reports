import os
import sys
import json
import subprocess
import time

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(ROOT_DIR)
import gemini_utils

VENV_PYTHON = os.path.join(ROOT_DIR, ".venv", "bin", "python")
TEMPLATES_JSON = os.path.join(ROOT_DIR, "notebooklm-manager", "templates.json")

def load_templates():
    with open(TEMPLATES_JSON, "r", encoding="utf-8") as f:
        return json.load(f)

def run_command(cmd_args, env=None):
    print(f"Running command: {' '.join(cmd_args)}")
    run_env = os.environ.copy()
    if env:
        run_env.update(env)
    result = subprocess.run(cmd_args, cwd=ROOT_DIR, env=run_env, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error: {result.stderr}")
        raise subprocess.CalledProcessError(result.returncode, cmd_args, result.stdout, result.stderr)
    return result.stdout

def generate_script_version(report_path, script_filename, template):
    script_path = os.path.join(ROOT_DIR, script_filename)
    audio_prompt = template.get("audioPromptV2") or template.get("audioPrompt")
    if not audio_prompt:
        print("No audio prompt found. Skipping.")
        return
        
    print(f"Generating script version: {script_filename}...")
    with open(report_path, "r", encoding="utf-8") as f:
        report_content = f.read()
        
    api_keys = gemini_utils.get_api_keys()
    
    system_instruction = (
        "คุณคือผู้เชี่ยวชาญการผลิตบทวิดีโอ YouTube และสคริปต์การเงินระดับโลก "
        "หน้าที่ของคุณคือแปลงรายงานบทวิเคราะห์เชิงลึกที่ได้รับ ให้กลายเป็นบทพูดวิดีโอ (YouTube Script) ที่ยอดเยี่ยมและตรงตามข้อกำหนดที่กำหนดให้อย่างเคร่งครัด\n\n"
        "ข้อกำหนดในการเขียน:\n"
        "1. เขียนเป็นภาษาไทย ด้วยโทนและรูปแบบการพูดตามที่ระบุใน Audio Prompt อย่างละเอียด\n"
        "2. ห้ามตัดข้อมูลตัวเลข ดัชนี แหล่งที่มา (เช่น [ที่มา: Bloomberg]) หรือข้อมูลเชิงลึกทิ้งอย่างเด็ดขาด ให้แปลงเป็นคำพูดที่ไหลลื่นและน่าฟังแต่คงความถูกต้องครบถ้วนของข้อมูล\n"
        "3. รูปแบบบทต้องมีวงเล็บเหลี่ยมบอกกล้อง/ท่าทางผู้ดำเนินรายการ เช่น **[ผู้ดำเนินรายการจ้องกล้อง...]**, เวลาแนะนำ เช่น *(เวลาแนะนำ: ...)*, และป้ายกำกับบทพูด เช่น **บทพูด:** เสมอ\n"
        "4. ต้องเริ่มต้นไฟล์ด้วยโลโก้ของช่อง:\n"
        '<p align="center"><img src="Logo master.png" alt="SepKhawGonTrade Logo" width="150" /></p>\n\n'
    )
    
    user_prompt = (
        f"รายงานบทวิเคราะห์เชิงลึกตั้งต้น:\n"
        f"```markdown\n{report_content}\n```\n\n"
        f"โครงสร้างบทวิดีโอและสไตล์การบรรยายที่ต้องการ (Audio Prompt):\n"
        f"```text\n{audio_prompt}\n```\n\n"
        f"วันที่ของบทรายการ: 2026-07-26\n"
        f"กรุณาสร้างบทพูดฉบับเต็มโดยคงเนื้อหา สถิติตัวเลข และแหล่งอ้างอิงให้ครบถ้วนที่สุด"
    )
    
    config = {
        "system_instruction": system_instruction,
        "temperature": 0.3
    }
    
    # Try gemini-3.5-flash
    try:
        from google import genai
        from google.genai import types
        client_config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.3
        )
        response = gemini_utils.generate_content_with_rotation(
            api_keys=api_keys,
            model="gemini-3.5-flash",
            contents=user_prompt,
            config=client_config
        )
    except Exception as e:
        print(f"Warning: Failed with gemini-3.5-flash: {e}. Retrying with gemini-2.0-flash...")
        response = gemini_utils.generate_content_with_rotation(
            api_keys=api_keys,
            model="gemini-2.0-flash",
            contents=user_prompt,
            config=client_config
        )
        
    script_content = response.text
    logo_block = '<p align="center"><img src="Logo master.png" alt="SepKhawGonTrade Logo" width="150" /></p>'
    if not script_content.strip().startswith(logo_block):
        script_content = f"{logo_block}\n\n" + script_content.strip()
        
    with open(script_path, "w", encoding="utf-8") as f:
        f.write(script_content)
    print(f"Successfully saved script to: {script_filename}")

def verify_and_clean_logo_branding(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    logo_block = '<p align="center"><img src="Logo master.png" alt="SepKhawGonTrade Logo" width="150" /></p>'
    cleaned = content.strip()
    if logo_block not in cleaned:
        cleaned = f"{logo_block}\n\n" + cleaned
    elif not cleaned.startswith(logo_block):
        cleaned = cleaned.replace(logo_block, "")
        cleaned = f"{logo_block}\n\n" + cleaned.strip()
    cleaned = cleaned.replace(f"{logo_block}\n\n\n", f"{logo_block}\n\n")
    cleaned = cleaned.replace(f"{logo_block}\n", f"{logo_block}\n\n")
    cleaned = cleaned.replace(f"{logo_block}\n\n\n\n", f"{logo_block}\n\n")
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(cleaned)

def main():
    templates = load_templates()
    short_squeeze_template = None
    for t in templates:
        if t.get("id") == "custom_1782454949086":
            short_squeeze_template = t
            break
            
    if not short_squeeze_template:
        print("Template custom_1782454949086 not found!")
        return
        
    prompt = short_squeeze_template.get("searchPromptV2") or short_squeeze_template.get("searchPrompt")
    output_file = "short_squeeze_analysis_2026_07_26.md"
    script_file = "short_squeeze_script_2026_07_26.md"
    output_path = os.path.join(ROOT_DIR, output_file)
    
    cmd = [
        VENV_PYTHON,
        os.path.join(ROOT_DIR, "gemini_research.py"),
        "--template-id", "custom_1782454949086",
        "--prompt", prompt,
        "--date", "2026-07-26",
        "--output", output_path
    ]
    
    env_path = os.path.join(ROOT_DIR, "notebooklm-manager", ".env")
    env_tmp_path = os.path.join(ROOT_DIR, "notebooklm-manager", ".env.tmp")
    env_renamed = False
    
    if os.path.exists(env_path):
        os.rename(env_path, env_tmp_path)
        env_renamed = True
        
    try:
        # Generate report (use gemini-3.5-flash via env)
        print("Generating report...")
        try:
            run_command(cmd, env={"GEMINI_MODEL": "gemini-3.5-flash"})
        except Exception:
            print("Failed with gemini-3.5-flash, retrying with gemini-2.0-flash...")
            run_command(cmd, env={"GEMINI_MODEL": "gemini-2.0-flash"})
        verify_and_clean_logo_branding(output_path)
        
        # Generate script version
        print("Generating script...")
        generate_script_version(output_path, script_file, short_squeeze_template)
        verify_and_clean_logo_branding(os.path.join(ROOT_DIR, script_file))
        
        print("Regeneration completed successfully!")
    finally:
        if env_renamed and os.path.exists(env_tmp_path):
            os.rename(env_tmp_path, env_path)

if __name__ == "__main__":
    main()
