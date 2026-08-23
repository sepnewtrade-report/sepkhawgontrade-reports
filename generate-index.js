const fs = require('fs');
const path = require('path');

const WORKSPACE_DIR = __dirname;
const OUTPUT_FILE = path.join(WORKSPACE_DIR, 'reports-index.json');

// Map of file prefixes to 4 Financial Intelligence Pillars
const CATEGORY_MAP = {
  // ☀️ 1. Market Intelligence (สรุปจบ ทันโลกหุ้น)
  'us_pre_market_analysis': { name: 'Market Intelligence', thai: 'สรุปจบ ทันโลกหุ้น' },
  'daily_script': { name: 'Market Intelligence', thai: 'สรุปจบ ทันโลกหุ้น' },
  'market_summary': { name: 'Market Intelligence', thai: 'สรุปจบ ทันโลกหุ้น' },
  'us_viral_stock_analysis': { name: 'Market Intelligence', thai: 'สรุปจบ ทันโลกหุ้น' },
  'global_market_recap': { name: 'Market Intelligence', thai: 'สรุปจบ ทันโลกหุ้น' },
  'equity_research_report': { name: 'Market Intelligence', thai: 'สรุปจบ ทันโลกหุ้น' },
  'us_equity_research_report': { name: 'Market Intelligence', thai: 'สรุปจบ ทันโลกหุ้น' },

  // 🐋 2. Smart Money Intelligence (วาฬขยับ ตลาดสะเทือน)
  'whale_flow': { name: 'Smart Money Intelligence', thai: 'วาฬขยับ ตลาดสะเทือน' },
  'options_screen_analysis': { name: 'Smart Money Intelligence', thai: 'วาฬขยับ ตลาดสะเทือน' },
  'short_squeeze': { name: 'Smart Money Intelligence', thai: 'วาฬขยับ ตลาดสะเทือน' },
  'bear_squeeze': { name: 'Smart Money Intelligence', thai: 'วาฬขยับ ตลาดสะเทือน' },
  'oversold_opportunity_report': { name: 'Smart Money Intelligence', thai: 'วาฬขยับ ตลาดสะเทือน' },
  'cosmic_trade_signal_pro': { name: 'Smart Money Intelligence', thai: 'วาฬขยับ ตลาดสะเทือน' },
  'small_cap_research': { name: 'Smart Money Intelligence', thai: 'วาฬขยับ ตลาดสะเทือน' },

  // 🥇 3. Gold Intelligence (วาฬทองคำ)
  'gold_whale_flow': { name: 'Gold Intelligence', thai: 'วาฬทองคำ' },

  // 🔮 4. Strategic Intelligence (Weekly Market Outlook)
  'whats_next': { name: 'Strategic Intelligence', thai: 'Weekly Market Outlook' },
  'weekly_script': { name: 'Strategic Intelligence', thai: 'Weekly Market Outlook' },
  'weekly_script_thai': { name: 'Strategic Intelligence', thai: 'Weekly Market Outlook' },
  'weekly_economic_calendar': { name: 'Strategic Intelligence', thai: 'Weekly Market Outlook' },
  'astro_economy_weekly': { name: 'Strategic Intelligence', thai: 'Weekly Market Outlook' },
  'thai_stock': { name: 'Strategic Intelligence', thai: 'Weekly Market Outlook' }
};

function getCategory(filename, title) {
  const lowercase = filename.toLowerCase();

  if (lowercase.startsWith('bot_trade_') || lowercase.startsWith('bot_stats_')) {
    return { name: 'Smart Money Intelligence', thai: 'วาฬขยับ ตลาดสะเทือน' };
  }

  for (const prefix in CATEGORY_MAP) {
    if (lowercase.startsWith(prefix)) {
      return CATEGORY_MAP[prefix];
    }
  }
  return { name: 'Market Intelligence', thai: 'สรุปจบ ทันโลกหุ้น' };
}

