# -*- coding: utf-8 -*-
"""
SepKhawGonTrade AI QC Validator (Powered by Groq Llama-3.3-70B)
Provides automated AI-driven Quality Control for financial markdown reports.
"""

import os
import sys
import json
import re
import argparse
import urllib.request
import urllib.error
from datetime import datetime

# Load environment variables from .env file if present
def load_dotenv():
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    key = key.strip()
                    val = val.strip().strip("'").strip('"')
                    if key not in os.environ:
                        os.environ[key] = val

load_dotenv()

# Fallback Groq API Key if not in environment
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")

def call_groq_api(system_prompt, user_content, model="llama-3.3-70b-versatile"):
    """
    Calls Groq API chat completions endpoint using standard urllib (zero external dependencies).
    """
    url = "https://api.groq.com/openai/v1/chat/completions"
    
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    payload = {
        "model": model,
        "temperature": 0.1,
        "response_format": {"type": "json_object"},
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content}
        ]
    }
    
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    
    try:
        with urllib.request.urlopen(req, timeout=45) as resp:
            body = resp.read().decode("utf-8")
            result = json.loads(body)
            content = result["choices"][0]["message"]["content"]
            return json.loads(content)
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8") if e.fp else str(e)
        print(f"❌ Groq API HTTP Error {e.code}: {err_body}")
        return None
    except Exception as e:
        print(f"❌ Error calling Groq API: {e}")
        return None

