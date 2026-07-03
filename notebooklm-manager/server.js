const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const { exec, spawn } = require('child_process');
const fs = require('fs');
const os = require('os');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Paths to venv executables and profiles
const VENV_PYTHON = path.join(__dirname, '..', '.venv', 'bin', 'python');
const VENV_NOTEBOOKLM = path.join(__dirname, '..', '.venv', 'bin', 'notebooklm');
const SCRIPT_PATH = path.join(__dirname, '..', 'delete_notebooks.py');
const PROFILES_DIR = path.join(os.homedir(), '.notebooklm', 'profiles');
const TEMPLATES_FILE = path.join(__dirname, 'templates.json');

// Global state for active workflow
let activeWorkflowState = {
  running: false,
  progress: 0,
  currentStep: '',
  logs: [],
  result: null,
  error: null
};

// Map of active workflows
let workflows = {};
const WORKFLOWS_FILE = path.join(__dirname, 'workflows_history.json');

function saveWorkflowsToDisk() {
  try {
    fs.writeFileSync(WORKFLOWS_FILE, JSON.stringify(workflows, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save workflows history:', err);
  }
}

function loadWorkflowsFromDisk() {
  try {
    if (fs.existsSync(WORKFLOWS_FILE)) {
      const data = fs.readFileSync(WORKFLOWS_FILE, 'utf8');
      workflows = JSON.parse(data);
      // Ensure all workflows are marked as not running on startup
      Object.keys(workflows).forEach(id => {
        if (workflows[id].running) {
          workflows[id].running = false;
          workflows[id].status = 'failed';
          workflows[id].error = 'เซิร์ฟเวอร์ถูกรีสตาร์ทขณะกำลังรันงาน';
        }
      });
    }
  } catch (err) {
    console.error('Failed to load workflows history:', err);
  }
}
loadWorkflowsFromDisk();

// Helper to sanitize input
function sanitizeName(name) {
  if (!name) return '';
  return name.replace(/[^a-zA-Z0-9_-]/g, '');
}

// Helper to get active profile name from CLI
function getActiveProfile() {
  return new Promise((resolve) => {
    exec(`"${VENV_NOTEBOOKLM}" profile list --json`, (error, stdout) => {
      if (error) {
        console.error('Error getting active profile:', error);
        return resolve('default');
      }
      try {
        const data = JSON.parse(stdout);
        resolve(data.active || 'default');
      } catch (e) {
        resolve('default');
      }
    });
  });
}

// Helper to run shell commands as promises
function runCmd(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        const errObj = new Error(stderr || error.message);
        errObj.stdout = stdout;
        errObj.stderr = stderr;
        reject(errObj);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

// Helper to run shell commands with retry logic (especially useful for network requests)
async function runCmdWithRetry(cmd, maxRetries = 3, delayMs = 5000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await runCmd(cmd);
    } catch (err) {
      if (attempt === maxRetries) {
        throw err;
      }
      console.warn(`Command failed (attempt ${attempt}/${maxRetries}): ${cmd}. Retrying in ${delayMs / 1000}s... Error: ${err.message}`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}

// Helper to check if CLI error indicates quota/rate limit exhaustion
function isQuotaError(err) {
  if (!err) return false;
  const msg = (err.message || '').toLowerCase();
  const stderr = (err.stderr || '').toLowerCase();
  const stdout = (err.stdout || '').toLowerCase();
  
  return msg.includes('quota') || 
         msg.includes('rate limit') || 
         msg.includes('removed from the list') || 
         msg.includes('incomplete') ||
         msg.includes('exceeded') ||
         stderr.includes('quota') ||
         stderr.includes('rate limit') ||
         stderr.includes('removed from the list') ||
         stderr.includes('incomplete') ||
         stderr.includes('exceeded') ||
         stdout.includes('quota') ||
         stdout.includes('rate limit') ||
         stdout.includes('removed from the list') ||
         stdout.includes('incomplete') ||
         stdout.includes('exceeded');
}

// Helper to get authenticated profiles from the CLI
async function getAuthenticatedProfiles() {
  try {
    const listRes = await runCmd(`"${VENV_NOTEBOOKLM}" profile list --json`);
    const data = JSON.parse(listRes.stdout);
    const active = data.active || 'default';
    const authenticated = data.profiles
      .filter(p => p.authenticated)
      .map(p => p.name);
    return { active, authenticated };
  } catch (e) {
    console.error('Error fetching authenticated profiles:', e);
    return { active: 'default', authenticated: ['default'] };
  }
}

// Helper to format YYYY-MM-DD to Thai Date (e.g., 26 มิถุนายน 2569)
function formatThaiDate(dateStr) {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  
  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  
  const thaiMonth = thaiMonths[month - 1] || parts[1];
  const thaiYear = year + 543; // Buddhist Era
  
  return `${day} ${thaiMonth} ${thaiYear}`;
}

// Helper to extract stock ticker from markdown content
function extractTicker(mdContent) {
  if (!mdContent) return 'หุ้นสหรัฐฯ';
  
  const lines = mdContent.split('\n').slice(0, 25);
  const tickerRegex = /\(([A-Z]{1,5})\)/;
  
  // Exclude common macro abbreviations
  const exclusions = ['USD', 'GDP', 'CPI', 'FED', 'NYSE', 'SEC', 'AI', 'US', 'USA', 'PCE', 'IPO', 'SPX', 'NDX', 'DJI'];
  
  for (const line of lines) {
    const match = line.match(tickerRegex);
    if (match) {
      const ticker = match[1];
      if (!exclusions.includes(ticker)) {
        return ticker;
      }
    }
  }
  
  // Try NYSE: TICKER or NASDAQ: TICKER
  const exchangeRegex = /(NYSE|NASDAQ):\s*([A-Z]{1,5})/i;
  for (const line of lines) {
    const match = line.match(exchangeRegex);
    if (match) {
      return match[2].toUpperCase();
    }
  }
  
  // Try matching any capitalized letters inside parenthesis in first 25 lines
  const globalParenthesisRegex = /\(([A-Z]{1,5})\)/g;
  const headContent = lines.join('\n');
  let match;
  const candidates = [];
  while ((match = globalParenthesisRegex.exec(headContent)) !== null) {
    const ticker = match[1];
    if (!exclusions.includes(ticker)) {
      candidates.push(ticker);
    }
  }
  if (candidates.length > 0) {
    return candidates[0];
  }
  
  // Scan entire document for NYSE/NASDAQ: TICKER
  const allExchangeTickers = [];
  const globalExchangeRegex = /(?:NYSE|NASDAQ|NYSEArca):\s*([A-Z]{1,5})\b/gi;
  while ((match = globalExchangeRegex.exec(mdContent)) !== null) {
    allExchangeTickers.push(match[1].toUpperCase());
  }
  
  if (allExchangeTickers.length > 0) {
    const unique = [...new Set(allExchangeTickers)];
    return unique.join(', ');
  }
  
  return 'หุ้นสหรัฐฯ';
}


// Log message to active workflow
function addWorkflowLog(workflowId, msg) {
  const time = new Date().toLocaleTimeString('th-TH');
  const logStr = `[${time}] ${msg}`;
  console.log(`[${workflowId}] ${logStr}`);
  if (workflows[workflowId]) {
    workflows[workflowId].logs.push(logStr);
    
    // Sync to activeWorkflowState for backwards compatibility
    activeWorkflowState.logs = workflows[workflowId].logs;
    activeWorkflowState.progress = workflows[workflowId].progress;
    activeWorkflowState.currentStep = workflows[workflowId].currentStep;
    activeWorkflowState.running = workflows[workflowId].running;
    activeWorkflowState.result = workflows[workflowId].result;
    activeWorkflowState.error = workflows[workflowId].error;
    saveWorkflowsToDisk();
  }
}

// Error handling helper for workflows
function handleWorkflowError(workflowId, err) {
  console.error(`[${workflowId}] Workflow error:`, err);
  let displayError = err.message;
  if (isQuotaError(err)) {
    displayError = 'โควตาการใช้งานบัญชีนี้เต็มแล้วสำหรับวันนี้ (Daily Quota Exceeded) หรือเซิร์ฟเวอร์ Google ปฏิเสธคำขอชั่วคราว กรุณาสลับผู้ใช้ไปใช้โปรไฟล์บัญชีอื่นในแท็บเมนูจัดการบัญชี แล้วทดลองใหม่อีกครั้ง';
  }
  addWorkflowLog(workflowId, `❌ เกิดข้อผิดพลาดในกระบวนการทำงาน: ${displayError}`);
  if (workflows[workflowId]) {
    workflows[workflowId].running = false;
    workflows[workflowId].status = 'failed';
    workflows[workflowId].error = displayError;
    saveWorkflowsToDisk();
  }
}

function addLog(msg) {
  const time = new Date().toLocaleTimeString('th-TH');
  const logStr = `[${time}] ${msg}`;
  console.log(logStr);
  activeWorkflowState.logs.push(logStr);
}

// Check authentication status and get active profile
app.get('/api/status', async (req, res) => {
  const activeProfile = await getActiveProfile();
  const storagePath = path.join(PROFILES_DIR, activeProfile, 'storage_state.json');
  const exists = fs.existsSync(storagePath);
  
  res.json({ 
    authenticated: exists, 
    activeProfile: activeProfile 
  });
});

// Trigger login flow for the active profile
app.post('/api/login', async (req, res) => {
  const activeProfile = await getActiveProfile();
  console.log(`Triggering login flow for profile: ${activeProfile}...`);
  
  const loginProc = spawn(VENV_NOTEBOOKLM, ['login'], {
    detached: true,
    stdio: 'ignore'
  });
  
  loginProc.unref();
  
  res.json({ success: true, message: `Login flow triggered for profile '${activeProfile}'.` });
});

// Get all profiles list
app.get('/api/profiles', (req, res) => {
  exec(`"${VENV_NOTEBOOKLM}" profile list --json`, (error, stdout, stderr) => {
    if (error) {
      console.error('Error listing profiles:', stderr);
      return res.status(500).json({ success: false, error: stderr || error.message });
    }
    
    try {
      const result = JSON.parse(stdout);
      res.json({ success: true, profiles: result.profiles, active: result.active });
    } catch (parseError) {
      res.status(500).json({ success: false, error: 'Failed to parse profiles list' });
    }
  });
});

// Switch active profile
app.post('/api/profiles/switch', (req, res) => {
  const name = sanitizeName(req.body.name);
  if (!name) {
    return res.status(400).json({ success: false, error: 'Invalid profile name' });
  }
  
  exec(`"${VENV_NOTEBOOKLM}" profile switch "${name}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error switching profile to ${name}:`, stderr);
      return res.status(500).json({ success: false, error: stderr || error.message });
    }
    res.json({ success: true, message: `Switched profile to '${name}'.` });
  });
});

// Create new profile
app.post('/api/profiles/create', (req, res) => {
  const name = sanitizeName(req.body.name);
  if (!name) {
    return res.status(400).json({ success: false, error: 'Invalid profile name' });
  }
  
  exec(`"${VENV_NOTEBOOKLM}" profile create "${name}"`, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ success: false, error: stderr || error.message });
    }
    
    exec(`"${VENV_NOTEBOOKLM}" profile switch "${name}"`, (switchErr, switchOut, switchStderr) => {
      if (switchErr) {
        return res.status(500).json({ success: false, error: switchStderr || switchErr.message });
      }
      
      const loginProc = spawn(VENV_NOTEBOOKLM, ['login'], {
        detached: true,
        stdio: 'ignore'
      });
      loginProc.unref();
      
      res.json({ success: true, message: `Profile '${name}' created. Login triggered.` });
    });
  });
});

