import os
import sys
import json
import subprocess
import time
from google import genai
from google.genai import types

# Make sure we import gemini_utils correctly
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import gemini_utils

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VENV_PYTHON = os.path.join(ROOT_DIR, ".venv", "bin", "python")
TEMPLATES_JSON = os.path.join(ROOT_DIR, "notebooklm-manager", "templates.json")

SUNDAY_DATE = "2026-07-26"
SUNDAY_DATE_UNDERSCORE = SUNDAY_DATE.replace("-", "_")

SUNDAY_REPORTS = [
    {
        "template_id": "what_s_next_for_market",
        "output_file": f"whats_next_{SUNDAY_DATE_UNDERSCORE}.md",
        "script_file": f"whats_next_script_{SUNDAY_DATE_UNDERSCORE}.md"
    },
    {
        "template_id": "custom_1782454949086",
        "output_file": f"short_squeeze_analysis_{SUNDAY_DATE_UNDERSCORE}.md",
        "script_file": f"short_squeeze_script_{SUNDAY_DATE_UNDERSCORE}.md"
    },
    {
        "template_id": "oversold_opportunity",
        "output_file": f"oversold_opportunity_report_{SUNDAY_DATE_UNDERSCORE}.md"
    },
    {
        "template_id": "astro_economic_weekly",
        "output_file": f"astro_economy_weekly_{SUNDAY_DATE_UNDERSCORE}.md"
    },
    {
        "template_id": "vip_market_strategy_watchlist",
        "output_file": f"vip_market_strategy_watchlist_{SUNDAY_DATE_UNDERSCORE}.md"
    }
]

def load_templates():
    with open(TEMPLATES_JSON, "r", encoding="utf-8") as f:
        return json.load(f)

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

def generate_report(report_config, templates):
    template_id = report_config["template_id"]
    output_file = report_config["output_file"]
    output_path = os.path.join(ROOT_DIR, output_file)
    
    # Find matching template
    template = None
    for t in templates:
        if t.get("id") == template_id:
            template = t
            break
            
    if not template:
        raise ValueError(f"Template not found: {template_id}")
        
    prompt = template.get("searchPromptV2") or template.get("searchPrompt")
    if not prompt:
        raise ValueError(f"No search prompt found for template: {template_id}")
        
    print(f"\n==================================================")
    print(f"Generating Report: {output_file} (Template ID: {template_id})")
    print(f"==================================================")
    
    gemini_research_py = os.path.join(ROOT_DIR, "gemini_research.py")
    
    cmd = [
        VENV_PYTHON,
        gemini_research_py,
        "--template-id", template_id,
        "--prompt", prompt,
        "--date", SUNDAY_DATE,
        "--output", output_path
    ]
    
    try:
        # Try with default model
        run_command(cmd)
    except subprocess.CalledProcessError as e:
        print(f"Warning: Failed to generate report with default model. Retrying with gemini-2.5-flash...")
        try:
            # Fallback to gemini-2.5-flash
            run_command(cmd, env={"GEMINI_MODEL": "gemini-2.5-flash"})
        except subprocess.CalledProcessError as e2:
            print(f"Warning: Failed with gemini-2.5-flash. Retrying with gemini-1.5-flash...")
            # Fallback to gemini-1.5-flash
            run_command(cmd, env={"GEMINI_MODEL": "gemini-1.5-flash"})
        
    print(f"Successfully generated report: {output_file}")
    
    # Check if we need to generate a script version
    script_file = report_config.get("script_file")
    if script_file:
        time.sleep(2)
        generate_script_version(output_path, script_file, template)

def generate_script_version(report_path, script_filename, template):
    script_path = os.path.join(ROOT_DIR, script_filename)
    audio_prompt = template.get("audioPromptV2") or template.get("audioPrompt")
    if not audio_prompt:
        print(f"Warning: No audio prompt found for template {template.get('id')}. Skipping script generation.")
        return
        
    print(f"Generating script version: {script_filename}...")
    
    with open(report_path, "r", encoding="utf-8") as f:
        report_content = f.read()
        
    api_keys = gemini_utils.get_api_keys()
    model_name = os.environ.get("GEMINI_MODEL", "gemini-2.5-pro")
    
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
        f"วันที่ของบทรายการ: {SUNDAY_DATE}\n"
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
        print(f"Warning: Failed to generate script with model {model_name} due to: {e}. Retrying with gemini-2.5-flash...")
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
        raise Exception(f"Gemini returned empty response for script {script_filename}")
        
    # Ensure logo branding is at the top
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
    
    # Check if logo is missing or not at the very top
    cleaned = content.strip()
    if logo_block not in cleaned:
        # Prepend logo
        cleaned = f"{logo_block}\n\n" + cleaned
    elif not cleaned.startswith(logo_block):
        # Move it to the top
        cleaned = cleaned.replace(logo_block, "")
        cleaned = f"{logo_block}\n\n" + cleaned.strip()
        
    # Standardize spaces around logo
    cleaned = cleaned.replace(f"{logo_block}\n\n\n", f"{logo_block}\n\n")
    cleaned = cleaned.replace(f"{logo_block}\n", f"{logo_block}\n\n")
    cleaned = cleaned.replace(f"{logo_block}\n\n\n\n", f"{logo_block}\n\n")
    
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(cleaned)

def main():
    print(f"=== Starting Sunday Reports Process for {SUNDAY_DATE} ===")
    templates = load_templates()
    
    # Temporarily rename notebooklm-manager/.env so GEMINI_MODEL is not overridden
    env_path = os.path.join(ROOT_DIR, "notebooklm-manager", ".env")
    env_tmp_path = os.path.join(ROOT_DIR, "notebooklm-manager", ".env.tmp")
    
    env_renamed = False
    if os.path.exists(env_path):
        print("Temporarily renaming notebooklm-manager/.env to allow model env override...")
        os.rename(env_path, env_tmp_path)
        env_renamed = True
        
    try:
        for report_config in SUNDAY_REPORTS:
            generate_report(report_config, templates)
            
            # Verify and format output reports/scripts
            output_path = os.path.join(ROOT_DIR, report_config["output_file"])
            verify_and_clean_logo_branding(output_path)
            
            if report_config.get("script_file"):
                script_path = os.path.join(ROOT_DIR, report_config["script_file"])
                verify_and_clean_logo_branding(script_path)
                
            time.sleep(2)
            
        print("\nAll reports and scripts generated successfully.")
        
        # Rebuilding catalog index
        print("\nUpdating website catalog index...")
        run_command(["node", "generate-index.js"])
        
        # Git commit and push
        print("\nPublishing to GitHub...")
        run_command(["git", "add", "."])
        # Commit changes
        try:
            run_command(["git", "commit", "-m", "Auto-update reports for Sunday 2026-07-26"])
            run_command(["git", "push"])
            print("\nSuccessfully committed and pushed all reports to GitHub!")
        except subprocess.CalledProcessError as e:
            if "nothing to commit" in str(e.stdout) or "nothing to commit" in str(e.stderr):
                print("No changes to commit. Everything is up-to-date.")
            else:
                raise e
                
        print("\n=== Process Completed Successfully ===")
        
    finally:
        if env_renamed and os.path.exists(env_tmp_path):
            print("Restoring notebooklm-manager/.env...")
            os.rename(env_tmp_path, env_path)

if __name__ == "__main__":
    main()
