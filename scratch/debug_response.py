# -*- coding: utf-8 -*-
import os
import sys
import json

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(ROOT_DIR)

import gemini_utils

api_keys = gemini_utils.get_api_keys()

prompt = "สรุปภาพรวมตลาดหุ้นสหรัฐฯ วันที่ 20 สิงหาคม 2026"
config = gemini_utils.types.GenerateContentConfig(
    system_instruction="คุณคือนักวิเคราะห์การเงิน ห้ามสร้างข้อมูลสมมติ",
    tools=[gemini_utils.types.Tool(google_search=gemini_utils.types.GoogleSearch())]
)

try:
    resp = gemini_utils.generate_content_with_rotation(
        api_keys=api_keys,
        model="gemini-2.5-flash",
        contents=prompt,
        config=config
    )
    print("Response type:", type(resp))
    print("Has text:", hasattr(resp, "text"))
    print("Text repr:", repr(resp.text))
    if hasattr(resp, "candidates") and resp.candidates:
        print("Candidates count:", len(resp.candidates))
        c = resp.candidates[0]
        print("Finish reason:", getattr(c, "finish_reason", None))
        if hasattr(c, "content") and c.content:
            print("Content parts count:", len(c.content.parts) if c.content.parts else 0)
            if c.content.parts:
                for i, p in enumerate(c.content.parts):
                    print(f"Part {i} type:", type(p))
                    print(f"Part {i} text repr:", repr(getattr(p, "text", None)))
except Exception as e:
    print("Exception:", e)