def audit_report_with_ai(report_path):
    """
    Sends report content to Groq AI for comprehensive quality control audit.
    """
    if not os.path.exists(report_path):
        print(f"❌ File not found: {report_path}")
        return None

    with open(report_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Smart truncation for large report files (> 25,000 chars) to prevent Groq API 429 Token Rate Limits
    MAX_CHARS = 25000
    if len(content) > MAX_CHARS:
        head_part = content[:15000]
        tail_part = content[-10000:]
        content_for_ai = head_part + "\n\n... [เนื้อหาบางส่วนในส่วนกลางของรายงานถูกย่อเพื่อประหยัด Tokenในการตรวจเช็ค] ...\n\n" + tail_part
    else:
        content_for_ai = content

    filename = os.path.basename(report_path)
    current_date_str = datetime.now().strftime("%Y-%m-%d")
    print(f"\n🧠 Running Groq AI QC Audit on: [{filename}] (Current Date: {current_date_str}) ...")

    system_prompt = f"""คุณคือ Editor-in-Chief และนักวิเคราะห์การเงินระดับสูงของช่อง SepKhawGonTrade
หน้าที่ของคุณคือตรวจสอบคุณภาพและความถูกต้องของรายงานวิเคราะห์หุ้นการเงินภาษาไทย (Financial Report Quality Audit)

วันที่ปัจจุบันสำหรับการตรวจเช็คคือ: {current_date_str}

คุณต้องทำการตรวจเช็ครายงานตามหลักเกณฑ์ต่อไปนี้:
1. **ความถูกต้องของตัวเลขและราคา (Data Accuracy)**: ตรวจเช็คว่าราคาหุ้น, % การเปลี่ยนแปลง, ดัชนีเศรษฐกิจมหภาค และสถิติมีความสอดคล้อง ไม่มีความขัดแย้งในตัวบทความ
2. **กรอบเวลาและ Timeline ล่าสุด (Timeframe & Freshness Verification)**: ตรวจสอบว่าวันที่, กรอบเวลาข่าวสาร, การประชุม FOMC, ผลประกอบการ หรือข้อมูลเศรษฐกิจมหภาคที่อ้างอิง **เป็นข้อมูลสดที่เป็นปัจจุบันล่าสุด ณ วันที่ {current_date_str} เท่านั้น** ห้ามนำข้อมูลเก่าหรือรายงานผิดช่วงเวลามานำเสนอ
3. **ตรรกะการวิเคราะห์ (Logic & Context)**: บทวิเคราะห์มีเหตุผลรองรับสอดคล้องกัน ไม่สับสนระหว่างข่าวบวกกับข่าวลบ
4. **คุณภาพภาษาไทย (Tone of Voice & Grammar)**: ใช้ภาษาทางการ อ่านง่าย เข้าใจง่าย ปราศจากคำสะกดผิด
5. **ความสะอาดของบทความ (Sanitization)**: ต้องไม่มีสคริปต์สำหรับการถ่ายวิดีโอหลุดมา เช่น **[กล้อง 1]**, *(เวลาแนะนำ: ...)*, หรือ **บทพูด:**
6. **องค์ประกอบของรายงาน (Structure)**: ต้องมีโลโก้ช่องอยู่ที่บรรทบรรทัดแรกสุด และมีส่วน "## 🌐 แหล่งข้อมูลอ้างอิง (Sources)" อยู่ท้ายสุด

ให้ส่งผลการตรวจกลับมาเป็น JSON ตามโครงสร้างนี้เท่านั้น:
{{
  "is_passed": true,
  "quality_score": 95,
  "summary": "สรุปภาพรวมคุณภาพของรายงาน 1-2 บรรทัด",
  "issues": [
    {{
      "severity": "CRITICAL / WARNING / SUGGESTION",
      "category": "Timeframe / Price / Logic / Language / Branding / Sources",
      "description": "รายละเอียดข้อผิดพลาดที่พบ",
      "recommendation": "คำแนะนำในการแก้ไข"
    }}
  ],
  "improved_sections": {{
    "section_name_or_fix": "เนื้อหาข้อความที่แนะนำให้แก้ไขปรับปรุงให้ดีขึ้น (ถ้ามี)"
  }}
}}"""

    user_prompt = f"โปรดตรวจสอบรายงานชื่อไฟล์ `{filename}` (วันที่ปัจจุบัน {current_date_str}) ดังต่อไปนี้:\n\n--- BEGIN REPORT CONTENT ---\n{content_for_ai}\n--- END REPORT CONTENT ---"

    ai_result = call_groq_api(system_prompt, user_prompt)
    if not ai_result:
        print("⚠️ AI Audit failed or timed out.")
        return None

    # Print clean summary to terminal
    print("\n" + "="*60)
    score = ai_result.get("quality_score", 0)
    passed = ai_result.get("is_passed", False)
    status_icon = "✅ PASSED" if passed else "❌ FAILED / NEEDS FIX"
    print(f"📊 AI QC Result: {status_icon} | Quality Score: {score}/100")
    print(f"📝 Summary: {ai_result.get('summary', '')}")
    
    issues = ai_result.get("issues", [])
    if issues:
        print(f"\n🔍 Issues Found ({len(issues)}):")
        for idx, item in enumerate(issues, 1):
            sev = item.get("severity", "INFO")
            cat = item.get("category", "")
            desc = item.get("description", "")
            rec = item.get("recommendation", "")
            print(f"  {idx}. [{sev}] [{cat}] {desc}")
            if rec:
                print(f"     👉 Suggestion: {rec}")
    else:
        print("🎉 No issues detected! Perfect report.")
    print("="*60 + "\n")

    # Save AI QC log to disk
    qc_json_path = report_path.replace(".md", "_ai_qc_report.json")
    try:
        with open(qc_json_path, "w", encoding="utf-8") as f:
            json.dump(ai_result, f, indent=2, ensure_ascii=False)
        print(f"💾 AI QC Log saved to: {qc_json_path}")
    except Exception as e:
        print(f"⚠️ Failed to save AI QC JSON log: {e}")

    return ai_result

def main():
    parser = argparse.ArgumentParser(description="Groq AI Quality Inspector for Markdown Reports")
    parser.add_argument("report", nargs="?", help="Path to markdown report file to audit")
    parser.add_argument("--date", help="Date string (YYYY-MM-DD) to audit all matching reports")
    args = parser.parse_args()

    if args.report:
        audit_report_with_ai(args.report)
    elif args.date:
        date_formatted = args.date.replace("-", "_")
        workspace_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        found_reports = [
            os.path.join(workspace_dir, f)
            for f in os.listdir(workspace_dir)
            if f.endswith(".md") and date_formatted in f and not f.startswith(".")
        ]
        if not found_reports:
            print(f"No reports found matching date {args.date}")
            return
        
        print(f"🔍 Found {len(found_reports)} reports for date {args.date}:")
        for r_path in sorted(found_reports):
            audit_report_with_ai(r_path)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