function parseDate(filename) {
  // Try to match YYYY_MM_DD
  const dateMatch = filename.match(/(\d{4})_(\d{2})_(\d{2})/);
  if (dateMatch) {
    return `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
  }
  // Try to match Month_YYYY (e.g. june_2026)
  const monthYearMatch = filename.match(/(june|july|august|september|october|november|december|january|february|march|april|may)_(\d{4})/i);
  if (monthYearMatch) {
    const month = monthYearMatch[1].charAt(0).toUpperCase() + monthYearMatch[1].slice(1).toLowerCase();
    return `${month} ${monthYearMatch[2]}`;
  }
  return null;
}

function sanitizeUTF8(str) {
  if (!str) return "";
  return str.replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/g, '').trim();
}

function extractMetadata(filePath, relativePath) {
  const filename = path.basename(filePath);
  const stats = fs.statSync(filePath);
  const content = fs.readFileSync(filePath, 'utf8');

  // Find first title heading (# Heading)
  let title = filename;
  const headingMatch = content.match(/^#\s+(.+)$/m);
  if (headingMatch) {
    title = headingMatch[1].replace(/[📊🌌🏆📈🚨📰🔥🔍💼💎👑]/gu, '').trim(); // Strip emojis cleanly
  }
  title = sanitizeUTF8(title);

  // Check if it is a script file by content keywords in the heading
  const titleLower = title.toLowerCase();
  if (titleLower.includes('สคริปต์') || titleLower.includes('script') || titleLower.includes('youtube')) {
    return null;
  }

  const categoryInfo = getCategory(filename, title);
  
  // Format local date fallback (YYYY-MM-DD) in the local timezone
  const mtime = new Date(stats.mtime);
  const yyyy = mtime.getFullYear();
  const mm = String(mtime.getMonth() + 1).padStart(2, '0');
  const dd = String(mtime.getDate()).padStart(2, '0');
  const localMtimeStr = `${yyyy}-${mm}-${dd}`;
  
  const dateStr = parseDate(filename) || localMtimeStr;

  return {
    title: title,
    filename: filename,
    path: relativePath,
    category: categoryInfo.name,
    categoryThai: categoryInfo.thai,
    date: dateStr,
    timestamp: stats.mtimeMs,
    size: stats.size
  };
}

function scanDir(dir, relativeDir = '') {
  let results = [];
  const list = fs.readdirSync(dir);

  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const relPath = relativeDir ? path.join(relativeDir, file) : file;
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Exclude hidden folders, node_modules, venvs, and scratch
      const ignoredDirs = ['node_modules', '.agents', 'venv', '.venv', 'fresh_venv', 'test_venv', 'tmp_venv', 'scratch'];
      if (!file.startsWith('.') && !ignoredDirs.includes(file)) {
        results = results.concat(scanDir(filePath, relPath));
      }
    } else if (file.endsWith('.md')) {
      // Exclude config files, readme, and video/daily scripts
      const nameLower = file.toLowerCase();
      if (nameLower !== 'agents.md' && 
          nameLower !== 'task.md' && 
          nameLower !== 'implementation_plan.md' && 
          nameLower !== 'walkthrough.md' &&
          nameLower !== 'readme.md' &&
          !nameLower.includes('script')) {
        const meta = extractMetadata(filePath, relPath);
        if (meta) {
          results.push(meta);
        }
      }
    }
  });

  return results;
}

try {
  console.log('Scanning workspace for Markdown reports...');
  const reports = scanDir(WORKSPACE_DIR);
  
  // Sort reports by date (newest first), then by timestamp
  reports.sort((a, b) => {
    const dateA = new Date(a.date.match(/^\d{4}-\d{2}-\d{2}$/) ? a.date : a.timestamp);
    const dateB = new Date(b.date.match(/^\d{4}-\d{2}-\d{2}$/) ? b.date : b.timestamp);
    return dateB - dateA || b.timestamp - a.timestamp;
  });

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(reports, null, 2), 'utf8');
  console.log(`Successfully generated index with ${reports.length} reports at ${OUTPUT_FILE}`);
} catch (error) {
  console.error('Error scanning directory:', error);
  process.exit(1);
}
