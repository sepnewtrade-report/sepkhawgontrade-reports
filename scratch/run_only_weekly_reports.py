import os
import sys
import json
import time
import subprocess

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PYTHON_BIN = os.path.join(ROOT_DIR, "fresh_venv", "bin", "python")
TARGET_DATE = "2026-08-15"
TARGET_DATE_UNDERSCORE = TARGET_DATE.replace("-", "_")
GEMINI_SCRIPT = os.path.join(ROOT_DIR, "gemini_research.py")

# Strictly ONLY Weekly Reports (รายงานประจำสัปดาห์)
WEEKLY_REPORTS = [
    ("weekly", "auto", f"global_market_recap_{TARGET_DATE_UNDERSCORE}.md"),
    ("economic_calendar", "auto", f"weekly_economic_calendar_{TARGET_DATE_UNDERSCORE}.md"),
    ("what_s_next_for_market", "auto", f"whats_next_{TARGET_DATE_UNDERSCORE}.md"),
    ("astro_economic_weekly", "auto", f"astro_economy_weekly_{TARGET_DATE_UNDERSCORE}.md"),
    ("gold_whale_weekly", "auto", f"gold_whale_flow_weekly_{TARGET_DATE_UNDERSCORE}.md"),
    ("vip_market_strategy_watchlist", "auto", f"vip_watchlist_{TARGET_DATE_UNDERSCORE}.md"),
    ("vp_top_opportunity_radar", "auto", os.path.join("MEMBERSHIP CONTENT SYSTEM", f"vp_top_opportunity_radar_{TARGET_DATE_UNDERSCORE}.md")),
    ("vp_whalezoomkephoonarai", "auto", os.path.join("MEMBERSHIP CONTENT SYSTEM", f"vp_whalezoomkephoonarai_{TARGET_DATE_UNDERSCORE}.md")),
]

def run_cmd(cmd, cwd=ROOT_DIR):
    print(f"\n==================== RUNNING: {' '.join(cmd)} ====================")
    res = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    if res.stdout:
        print(f"STDOUT:\n{res.stdout[:1500]}")
    if res.stderr:
        print(f"STDERR:\n{res.stderr[:1500]}")
    if res.returncode != 0:
        print(f"ERROR: Command failed with exit code {res.returncode}")
        return False
    return True

def main():
    print(f"Starting ONLY Weekly Reports Generation for Date: {TARGET_DATE}")
    
    for i, (tmpl_id, prompt, rel_output) in enumerate(WEEKLY_REPORTS):
        out_path = os.path.join(ROOT_DIR, rel_output)
        cmd = [
            PYTHON_BIN,
            GEMINI_SCRIPT,
            "--template-id", tmpl_id,
            "--prompt", prompt,
            "--date", TARGET_DATE,
            "--output", out_path
        ]
        success = run_cmd(cmd)
        if not success:
            print(f"Failed to generate {rel_output}")
        # Add 10s pause between deep research calls to respect API rate limits
        if i < len(WEEKLY_REPORTS) - 1:
            print("Pausing 10s before next weekly report...")
            time.sleep(10)

    # Copy Thai Recap Alias
    gmr_path = os.path.join(ROOT_DIR, f"global_market_recap_{TARGET_DATE_UNDERSCORE}.md")
    gmr_thai_path = os.path.join(ROOT_DIR, f"global_market_recap_thai_{TARGET_DATE_UNDERSCORE}.md")
    if os.path.exists(gmr_path):
        with open(gmr_path, "r", encoding="utf-8") as f:
            content = f.read()
        with open(gmr_thai_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Synced {gmr_thai_path}")

    # Update Index
    print("\n==================== UPDATING INDEX ====================")
    run_cmd(["node", "generate-index.js"])
    print("\nALL WEEKLY REPORTS GENERATED AND INDEX UPDATED SUCCESSFULLY!")

if __name__ == "__main__":
    main()
