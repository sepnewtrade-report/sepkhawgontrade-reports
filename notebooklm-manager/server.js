require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { exec, spawn } = require('child_process');
const path = require('path');
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

  // Find the latest file date in the workspace
  let latestDateStr = '';
  allFiles.forEach(file => {
    const name = file.filename.toLowerCase();
    if (name.endsWith('.md') && 
        name !== 'readme_notebooklm.md' && 
        name !== 'agents.md' && 
        name !== 'task.md' &&
        name !== 'implementation_plan.md' &&
        name !== 'walkthrough.md') {
      const dateMatch = file.filename.match(/(\d{4})[-_](\d{2})[-_](\d{2})/);
      if (dateMatch) {
        const dateStr = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
        if (!latestDateStr || dateStr > latestDateStr) {
          latestDateStr = dateStr;
        }
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

  // Get date filter from query param, default to latest report date
  let targetDateStr = req.query.date;
  if (!targetDateStr) {
    targetDateStr = latestDateStr;
  }
  
  const targetDateDash = targetDateStr.replace(/_/g, '-');
  const targetDateUnderscore = targetDateStr.replace(/-/g, '_');

  // Filter for markdown files and exclude config/status files
  const mdFiles = allFiles
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
      
      // Parse date from filename (e.g. YYYY_MM_DD or YYYY-MM-DD)
      const dateMatch = file.filename.match(/(\d{4})[-_](\d{2})[-_](\d{2})/);
      let parsedDate = stats.mtime;
      if (dateMatch) {
        const dateObj = new Date(`${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`);
        if (!isNaN(dateObj.getTime())) {
          parsedDate = dateObj;
        }
      }
      
      return {
        filename: file.relativePath,
        path: file.absolutePath,
        created_at: parsedDate,
        mtime: stats.mtime
      };
    })
    // Filter for files whose names match targetDate string
    .filter(file => {
      return file.filename.includes(targetDateDash) || file.filename.includes(targetDateUnderscore);
    })
    // Filter out files that already have clips generated in Draft folder
    .filter(file => {
      const baseName = path.basename(file.filename);
      const dateMatch = baseName.match(/(\d{4})[-_](\d{2})[-_](\d{2})/);
      if (!dateMatch) return true; // Keep files without date for safety
      
      const dateStr = `${dateMatch[1]}_${dateMatch[2]}_${dateMatch[3]}`;
      
      // Find template mapping
      let matchedTemplate = null;
      if (baseName.startsWith('market_summary_')) {
        matchedTemplate = templates.find(t => t.id === 'daily');
      } else if (baseName.startsWith('global_market_recap_') || baseName.startsWith('global_market_recap_thai_')) {
        matchedTemplate = templates.find(t => t.id === 'weekly');
      } else if (baseName.startsWith('whale_flow_analysis_')) {
        matchedTemplate = templates.find(t => t.id === 'whale');
      } else {
        // Custom templates match prefix
        matchedTemplate = templates.find(t => baseName.toLowerCase().startsWith(t.id + '_'));
      }
      
      let showNameClean = '';
      if (matchedTemplate) {
        showNameClean = matchedTemplate.name
          .replace(/\s*\(.*?\)/g, '')
          .replace(/\s+/g, '_')
          .replace(/[^a-zA-Z0-9_\u0e00-\u0e7f]/g, '');
      } else {
        // Fallback to filename prefix before date
        showNameClean = baseName.substring(0, dateMatch.index).replace(/_$/, '');
      }
      
      const expectedAudioPath = path.join(draftDir, `${showNameClean}_${dateStr}.mp3`);
      
      // Exclude file if matching audio clip already exists
      const hasClip = fs.existsSync(expectedAudioPath);
      return !hasClip;
    })
    // Sort by parsed date (newest first)
    .sort((a, b) => b.created_at - a.created_at);
    
  res.json({ success: true, files: mdFiles, suggestedDate: targetDateStr });
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
  res.json(activeWorkflowState);
});

