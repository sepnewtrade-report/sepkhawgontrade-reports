# -*- coding: utf-8 -*-
import os
import sys
import json

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(ROOT_DIR)

import gemini_utils

api_keys = gemini_utils.get_api_keys()

TEMPLATES_JSON = os.path.join(ROOT_DIR, "notebooklm-manager", "templates.json")
with open(TEMPLATES_JSON, "r", encoding="utf-8") as f:
    templates = json.load(f)

daily_pro = [t for t in templates if t.get("id") == "daily_pro"][0]
search_prompt = daily_pro["searchPrompt"]

# Remove file saving line from search prompt
search_prompt_clean = search_prompt.replace("ข้อกำหนดการบันทึกไฟล์: บันทึกผลลัพธ์เป็นไฟล์ 'market_summary_YYYY_MM_DD.md' เสมอ", "").strip()

system_instruction = (
    "คุณคือหัวหน้านักวิเคราะห์การเงินและเศรษฐกิจมหภาคระดับสูงของช่อง 'เสพข่าวก่อนเทรด หุ้นอเมริกา' สไตล์ Financial Intelligence Agent Pro "
    "ปฏิบัติหน้าที่จัดทำรายงานวิเคราะห์ตลาดหุ้นสหรัฐฯ ประจำวันฉบับเต็มโดยวิเคราะห์ข้อมูลจริงรอบ 24 ชั่วโมงที่ผ่านมา\n\n"
    "ข้อกำหนดในการเขียนที่ต้องปฏิบัติตามอย่างเคร่งครัด 100%:\n"
    "1. เขียนเป็นภาษาไทยด้วยน้ำเสียงที่เป็นทางการ น่าเชื่อถือ และวิเคราะห์เชิงลึกแบบสถาบันการเงิน (Wall Street Research)\n"
    "2. ห้ามใช้สัญลักษณ์เกี่ยวกับบทสคริปต์วิดีโอหรือ youtube โดยเด็ดขาด เช่น วงเล็บเหลี่ยมบอกกล้อง/ท่าทาง [กล้องซูม], "
    "เวลาแนะนำ *(เวลาแนะนำ: 01:20)*, หรือป้ายบทพูด เช่น **บทพูด:**, **ผู้ดำเนินรายการ:**, **Host:** เป็นต้น\n"
    "3. 🚨 MANDATE STRICT DATA INTEGRITY: ห้ามใช้ข้อมูลสมมติ ห้ามใช้ชื่อบริษัทสมมติ (เช่น InnovateTech, GlobalBank) ห้ามใช้ตัวเลขจำลอง "
    "และห้ามใส่ข้อความเกริ่นนำว่าเป็น 'การจำลองสถานการณ์' หรือ 'ข้อมูลเพื่อการสาธิต' โดยเด็ดขาด! คุณต้องใช้ข้อมูลข่าวและราคาปิดจริง ณ วันที่เป้าหมาย 100%\n"
    "4. บังคับใช้ครบทุก 12 หัวข้อของ Financial Intelligence Pro Standard\n"
    "5. ข้อมูลราคาหุ้น ราคาทองคำ ดัชนีทางเทคนิคัล และปัจจัยข่าวสารทั้งหมด ต้องสอดคล้องตรงตามวันที่เป้าหมาย (2026-08-20) อย่างเคร่งครัด\n"
)

user_prompt = (
    f"วันที่ของรายงาน: 2026-08-20\n\n"
    f"{search_prompt_clean}\n\n"
    f"กรุณาใช้ Google Search เพื่อสืบค้นข้อมูลข่าวสารและตัวเลขจริงล่าสุด แล้วเขียนรายงานบทวิเคราะห์ฉบับสมบูรณ์ตามโครงสร้าง Financial Intelligence Pro ทั้งหมด 12 ข้อ โดยแทรกหัวข้อโลโก้ของช่องไว้ที่บรรทัดแรกสุดดังนี้:\n"
    f'<p align="center"><img src="Logo master.png" alt="SepKhawGonTrade Logo" width="150" /></p>\n\n'
)

config = gemini_utils.types.GenerateContentConfig(
    system_instruction=system_instruction,
    tools=[gemini_utils.types.Tool(google_search=gemini_utils.types.GoogleSearch())],
    temperature=0.2
)

try:
    resp = gemini_utils.generate_content_with_rotation(
        api_keys=api_keys,
        model="gemini-2.5-flash",
        contents=user_prompt,
        config=config
    )
    print("Response text length:", len(resp.text) if resp and resp.text else 0)
    print("Snippet:", resp.text[:400] if resp and resp.text else "EMPTY")
except Exception as e:
    print("Exception:", e)