// Delete a profile
app.post('/api/profiles/delete', (req, res) => {
  const name = sanitizeName(req.body.name);
  if (!name || name === 'default') {
    return res.status(400).json({ success: false, error: 'Cannot delete default' });
  }
  
  exec(`echo y | "${VENV_NOTEBOOKLM}" profile delete "${name}"`, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ success: false, error: stderr || error.message });
    }
    res.json({ success: true, message: `Profile '${name}' deleted.` });
  });
});

// Get Workspace MD Files List (scans parent directory and MEMBERSHIP CONTENT SYSTEM)
app.get('/api/workspace-files', (req, res) => {
  const parentDir = path.join(__dirname, '..');
  const membershipDir = path.join(parentDir, 'MEMBERSHIP CONTENT SYSTEM');
  const draftDir = '/Users/soontorntachasakulnapaporn/Downloads/SepNewTrade_Project/Draft';
  
  let templates = [];
  try {
    if (fs.existsSync(TEMPLATES_FILE)) {
      templates = JSON.parse(fs.readFileSync(TEMPLATES_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Error loading templates in workspace-files:', e);
  }

  // Read parent folder
  let parentFiles = [];
  try {
    parentFiles = fs.readdirSync(parentDir).map(file => ({
      filename: file,
      relativePath: file,
      absolutePath: path.join(parentDir, file)
    }));
  } catch (e) {
    console.error('Failed to read parent dir:', e);
  }

  // Read membership folder
  let membershipFiles = [];
  try {
    if (fs.existsSync(membershipDir)) {
      membershipFiles = fs.readdirSync(membershipDir).map(file => ({
        filename: file,
        relativePath: `MEMBERSHIP CONTENT SYSTEM/${file}`,
        absolutePath: path.join(membershipDir, file)
      }));
    }
  } catch (e) {
    console.error('Failed to read membership dir:', e);
  }

  const allFiles = [...parentFiles, ...membershipFiles];

  // Get date filter from query param
  const targetDateStr = req.query.date || '';
  
  // Find the latest file date in the workspace using the actual file creation/modification time
  let latestDateStr = '';
  allFiles.forEach(file => {
    const name = file.filename.toLowerCase();
    if (name.endsWith('.md') && 
        name !== 'readme_notebooklm.md' && 
        name !== 'agents.md' && 
        name !== 'task.md' &&
        name !== 'implementation_plan.md' &&
        name !== 'walkthrough.md') {
      const stats = fs.statSync(file.absolutePath);
      const fileDateObj = stats.birthtime || stats.mtime;
      const yyyy = fileDateObj.getFullYear();
      const mm = String(fileDateObj.getMonth() + 1).padStart(2, '0');
      const dd = String(fileDateObj.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      if (!latestDateStr || dateStr > latestDateStr) {
        latestDateStr = dateStr;
      }
    }
  });

  // If no files with dates were found, default to today's local date
  if (!latestDateStr) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    latestDateStr = `${yyyy}-${mm}-${dd}`;
  }

  // Filter for markdown files and exclude config/status files
  let mdFiles = allFiles
    .filter(file => {
      const name = file.filename.toLowerCase();
      return name.endsWith('.md') && 
             name !== 'readme_notebooklm.md' && 
             name !== 'agents.md' && 
             name !== 'task.md' &&
             name !== 'implementation_plan.md' &&
             name !== 'walkthrough.md';
    })
    .map(file => {
      const stats = fs.statSync(file.absolutePath);
      
      // Parse date from filename first, fallback to stats.mtime/birthtime
      let actualFileDateStr = '';
      const dateMatch = file.filename.match(/(\d{4})_(\d{2})_(\d{2})/);
      if (dateMatch) {
        actualFileDateStr = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
      } else {
        const fileDateObj = stats.birthtime || stats.mtime;
        const yyyy = fileDateObj.getFullYear();
        const mm = String(fileDateObj.getMonth() + 1).padStart(2, '0');
        const dd = String(fileDateObj.getDate()).padStart(2, '0');
        actualFileDateStr = `${yyyy}-${mm}-${dd}`;
      }
      
      const fileDateObj = stats.birthtime || stats.mtime;
      return {
        filename: file.relativePath,
        path: file.absolutePath,
        created_at: fileDateObj,
        mtime: stats.mtime,
        actualFileDateStr: actualFileDateStr
      };
    });

  // Filter for files whose actual date matches targetDateStr
  if (targetDateStr) {
    mdFiles = mdFiles.filter(file => file.actualFileDateStr === targetDateStr);
  }

  // Sort by parsed date (newest first)
  mdFiles.sort((a, b) => b.created_at - a.created_at);
    
  res.json({ success: true, files: mdFiles, suggestedDate: targetDateStr || latestDateStr });
});

// Get Prompt Templates
app.get('/api/templates', (req, res) => {
  fs.readFile(TEMPLATES_FILE, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'Failed to read templates' });
    }
    res.json({ success: true, templates: JSON.parse(data) });
  });
});

