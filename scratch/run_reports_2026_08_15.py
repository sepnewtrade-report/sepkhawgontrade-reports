import os
import sys
import json
import subprocess

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VENV_PYTHON = os.path.join(ROOT_DIR, "venv", "bin", "python")
TEMPLATES_JSON = os.path.join(ROOT_DIR, "notebooklm-manager", "templates.json")
TARGET_DATE = "2026-08-15"
TARGET_DATE_UNDERSCORE = TARGET_DATE.replace("-", "_")

def load_templates():
    with open(TEMPLATES_JSON, "r", encoding="utf-8") as f:
        return {t["id"]: t for t in json.load(f)}

def run_cmd(cmd, cwd=ROOT_DIR):
    print(f"\n[RUN COMMAND]: {' '.join(cmd)}")
    res = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    print(f"STDOUT:\n{res.stdout}")
    if res.stderr:
        print(f"STDERR:\n{res.stderr}")
    if res.returncode != 0:
        raise RuntimeError(f"Command failed with code {res.returncode}")
    return res.stdout

def main():
    templates_map = load_templates()
    gemini_script = os.path.join(ROOT_DIR, "gemini_research.py")

    # 1. Run สรุปจบทันโลกหุ้น (daily)
    print(f"==================== GENERATING DAILY MARKET SUMMARY ({TARGET_DATE}) ====================")
    t_daily = templates_map.get("daily")
    if not t_daily:
        raise ValueError("Template ID 'daily' not found in templates.json")
    prompt_daily = t_daily.get("searchPromptV2") or t_daily.get("searchPrompt", "")
    out_daily = f"market_summary_{TARGET_DATE_UNDERSCORE}.md"
    out_daily_path = os.path.join(ROOT_DIR, out_daily)

    cmd_daily = [
        VENV_PYTHON,
        gemini_script,
        "--template-id", "daily",
        "--prompt", prompt_daily,
        "--date", TARGET_DATE,
        "--output", out_daily_path
    ]
    run_cmd(cmd_daily)

    # Generate daily_script_2026_08_15.md
    daily_script_path = os.path.join(ROOT_DIR, f"daily_script_{TARGET_DATE_UNDERSCORE}.md")
    if os.path.exists(out_daily_path):
        with open(out_daily_path, "r", encoding="utf-8") as f:
            content = f.read()
        with open(daily_script_path, "w", encoding="utf-8") as f:
            f.write(f"# 📊 บทวิเคราะห์สรุปจบ ทันโลกหุ้น — {TARGET_DATE}\n\n" + content)
        print(f"Created script variant: {daily_script_path}")

    # 2. Run วาฬทองคำ (gold_whale_daily)
    print(f"\n==================== GENERATING GOLD WHALE FLOW ({TARGET_DATE}) ====================")
    t_gw = templates_map.get("gold_whale_daily")
    if not t_gw:
        raise ValueError("Template ID 'gold_whale_daily' not found in templates.json")
    prompt_gw = t_gw.get("searchPromptV2") or t_gw.get("searchPrompt", "")
    out_gw = f"gold_whale_flow_{TARGET_DATE_UNDERSCORE}.md"
    out_gw_path = os.path.join(ROOT_DIR, out_gw)

    cmd_gw = [
        VENV_PYTHON,
        gemini_script,
        "--template-id", "gold_whale_daily",
        "--prompt", prompt_gw,
        "--date", TARGET_DATE,
        "--output", out_gw_path
    ]
    run_cmd(cmd_gw)

    # 3. Update Index
    print("\n==================== UPDATING INDEX ====================")
    node_cmd = ["node", "generate-index.js"]
    run_cmd(node_cmd)
    print("All reports and index generated successfully!")

if __name__ == "__main__":
    main()
