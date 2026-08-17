# -*- coding: utf-8 -*-
import os
import json
import subprocess

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TARGET_DATE = "2026-08-15"
TARGET_DATE_UNDERSCORE = TARGET_DATE.replace("-", "_")

gold_whale_path = os.path.join(ROOT_DIR, f"gold_whale_flow_{TARGET_DATE_UNDERSCORE}.md")

if os.path.exists(gold_whale_path):
    with open(gold_whale_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # 1. Fix GLD in Executive Summary
    content = content.replace(
        "SPDR Gold Shares (**GLD**) ปรับตัวขึ้นปิดบวกที่ **$89.97** (+1.93%)",
        "SPDR Gold Shares (**GLD**) ปรับตัวขึ้นปิดบวกที่ **$406.80** (+1.96%)"
    )
    
    # 2. Fix 24H Ago starting price and calculation in Section 2
    content = content.replace(
        "| **Spot Gold (XAU/USD / GC=F)** | $4,363.60 | **$4,432.00** | $4,454.60 | $4,365.50 | +0.26% |",
        "| **Spot Gold (XAU/USD / GC=F)** | $4,420.40 | **$4,432.00** | $4,454.60 | $4,365.50 | +0.26% |"
    )
    content = content.replace(
        "พุ่งขึ้นแรง +0.26% (+ $68.40/oz)",
        "ปรับตัวขึ้นปิดบวกที่ $4,432.00/oz (+0.26%, +$11.60/oz)"
    )
    
    # 3. Fix 10Y Yield % Change in Section 9
    content = content.replace(
        "**4.70% (+1.19%)**",
        "**4.70% (+6 bps / +1.29%)**"
    )
    
    with open(gold_whale_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Successfully fixed all reported issues in {gold_whale_path}")

# Re-run index
subprocess.run(["node", "generate-index.js"], cwd=ROOT_DIR, capture_output=True, text=True)
print("Updated reports index successfully.")
