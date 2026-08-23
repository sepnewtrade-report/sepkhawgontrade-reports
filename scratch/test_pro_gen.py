# -*- coding: utf-8 -*-
import os
import sys
import json
import time

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(ROOT_DIR)

import gemini_utils

api_keys = gemini_utils.get_api_keys()
print("Loaded API keys count:", len(api_keys))

TEMPLATES_JSON = os.path.join(ROOT_DIR, "notebooklm-manager", "templates.json")
with open(TEMPLATES_JSON, "r", encoding="utf-8") as f:
    templates = json.load(f)

daily_pro = [t for t in templates if t.get("id") == "daily_pro"][0]
search_prompt = daily_pro["searchPrompt"]

date_str = "2026-08-20"
system_instruction = (
    "คุณคือหัวหน้านักวิเคราะห์การเงินและเศรษฐกิจมหภาคระดับสูงของช่อง 'เสพข่าวก่อนเทรด หุ้นอเมริกา' สไตล์ Financial Intelligence Agent Pro "
    "งานของคุณคือทำ Deep Research และเขียนรายงานวิเคราะห์สถานการณ์ตลาดหุ้นสหรัฐฯ ดัชนีหลัก สินทรัพย์การเงิน และทิศทางเศรษฐกิจอย่างมืออาชีพ\n\n"
    "ข้อกำหนดในการเขียน:\n"
    "1. เขียนเป็นภาษาไทยด้วยน้ำเสียงที่เป็นทางการ น่าเชื่อถือ และวิเคราะห์เชิงลึกแบบสถาบันการเงิน (Wall Street Research)\n"
    "2. ห้ามใช้สัญลักษณ์สคริปต์วิดีโอ YouTube เช่น [กล้องซูม], *(เวลาแนะนำ)*, **บทพูด:** เด็ดขาด\n"
    "3. บังคับใช้ข้อมูลจริง 100% ณ วันที่ 20 สิงหาคม 2026 ผ่าน Google Search ห้ามใช้ตัวเลขสมมติ ห้ามสร้างชื่อบริษัทสมมติ (เช่น InnovateTech, GlobalBank) และห้ามใส่ข้อความ disclaimer เรื่องการจำลองสถานการณ์เด็ดขาด!\n"
