# -*- coding: utf-8 -*-
import os
import sys
import json

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(ROOT_DIR)

import gemini_utils

api_keys = gemini_utils.get_api_keys()

prompt = """คุณคือหัวหน้านักวิเคราะห์การเงินระดับสูงของช่อง 'เสพข่าวก่อนเทรด หุ้นอเมริกา' 
กรุณาทำวิจัยและเขียนรายงาน Financial Intelligence Pro ประจำวันล่าสุด (20 สิงหาคม 2026)
โดยให้ค้นหาข้อมูลข่าวสาร เศรษฐกิจ และราคาปิดล่าสุดของตลาดหุ้นสหรัฐฯ (S&P 500, Nasdaq, Dow, VIX, US 10Y Yield, DXY, Gold, Oil) ในสัปดาห์นี้
และเขียนรายงานวิเคราะห์เชิงลึกตามโครงสร้าง 12 ข้อของ Financial Intelligence Pro"""

system_instruction = (
    "คุณคือหัวหน้านักวิเคราะห์การเงินระดับสูงของช่อง 'เสพข่าวก่อนเทรด หุ้นอเมริกา' สไตล์ Financial Intelligence Agent Pro "
    "ปฏิบัติหน้าที่ในฐานะนักวิเคราะห์สถาบันการเงินที่จัดทำรายงานวิเคราะห์ตลาดหุ้นสหรัฐฯ ประจำวันที่ 20 สิงหาคม 2026 "
    "โดยสืบค้นข้อมูลข่าวสาร ราคาปิดตลาด และสภาวะเศรษฐกิจล่าสุดรอบ 24 ชั่วโมงที่ผ่านมาผ่าน Google Search และเขียนรายงานฉบับสมบูรณ์"
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
        contents=prompt,
        config=config
    )
    print("Response text length:", len(resp.text) if resp and resp.text else 0)
    print("Response snippet:", resp.text[:300] if resp and resp.text else "EMPTY")
except Exception as e:
    print("Exception:", e)
