import os
import sys
import json
import subprocess

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VENV_PYTHON = os.path.join(ROOT_DIR, "venv", "bin", "python")

TEMPLATES_JSON = os.path.join(ROOT_DIR, "notebooklm-manager", "templates.json")
TARGET_DATE = "2026-08-14"
TARGET_DATE_UNDERSCORE = TARGET_DATE.replace("-", "_")

def load_templates():
    with open(TEMPLATES_JSON, "r", encoding="utf-8") as f:
        return {t["id"]: t for t in json.load(f)}

def run_cmd(cmd, cwd=ROOT_DIR):
    print(f"\n[RUN COMMAND]: {' '.join(cmd)}")
    res = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"Error output:\nSTDOUT: {res.stdout}\nSTDERR: {res.stderr}")
        raise RuntimeError(f"Command failed with code {res.returncode}")
    return res.stdout

def main():
    templates_map = load_templates()
    gemini_script = os.path.join(ROOT_DIR, "gemini_research.py")

    t_data = templates_map.get("daily")
    if not t_data:
        raise ValueError("Template ID 'daily' not found in templates.json")

    base_prompt = t_data.get("searchPromptV2") or t_data.get("searchPrompt", "")
    output_file = f"market_summary_{TARGET_DATE_UNDERSCORE}.md"
    output_path = os.path.join(ROOT_DIR, output_file)

    cmd = [
        VENV_PYTHON,
        gemini_script,
        "--template-id", "daily",
        "--prompt", base_prompt,
        "--date", TARGET_DATE,
        "--output", output_path
    ]

    print(f"Generating Daily Market Summary (สรุปจบ ทันโลกหุ้น) for date {TARGET_DATE}...")
    run_cmd(cmd)
    print(f"Successfully generated {output_file}")

    # Generate script variant daily_script_2026_08_12.md
    daily_script_path = os.path.join(ROOT_DIR, f"daily_script_{TARGET_DATE_UNDERSCORE}.md")
    if os.path.exists(output_path):
        with open(output_path, "r", encoding="utf-8") as f:
            content = f.read()
        with open(daily_script_path, "w", encoding="utf-8") as f:
            f.write(f"# 📊 บทวิเคราะห์สรุปจบ ทันโลกหุ้น — {TARGET_DATE}\n\n" + content)
        print(f"Created script variant: {daily_script_path}")

    # Run node generate-index.js
    node_cmd = ["node", "generate-index.js"]
    print("Updating reports index via generate-index.js...")
    run_cmd(node_cmd)
    print("Index updated successfully.")

if __name__ == "__main__":
    main()