// Run Video Production Workflow Pipeline
app.post('/api/workflow/run', async (req, res) => {
  if (activeWorkflowState.running) {
    return res.status(400).json({ success: false, error: 'Another workflow is already running' });
  }
  
  const { templateId, selectedFile, dateStr, searchPrompt, audioPrompt, reportPrompt, infoPrompt } = req.body;
  
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
  const baseFilename = `${showNameClean}_${fileDate}`;
  
  const outputAudioPath = path.join(draftDir, `${baseFilename}.mp3`);
  const outputInfoPath = path.join(draftDir, `${baseFilename}.png`);
  const outputReportPath = path.join(draftDir, `${baseFilename}.md`);
  
  let mdFilePath = '';
  let sourceTitle = '';
  if (selectedFile) {
    mdFilePath = path.join(__dirname, '..', selectedFile);
    sourceTitle = `${path.basename(selectedFile).replace('.md', '')}_Source`;
  }
  
  // Start workflow asynchronously
  activeWorkflowState = {
    running: true,
    progress: 5,
    currentStep: 'ตรวจสอบความพร้อม...',
    logs: [],
    result: null,
    error: null
  };
  
  res.json({ success: true, message: 'Workflow started' });
  
  try {
    // 1. Check Auth Status
    addLog(`ขั้นตอนที่ 1/8: ตรวจสอบความถูกต้องของการเชื่อมต่อบัญชี Google...`);
    const activeProfile = await getActiveProfile();
    const storagePath = path.join(PROFILES_DIR, activeProfile, 'storage_state.json');
    if (!fs.existsSync(storagePath)) {
      throw new Error(`บัญชี Google '${activeProfile}' ยังไม่ได้ล็อกอิน กรุณาล็อกอินก่อนเริ่มรันกระบวนการ`);
    }
    
    // 2. Read input file or run Gemini Deep Research
    activeWorkflowState.progress = 15;
    let actualFile = selectedFile;
    let actualFilePath = mdFilePath;
    let actualSourceTitle = sourceTitle;
    
    if (actualFile) {
      activeWorkflowState.currentStep = 'กำลังอ่านไฟล์บทวิเคราะห์...';
      addLog(`ขั้นตอนที่ 2/8: กำลังตรวจสอบไฟล์บทวิเคราะห์ในเครื่อง: ${actualFile}...`);
      if (!fs.existsSync(actualFilePath)) {
        throw new Error(`ไม่พบไฟล์บทวิเคราะห์ ${actualFile} ในโฟลเดอร์หลักของโปรเจกต์`);
      }
    } else {
      activeWorkflowState.currentStep = 'กำลังทำ Gemini Deep Research...';
      addLog(`ขั้นตอนที่ 2/8: เริ่มทำ Deep Research วิจัยรวบรวมข่าวผ่าน Gemini...`);
      
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('กรุณาระบุ GEMINI_API_KEY ในไฟล์ .env ของโฟลเดอร์ notebooklm-manager ก่อนดำเนินการ');
      }
      
      // Calculate output filename
      const fileDate = dateStr.replace(/-/g, '_');
      let generatedFilename = '';
      if (templateId === 'daily') {
        generatedFilename = `market_summary_${fileDate}.md`;
      } else if (templateId === 'weekly') {
        generatedFilename = `global_market_recap_${fileDate}.md`;
      } else if (templateId === 'whale') {
        generatedFilename = `whale_flow_analysis_${fileDate}.md`;
      } else {
        generatedFilename = `${templateId}_${fileDate}.md`;
      }
      
      const generatedFilePath = path.join(__dirname, '..', generatedFilename);
      const geminiScriptPath = path.join(__dirname, '..', 'gemini_research.py');
      
      addLog(`รันโมเดล Gemini เพื่อค้นหาข่าวและวิเคราะห์ตลาดลงไฟล์: ${generatedFilename}...`);
      
      const escapedPrompt = searchPrompt.replace(/"/g, '\\"').replace(/\n/g, ' ');
      const geminiCmd = `"${VENV_PYTHON}" "${geminiScriptPath}" --template-id "${templateId}" --prompt "${escapedPrompt}" --date "${dateStr}" --output "${generatedFilePath}"`;
      
      await runCmd(geminiCmd);
      addLog(`สร้างและเซฟรายงานการเงินสำเร็จ: ${generatedFilename}`);
      
      // Rebuild website index and push to GitHub
      activeWorkflowState.progress = 20;
      activeWorkflowState.currentStep = 'กำลังบันทึกลงเว็บและ Push ขึ้น GitHub...';
      addLog(`ขั้นตอนที่ 2.5/8: กำลังอัปเดตสารบัญข่าวบนเว็บและดาวน์โหลดซิงค์ขึ้น GitHub...`);
      
      const parentDir = path.join(__dirname, '..');
      const syncCmd = `node "${path.join(parentDir, 'generate-index.js')}" && git add . && git commit -m "Auto-update reports" && git push`;
      
      try {
        await runCmd(syncCmd);
        addLog(`อัปเดตสารบัญเว็บสำเร็จและ Push ขึ้น GitHub เรียบร้อยแล้ว!`);
      } catch (syncErr) {
        addLog(`⚠️ คำเตือน: ระบบพุช GitHub ล้มเหลว (ข้ามไปรันขั้นตอนถัดไป): ${syncErr.message}`);
      }
      
      // Override parameters to ingest this generated file
      actualFile = generatedFilename;
      actualFilePath = generatedFilePath;
      actualSourceTitle = `${path.basename(actualFile).replace('.md', '')}_Source`;
    }
    
    const { active: initialProfile, authenticated: authProfiles } = await getAuthenticatedProfiles();
    let currentProfile = initialProfile;
    const maxAttempts = authProfiles.length;
    let success = false;
    let lastError = null;
    let fbPostContent = '';
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      let notebookId = '';
      try {
        if (maxAttempts > 1) {
          addLog(`[บัญชี: ${currentProfile}] เริ่มต้นการประมวลผลระบบ NotebookLM (พยายามครั้งที่ ${attempt}/${maxAttempts})...`);
        }
        
        // 3. Create Notebook
        activeWorkflowState.progress = 25;
        activeWorkflowState.currentStep = `[${currentProfile}] กำลังสร้าง Notebook ใหม่...`;
        const notebookTitle = `${showNameClean.replace(/_/g, ' ')} — ${dateStr}`;
        addLog(`ขั้นตอนที่ 3/8: กำลังสร้าง Notebook ใน NotebookLM: "${notebookTitle}"...`);
        const createRes = await runCmd(`"${VENV_NOTEBOOKLM}" create "${notebookTitle}"`);
        
        const match = createRes.stdout.match(/Created notebook:\s+([a-f0-9-]+)\s+-/);
        if (!match) {
          throw new Error('ไม่สามารถค้นหา Notebook ID จากผลลัพธ์ของคำสั่งได้:\n' + createRes.stdout);
        }
        notebookId = match[1];
        addLog(`สร้าง Notebook สำเร็จ ID: ${notebookId}`);
        
        // 4. Ingest source
        activeWorkflowState.progress = 40;
        activeWorkflowState.currentStep = `[${currentProfile}] กำลังนำเข้าแหล่งข้อมูล...`;
        addLog(`ขั้นตอนที่ 4/8: กำลังนำเข้าเนื้อหาจากไฟล์ ${actualFile} สู่ NotebookLM...`);
        
        let tempTxtFilePath = '';
        if (actualFilePath.toLowerCase().endsWith('.md')) {
          tempTxtFilePath = actualFilePath.replace(/\.md$/i, '.txt');
          fs.copyFileSync(actualFilePath, tempTxtFilePath);
        }
        
        const fileToUpload = tempTxtFilePath || actualFilePath;
        try {
          await runCmd(`"${VENV_NOTEBOOKLM}" source add -n ${notebookId} --title "${actualSourceTitle}" "${fileToUpload}"`);
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
        addLog(`นำเข้าข้อมูลเนื้อหาบทวิเคราะห์ลงสู่ NotebookLM เรียบร้อยแล้ว`);
    
        // Extract ticker and date from report for prompt replacement
        let resolvedAudioPrompt = audioPrompt;
        let resolvedReportPrompt = reportPrompt;
        let resolvedInfoPrompt = infoPrompt;
        
        try {
          if (fs.existsSync(actualFilePath)) {
            const mdContent = fs.readFileSync(actualFilePath, 'utf8');
            const ticker = extractTicker(mdContent);
            const thaiDate = formatThaiDate(dateStr);
            
            addLog(`ระบบสแกนข้อมูลพบ Ticker: ${ticker} | วันที่: ${thaiDate}`);
            
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
          addLog(`⚠️ คำเตือน: ระบบแทนที่ตัวแปร Ticker / วันที่ ขัดข้อง: ${parseErr.message}`);
        }
        
        // 5. Generate Audio Overview
        activeWorkflowState.progress = 55;
        activeWorkflowState.currentStep = `[${currentProfile}] กำลังสร้าง Audio Overview (Deep Dive)...`;
        addLog(`ขั้นตอนที่ 5/8: กำลังประมวลผลสร้างเสียง Audio Overview (Deep Dive, ภาษาไทย)...`);
        addLog(`Prompt บังคับสำหรับบทสนทนา: "${resolvedAudioPrompt}"`);
        const tempAudioPromptPath = path.join(__dirname, `temp_prompt_audio_${Date.now()}.txt`);
        fs.writeFileSync(tempAudioPromptPath, resolvedAudioPrompt, 'utf8');
        try {
          await runCmd(`"${VENV_NOTEBOOKLM}" generate audio -n ${notebookId} --format deep-dive --language th --wait --prompt-file "${tempAudioPromptPath}"`);
        } finally {
          try { fs.unlinkSync(tempAudioPromptPath); } catch (_) {}
        }
        addLog(`เสียงสนทนาประมวลผลเสร็จสิ้น กำลังดาวน์โหลดไฟล์เสียง...`);
        await runCmd(`"${VENV_NOTEBOOKLM}" download audio -n ${notebookId} --latest --force "${outputAudioPath}"`);
        addLog(`ดาวน์โหลดเสียงสำเร็จและเซฟไว้ที่: ${outputAudioPath}`);
        
        // 6. Generate Report (Facebook post)
        activeWorkflowState.progress = 70;
        activeWorkflowState.currentStep = `[${currentProfile}] กำลังสร้างเนื้อหาโพสต์ Facebook...`;
        addLog(`ขั้นตอนที่ 6/8: กำลังสร้างรายงาน Custom Report สำหรับทำโพสต์ Facebook...`);
        addLog(`Prompt: "${resolvedReportPrompt}"`);
        const tempReportPromptPath = path.join(__dirname, `temp_prompt_report_${Date.now()}.txt`);
        fs.writeFileSync(tempReportPromptPath, resolvedReportPrompt, 'utf8');
        try {
          await runCmd(`"${VENV_NOTEBOOKLM}" generate report -n ${notebookId} --format custom --language th --wait --prompt-file "${tempReportPromptPath}"`);
        } finally {
          try { fs.unlinkSync(tempReportPromptPath); } catch (_) {}
        }
        addLog(`รายงานประมวลผลเสร็จสิ้น กำลังดาวน์โหลดเนื้อหารายงาน...`);
        await runCmd(`"${VENV_NOTEBOOKLM}" download report -n ${notebookId} --latest --force "${outputReportPath}"`);
        addLog(`บันทึกรายงานสำรองสำเร็จไว้ที่: ${outputReportPath}`);
        
        // Read generated report content for Facebook post copy paste
        fbPostContent = fs.readFileSync(outputReportPath, 'utf8');
        
        // 7. Generate Infographic
        activeWorkflowState.progress = 85;
        activeWorkflowState.currentStep = `[${currentProfile}] กำลังสร้างรูปภาพ Infographic...`;
        addLog(`ขั้นตอนที่ 7/8: กำลังประมวลผลสร้าง Infographic (Landscape, สไตล์ Auto)...`);
        addLog(`Prompt: "${resolvedInfoPrompt}"`);
        const tempInfoPromptPath = path.join(__dirname, `temp_prompt_info_${Date.now()}.txt`);
        fs.writeFileSync(tempInfoPromptPath, resolvedInfoPrompt, 'utf8');
        try {
          await runCmd(`"${VENV_NOTEBOOKLM}" generate infographic -n ${notebookId} --orientation landscape --detail standard --language th --wait --prompt-file "${tempInfoPromptPath}"`);
        } finally {
          try { fs.unlinkSync(tempInfoPromptPath); } catch (_) {}
        }
        addLog(`รูปภาพอินโฟกราฟิกประมวลผลเสร็จสิ้น กำลังดาวน์โหลดรูปภาพ...`);
        await runCmd(`"${VENV_NOTEBOOKLM}" download infographic -n ${notebookId} --latest --force "${outputInfoPath}"`);
        addLog(`ดาวน์โหลดรูปภาพอินโฟกราฟิกสำเร็จและเซฟไว้ที่: ${outputInfoPath}`);
        
        // 8. Finished!
        activeWorkflowState.progress = 100;
        activeWorkflowState.currentStep = 'เสร็จสมบูรณ์!';
        addLog(`ขั้นตอนที่ 8/8: ทำงานเสร็จสมบูรณ์ ไฟล์ทั้งหมดถูกดาวน์โหลดลงในโฟลเดอร์ Draft เรียบร้อยแล้ว!`);
        
        activeWorkflowState.running = false;
        activeWorkflowState.result = {
          audioPath: outputAudioPath,
          infoPath: outputInfoPath,
          fbPost: fbPostContent
        };
        
        success = true;
        break; // Success! Break retry loop
        
      } catch (err) {
        lastError = err;
        console.error(`[บัญชี: ${currentProfile}] การทำงานขั้นตอนนี้ขัดข้อง:`, err);
        
        // Delete partial notebook of the failed attempt to keep it clean
        if (notebookId) {
          try {
            addLog(`[บัญชี: ${currentProfile}] กำลังลบ Notebook ที่สร้างค้างไว้ ID: ${notebookId} เพื่อเคลียร์ระบบ...`);
            await runCmd(`"${VENV_NOTEBOOKLM}" delete "${notebookId}"`);
          } catch (delErr) {
            console.error('Failed to delete notebook on failure:', delErr);
          }
        }
        
        if (isQuotaError(err) && attempt < maxAttempts) {
          const currentIdx = authProfiles.indexOf(currentProfile);
          const nextIdx = (currentIdx + 1) % authProfiles.length;
          const nextProfile = authProfiles[nextIdx];
          
          addLog(`⚠️ ตรวจพบโควตาเต็มสำหรับบัญชี '${currentProfile}'!`);
          addLog(`🔄 กำลังสลับบัญชีอัตโนมัติไปยังบัญชีถัดไป: '${nextProfile}'...`);
          
          try {
            await runCmd(`"${VENV_NOTEBOOKLM}" profile switch "${nextProfile}"`);
            currentProfile = nextProfile;
            addLog(`✅ สลับบัญชีสำเร็จเป็น '${nextProfile}'! จะเริ่มกระบวนการประมวลผลใหม่อีกครั้ง...`);
          } catch (switchErr) {
            addLog(`❌ สลับบัญชีล้มเหลว: ${switchErr.message}`);
            throw err;
          }
        } else {
          // Rethrow the error to be caught by the outer block
          throw err;
        }
      }
    }
    
    if (!success && lastError) {
      throw lastError;
    }
  } catch (err) {
    console.error('Workflow error:', err);
    let displayError = err.message;
    if (isQuotaError(err)) {
      displayError = 'โควตาการใช้งานบัญชีนี้เต็มแล้วสำหรับวันนี้ (Daily Quota Exceeded) หรือเซิร์ฟเวอร์ Google ปฏิเสธคำขอชั่วคราว กรุณาสลับผู้ใช้ไปใช้โปรไฟล์บัญชีอื่นในแท็บเมนูจัดการบัญชี แล้วทดลองใหม่อีกครั้ง';
    }
    addLog(`❌ เกิดข้อผิดพลาดในกระบวนการทำงาน: ${displayError}`);
    activeWorkflowState.running = false;
    activeWorkflowState.error = displayError;
  }
});

// Fetch all notebooks
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