// Save Prompt Templates
app.post('/api/templates/save', (req, res) => {
  const { templates } = req.body;
  if (!templates || !Array.isArray(templates)) {
    return res.status(400).json({ success: false, error: 'Invalid templates data' });
  }
  
  fs.writeFile(TEMPLATES_FILE, JSON.stringify(templates, null, 2), 'utf8', (err) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'Failed to save templates' });
    }
    res.json({ success: true, message: 'Templates saved successfully' });
  });
});

// Get Workflow Run Status
app.get('/api/workflow/status', (req, res) => {
  const workflowId = req.query.workflowId;
  if (workflowId && workflows[workflowId]) {
    return res.json(workflows[workflowId]);
  }
  
  const activeList = Object.values(workflows).map(w => ({
    id: w.id,
    title: w.title,
    status: w.status,
    progress: w.progress,
    currentStep: w.currentStep,
    error: w.error
  }));
  
  res.json({
    activeWorkflows: activeList,
    running: Object.values(workflows).some(w => w.running),
    progress: Object.values(workflows)[0]?.progress || 0,
    currentStep: Object.values(workflows)[0]?.currentStep || '',
    logs: Object.values(workflows)[0]?.logs || [],
    result: Object.values(workflows)[0]?.result || null,
    error: Object.values(workflows)[0]?.error || null
  });
});

// Approve and resume workflow
app.post('/api/workflow/approve', async (req, res) => {
  const { workflowId, content } = req.body;
  if (!workflowId || !workflows[workflowId]) {
    return res.status(400).json({ success: false, error: 'Workflow not found' });
  }
  
  const w = workflows[workflowId];
  if (w.status !== 'waiting_approval') {
    return res.status(400).json({ success: false, error: 'Workflow is not waiting for approval' });
  }
  
  try {
    fs.writeFileSync(w.actualFilePath, content, 'utf8');
    addWorkflowLog(workflowId, `[อนุมัติ] บันทึกเนื้อหาเรียบร้อยแล้ว ดำเนินการขั้นตอนที่ 3 ถัดไป...`);
    
    w.status = 'running';
    w.running = true;
    w.tempContent = '';
    
    // Resume from step 3
    runWorkflowPipelineFromStep3(workflowId);
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error approving workflow:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Cancel active workflow
app.post('/api/workflow/cancel', (req, res) => {
  const { workflowId } = req.body;
  if (workflowId && workflows[workflowId]) {
    workflows[workflowId].running = false;
    workflows[workflowId].status = 'failed';
    workflows[workflowId].error = 'กระบวนการถูกยกเลิกโดยผู้ใช้';
    addWorkflowLog(workflowId, `❌ กระบวนการทำงานนี้ถูกยกเลิกโดยผู้ใช้`);
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false, error: 'Workflow not found' });
  }
});

// Delete workflow from memory
app.post('/api/workflow/delete', (req, res) => {
  const { workflowId } = req.body;
  if (workflowId && workflows[workflowId]) {
    workflows[workflowId].running = false;
    delete workflows[workflowId];
    saveWorkflowsToDisk();
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false, error: 'Workflow not found' });
  }
});

