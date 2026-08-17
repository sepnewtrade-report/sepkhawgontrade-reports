import os
import sys
import json
import subprocess

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PYTHON_BIN = os.path.join(ROOT_DIR, "fresh_venv", "bin", "python")
TARGET_DATE = "2026-08-15"
TARGET_DATE_UNDERSCORE = TARGET_DATE.replace("-", "_")
GEMINI_SCRIPT = os.path.join(ROOT_DIR, "gemini_research.py")

REPORTS_TO_RUN = [
    # (Template ID, Prompt ("auto" to load from template), Output Relative Path)
    ("weekly", "auto", f"global_market_recap_{TARGET_DATE_UNDERSCORE}.md"),
    ("economic_calendar", "auto", f"weekly_economic_calendar_{TARGET_DATE_UNDERSCORE}.md"),
    ("what_s_next_for_market", "auto", f"whats_next_{TARGET_DATE_UNDERSCORE}.md"),
    ("astro_economic_weekly", "auto", f"astro_economy_weekly_{TARGET_DATE_UNDERSCORE}.md"),
    ("gold_whale_weekly", "auto", f"gold_whale_flow_weekly_{TARGET_DATE_UNDERSCORE}.md"),
    ("vip_market_strategy_watchlist", "auto", f"vip_watchlist_{TARGET_DATE_UNDERSCORE}.md"),
    ("vp_top_opportunity_radar", "auto", os.path.join("MEMBERSHIP CONTENT SYSTEM", f"vp_top_opportunity_radar_{TARGET_DATE_UNDERSCORE}.md")),
    ("vp_whalezoomkephoonarai", "auto", os.path.join("MEMBERSHIP CONTENT SYSTEM", f"vp_whalezoomkephoonarai_{TARGET_DATE_UNDERSCORE}.md")),
    ("custom_1782454949086", "auto", f"short_squeeze_analysis_{TARGET_DATE_UNDERSCORE}.md"),
    ("oversold_opportunity", "auto", f"oversold_opportunity_report_{TARGET_DATE_UNDERSCORE}.md"),
    ("custom_1782639746404", "auto", f"thai_stock_{TARGET_DATE_UNDERSCORE}.md"),
    ("whale", "auto", f"whale_flow_analysis_{TARGET_DATE_UNDERSCORE}.md"),
    ("options_screen", "auto", f"options_screen_analysis_{TARGET_DATE_UNDERSCORE}.md"),
    ("hot_stock", "auto", f"us_viral_stock_analysis_{TARGET_DATE_UNDERSCORE}.md"),
    ("custom_1782448721923", "auto", f"us_pre_market_analysis_{TARGET_DATE_UNDERSCORE}.md"),
    ("small_cap_radar", "auto", f"small_cap_research_{TARGET_DATE_UNDERSCORE}.md"),
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
    print(f"Starting Saturday Weekly Reports Pipeline for Date: {TARGET_DATE}")
    
    # 1. Run Gemini Deep Research Reports
    for tmpl_id, prompt, rel_output in REPORTS_TO_RUN:
        out_path = os.path.join(ROOT_DIR, rel_output)
        cmd = [
            PYTHON_BIN,
            GEMINI_SCRIPT,
            "--template-id", tmpl_id,
            "--prompt", prompt,
            "--date", TARGET_DATE,
            "--output", out_path
        ]
        run_cmd(cmd)

    # 2. Copy/Create Thai Recap Alias if needed
    gmr_path = os.path.join(ROOT_DIR, f"global_market_recap_{TARGET_DATE_UNDERSCORE}.md")
    gmr_thai_path = os.path.join(ROOT_DIR, f"global_market_recap_thai_{TARGET_DATE_UNDERSCORE}.md")
    if os.path.exists(gmr_path):
        with open(gmr_path, "r", encoding="utf-8") as f:
            content = f.read()
        with open(gmr_thai_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Synced {gmr_thai_path}")

    # 3. Update Index
    print("\n==================== UPDATING INDEX ====================")
    run_cmd(["node", "generate-index.js"])
    print("ALL SATURDAY WEEKLY REPORTS COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    main()
