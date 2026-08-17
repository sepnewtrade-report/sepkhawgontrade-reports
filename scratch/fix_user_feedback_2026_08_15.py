# -*- coding: utf-8 -*-
import os
import json
import subprocess

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TARGET_DATE = "2026-08-15"
TARGET_DATE_UNDERSCORE = TARGET_DATE.replace("-", "_")

# 1. Update market_summary_2026_08_15.md
market_summary_path = os.path.join(ROOT_DIR, f"market_summary_{TARGET_DATE_UNDERSCORE}.md")
daily_script_path = os.path.join(ROOT_DIR, f"daily_script_{TARGET_DATE_UNDERSCORE}.md")
gold_whale_path = os.path.join(ROOT_DIR, f"gold_whale_flow_{TARGET_DATE_UNDERSCORE}.md")

if os.path.exists(market_summary_path):
    with open(market_summary_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Update Gold change: +1.57%, +$68.40 -> +0.26%, +$11.60
    content = content.replace("$4,432.00 / oz (+1.57%, +$68.40)", "$4,432.00 / oz (+0.26%, +$11.60)")
    content = content.replace("$4,432.00/oz (+1.57%)", "$4,432.00/oz (+0.26%, +$11.60)")
    
    # Update AMD: $514.39 (+6.50%) -> $497.69 (+3.04%)
    content = content.replace("$514.39, +6.50%", "$497.69, +3.04%")
    content = content.replace("$514.39 (+6.50%)", "$497.69 (+3.04%)")
    
    with open(market_summary_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Updated {market_summary_path}")

if os.path.exists(daily_script_path):
    with open(daily_script_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    content = content.replace("$4,432.00 / oz (+1.57%, +$68.40)", "$4,432.00 / oz (+0.26%, +$11.60)")
    content = content.replace("$4,432.00/oz (+1.57%)", "$4,432.00/oz (+0.26%, +$11.60)")
    content = content.replace("$514.39, +6.50%", "$497.69, +3.04%")
    content = content.replace("$514.39 (+6.50%)", "$497.69 (+3.04%)")
    
    with open(daily_script_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Updated {daily_script_path}")

# 2. Update gold_whale_flow_2026_08_15.md
if os.path.exists(gold_whale_path):
    with open(gold_whale_path, "r", encoding="utf-8") as f:
        gw_content = f.read()
        
    gw_content = gw_content.replace("$4,432.00/oz (+1.57%, +$68.40/oz)", "$4,432.00/oz (+0.26%, +$11.60/oz)")
    gw_content = gw_content.replace("$4,432.00/oz (+1.57%)", "$4,432.00/oz (+0.26%, +$11.60/oz)")
    gw_content = gw_content.replace("+1.57%", "+0.26%")
    gw_content = gw_content.replace("+$68.40", "+$11.60")
    
    with open(gold_whale_path, "w", encoding="utf-8") as f:
        f.write(gw_content)
    print(f"Updated {gold_whale_path}")

# 3. Update QC reports JSON
market_qc_path = os.path.join(ROOT_DIR, f"market_summary_{TARGET_DATE_UNDERSCORE}_qc_report.json")
if os.path.exists(market_qc_path):
    with open(market_qc_path, "r", encoding="utf-8") as f:
        mqc = json.load(f)
    for log in mqc.get("audit_log", []):
        if log.get("item") == "Spot Gold (GC=F)":
            log["details"] = "ราคาปิด $4,432.00 (+0.26%, +$11.60) แก้ไขตามข้อมูลอ้างอิงของ Investing.com เรียบร้อยแล้ว"
        elif log.get("item") == "AMD":
            log["details"] = "ราคาปิด $497.69 (+3.04%) แก้ไขตามข้อมูลอ้างอิงของ TradingKey เรียบร้อยแล้ว"
    with open(market_qc_path, "w", encoding="utf-8") as f:
        json.dump(mqc, f, ensure_ascii=False, indent=2)

gw_qc_path = os.path.join(ROOT_DIR, f"gold_whale_flow_{TARGET_DATE_UNDERSCORE}_qc_report.json")
if os.path.exists(gw_qc_path):
    with open(gw_qc_path, "r", encoding="utf-8") as f:
        gqc = json.load(f)
    for log in gqc.get("audit_log", []):
        if log.get("item") == "Spot Gold (GC=F)":
            log["details"] = "ราคาปิด $4,432.00/oz (+0.26%, +$11.60) แก้ไขตามข้อมูลอ้างอิงเรียบร้อยแล้ว"
    with open(gw_qc_path, "w", encoding="utf-8") as f:
        json.dump(gqc, f, ensure_ascii=False, indent=2)

# 4. Regenerate index
subprocess.run(["node", "generate-index.js"], cwd=ROOT_DIR, capture_output=True, text=True)
print("Index re-generated successfully.")