// Scan a markdown file for stock tickers, extract written prices, and fetch real-time prices
app.get('/api/workflow/check-prices', async (req, res) => {
  const selectedFile = req.query.file;
  if (!selectedFile) {
    return res.status(400).json({ success: false, error: 'Missing file parameter' });
  }

  const filePath = path.join(__dirname, '..', selectedFile);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, error: 'File not found' });
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    // Ticker regex matches (EXCHANGE: TICKER)
    const tickerRegex = /\((NASDAQ|NYSE|AMEX|BKK|SET|NYSE-ARCA):\s*([A-Z0-9.]+)\)/gi;
    
    // Matches patterns like ปิดที่ $123.45, ราคา $123.45, ปิดตลาดปกติ: xxx (ปิดที่ $yyy), ราคาปัจจุบัน: $zzz
    const priceRegex = /(?:ราคาปัจจุบัน|ราคา|ปิดที่|ปิดตลาดที่|ระดับ|โซนราคา|ปิดที่ราคา)[^\$]*?\$([0-9,.]+)\b/i;
    const genericPriceRegex = /(?:\*\*)?\$([0-9,.]+)\b/i;
    
    const foundTickers = [];
    const seenTickers = new Set();

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let match;
      tickerRegex.lastIndex = 0;
      
      while ((match = tickerRegex.exec(line)) !== null) {
        const exchange = match[1].toUpperCase();
        const symbol = match[2].toUpperCase();
        const uniqueKey = symbol;
        
        if (seenTickers.has(uniqueKey)) continue;
        seenTickers.add(uniqueKey);
        
        let filePrice = null;
        let originalText = '';
        let targetLineIndex = -1;
        
        // Phase 1: Search current line + next 5 lines for high-confidence priceRegex
        for (let j = i; j < Math.min(i + 6, lines.length); j++) {
          const currentLine = lines[j];
          const priceMatch = priceRegex.exec(currentLine);
          if (priceMatch) {
            const rawVal = priceMatch[1].replace(/,/g, '');
            const parsedVal = parseFloat(rawVal);
            if (!isNaN(parsedVal)) {
              filePrice = parsedVal;
              originalText = priceMatch[0];
              targetLineIndex = j;
              break;
            }
          }
        }
        
        // Phase 2: If not found, fallback to genericPriceRegex in current line + next 5 lines
        if (targetLineIndex === -1) {
          for (let j = i; j < Math.min(i + 6, lines.length); j++) {
            const currentLine = lines[j];
            const cleanedLine = currentLine.replace(/\$[0-9,.]+[BMTbmt]\b/g, '');
            const priceMatch = genericPriceRegex.exec(cleanedLine);
            if (priceMatch) {
              const rawVal = priceMatch[1].replace(/,/g, '');
              const parsedVal = parseFloat(rawVal);
              if (!isNaN(parsedVal)) {
                filePrice = parsedVal;
                originalText = priceMatch[0];
                targetLineIndex = j;
                break;
              }
            }
          }
        }
        
        foundTickers.push({
          ticker: symbol,
          exchange: exchange,
          filePrice: filePrice,
          originalText: originalText,
          lineIndex: targetLineIndex,
          lineContent: targetLineIndex !== -1 ? lines[targetLineIndex] : ''
        });
      }
    }
    
    // Fetch Yahoo Finance prices in parallel
    const results = await Promise.all(foundTickers.map(async (item) => {
      let currentPrice = null;
      let deviationPercent = null;
      
      try {
        const fetchUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${item.ticker}`;
        const response = await fetch(fetchUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const data = await response.json();
        
        if (data.chart && data.chart.result && data.chart.result[0]) {
          const meta = data.chart.result[0].meta;
          currentPrice = meta.regularMarketPrice || meta.chartPreviousClose;
          
          if (item.filePrice && currentPrice) {
            deviationPercent = parseFloat((((currentPrice - item.filePrice) / item.filePrice) * 100).toFixed(2));
          }
        }
      } catch (err) {
        console.error(`Failed to fetch Yahoo Finance price for ${item.ticker}:`, err.message);
      }
      
      return {
        ...item,
        currentPrice: currentPrice,
        deviationPercent: deviationPercent
      };
    }));

    res.json({ success: true, tickers: results });
  } catch (err) {
    console.error('Error scanning file for prices:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update selected stock prices in the markdown file
app.post('/api/workflow/update-prices', (req, res) => {
  const { file, updates } = req.body;
  if (!file || !updates || !Array.isArray(updates)) {
    return res.status(400).json({ success: false, error: 'Missing required parameters (file, updates)' });
  }

  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, error: 'File not found' });
  }

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    updates.forEach(u => {
      const { lineIndex, oldPrice, newPrice } = u;
      
      if (lineIndex !== undefined && lineIndex >= 0 && lineIndex < lines.length) {
        const line = lines[lineIndex];
        const oldPriceStr = String(oldPrice);
        const newPriceStr = parseFloat(newPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        
        // Escape regex characters for safety
        const escPlain = oldPriceStr.replace('.', '\\.');
        const formattedOldPrice = parseFloat(oldPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const escForm = formattedOldPrice.replace('.', '\\.').replace(',', ',?');
        
        const pattern = new RegExp(`\\$(${escPlain}|${escForm})\\b`, 'g');
        lines[lineIndex] = line.replace(pattern, '$$' + newPriceStr);
      }
    });

    const updatedContent = lines.join('\n');
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating file prices:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Run Video Production Workflow Pipeline
app.post('/api/workflow/run', async (req, res) => {
  const { 
    templateId, 
    selectedFile, 
    dateStr, 
    searchPrompt, 
    audioPrompt, 
    reportPrompt, 
    infoPrompt, 
    genFacebook, 
    resumeWorkflow,
    pauseForReview 
  } = req.body;
  
  const shouldGenFacebook = genFacebook === true || genFacebook === 'true' || genFacebook === undefined;
  const shouldResume = resumeWorkflow === true || resumeWorkflow === 'true' || resumeWorkflow === undefined;
  const shouldPause = pauseForReview === true || pauseForReview === 'true';
  
  if (!templateId || !dateStr) {
    return res.status(400).json({ success: false, error: 'Missing required parameters (templateId, dateStr)' });
  }
  if (!selectedFile && !searchPrompt) {
    return res.status(400).json({ success: false, error: 'ต้องเลือกไฟล์บทวิเคราะห์ หรือระบุ Prompt ในการค้นหาข่าว' });
  }
  
  // Set up output directory
  const draftDir = '/Users/soontorntachasakulnapaporn/Downloads/SepNewTrade_Project/Draft';
  try {
    fs.mkdirSync(draftDir, { recursive: true });
  } catch (err) {
    console.error('Failed to create Draft directory:', err);
  }
  
  // Set up filenames
  const fileDate = dateStr.replace(/-/g, '_');
  let showNameClean = templateId;
  try {
    if (fs.existsSync(TEMPLATES_FILE)) {
      const templatesData = JSON.parse(fs.readFileSync(TEMPLATES_FILE, 'utf8'));
      const template = templatesData.find(t => t.id === templateId);
      if (template) {
        showNameClean = template.name
          .replace(/\s*\(.*?\)/g, '')
          .replace(/\s+/g, '_')
          .replace(/[^a-zA-Z0-9_\u0e00-\u0e7f]/g, '');
      }
    }
  } catch (e) {
    console.error('Error looking up template name in workflow:', e);
  }

  // Pre-extract ticker if a file is selected (useful for custom filename formats)
  let tickerPrefix = '';
  if (selectedFile) {
    const mdFilePath = path.join(__dirname, '..', selectedFile);
    if (fs.existsSync(mdFilePath)) {
      try {
        const mdContent = fs.readFileSync(mdFilePath, 'utf8');
        const extracted = extractTicker(mdContent);
        if (extracted && extracted !== 'หุ้นสหรัฐฯ') {
          tickerPrefix = `${extracted}_`;
        }
      } catch (err) {
        console.error('Error extracting ticker for custom filename:', err);
      }
    }
  }

  let baseFilename = `${showNameClean}_${fileDate}`;
  if (showNameClean === 'หุ้นในดวงใจ' || showNameClean === 'ขอมา_จัดให้') {
    if (tickerPrefix) {
      baseFilename = `${tickerPrefix}${showNameClean}_${fileDate}`;
    }
  }
  
  const outputAudioPath = path.join(draftDir, `${baseFilename}.mp3`);
  const outputInfoPath = path.join(draftDir, `${baseFilename}.png`);
  const outputReportPath = path.join(draftDir, `${baseFilename}.md`);
  
  let mdFilePath = '';
  let sourceTitle = '';
  if (selectedFile) {
    mdFilePath = path.join(__dirname, '..', selectedFile);
    sourceTitle = `${path.basename(selectedFile).replace('.md', '')}_Source`;
  }
  
  // Generate unique workflow ID
  const workflowId = `wf_${Date.now()}`;
  
  const w = {
    id: workflowId,
    templateId,
    selectedFile,
    dateStr,
    searchPrompt,
    audioPrompt,
    reportPrompt,
    infoPrompt,
    genFacebook: shouldGenFacebook,
    resumeWorkflow: shouldResume,
    pauseForReview: shouldPause,
    
    title: `${showNameClean.replace(/_/g, ' ')} (${dateStr})`,
    running: true,
    status: 'running', // 'running', 'waiting_approval', 'completed', 'failed'
    progress: 5,
    currentStep: 'ตรวจสอบความพร้อม...',
    logs: [],
    result: null,
    error: null,
    
    // File paths and titles
    actualFile: selectedFile,
    actualFilePath: mdFilePath,
    actualSourceTitle: sourceTitle,
    showNameClean: showNameClean,
    baseFilename: baseFilename,
    outputAudioPath: outputAudioPath,
    outputInfoPath: outputInfoPath,
    outputReportPath: outputReportPath,
    draftDir: draftDir,
    
    tempContent: ''
  };
  
  workflows[workflowId] = w;
  
  res.json({ success: true, workflowId: workflowId });
  
  // Start pipeline in background
  runWorkflowPipeline(workflowId);
});

// Async pipeline execution helpers
async function runWorkflowPipeline(workflowId) {
  const w = workflows[workflowId];
  if (!w) return;
  
  try {
    // 1. Check Auth Status
    addWorkflowLog(workflowId, `ขั้นตอนที่ 1/8: ตรวจสอบความถูกต้องของการเชื่อมต่อบัญชี Google...`);
    const activeProfile = await getActiveProfile();
    const storagePath = path.join(PROFILES_DIR, activeProfile, 'storage_state.json');
    if (!fs.existsSync(storagePath)) {
      throw new Error(`บัญชี Google '${activeProfile}' ยังไม่ได้ล็อกอิน กรุณาล็อกอินก่อนเริ่มรันกระบวนการ`);
    }
    
    // 2. Read input file or run Gemini Deep Research
    w.progress = 15;
    
    if (w.actualFile) {
      w.currentStep = 'กำลังอ่านไฟล์บทวิเคราะห์...';
      addWorkflowLog(workflowId, `ขั้นตอนที่ 2/8: กำลังตรวจสอบไฟล์บทวิเคราะห์ในเครื่อง: ${w.actualFile}...`);
      if (!fs.existsSync(w.actualFilePath)) {
        throw new Error(`ไม่พบไฟล์บทวิเคราะห์ ${w.selectedFile} ในโฟลเดอร์หลักของโปรเจกต์`);
      }
    } else {
      w.currentStep = 'กำลังทำ Gemini Deep Research...';
      addWorkflowLog(workflowId, `ขั้นตอนที่ 2/8: เริ่มทำ Deep Research วิจัยรวบรวมข่าวผ่าน Gemini...`);
      
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('กรุณาระบุ GEMINI_API_KEY ในไฟล์ .env ของโฟลเดอร์ notebooklm-manager ก่อนดำเนินการ');
      }
      
      // Calculate output filename
      const fileDate = w.dateStr.replace(/-/g, '_');
      let generatedFilename = '';
      if (w.templateId === 'daily') {
        generatedFilename = `market_summary_${fileDate}.md`;
      } else if (w.templateId === 'weekly') {
        generatedFilename = `global_market_recap_${fileDate}.md`;
      } else if (w.templateId === 'whale') {
        generatedFilename = `whale_flow_analysis_${fileDate}.md`;
      } else {
        generatedFilename = `${w.templateId}_${fileDate}.md`;
      }
      
      const generatedFilePath = path.join(__dirname, '..', generatedFilename);
      const geminiScriptPath = path.join(__dirname, '..', 'gemini_research.py');
      
      addWorkflowLog(workflowId, `รันโมเดล Gemini เพื่อค้นหาข่าวและวิเคราะห์ตลาดลงไฟล์: ${generatedFilename}...`);
      
      const escapedPrompt = w.searchPrompt.replace(/"/g, '\\"').replace(/\n/g, ' ');
      const geminiCmd = `"${VENV_PYTHON}" "${geminiScriptPath}" --template-id "${w.templateId}" --prompt "${escapedPrompt}" --date "${w.dateStr}" --output "${generatedFilePath}"`;
      
      await runCmd(geminiCmd);
      addWorkflowLog(workflowId, `สร้างและเซฟรายงานการเงินสำเร็จ: ${generatedFilename}`);
      
      // Rebuild website index and push to GitHub
      w.progress = 20;
      w.currentStep = 'กำลังบันทึกลงเว็บและ Push ขึ้น GitHub...';
      addWorkflowLog(workflowId, `ขั้นตอนที่ 2.5/8: กำลังอัปเดตสารบัญข่าวบนเว็บและดาวน์โหลดซิงค์ขึ้น GitHub...`);
      
      const parentDir = path.join(__dirname, '..');
      const syncCmd = `node "${path.join(parentDir, 'generate-index.js')}" && git add . && git commit -m "Auto-update reports" && git push`;
      
      try {
        await runCmd(syncCmd);
        addWorkflowLog(workflowId, `อัปเดตสารบัญเว็บสำเร็จและ Push ขึ้น GitHub เรียบร้อยแล้ว!`);
      } catch (syncErr) {
        addWorkflowLog(workflowId, `⚠️ คำเตือน: ระบบพุช GitHub ล้มเหลว (ข้ามไปรันขั้นตอนถัดไป): ${syncErr.message}`);
      }
      
      // Override parameters to ingest this generated file
      w.actualFile = generatedFilename;
      w.actualFilePath = generatedFilePath;
      w.actualSourceTitle = `${path.basename(w.actualFile).replace('.md', '')}_Source`;
    }
    
    // Pause for review if requested
    if (w.pauseForReview) {
      w.status = 'waiting_approval';
      w.running = false;
      w.currentStep = 'รอตรวจทานและอนุมัติเนื้อหา...';
      w.progress = 20;
      w.tempContent = fs.readFileSync(w.actualFilePath, 'utf8');
      addWorkflowLog(workflowId, `[รอการอนุมัติ] ค้นหาข้อมูลและเรียบเรียงร่างรายงานสำเร็จแล้ว กรุณาตรวจทานหน้าเว็บและอนุมัติเพื่อรันต่อ`);
      return; // Exit here
    }
    
    // Proceed directly if no pause requested
    runWorkflowPipelineFromStep3(workflowId);
    
  } catch (err) {
    handleWorkflowError(workflowId, err);
  }
}

async function runWorkflowPipelineFromStep3(workflowId) {
  const w = workflows[workflowId];
  if (!w) return;
  
  try {
    const { active: initialProfile, authenticated: authProfiles } = await getAuthenticatedProfiles();
    let currentProfile = initialProfile;
    const maxAttempts = authProfiles.length;
    let success = false;
    let lastError = null;
    let fbPostContent = '';
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      if (!w.running) {
        // Canceled early by user
        return;
      }
      let notebookId = null;
      try {
        if (maxAttempts > 1) {
          addWorkflowLog(workflowId, `[บัญชี: ${currentProfile}] เริ่มต้นการประมวลผลระบบ NotebookLM (พยายามครั้งที่ ${attempt}/${maxAttempts})...`);
        }
        
        // 3. Create Notebook or Reuse Existing
        w.progress = 25;
        w.currentStep = `[${currentProfile}] กำลังเตรียม Notebook ใน NotebookLM...`;
        const notebookTitle = `${w.showNameClean.replace(/_/g, ' ')} — ${w.dateStr}`;
        
        if (w.resumeWorkflow) {
          try {
            addWorkflowLog(workflowId, `กำลังสแกนค้นหา Notebook เดิมสำหรับหัวข้อ: "${notebookTitle}"...`);
            const listRes = await runCmd(`"${VENV_NOTEBOOKLM}" -p "${currentProfile}" list --json`);
            const notebooksData = JSON.parse(listRes.stdout);
            if (notebooksData && Array.isArray(notebooksData.notebooks)) {
              const existingNotebook = notebooksData.notebooks.find(n => n.title === notebookTitle);
              if (existingNotebook) {
                notebookId = existingNotebook.id;
                addWorkflowLog(workflowId, `พบ Notebook เดิมในระบบเรียบร้อยแล้ว (ID: ${notebookId}) ข้ามขั้นตอนการสร้างใหม่!`);
              }
            }
          } catch (scanErr) {
            console.error('Failed to scan existing notebooks:', scanErr);
            addWorkflowLog(workflowId, `⚠️ คำเตือน: สแกนค้นหา Notebook เดิมขัดข้อง จะใช้วิธีสร้างใหม่...`);
          }
        }
        
        if (!notebookId) {
          addWorkflowLog(workflowId, `ไม่พบ Notebook เดิม หรือผู้เลือกตั้งค่าให้เริ่มใหม่ กำลังสร้าง Notebook ใหม่: "${notebookTitle}"...`);
          const createRes = await runCmd(`"${VENV_NOTEBOOKLM}" -p "${currentProfile}" create "${notebookTitle}"`);
          const match = createRes.stdout.match(/Created notebook:\s+([a-f0-9-]+)\s+-/);
          if (!match) {
            throw new Error('ไม่สามารถค้นหา Notebook ID จากผลลัพธ์ของคำสั่งได้:\n' + createRes.stdout);
          }
          notebookId = match[1];
          addWorkflowLog(workflowId, `สร้าง Notebook ใหม่สำเร็จ ID: ${notebookId}`);
        }
        
        // 4. Ingest source
        w.progress = 40;
        w.currentStep = `[${currentProfile}] กำลังนำเข้าแหล่งข้อมูล...`;
        
        let hasSources = false;
        if (w.resumeWorkflow && notebookId) {
          try {
            addWorkflowLog(workflowId, `กำลังตรวจสอบแหล่งข้อมูลใน Notebook...`);
            const sourcesRes = await runCmd(`"${VENV_NOTEBOOKLM}" -p "${currentProfile}" source list -n ${notebookId} --json`);
            const sourcesList = JSON.parse(sourcesRes.stdout);
            if (sourcesList && Array.isArray(sourcesList.sources) && sourcesList.sources.length > 0) {
              hasSources = true;
            } else if (Array.isArray(sourcesList) && sourcesList.length > 0) {
              hasSources = true;
            }
          } catch (sourcesErr) {
            console.error('Failed to list sources:', sourcesErr);
          }
        }
        
        if (hasSources) {
          addWorkflowLog(workflowId, `พบข้อมูลแหล่งอ้างอิงเดิมใน Notebook เรียบร้อยแล้ว ข้ามการนำเข้าข้อมูลเพื่อประหยัดโควตา!`);
        } else {
          addWorkflowLog(workflowId, `กำลังนำเข้าเนื้อหาจากไฟล์ ${w.actualFile} สู่ NotebookLM...`);
          let tempTxtFilePath = '';
          if (w.actualFilePath.toLowerCase().endsWith('.md')) {
            tempTxtFilePath = w.actualFilePath.replace(/\.md$/i, '.txt');
            fs.copyFileSync(w.actualFilePath, tempTxtFilePath);
          }
          
          const fileToUpload = tempTxtFilePath || w.actualFilePath;
          try {
            await runCmd(`"${VENV_NOTEBOOKLM}" -p "${currentProfile}" source add -n ${notebookId} --title "${w.actualSourceTitle}" "${fileToUpload}"`);
          } finally {
            if (tempTxtFilePath) {
              try {
                if (fs.existsSync(tempTxtFilePath)) {
                  fs.unlinkSync(tempTxtFilePath);
                }
              } catch (err) {
                console.error('Failed to clean up temp text file:', err);
              }
            }
          }
          addWorkflowLog(workflowId, `นำเข้าข้อมูลเนื้อหาบทวิเคราะห์ลงสู่ NotebookLM เรียบร้อยแล้ว`);
        }
        
        // Extract ticker and date from report for prompt replacement
        let resolvedAudioPrompt = w.audioPrompt;
        let resolvedReportPrompt = w.reportPrompt;
        let resolvedInfoPrompt = w.infoPrompt;
        
        try {
          if (fs.existsSync(w.actualFilePath)) {
            const mdContent = fs.readFileSync(w.actualFilePath, 'utf8');
            const ticker = extractTicker(mdContent);
            const thaiDate = formatThaiDate(w.dateStr);
            
            addWorkflowLog(workflowId, `ระบบสแกนข้อมูลพบ Ticker: ${ticker} | วันที่: ${thaiDate}`);
            
            // Replace [TICKER] (case-insensitive)
            resolvedAudioPrompt = resolvedAudioPrompt.replace(/\[TICKER\]/gi, ticker);
            resolvedReportPrompt = resolvedReportPrompt.replace(/\[TICKER\]/gi, ticker);
            resolvedInfoPrompt = resolvedInfoPrompt.replace(/\[TICKER\]/gi, ticker);
            
            // Replace [วัน เดือน ปี] (supports spaces, slashes or dashes)
            const datePattern = /\[วัน\s*[\/\-\s]?\s*เดือน\s*[\/\-\s]?\s*ปี\]/g;
            resolvedAudioPrompt = resolvedAudioPrompt.replace(datePattern, thaiDate);
            resolvedReportPrompt = resolvedReportPrompt.replace(datePattern, thaiDate);
            resolvedInfoPrompt = resolvedInfoPrompt.replace(datePattern, thaiDate);
          }
        } catch (parseErr) {
          console.error('Error parsing placeholders:', parseErr);
          addWorkflowLog(workflowId, `⚠️ คำเตือน: ระบบแทนที่ตัวแปร Ticker / วันที่ ขัดข้อง: ${parseErr.message}`);
        }
        
        if (!w.running) return;
        
        // 5. Generate Audio Overview
        w.progress = 55;
        w.currentStep = `[${currentProfile}] กำลังประมวลผล Audio Overview...`;
        
        let audioSuccess = false;
        if (w.resumeWorkflow && fs.existsSync(w.outputAudioPath)) {
          addWorkflowLog(workflowId, `พบไฟล์เสียงเดิมที่ดาวน์โหลดไว้ในเครื่องแล้วที่: ${w.outputAudioPath} (ข้ามขั้นตอนการประมวลผลเสียง)`);
          audioSuccess = true;
        } else if (w.resumeWorkflow) {
          try {
            addWorkflowLog(workflowId, `พยายามดาวน์โหลดไฟล์เสียงที่มีอยู่ใน Notebook...`);
            await runCmdWithRetry(`"${VENV_NOTEBOOKLM}" -p "${currentProfile}" download audio -n ${notebookId} --latest --force "${w.outputAudioPath}"`, 1, 1000);
            addWorkflowLog(workflowId, `ดาวน์โหลดไฟล์เสียงสำเร็จรูปสำเร็จและเซฟไว้ที่: ${w.outputAudioPath}`);
            audioSuccess = true;
          } catch (dlErr) {
            addWorkflowLog(workflowId, `ไม่พบไฟล์เสียงสำเร็จรูปในคลาวด์ กำลังเริ่มขั้นตอนสร้างเสียงใหม่...`);
          }
        }
        
        if (!audioSuccess) {
          addWorkflowLog(workflowId, `ขั้นตอนที่ 5/8: กำลังประมวลผลสร้างเสียง Audio Overview (Deep Dive, ภาษาไทย)...`);
          addWorkflowLog(workflowId, `Prompt บังคับสำหรับบทสนทนา: "${resolvedAudioPrompt}"`);
          const tempAudioPromptPath = path.join(__dirname, `temp_prompt_audio_${Date.now()}.txt`);
          fs.writeFileSync(tempAudioPromptPath, resolvedAudioPrompt, 'utf8');
          try {
            await runCmd(`"${VENV_NOTEBOOKLM}" -p "${currentProfile}" generate audio -n ${notebookId} --format deep-dive --language th --wait --prompt-file "${tempAudioPromptPath}"`);
          } finally {
            try { fs.unlinkSync(tempAudioPromptPath); } catch (_) {}
          }
          addWorkflowLog(workflowId, `เสียงสนทนาประมวลผลเสร็จสิ้น กำลังดาวน์โหลดไฟล์เสียง...`);
          await runCmdWithRetry(`"${VENV_NOTEBOOKLM}" -p "${currentProfile}" download audio -n ${notebookId} --latest --force "${w.outputAudioPath}"`);
          addWorkflowLog(workflowId, `ดาวน์โหลดเสียงสำเร็จและเซฟไว้ที่: ${w.outputAudioPath}`);
        }
        
        if (!w.running) return;
        
        // 6. Generate Report (Facebook post)
        if (w.genFacebook) {
          let reportSuccess = false;
          if (w.resumeWorkflow && fs.existsSync(w.outputReportPath)) {
            addWorkflowLog(workflowId, `พบไฟล์รายงานโพสต์ Facebook เดิมที่ดาวน์โหลดไว้ในเครื่องแล้วที่: ${w.outputReportPath} (ข้ามขั้นตอนการประมวลผลรายงาน)`);
            fbPostContent = fs.readFileSync(w.outputReportPath, 'utf8');
            reportSuccess = true;
          } else if (w.resumeWorkflow) {
            try {
              addWorkflowLog(workflowId, `พยายามดาวน์โหลดรายงานโพสต์ Facebook ที่มีอยู่ใน Notebook...`);
              await runCmdWithRetry(`"${VENV_NOTEBOOKLM}" -p "${currentProfile}" download report -n ${notebookId} --latest --force "${w.outputReportPath}"`, 1, 1000);
              fbPostContent = fs.readFileSync(w.outputReportPath, 'utf8');
              addWorkflowLog(workflowId, `ดาวน์โหลดรายงานโพสต์ Facebook สำเร็จรูปสำเร็จและเซฟไว้ที่: ${w.outputReportPath}`);
              reportSuccess = true;
            } catch (dlErr) {
              addWorkflowLog(workflowId, `ไม่พบรายงานโพสต์ Facebook สำเร็จรูปในคลาวด์ กำลังเริ่มขั้นตอนสร้างรายงานใหม่...`);
            }
          }
          
          if (!reportSuccess) {
            w.progress = 70;
            w.currentStep = `[${currentProfile}] กำลังสร้างเนื้อหาโพสต์ Facebook...`;
            addWorkflowLog(workflowId, `ขั้นตอนที่ 6/8: กำลังสร้างรายงาน Custom Report สำหรับทำโพสต์ Facebook...`);
            addWorkflowLog(workflowId, `Prompt: "${resolvedReportPrompt}"`);
            const tempReportPromptPath = path.join(__dirname, `temp_prompt_report_${Date.now()}.txt`);
            fs.writeFileSync(tempReportPromptPath, resolvedReportPrompt, 'utf8');
            try {
              await runCmd(`"${VENV_NOTEBOOKLM}" -p "${currentProfile}" generate report -n ${notebookId} --format custom --language th --wait --prompt-file "${tempReportPromptPath}"`);
            } finally {
              try { fs.unlinkSync(tempReportPromptPath); } catch (_) {}
            }
            addWorkflowLog(workflowId, `รายงานประมวลผลเสร็จสิ้น กำลังดาวน์โหลดเนื้อหารายงาน...`);
            await runCmdWithRetry(`"${VENV_NOTEBOOKLM}" -p "${currentProfile}" download report -n ${notebookId} --latest --force "${w.outputReportPath}"`);
            addWorkflowLog(workflowId, `บันทึกรายงานสำรองสำเร็จไว้ที่: ${w.outputReportPath}`);
            
            fbPostContent = fs.readFileSync(w.outputReportPath, 'utf8');
          }
        } else {
          w.progress = 70;
          w.currentStep = `[${currentProfile}] ข้ามขั้นตอนการสร้างเนื้อหาโพสต์ Facebook...`;
          addWorkflowLog(workflowId, `ขั้นตอนที่ 6/8: [ข้าม] ข้ามขั้นตอนการสร้างเนื้อหาโพสต์ Facebook ตามที่ตั้งค่าไว้`);
          fbPostContent = 'ข้ามการสร้างเนื้อหาสำหรับโพสต์ Facebook (User disabled)';
        }
        
        if (!w.running) return;
        
        // 7. Generate Infographic
        let infoSuccess = false;
        if (w.resumeWorkflow && fs.existsSync(w.outputInfoPath)) {
          addWorkflowLog(workflowId, `พบไฟล์รูปภาพอินโฟกราฟิกเดิมที่ดาวน์โหลดไว้ในเครื่องแล้วที่: ${w.outputInfoPath} (ข้ามขั้นตอนการประมวลผลภาพ)`);
          infoSuccess = true;
        } else if (w.resumeWorkflow) {
          try {
            addWorkflowLog(workflowId, `พยายามดาวน์โหลดอินโฟกราฟิกที่มีอยู่ใน Notebook...`);
            await runCmdWithRetry(`"${VENV_NOTEBOOKLM}" -p "${currentProfile}" download infographic -n ${notebookId} --latest --force "${w.outputInfoPath}"`, 1, 1000);
            addWorkflowLog(workflowId, `ดาวน์โหลดรูปภาพอินโฟกราฟิกสำเร็จรูปสำเร็จและเซฟไว้ที่: ${w.outputInfoPath}`);
            infoSuccess = true;
          } catch (dlErr) {
            addWorkflowLog(workflowId, `ไม่พบรูปภาพอินโฟกราฟิกสำเร็จรูปในคลาวด์ กำลังเริ่มขั้นตอนสร้างภาพใหม่...`);
          }
        }
        
        if (!infoSuccess) {
          w.progress = 85;
          w.currentStep = `[${currentProfile}] กำลังสร้างรูปภาพ Infographic...`;
          addWorkflowLog(workflowId, `ขั้นตอนที่ 7/8: กำลังประมวลผลสร้าง Infographic (Landscape, สไตล์ Auto)...`);
          addWorkflowLog(workflowId, `Prompt: "${resolvedInfoPrompt}"`);
          const tempInfoPromptPath = path.join(__dirname, `temp_prompt_info_${Date.now()}.txt`);
          fs.writeFileSync(tempInfoPromptPath, resolvedInfoPrompt, 'utf8');
          try {
            await runCmd(`"${VENV_NOTEBOOKLM}" -p "${currentProfile}" generate infographic -n ${notebookId} --orientation landscape --detail standard --language th --wait --prompt-file "${tempInfoPromptPath}"`);
          } finally {
            try { fs.unlinkSync(tempInfoPromptPath); } catch (_) {}
          }
          addWorkflowLog(workflowId, `รูปภาพอินโฟกราฟิกประมวลผลเสร็จสิ้น กำลังดาวน์โหลดรูปภาพ...`);
          await runCmdWithRetry(`"${VENV_NOTEBOOKLM}" -p "${currentProfile}" download infographic -n ${notebookId} --latest --force "${w.outputInfoPath}"`);
          addWorkflowLog(workflowId, `ดาวน์โหลดรูปภาพอินโฟกราฟิกสำเร็จและเซฟไว้ที่: ${w.outputInfoPath}`);
        }
        
        // 8. Finished!
        w.progress = 100;
        w.currentStep = 'เสร็จสมบูรณ์!';
        w.status = 'completed';
        addWorkflowLog(workflowId, `ขั้นตอนที่ 8/8: ทำงานเสร็จสมบูรณ์ ไฟล์ทั้งหมดถูกดาวน์โหลดลงในโฟลเดอร์ Draft เรียบร้อยแล้ว!`);
        
        w.running = false;
        w.result = {
          audioPath: w.outputAudioPath,
          infoPath: w.outputInfoPath,
          fbPost: fbPostContent
        };
        
        success = true;
        break; // Success! Break retry loop
        
      } catch (err) {
        lastError = err;
        console.error(`[บัญชี: ${currentProfile}] ช่วงที่เกิดข้อติดขัด:`, err);
        
        addWorkflowLog(workflowId, `[บัญชี: ${currentProfile}] ระบบค้างหรือขัดข้อง: จะคงรักษา Notebook ID: ${notebookId || 'N/A'} เพื่อให้คุณสามารถกดรันประมวลผลต่อ (Resume) ได้ทันทีโดยไม่ต้องเริ่มนับหนึ่งใหม่`);
        
        if (isQuotaError(err) && attempt < maxAttempts) {
          const currentIdx = authProfiles.indexOf(currentProfile);
          const nextIdx = (currentIdx + 1) % authProfiles.length;
          const nextProfile = authProfiles[nextIdx];
          
          addWorkflowLog(workflowId, `⚠️ ตรวจพบโควตาเต็มสำหรับบัญชี '${currentProfile}'!`);
          addWorkflowLog(workflowId, `🔄 กำลังสลับบัญชีอัตโนมัติไปยังบัญชีถัดไป: '${nextProfile}'...`);
          
          try {
            await runCmd(`"${VENV_NOTEBOOKLM}" -p "${currentProfile}" profile switch "${nextProfile}"`);
            currentProfile = nextProfile;
            addWorkflowLog(workflowId, `✅ สลับบัญชีสำเร็จเป็น '${nextProfile}'! จะเริ่มกระบวนการประมวลผลใหม่อีกครั้ง...`);
          } catch (switchErr) {
            addWorkflowLog(workflowId, `❌ สลับบัญชีล้มเหลว: ${switchErr.message}`);
            throw err;
          }
        } else {
          throw err;
        }
      }
    }
    
    if (!success && lastError) {
      throw lastError;
    }
  } catch (err) {
    handleWorkflowError(workflowId, err);
  }
}
app.get('/api/notebooks', (req, res) => {
  exec(`"${VENV_PYTHON}" "${SCRIPT_PATH}" --list-json`, (error, stdout, stderr) => {
    if (error) {
      console.error('Error executing script:', stderr);
      return res.status(500).json({ success: false, error: stderr || error.message });
    }
    
    try {
      const result = JSON.parse(stdout);
      if (result.success) {
        res.json({ success: true, notebooks: result.notebooks });
      } else {
        res.status(400).json({ success: false, error: result.error });
      }
    } catch (parseError) {
      res.status(500).json({ success: false, error: 'Failed to parse notebooks list' });
    }
  });
});

// Delete selected notebooks
app.post('/api/delete', async (req, res) => {
  const { ids } = req.body;
  
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, error: 'No notebook IDs provided' });
  }
  
  console.log(`Deleting notebooks...`);
  const results = [];
  
  for (const id of ids) {
    const success = await new Promise((resolve) => {
      exec(`"${VENV_PYTHON}" "${SCRIPT_PATH}" --delete "${id}"`, (error, stdout, stderr) => {
        if (error) {
          resolve({ id, success: false, error: stderr || error.message });
          return;
        }
        try {
          const resObj = JSON.parse(stdout);
          if (resObj.success) {
            resolve({ id, success: true });
          } else {
            resolve({ id, success: false, error: resObj.error });
          }
        } catch (e) {
          resolve({ id, success: false, error: 'Parse error' });
        }
      });
    });
    results.push(success);
    await new Promise(r => setTimeout(r, 600));
  }
  
  const successfulCount = results.filter(r => r.success).length;
  res.json({
    success: true,
    total: ids.length,
    deleted: successfulCount,
    details: results
  });
});

app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(` NotebookLM Manager Web App with Profile Switcher`);
  console.log(` URL: http://localhost:${PORT}`);
  console.log(`=================================================`);
});
