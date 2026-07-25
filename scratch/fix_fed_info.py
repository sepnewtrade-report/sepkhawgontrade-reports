import os

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPORT_PATH = os.path.join(ROOT_DIR, "whats_next_2026_07_26.md")
SCRIPT_PATH = os.path.join(ROOT_DIR, "whats_next_script_2026_07_26.md")

def fix_report():
    if not os.path.exists(REPORT_PATH):
        print("Report path not found")
        return
        
    with open(REPORT_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    # Old text in report:
    old_text = (
        "*   **นโยบายการเงินของธนาคารกลางสหรัฐฯ (Fed):** แม้ว่าผู้เชี่ยวชาญส่วนใหญ่คาดการณ์ว่า Fed จะคงอัตราดอกเบี้ยไว้ในการประชุม FOMC ที่จะมีขึ้นในวันที่ 29 กรกฎาคม 2569 แต่ตลาดก็มีการคาดการณ์ถึงโอกาส 33% ที่ Fed จะปรับขึ้นอัตราดอกเบี้ยในสัปดาห์หน้า ซึ่งเป็นผลมาจากราคาน้ำมันที่พุ่งสูงขึ้นและแรงกดดันด้านเงินเฟ้อ คณะกรรมการ FOMC ได้คงเป้าหมายอัตราดอกเบี้ย Fed Funds ไว้ที่ 5.25% ถึง 5.50% ตั้งแต่ต้นปี 2569 และยังคงจับตาอัตราเงินเฟ้อที่ยังคงสูงกว่าเป้าหมาย 2% [ที่มา: Federal Reserve, การคาดการณ์ตลาด, กรกฎาคม 2569]"
    )
    
    new_text = (
        "*   **นโยบายการเงินของธนาคารกลางสหรัฐฯ (Fed):** คาดการณ์ว่า Fed ภายใต้ประธาน Kevin Warsh จะคงอัตราดอกเบี้ยเป้าหมายไว้ที่ระดับ 3.50% ถึง 3.75% ในการประชุม FOMC วันที่ 28–29 กรกฎาคม 2569 นี้ แม้ว่าเริ่มมีความกังวลเพิ่มขึ้นเกี่ยวกับการปรับขึ้นดอกเบี้ยในระยะถัดไปของปี 2569 เนื่องมาจากราคาน้ำมันดิบที่ทรงตัวในระดับสูงและแรงกดดันด้านอัตราเงินเฟ้อที่ยังสูงกว่าเป้าหมาย 2% [ที่มา: Federal Reserve, ข้อมูลตลาด ณ กรกฎาคม 2569]"
    )
    
    content = content.replace(old_text, new_text)
    
    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        f.write(content)
    print("Report Fed info corrected successfully.")

def fix_script():
    if not os.path.exists(SCRIPT_PATH):
        print("Script path not found")
        return
        
    with open(SCRIPT_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    # Old text in script:
    old_text = (
        "*   **Bond Yield และ Fed Expectations:** แม้ผู้เชี่ยวชาญส่วนใหญ่คาดว่า Fed จะคงอัตราดอกเบี้ยในการประชุม FOMC วันที่ 29 กรกฎาคม 2569 แต่ตลาดก็มีการคาดการณ์ถึงโอกาส 33% ที่ Fed จะปรับขึ้นอัตราดอกเบี้ยในสัปดาห์หน้า นี่เป็นผลมาจากราคาน้ำมันที่พุ่งสูงขึ้นและแรงกดดันด้านเงินเฟ้อที่กลับมาอีกครั้งครับ คณะกรรมการ FOMC ได้คงเป้าหมายอัตราดอกเบี้ย Fed Funds ไว้ที่ 5.25% ถึง 5.50% ตั้งแต่ต้นปี 2569 และยังคงจับตาอัตราเงินเฟ้อที่ยังคงสูงกว่าเป้าหมาย 2% [ที่มา: Federal Reserve, การคาดการณ์ตลาด, กรกฎาคม 2569]"
    )
    
    new_text = (
        "*   **Bond Yield และ Fed Expectations:** นักวิเคราะห์คาดการณ์ว่า Fed ภายใต้การนำของประธาน Kevin Warsh จะคงอัตราดอกเบี้ยเป้าหมายไว้ที่ระดับ 3.50% ถึง 3.75% ในการประชุม FOMC วันที่ 28–29 กรกฎาคม 2569 นี้ครับ แม้ว่าตลาดจะเริ่มกังวลว่าอาจมีการปรับขึ้นอัตราดอกเบี้ยในอนาคตเพื่อควบคุมเงินเฟ้อที่เป็นผลมาจากราคาน้ำมันดิบที่พุ่งขึ้นก็ตาม คณะกรรมการ FOMC ยังคงจับตาอัตราเงินเฟ้ออย่างใกล้ชิดเพื่อให้กลับคืนสู่เป้าหมายที่ 2% [ที่มา: Federal Reserve, ข้อมูลตลาด ณ กรกฎาคม 2569]"
    )
    
    content = content.replace(old_text, new_text)
    
    with open(SCRIPT_PATH, "w", encoding="utf-8") as f:
        f.write(content)
    print("Script Fed info corrected successfully.")

if __name__ == "__main__":
    fix_report()
    fix_script()
