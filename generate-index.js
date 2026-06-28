const fs = require('fs');
const path = require('path');

const WORKSPACE_DIR = __dirname;
const OUTPUT_FILE = path.join(WORKSPACE_DIR, 'reports-index.json');

// Map of file prefixes to friendly categories (Thai/English)
const CATEGORY_MAP = {
  'us_pre_market_analysis': { name: 'Pre-Market Analysis', thai: 'หุ้นพุ่งก่อนตลาดเปิด' },
  'daily_script': { name: 'Daily Script', thai: 'บทวิเคราะห์รายวัน' },
  'cosmic_trade_signal_pro': { name: 'Cosmic Trade Signal', thai: 'Cosmic Trade Signal' },
  'small_cap_research': { name: 'Small Cap Radar', thai: 'Small Cap Radar' },
  'us_viral_stock_analysis': { name: 'Hot Stock วันนี้', thai: 'Hot Stock วันนี้' },
  'weekly_economic_calendar': { name: 'Economic Calendar', thai: 'Economic Calendar' },
  'weekly_script_thai': { name: 'Weekly Script (Thai)', thai: 'บทวิเคราะห์รายสัปดาห์ (ไทย)' },
  'weekly_script': { name: 'Weekly Script', thai: 'บทวิเคราะห์รายสัปดาห์' },
  'whale_flow': { name: 'Whale Flow', thai: 'วาฬขยับ ตลาดสะเทือน' },
  'oversold_opportunity_report': { name: 'Oversold Opportunity', thai: 'Oversold Opportunity' },
  
  // New Categories
  'market_summary': { name: 'Market Summary', thai: 'สรุปจบ ทันโลกหุ้น' },
  'bear_squeeze': { name: 'Bear Squeeze', thai: 'หมีโดนบีบ' },
  'short_squeeze': { name: 'Bear Squeeze', thai: 'หมีโดนบีบ' },
  'global_market_recap': { name: 'Global Market Recap', thai: 'Global Market Recap' },
  'whats_next': { name: "What's Next for Market", thai: "What's Next for Market" },
  'thai_stock': { name: 'Thai Stock Analysis', thai: 'เหลียวหลังมามองหุ้นไทย' },
  'astro_economy_weekly': { name: 'Astro Economy Weekly', thai: 'Astro Economy Weekly' }
};

function getCategory(filename) {
  const lowercase = filename.toLowerCase();
  for (const prefix in CATEGORY_MAP) {
    if (lowercase.startsWith(prefix)) {
      return CATEGORY_MAP[prefix];
    }
  }
  return { name: 'Other Reports', thai: 'รายงานทั่วไป' };
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

function extractMetadata(filePath, relativePath) {
  const filename = path.basename(filePath);
  const stats = fs.statSync(filePath);
  const content = fs.readFileSync(filePath, 'utf8');

  // Find first title heading (# Heading)
  let title = filename;
  const headingMatch = content.match(/^#\s+(.+)$/m);
  if (headingMatch) {
    title = headingMatch[1].replace(/[📊🌌🏆📈🚨📰🔥🔍💼💎👑]/g, '').trim(); // Strip emojis for cleaner indexing, but keep title
  }

  // Check if it is a script file by content keywords in the heading
  const titleLower = title.toLowerCase();
  if (titleLower.includes('สคริปต์') || titleLower.includes('script') || titleLower.includes('youtube')) {
    return null;
  }

  const categoryInfo = getCategory(filename);
  
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
      // Exclude hidden folders, node_modules, and .agents
      if (!file.startsWith('.') && file !== 'node_modules' && file !== '.agents') {
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
