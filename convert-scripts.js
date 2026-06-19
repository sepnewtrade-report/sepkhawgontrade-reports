const fs = require('fs');
const path = require('path');

const WORKSPACE_DIR = __dirname;

function cleanScriptContent(content, dateStr, type) {
  let cleaned = content;

  // 1. Replace the first header
  if (type === 'weekly') {
    cleaned = cleaned.replace(/^#\s+.*สคริปต์.*$/m, `# 🌍 Global Market Recap — ${dateStr}`);
  } else if (type === 'daily') {
    cleaned = cleaned.replace(/^#\s+.*สคริปต์.*$/m, `# 📊 สรุปจบ ทันโลกหุ้น — ${dateStr}`);
  } else if (type === 'whale') {
    cleaned = cleaned.replace(/^#\s+.*สคริปต์.*$/m, `# 🐋 วาฬขยับ ตลาดสะเทือน — ${dateStr}`);
  }

  // 2. Strip stage directions, e.g. **[ผู้ดำเนินรายการ...]**
  cleaned = cleaned.replace(/\*\*\[.*?\]\*\*\s*[\r\n]*/g, '');

  // 3. Strip time recommendations, e.g. *(เวลาแนะนำ: 0:00 - 0:45)*
  cleaned = cleaned.replace(/\*\(\s*เวลาแนะนำ.*?\)\*\s*[\r\n]*/g, '');

  // 4. Strip speech labels, e.g. **บทพูด:** or **บทพูด (Hook):**
  cleaned = cleaned.replace(/\*\*บทพูด(\s*\(.*?\))?:\*\*\s*/gi, '');

  // 5. Replace section headers like "## 1️⃣ 🔥 OPENING (Hook)" with cleaner versions
  cleaned = cleaned.replace(/##\s+\d+️⃣\s*(🔥|🌍|📊|🔍|💡|🏁)\s*(.*)/g, '## $2');

  // Prepend Logo Branding
  cleaned = `<p align="center"><img src="Logo master.png" alt="SepKhawGonTrade Logo" width="150" /></p>\n\n` + cleaned;

  return cleaned;
}

function processScripts() {
  const files = fs.readdirSync(WORKSPACE_DIR);

  files.forEach(file => {
    const filePath = path.join(WORKSPACE_DIR, file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) return;

    let targetFilename = '';
    let type = ''; // 'daily', 'weekly', 'whale'
    let dateStr = '';

    // Match daily_script_YYYY_MM_DD.md
    const dailyMatch = file.match(/daily_script_(\d{4}_\d{2}_\d{2})\.md/);
    if (dailyMatch) {
      dateStr = dailyMatch[1].replace(/_/g, '-');
      targetFilename = `market_summary_${dailyMatch[1]}.md`; // Prefix maps to 'Market Summary' ('สรุปจบ ทันโลกหุ้น')
      type = 'daily';
    }

    // Match weekly_script_thai_YYYY_MM_DD.md
    const weeklyThaiMatch = file.match(/weekly_script_thai_(\d{4}_\d{2}_\d{2})\.md/);
    if (weeklyThaiMatch) {
      dateStr = weeklyThaiMatch[1].replace(/_/g, '-');
      targetFilename = `global_market_recap_thai_${weeklyThaiMatch[1]}.md`; // Prefix maps to 'Global Market Recap'
      type = 'weekly';
    } else {
      // Match weekly_script_YYYY_MM_DD.md
      const weeklyMatch = file.match(/weekly_script_(\d{4}_\d{2}_\d{2})\.md/);
      if (weeklyMatch) {
        dateStr = weeklyMatch[1].replace(/_/g, '-');
        targetFilename = `global_market_recap_${weeklyMatch[1]}.md`; // Prefix maps to 'Global Market Recap'
        type = 'weekly';
      }
    }

    // Match whale_flow_YYYY_MM_DD.md
    const whaleMatch = file.match(/whale_flow_(\d{4}_\d{2}_\d{2})\.md/);
    if (whaleMatch) {
      dateStr = whaleMatch[1].replace(/_/g, '-');
      targetFilename = `whale_flow_analysis_${whaleMatch[1]}.md`; // Prefix maps to 'Whale Flow' ('วาฬขยับ ตลาดสะเทือน')
      type = 'whale';
    }

    if (targetFilename) {
      const content = fs.readFileSync(filePath, 'utf8');
      const cleanedContent = cleanScriptContent(content, dateStr, type);
      const targetPath = path.join(WORKSPACE_DIR, targetFilename);

      fs.writeFileSync(targetPath, cleanedContent, 'utf8');
      console.log(`Converted: ${file} -> ${targetFilename}`);
    }
  });
}

try {
  console.log('Starting conversion of script files into analysis reports...');
  processScripts();
  console.log('Conversion completed successfully.');
} catch (error) {
  console.error('Error during conversion:', error);
}
