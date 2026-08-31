#!/usr/bin/env node
/**
 * 📚 NotebookLM Album — Standalone Program & Web App
 * 
 * แสดงรายการผลิตคลิป NotebookLM ทั้งหมด พร้อม Prompt 4 ประเภท
 * สามารถเพิ่มรายการใหม่ และเพิ่ม Prompt Version ใหม่ ได้จากหน้าเว็บทันที
 * 
 * วิธีใช้: node generate-album.js
 * จากนั้นเปิด http://localhost:3457 ในเบราว์เซอร์
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const url = require('url');
const { execSync } = require('child_process');

const PORT = 3457;
const TEMPLATES_FILE = path.join(__dirname, 'templates.json');
const WORKFLOWS_FILE = path.join(__dirname, 'workflows_history.json');

const AUTO_SHUTDOWN_MS = 0;
let shutdownTimer = null;
let isPaused = false;

function resetShutdownTimer() {
  if (shutdownTimer) clearTimeout(shutdownTimer);
  isPaused = false;
}

// --- Load ---
function loadTemplates() {
  return JSON.parse(fs.readFileSync(TEMPLATES_FILE, 'utf8'));
}

function loadWorkflows() {
  try {
    if (fs.existsSync(WORKFLOWS_FILE)) {
      return JSON.parse(fs.readFileSync(WORKFLOWS_FILE, 'utf8'));
    }
  } catch (e) { /* ignore */ }
  return {};
}

function saveTemplates(templates) {
  fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(templates, null, 2), 'utf8');
}

// --- Export static album.html ---
const ROOT_ALBUM_FILE = path.join(__dirname, '..', 'album.html');
const LOCAL_ALBUM_FILE = path.join(__dirname, 'album.html');

function exportAlbumHtml() {
  try {
    const html = generateHtml(false);
    fs.writeFileSync(LOCAL_ALBUM_FILE, html, 'utf8');
    fs.writeFileSync(ROOT_ALBUM_FILE, html, 'utf8');
    console.log('📦 อัปเดต album.html ทั้งที่ root และ notebooklm-manager สำเร็จ');
  } catch (e) {
    console.error('❌ Export album.html ล้มเหลว:', e.message);
  }
}

// --- Server ---
const server = http.createServer((req, res) => {
  const parsed = new URL(req.url, `http://localhost:${PORT}`);

  resetShutdownTimer();

  // Serve logo-mascot.png
  if (parsed.pathname === '/logo-mascot.png') {
    let imgPath = path.join(__dirname, '..', 'logo-mascot.png');
    if (!fs.existsSync(imgPath)) {
      imgPath = path.join(__dirname, 'public', 'logo-mascot.png');
    }
    if (fs.existsSync(imgPath)) {
      res.writeHead(200, { 
        'Content-Type': 'image/png',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      res.end(fs.readFileSync(imgPath));
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
    return;
  }

  // API: Heartbeat
  if (parsed.pathname === '/api/heartbeat' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ alive: true, paused: isPaused, autoShutdownMs: AUTO_SHUTDOWN_MS }));
    return;
  }

  // API: GET data
  if (parsed.pathname === '/api/album-data' && req.method === 'GET') {
    try {
      const templates = loadTemplates();
      const workflows = loadWorkflows();
      res.writeHead(200, { 
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      });
      res.end(JSON.stringify({ templates, workflows }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // API: ADD TEMPLATE
  if (parsed.pathname === '/api/add-template' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { id, name, searchPrompt, audioPrompt, reportPrompt, infoPrompt } = JSON.parse(body);
        if (!id || !name) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'ID และชื่อรายการจำเป็นต้องระบุ' }));
          return;
        }
        const templates = loadTemplates();
        const cleanId = id.trim().toLowerCase().replace(/\s+/g, '_');
        
        let newTemplate = templates.find(t => t.id === cleanId);
        if (!newTemplate) {
          newTemplate = {
            id: cleanId,
            name: name.trim(),
            searchPrompt: searchPrompt || '',
            audioPrompt: audioPrompt || '',
            reportPrompt: reportPrompt || '',
            infoPrompt: infoPrompt || ''
          };
          templates.push(newTemplate);
        } else {
          newTemplate.name = name.trim();
          if (searchPrompt) newTemplate.searchPrompt = searchPrompt;
          if (audioPrompt) newTemplate.audioPrompt = audioPrompt;
          if (reportPrompt) newTemplate.reportPrompt = reportPrompt;
          if (infoPrompt) newTemplate.infoPrompt = infoPrompt;
        }

        saveTemplates(templates);
        exportAlbumHtml();

        console.log(`➕ เพิ่มรายการผลิตคลิปใหม่: "${newTemplate.name}" (${newTemplate.id}) สำเร็จ`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, template: newTemplate }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // API: SAVE PROMPT
  if (parsed.pathname === '/api/save-prompt' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { templateId, promptType, value } = JSON.parse(body);
        const templates = loadTemplates();
        const tmpl = templates.find(t => t.id === templateId);
        if (!tmpl) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Template not found' }));
          return;
        }

        const keyMap = { 
          search: 'searchPrompt', 
          audio: 'audioPrompt', 
          report: 'reportPrompt', 
          info: 'infoPrompt'
        };

        let key = keyMap[promptType];
        if (!key) {
          const match = promptType.match(/^(search|audio|report|info)(V[0-9]+)$/i);
          if (match) {
            key = match[1] + 'Prompt' + match[2].toUpperCase();
          } else {
            key = promptType;
          }
        }

        tmpl[key] = value;
        saveTemplates(templates);
        exportAlbumHtml();
        console.log(`💾 บันทึก ${key} ของ "${tmpl.name}" สำเร็จ`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, key }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // Serve HTML page with strict No-Cache Headers
  if (parsed.pathname === '/' || parsed.pathname === '/index.html') {
    res.writeHead(200, { 
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.end(generateHtml(isPaused));
    return;
  }

  // API: Deploy to GitHub
  if (parsed.pathname === '/api/deploy' && req.method === 'POST') {
    try {
      const projectRoot = path.join(__dirname, '..');
      exportAlbumHtml();
      const output = execSync(
        'node generate-index.js && git add . && git commit -m "Update album prompts and templates [No-Cache]" && git push origin main && git push origin main:gh-pages && git push web main:gh-pages && git push calc main:gh-pages && git push freshcalc main:gh-pages',
        { cwd: projectRoot, encoding: 'utf8', timeout: 35000 }
      );
      console.log('🚀 Deploy สำเร็จ!');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Deploy สำเร็จ!' }));
    } catch (e) {
      const errMsg = (e.stderr || e.message || '').toString().substring(0, 500);
      if (errMsg.includes('nothing to commit') || (e.stdout && e.stdout.includes('nothing to commit'))) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'ไม่มีอะไรเปลี่ยนแปลง — เว็บเป็นปัจจุบันแล้ว' }));
      } else {
        console.error('❌ Deploy ล้มเหลว:', errMsg);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: errMsg }));
      }
    }
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use.`);
  } else {
    console.error(`❌ Server error: ${err.message}`);
  }
});

server.listen(PORT, '127.0.0.1', () => {
  resetShutdownTimer();
  console.log('');
  console.log('━'.repeat(55));
  console.log('  📚 NotebookLM Album — Standalone Program & Web App');
  console.log('━'.repeat(55));
  console.log(`  🌐 เปิดเบราว์เซอร์ไปที่: http://localhost:${PORT}`);
  console.log('  ➕ สามารถเพิ่มรายการผลิตคลิปใหม่ & เพิ่ม Prompt Version ได้จากหน้าเว็บ');
  console.log('━'.repeat(55));
  console.log('');
});

// --- HTML Generator ---
function generateHtml(paused) {
  const templates = loadTemplates();
  const workflows = loadWorkflows();

  const timeStamp = Date.now();
  const generatedDate = new Date().toLocaleDateString('th-TH', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  const totalWorkflows = Object.keys(workflows).length;
  const totalCompleted = Object.values(workflows).filter(w => w.status === 'completed').length;

  const workflowsByTemplate = {};
  Object.values(workflows).forEach(wf => {
    const tid = wf.templateId;
    if (!workflowsByTemplate[tid]) workflowsByTemplate[tid] = [];
    workflowsByTemplate[tid].push(wf);
  });
  Object.keys(workflowsByTemplate).forEach(tid => {
    workflowsByTemplate[tid].sort((a, b) => (b.dateStr || '').localeCompare(a.dateStr || ''));
  });

  const clientData = JSON.stringify({ templates, workflowsByTemplate, totalWorkflows, totalCompleted, isPaused: paused });

  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
  <meta http-equiv="Pragma" content="no-cache">
  <meta http-equiv="Expires" content="0">
  <title>Album รายการผลิตคลิป — เสพข่าวก่อนเทรด หุ้นอเมริกา</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
${getCSS()}
  </style>
</head>
<body>
  <div class="page-wrap">
    <!-- Server Control Bar -->
    <div class="server-bar" id="server-bar">
      <div class="server-status">
        <span class="pulse-dot" id="pulse-dot"></span>
        <span id="server-status-text">Album Manager (พร้อมใช้งาน)</span>
        <span class="countdown" id="countdown">🟢 ระบบออนไลน์</span>
      </div>
      <div class="toggle-group">
        <button class="btn-add-item" onclick="openAddTemplateModal()">➕ เพิ่มรายการใหม่</button>
        <button class="btn-deploy" id="btn-deploy" onclick="deployToGithub()">🚀 Deploy</button>
      </div>
    </div>

    <header class="page-header">
      <h1>
        <img src="logo-mascot.png?v=${timeStamp}" class="header-logo" alt="Logo">
        <span class="header-text">Album รายการผลิตคลิป</span>
      </h1>
      <p>รวบรวมทุกรายการผลิตคลิปผ่าน NotebookLM พร้อมระบบเพิ่มรายการใหม่และจัดการ Prompt Version</p>
      <div class="stats-bar" id="stats-bar"></div>
      <div class="search-bar-wrap">
        <div class="search-bar">
          <span class="search-icon">🔍</span>
          <input type="text" id="album-search" placeholder="ค้นหารายการ..." oninput="filterCards()">
        </div>
        <button class="btn-primary-add" onclick="openAddTemplateModal()">➕ เพิ่มรายการผลิตคลิปใหม่</button>
      </div>
    </header>
    <div class="album-grid" id="album-grid"></div>
    <div class="no-results" id="no-results">ไม่พบรายการที่ค้นหา</div>
    <footer class="page-footer">
      <p>🎙️ เสพข่าวก่อนเทรด หุ้นอเมริกา — Album Manager</p>
      <p>อัปเดตล่าสุด: ${generatedDate}</p>
    </footer>
  </div>

  <!-- Modal containers -->
  <div id="modal-container"></div>
  <div id="add-modal-container"></div>

  <!-- Toast -->
  <div class="toast" id="toast"></div>

  <script>
    const DATA = ${clientData};
    ${getJS()}
  </script>
</body>
</html>`;
}

// ============================================================
function getCSS() {
  return `
    :root {
      --bg-base: #06060c;
      --bg-surface: rgba(18,18,30,0.7);
      --bg-card: rgba(22,22,40,0.65);
      --bg-card-hover: rgba(35,35,60,0.8);
      --border-color: rgba(255,255,255,0.07);
      --border-glow: rgba(99,102,241,0.35);
      --primary: #6366f1; --primary-light: #818cf8;
      --success: #10b981; --danger: #ef4444; --warning: #f59e0b; --info: #3b82f6;
      --clr-search: #3b82f6; --clr-audio: #a855f7; --clr-report: #10b981; --clr-info: #f59e0b;
      --text-primary: #f1f5f9; --text-secondary: #94a3b8; --text-muted: #64748b;
      --font-heading: 'Outfit','Sarabun',sans-serif;
      --font-body: 'Sarabun','Outfit',sans-serif;
      --radius-sm: 8px; --radius-md: 14px; --radius-lg: 20px;
    }
    *,*::before,*::after { margin:0; padding:0; box-sizing:border-box; }
    body { background:var(--bg-base); color:var(--text-primary); font-family:var(--font-body); font-size:15px; line-height:1.6; min-height:100vh; overflow-x:hidden; }
    body::before { content:''; position:fixed; inset:0; background: radial-gradient(ellipse 600px 400px at 15% 20%,rgba(99,102,241,.08),transparent), radial-gradient(ellipse 500px 350px at 80% 75%,rgba(168,85,247,.06),transparent), radial-gradient(ellipse 400px 300px at 50% 50%,rgba(59,130,246,.04),transparent); pointer-events:none; z-index:0; }
    .page-wrap { position:relative; z-index:1; max-width:1440px; margin:0 auto; padding:24px 28px 60px; }

    /* Header */
    .page-header { text-align:center; padding:40px 20px 28px; }
    .page-header h1 { display: flex; align-items: center; justify-content: center; gap: 14px; margin-bottom: 10px; }
    .page-header h1 .header-logo { height: 90px; width: auto; border-radius: 10px; filter: drop-shadow(0 4px 12px rgba(99,102,241,0.35)); }
    .page-header h1 .header-text { font-family:var(--font-heading); font-size:2.5rem; font-weight:700; background:linear-gradient(135deg,#818cf8,#a855f7,#ec4899); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
    .page-header p { color:var(--text-secondary); font-size:1.05rem; max-width:650px; margin:0 auto; }
    .stats-bar { display:flex; justify-content:center; gap:36px; margin-top:24px; flex-wrap:wrap; }
    .stat-item { text-align:center; }
    .stat-value { font-family:var(--font-heading); font-size:2rem; font-weight:700; color:var(--primary-light); }
    .stat-label { font-size:.85rem; color:var(--text-muted); margin-top:2px; }
    .search-bar-wrap { display:flex; justify-content:center; align-items:center; gap:14px; max-width:680px; margin:28px auto 0; flex-wrap:wrap; }
    .search-bar { flex:1; min-width:280px; position:relative; }
    .search-bar input { width:100%; padding:12px 16px 12px 44px; border-radius:999px; border:1px solid var(--border-color); background:var(--bg-surface); color:var(--text-primary); font-size:15px; font-family:var(--font-body); outline:none; transition:border-color .2s,box-shadow .2s; }
    .search-bar input:focus { border-color:var(--border-glow); box-shadow:0 0 0 3px rgba(99,102,241,.12); }
    .search-bar input::placeholder { color:var(--text-muted); }
    .search-bar .search-icon { position:absolute; left:16px; top:50%; transform:translateY(-50%); color:var(--text-muted); font-size:16px; pointer-events:none; }

    /* Action Buttons */
    .btn-add-item, .btn-primary-add { background:linear-gradient(135deg,#10b981,#059669); border:none; color:#fff; padding:10px 20px; border-radius:999px; font-size:.9rem; font-weight:600; font-family:var(--font-heading); cursor:pointer; transition:all .25s; box-shadow:0 4px 14px rgba(16,185,129,.3); white-space:nowrap; }
    .btn-add-item:hover, .btn-primary-add:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(16,185,129,.45); }
    .btn-add-version { background:rgba(99,102,241,.2); border:1px dashed rgba(99,102,241,.5); color:var(--primary-light); padding:8px 16px; border-radius:7px; font-size:.88rem; font-weight:600; font-family:var(--font-body); cursor:pointer; transition:all .2s; }
    .btn-add-version:hover { background:rgba(99,102,241,.35); border-color:var(--primary-light); color:#fff; }

    /* Grid */
    .album-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(340px,1fr)); gap:22px; margin-top:36px; }
    .album-card { background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:24px; cursor:pointer; transition:all .25s ease; position:relative; overflow:hidden; }
    .album-card::before { content:''; position:absolute; inset:0; border-radius:var(--radius-md); padding:1px; background:linear-gradient(135deg,rgba(99,102,241,.3),rgba(168,85,247,.2),rgba(236,72,153,.15)); -webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0); -webkit-mask-composite:xor; mask-composite:exclude; pointer-events:none; opacity:0; transition:opacity .3s; }
    .album-card:hover { transform:translateY(-4px); background:var(--bg-card-hover); border-color:rgba(99,102,241,.25); box-shadow:0 12px 40px rgba(99,102,241,.1),0 4px 16px rgba(0,0,0,.3); }
    .album-card:hover::before { opacity:1; }
    .card-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; }
    .card-icon { font-size:2rem; }
    .card-badge { font-size:.72rem; padding:3px 10px; border-radius:999px; font-weight:600; letter-spacing:.3px; }
    .badge-daily { background:rgba(59,130,246,.15); color:#60a5fa; border:1px solid rgba(59,130,246,.25); }
    .badge-weekly { background:rgba(168,85,247,.15); color:#c084fc; border:1px solid rgba(168,85,247,.25); }
    .badge-special { background:rgba(245,158,11,.15); color:#fbbf24; border:1px solid rgba(245,158,11,.25); }
    .card-title { font-family:var(--font-heading); font-size:1.15rem; font-weight:600; color:var(--text-primary); margin-bottom:14px; line-height:1.4; }
    .card-meta { display:flex; flex-direction:column; gap:6px; margin-bottom:14px; }
    .meta-item { display:flex; align-items:center; gap:8px; font-size:.85rem; color:var(--text-secondary); }
    .card-prompts-preview { display:flex; gap:8px; margin-bottom:16px; flex-wrap:wrap; }
    .prompt-dot { font-size:1.1rem; width:34px; height:34px; display:flex; align-items:center; justify-content:center; border-radius:8px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.06); }
    .card-action { text-align:right; font-size:.85rem; color:var(--primary-light); font-weight:500; opacity:0; transform:translateX(-6px); transition:all .25s; }
    .album-card:hover .card-action { opacity:1; transform:translateX(0); }

    /* Modal */
    .modal-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,.72); backdrop-filter:blur(8px); z-index:1000; justify-content:center; align-items:flex-start; padding:40px 20px; overflow-y:auto; }
    .modal-overlay.show { display:flex; }
    .modal-content { background:linear-gradient(180deg,rgba(18,18,35,.98),rgba(12,12,24,.98)); border:1px solid rgba(99,102,241,.2); border-radius:var(--radius-lg); width:100%; max-width:960px; max-height:90vh; overflow-y:auto; box-shadow:0 24px 80px rgba(0,0,0,.5); animation:modalIn .3s ease; }
    @keyframes modalIn { from{opacity:0;transform:translateY(20px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
    .modal-header { display:flex; justify-content:space-between; align-items:center; padding:28px 32px 20px; border-bottom:1px solid var(--border-color); }
    .modal-title-group { display:flex; align-items:center; gap:16px; }
    .modal-icon { font-size:2.4rem; }
    .modal-title-group h2 { font-family:var(--font-heading); font-size:1.4rem; font-weight:600; }
    .modal-id { font-size:.78rem; color:var(--text-muted); font-family:monospace; }
    .modal-close { background:none; border:none; color:var(--text-muted); font-size:1.8rem; cursor:pointer; padding:4px 10px; border-radius:8px; transition:all .2s; }
    .modal-close:hover { background:rgba(255,255,255,.06); color:var(--text-primary); }
    .modal-body { padding:28px 32px 36px; }
    .section-title { font-family:var(--font-heading); font-size:1.1rem; font-weight:600; color:var(--text-primary); margin-bottom:16px; padding-bottom:10px; border-bottom:1px solid var(--border-color); }

    /* Form controls in Add Modal */
    .form-group { margin-bottom:16px; }
    .form-label { display:block; font-size:.85rem; color:var(--text-secondary); margin-bottom:6px; font-weight:500; }
    .form-input { width:100%; padding:10px 14px; background:rgba(0,0,0,.25); border:1px solid var(--border-color); border-radius:8px; color:var(--text-primary); font-size:.9rem; font-family:var(--font-body); outline:none; transition:border-color .2s; }
    .form-input:focus { border-color:var(--border-glow); }
    .form-textarea { width:100%; min-height:80px; background:rgba(0,0,0,.25); border:1px solid var(--border-color); border-radius:8px; padding:12px; color:var(--text-primary); font-size:.85rem; font-family:var(--font-body); resize:vertical; outline:none; }
    .form-textarea:focus { border-color:var(--border-glow); }

    /* Prompt Accordion */
    .prompt-accordion { display:flex; flex-direction:column; gap:10px; }
    .prompt-section { border-radius:var(--radius-sm); overflow:hidden; border:1px solid var(--border-color); transition:border-color .2s; }
    .prompt-section:hover { border-color:rgba(255,255,255,.12); }
    .prompt-header-btn { width:100%; display:flex; justify-content:space-between; align-items:center; padding:14px 18px; background:rgba(255,255,255,.03); border:none; color:var(--text-primary); font-size:.95rem; font-weight:500; font-family:var(--font-body); cursor:pointer; transition:background .2s; }
    .prompt-header-btn:hover { background:rgba(255,255,255,.06); }
    .chevron { font-size:.7rem; color:var(--text-muted); transition:transform .25s; }
    .prompt-header-btn.open .chevron { transform:rotate(180deg); }
    .prompt-status { font-size:.78rem; color:var(--text-muted); margin-left:auto; margin-right:12px; }
    .prompt-body { display:none; padding:0 18px 18px; background:rgba(0,0,0,.15); }
    .prompt-body.show { display:block; }
    .prompt-actions { display:flex; justify-content:flex-end; gap:8px; padding:10px 0 8px; }
    .btn-sm { padding:5px 14px; border-radius:6px; font-size:.8rem; cursor:pointer; font-family:var(--font-body); transition:all .2s; border:1px solid; }
    .btn-copy { background:rgba(99,102,241,.12); border-color:rgba(99,102,241,.2); color:var(--primary-light); }
    .btn-copy:hover { background:rgba(99,102,241,.2); }
    .btn-copy.copied { background:rgba(16,185,129,.15); border-color:rgba(16,185,129,.3); color:#34d399; }
    .btn-save { background:rgba(16,185,129,.12); border-color:rgba(16,185,129,.2); color:#34d399; }
    .btn-save:hover { background:rgba(16,185,129,.2); }
    .btn-save.saved { background:rgba(16,185,129,.25); border-color:rgba(16,185,129,.4); }
    .btn-save:disabled { opacity:.4; cursor:not-allowed; }
    .prompt-textarea { width:100%; min-height:200px; background:rgba(0,0,0,.25); border:1px solid var(--border-color); border-radius:8px; padding:16px; font-size:.85rem; line-height:1.7; color:var(--text-secondary); font-family:var(--font-body); resize:vertical; outline:none; transition:border-color .2s; }
    .prompt-textarea:focus { border-color:var(--border-glow); }
    .prompt-textarea.no-data { color:var(--text-muted); font-style:italic; min-height:60px; }
    .prompt-search .prompt-header-btn { border-left:3px solid var(--clr-search); }
    .prompt-audio .prompt-header-btn  { border-left:3px solid var(--clr-audio); }
    .prompt-report .prompt-header-btn { border-left:3px solid var(--clr-report); }
    .prompt-info .prompt-header-btn   { border-left:3px solid var(--clr-info); }

    /* Workflow Table */
    .table-wrap { overflow-x:auto; }
    .wf-table { width:100%; border-collapse:collapse; font-size:.85rem; }
    .wf-table th { background:rgba(99,102,241,.08); color:var(--text-secondary); font-weight:600; padding:10px 14px; text-align:left; border-bottom:1px solid var(--border-color); white-space:nowrap; }
    .wf-table td { padding:10px 14px; border-bottom:1px solid rgba(255,255,255,.04); color:var(--text-secondary); vertical-align:top; }
    .wf-table tbody tr:hover td { background:rgba(255,255,255,.02); }
    .cell-title { color:var(--text-primary); font-weight:500; max-width:220px; }
    .status-badge { display:inline-block; padding:2px 10px; border-radius:999px; font-size:.78rem; font-weight:500; white-space:nowrap; }
    .status-completed { background:rgba(16,185,129,.12); color:#34d399; }
    .status-failed { background:rgba(239,68,68,.12); color:#f87171; }
    .status-running { background:rgba(59,130,246,.12); color:#60a5fa; }
    .status-waiting { background:rgba(245,158,11,.12); color:#fbbf24; }
    .btn-logs { background:rgba(255,255,255,.05); border:1px solid var(--border-color); color:var(--text-secondary); padding:4px 10px; border-radius:6px; font-size:.78rem; cursor:pointer; font-family:var(--font-body); transition:all .2s; }
    .btn-logs:hover { background:rgba(255,255,255,.1); }
    .logs-row td { padding:0 14px 14px !important; }
    .logs-container { background:rgba(0,0,0,.3); border:1px solid var(--border-color); border-radius:8px; padding:14px; max-height:300px; overflow-y:auto; font-size:.78rem; }
    .log-line { padding:3px 0; color:var(--text-muted); border-bottom:1px solid rgba(255,255,255,.02); word-break:break-all; }
    .log-line:last-child { border-bottom:none; }

    /* Version Selector */
    .version-selector { display:flex; gap:8px; margin-bottom:20px; padding:6px; background:rgba(255,255,255,.03); border:1px solid var(--border-color); border-radius:10px; width:fit-content; flex-wrap:wrap; align-items:center; }
    .btn-version { padding:8px 16px; border:none; background:transparent; color:var(--text-secondary); font-size:.88rem; font-weight:500; font-family:var(--font-body); cursor:pointer; border-radius:7px; transition:all .2s; }
    .btn-version:hover { color:var(--text-primary); }
    .btn-version.active { background:var(--primary); color:#fff; box-shadow:0 2px 8px rgba(99,102,241,0.3); }

    /* Server Control Bar */
    .server-bar { display:flex; justify-content:space-between; align-items:center; padding:10px 20px; background:rgba(16,185,129,.08); border:1px solid rgba(16,185,129,.15); border-radius:var(--radius-sm); margin-bottom:8px; position:sticky; top:0; z-index:100; backdrop-filter:blur(16px); }
    .server-status { display:flex; align-items:center; gap:10px; font-size:.85rem; color:var(--text-secondary); }
    .pulse-dot { width:8px; height:8px; background:#10b981; border-radius:50%; animation:pulse 2s ease-in-out infinite; }
    @keyframes pulse { 0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(16,185,129,.4)} 50%{opacity:.7;box-shadow:0 0 0 6px rgba(16,185,129,0)} }
    .countdown { color:var(--text-muted); font-size:.8rem; font-family:var(--font-heading); }
    .toggle-group { display:flex; align-items:center; gap:12px; }

    /* Toast */
    .toast { position:fixed; bottom:30px; left:50%; transform:translateX(-50%) translateY(100px); background:rgba(16,185,129,.9); color:#fff; padding:12px 28px; border-radius:999px; font-size:.9rem; font-weight:500; z-index:9999; opacity:0; transition:all .35s ease; pointer-events:none; backdrop-filter:blur(10px); }
    .toast.show { opacity:1; transform:translateX(-50%) translateY(0); }
    .toast.error { background:rgba(239,68,68,.9); }

    .page-footer { text-align:center; padding:40px 20px 20px; color:var(--text-muted); font-size:.82rem; }
    .no-results { display:none; text-align:center; padding:60px 20px; color:var(--text-muted); font-size:1.1rem; }

    ::-webkit-scrollbar { width:6px; height:6px; }
    ::-webkit-scrollbar-track { background:transparent; }
    ::-webkit-scrollbar-thumb { background:rgba(255,255,255,.1); border-radius:3px; }
    ::-webkit-scrollbar-thumb:hover { background:rgba(255,255,255,.2); }

    @media (max-width:768px) {
      .page-header h1 { gap: 10px; }
      .page-header h1 .header-text { font-size:1.8rem; }
      .page-header h1 .header-logo { height: 70px; }
      .album-grid { grid-template-columns:1fr; }
      .modal-content { max-width:100%; }
      .modal-body { padding:20px 16px 28px; }
    }
  `;
}

// ============================================================
function getJS() {
  return `
    let activeVersion = 'v1';
    let currentDetailIdx = null;

    function saveLocalState() {
      try {
        localStorage.setItem('custom_templates_v2', JSON.stringify(DATA.templates));
      } catch(e){}
    }

    function loadLocalState() {
      try {
        const saved = localStorage.getItem('custom_templates_v2');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            parsed.forEach(pt => {
              Object.keys(pt).forEach(k => {
                const match = k.match(/^(search|audio|report|info)(V[0-9]+)$/i);
                if (match) {
                  const correctKey = match[1] + 'Prompt' + match[2].toUpperCase();
                  if (pt[k] && (!pt[correctKey] || !pt[correctKey].trim())) {
                    pt[correctKey] = pt[k];
                  }
                  delete pt[k];
                }
              });

              const existingIdx = DATA.templates.findIndex(t => t.id === pt.id);
              if (existingIdx >= 0) {
                const orig = DATA.templates[existingIdx];
                Object.keys(pt).forEach(k => {
                  if (pt[k] !== undefined && pt[k] !== null) {
                    if (typeof pt[k] === 'string' && !pt[k].trim() && orig[k] && orig[k].trim()) {
                      return;
                    }
                    orig[k] = pt[k];
                  }
                });
              } else {
                DATA.templates.push(pt);
              }
            });
            saveLocalState();
          }
        }
      } catch(e){}
    }

    loadLocalState();

    function esc(s) { if (!s) return ''; const d=document.createElement('div'); d.textContent=s; return d.innerHTML; }
    function getIcon(id,name) {
      const n=(name||'').toLowerCase();
      if(n.includes('daily')||n.includes('สรุปจบ')) return '🌍';
      if(n.includes('weekly')||n.includes('รายสัปดาห์')) return '📅';
      if(n.includes('whale')||n.includes('วาฬ')) return '🐋';
      if(n.includes('small cap')||n.includes('radar')) return '📡';
      if(n.includes('hot stock')) return '🔥';
      if(n.includes('พุ่ง')||n.includes('pre-market')||n.includes('pre_market')) return '🚀';
      if(n.includes('ดวงใจ')) return '💖';
      if(n.includes('ขอมา')) return '🎯';
      if(n.includes('หมี')||n.includes('squeeze')) return '🐻';
      if(n.includes('vip')||n.includes('watchlist')) return '👑';
      if(n.includes('vp')||n.includes('opportunity')) return '🏆';
      if(n.includes('global')||n.includes('recap')) return '🌐';
      if(n.includes('next')) return '🔮';
      if(n.includes('astro')) return '✨';
      if(n.includes('calendar')||n.includes('economic')) return '📆';
      if(n.includes('ไทย')||n.includes('thai')) return '🇹🇭';
      if(n.includes('oversold')) return '📉';
      if(n.includes('cosmic')||n.includes('signal')) return '🌠';
      return '📋';
    }
    function getBadge(id,name) {
      const n=(name||'').toLowerCase();
      if(n.includes('daily')||n.includes('สรุปจบ')||n.includes('hot stock')||n.includes('พุ่ง')||n.includes('small cap')) return {text:'รายวัน',cls:'badge-daily'};
      if(n.includes('weekly')||n.includes('รายสัปดาห์')||n.includes('whale')||n.includes('วาฬ')||n.includes('recap')||n.includes('next')||n.includes('astro')||n.includes('calendar')||n.includes('oversold')||n.includes('cosmic')||n.includes('ไทย')) return {text:'รายสัปดาห์',cls:'badge-weekly'};
      return {text:'พิเศษ',cls:'badge-special'};
    }
    function statusBadge(st) {
      const m = {completed:'✅ สำเร็จ|status-completed', failed:'❌ ล้มเหลว|status-failed', running:'⏳ กำลังรัน|status-running', waiting_approval:'⏸️ รออนุมัติ|status-waiting'};
      const [txt,cls] = (m[st]||((st||'N/A')+'|')).split('|');
      return '<span class="status-badge '+cls+'">'+txt+'</span>';
    }

    // --- Render Cards & Stats ---
    function render() {
      const {templates, workflowsByTemplate, totalWorkflows, totalCompleted} = DATA;

      document.getElementById('stats-bar').innerHTML = [
        {v:templates.length,l:'รายการทั้งหมด'},
        {v:totalWorkflows,l:'Workflow ที่รัน'},
        {v:totalCompleted,l:'สำเร็จ'}
      ].map(s => '<div class="stat-item"><div class="stat-value">'+s.v+'</div><div class="stat-label">'+s.l+'</div></div>').join('');

      const grid = document.getElementById('album-grid');
      grid.innerHTML = templates.map((t,i) => {
        const icon = getIcon(t.id,t.name);
        const badge = getBadge(t.id,t.name);
        const wfs = workflowsByTemplate[t.id] || [];
        const completed = wfs.filter(w=>w.status==='completed').length;
        
        const versionKeys = getAvailableVersionsForTemplate(t);
        const versionSummaryText = versionKeys.map(v => {
          const suffix = v === 'v1' ? '' : v.toUpperCase();
          const cnt = [t['searchPrompt'+suffix], t['audioPrompt'+suffix], t['reportPrompt'+suffix], t['infoPrompt'+suffix]].filter(p=>p&&p.trim()).length;
          return v.toUpperCase() + ': ' + cnt;
        }).join(' | ');

        const hasS = versionKeys.some(v => { const s = v==='v1'?'':v.toUpperCase(); return t['searchPrompt'+s] && t['searchPrompt'+s].trim(); });
        const hasA = versionKeys.some(v => { const s = v==='v1'?'':v.toUpperCase(); return t['audioPrompt'+s] && t['audioPrompt'+s].trim(); });
        const hasR = versionKeys.some(v => { const s = v==='v1'?'':v.toUpperCase(); return t['reportPrompt'+s] && t['reportPrompt'+s].trim(); });
        const hasI = versionKeys.some(v => { const s = v==='v1'?'':v.toUpperCase(); return t['infoPrompt'+s] && t['infoPrompt'+s].trim(); });

        return '<div class="album-card" onclick="openDetail('+i+')" data-name="'+esc(t.name)+'" data-id="'+esc(t.id)+'">'+
          '<div class="card-header"><span class="card-icon">'+icon+'</span><span class="card-badge '+badge.cls+'">'+badge.text+'</span></div>'+
          '<h3 class="card-title">'+esc(t.name)+'</h3>'+
          '<div class="card-meta">'+
            '<div class="meta-item"><span>📝</span><span>'+versionSummaryText+' Prompts</span></div>'+
            '<div class="meta-item"><span>🎬</span><span>'+wfs.length+' ครั้งที่รัน'+(completed>0?' ('+completed+' สำเร็จ)':'')+'</span></div>'+
          '</div>'+
          '<div class="card-prompts-preview">'+
            (hasS?'<span class="prompt-dot" title="ค้นหาข่าว">🔍</span>':'')+
            (hasA?'<span class="prompt-dot" title="Audio">🎙️</span>':'')+
            (hasR?'<span class="prompt-dot" title="Facebook">📱</span>':'')+
            (hasI?'<span class="prompt-dot" title="Infographic">🖼️</span>':'')+
          '</div>'+
          '<div class="card-action"><span>ดูรายละเอียด & แก้ไข →</span></div>'+
        '</div>';
      }).join('');
    }

    function getAvailableVersionsForTemplate(t) {
      const vers = new Set(['v1', 'v2', 'v3']);
      const regex = new RegExp('^(search|audio|report|info)Prompt(V[0-9]+)$', 'i');
      Object.keys(t).forEach(k => {
        const m = k.match(regex);
        if (m) {
          vers.add(m[2].toLowerCase());
        }
      });
      return Array.from(vers).sort((a,b) => {
        const numA = parseInt(a.replace('v',''))||0;
        const numB = parseInt(b.replace('v',''))||0;
        return numA - numB;
      });
    }

    function getPromptPropKey(promptType) {
      const keyMap = { 
        search: 'searchPrompt', 
        audio: 'audioPrompt', 
        report: 'reportPrompt', 
        info: 'infoPrompt'
      };
      if (keyMap[promptType]) return keyMap[promptType];

      const match = promptType.match(/^(search|audio|report|info)(V[0-9]+)$/i);
      if (match) {
        return match[1] + 'Prompt' + match[2].toUpperCase();
      }
      return promptType;
    }

    window.switchVersion = function(ver) {
      activeVersion = ver.toLowerCase();
      openDetail(currentDetailIdx);
    }

    window.addNewVersion = function(templateIdx) {
      const vName = prompt('ระบุชื่อ Version ใหม่ที่ต้องการเพิ่ม (เช่น V4, V5):', 'V4');
      if (!vName) return;
      let cleanVer = vName.trim().toLowerCase();
      if (!cleanVer.startsWith('v')) {
        cleanVer = 'v' + cleanVer;
      }
      activeVersion = cleanVer;
      
      const t = DATA.templates[templateIdx];
      const suffix = cleanVer.toUpperCase();
      if (t['searchPrompt' + suffix] === undefined) t['searchPrompt' + suffix] = '';
      if (t['audioPrompt' + suffix] === undefined) t['audioPrompt' + suffix] = '';
      if (t['reportPrompt' + suffix] === undefined) t['reportPrompt' + suffix] = '';
      if (t['infoPrompt' + suffix] === undefined) t['infoPrompt' + suffix] = '';

      saveLocalState();
      openDetail(templateIdx);
      showToast('✨ เพิ่ม ' + cleanVer.toUpperCase() + ' เรียบร้อย — พิมพ์ Prompt แล้วกด Save เพื่อบันทึก');
    }

    function openDetail(idx) {
      currentDetailIdx = idx;
      const t = DATA.templates[idx];
      const wfs = DATA.workflowsByTemplate[t.id] || [];
      const icon = getIcon(t.id,t.name);

      const availableVersions = getAvailableVersionsForTemplate(t);
      if (!availableVersions.includes(activeVersion)) {
        availableVersions.push(activeVersion);
      }

      const keySuffix = activeVersion === 'v1' ? '' : activeVersion.toUpperCase();

      const getPromptVal = (key) => {
        return t[key + 'Prompt' + keySuffix] || '';
      };

      const prompts = [
        {key:'search',label:'🔍 Prompt ค้นหาข่าว (Search)',cls:'prompt-search',val: getPromptVal('search')},
        {key:'audio',label:'🎙️ Prompt Audio Overview',cls:'prompt-audio',val: getPromptVal('audio')},
        {key:'report',label:'📱 Prompt Report Facebook',cls:'prompt-report',val: getPromptVal('report')},
        {key:'info',label:'🖼️ Prompt Infographic',cls:'prompt-info',val: getPromptVal('info')},
      ];

      let versionButtonsHtml = availableVersions.map(v => {
        const isAct = v === activeVersion;
        return '<button class="btn-version '+(isAct?'active':'')+'" onclick="switchVersion(\\''+v+'\\')">Version '+v.replace('v','')+'</button>';
      }).join('') + '<button class="btn-add-version" onclick="addNewVersion('+idx+')">➕ เพิ่ม Version ใหม่</button>';

      let wfRows = '';
      if (wfs.length > 0) {
        wfs.forEach(wf => {
          wfRows += '<tr><td>'+esc(wf.dateStr||'N/A')+'</td><td class="cell-title">'+esc(wf.title||'N/A')+'</td><td>'+esc(wf.selectedFile||'N/A')+'</td><td>'+statusBadge(wf.status)+'</td><td>'+(wf.progress!=null?wf.progress+'%':'N/A')+'</td><td>';
          if (wf.logs && wf.logs.length > 0) {
            wfRows += '<button class="btn-logs" onclick="toggleLogs(event,\\'logs_'+wf.id+'\\')">📋 '+wf.logs.length+' logs</button>';
          } else { wfRows += '-'; }
          wfRows += '</td></tr>';
          if (wf.logs && wf.logs.length > 0) {
            wfRows += '<tr class="logs-row" id="logs_'+wf.id+'" style="display:none"><td colspan="6"><div class="logs-container">';
            wf.logs.forEach(l => wfRows += '<div class="log-line">'+esc(l)+'</div>');
            wfRows += '</div></td></tr>';
          }
        });
      } else {
        wfRows = '<tr><td colspan="6" class="no-data-cell">ยังไม่มีประวัติการรัน Workflow</td></tr>';
      }

      const modalHtml = '<div class="modal-overlay show" id="detail-modal" onclick="if(event.target===this)closeDetail()">'+
        '<div class="modal-content" onclick="event.stopPropagation()">'+
          '<div class="modal-header"><div class="modal-title-group"><span class="modal-icon">'+icon+'</span><div><h2>'+esc(t.name)+'</h2><span class="modal-id">ID: '+esc(t.id)+'</span></div></div><button class="modal-close" onclick="closeDetail()">&times;</button></div>'+
          '<div class="modal-body">'+
            '<h3 class="section-title" style="margin-bottom:12px">🎛️ การตั้งค่า Prompt ('+activeVersion.toUpperCase()+') <span style="font-size:.78rem;color:var(--text-muted);font-weight:400">— แก้ไขได้ กด Save เพื่อบันทึก</span></h3>'+
            '<div class="version-selector">'+versionButtonsHtml+'</div>'+
            '<div class="prompt-accordion">'+
            prompts.map(p => {
              const hasVal = !!(p.val && p.val.trim());
              const typeKey = p.key + (activeVersion === 'v1' ? '' : activeVersion.toUpperCase());
              return '<div class="prompt-section '+p.cls+'">'+
                '<button class="prompt-header-btn" onclick="toggleAccordion(this)"><span>'+p.label+'</span><span class="prompt-status">'+(hasVal?'✅ ตั้งค่าแล้ว':'⬜ ยังไม่ได้ตั้ง')+'</span><span class="chevron">▼</span></button>'+
                '<div class="prompt-body">'+
                  '<div class="prompt-actions">'+
                    '<button class="btn-sm btn-copy" onclick="copyText(\\'ta_'+t.id+'_'+typeKey+'\\',this)">📋 Copy</button>'+
                    '<button class="btn-sm btn-save" id="save_'+t.id+'_'+typeKey+'" onclick="savePrompt(\\''+t.id+'\\',\\''+typeKey+'\\','+idx+')" disabled>💾 Save</button>'+
                  '</div>'+
                  '<textarea class="prompt-textarea'+(hasVal?'':' no-data')+'" id="ta_'+t.id+'_'+typeKey+'" oninput="onPromptEdit(\\''+t.id+'\\',\\''+typeKey+'\\')" placeholder="ยังไม่ได้ตั้งค่า Prompt นี้ — พิมพ์เพื่อเพิ่ม...">'+(p.val||'')+'</textarea>'+
                '</div>'+
              '</div>';
            }).join('')+
            '</div>'+
            '<h3 class="section-title" style="margin-top:30px">📊 ประวัติ Workflow ('+wfs.length+' ครั้ง)</h3>'+
            '<div class="table-wrap"><table class="wf-table"><thead><tr><th>วันที่</th><th>ชื่องาน</th><th>ไฟล์ต้นฉบับ</th><th>สถานะ</th><th>Progress</th><th>Logs</th></tr></thead><tbody>'+wfRows+'</tbody></table></div>'+
          '</div>'+
        '</div>'+
      '</div>';

      document.getElementById('modal-container').innerHTML = modalHtml;
      document.body.style.overflow = 'hidden';
    }

    function closeDetail() {
      document.getElementById('modal-container').innerHTML = '';
      document.body.style.overflow = '';
    }

    // --- Modal: Add New Template ---
    window.openAddTemplateModal = function() {
      const modalHtml = '<div class="modal-overlay show" id="add-template-modal" onclick="if(event.target===this)closeAddModal()">'+
        '<div class="modal-content" style="max-width:720px" onclick="event.stopPropagation()">'+
          '<div class="modal-header"><div class="modal-title-group"><span class="modal-icon">➕</span><div><h2>เพิ่มรายการผลิตคลิปใหม่</h2><span class="modal-id">สร้างรายการแบบแผนคัดสรรและวิเคราะห์ด้วย NotebookLM</span></div></div><button class="modal-close" onclick="closeAddModal()">&times;</button></div>'+
            '<form onsubmit="submitNewTemplate(event)">'+
              '<div class="form-group">'+
                '<label class="form-label">ชื่อรายการ (เช่น This Week’s Watchlist — หุ้นอเมริกา):</label>'+
                '<input type="text" class="form-input" id="new-template-name" placeholder="ตัวอย่าง: This Week’s Watchlist — หุ้นอเมริกา" oninput="autoGenerateId()" required>'+
              '</div>'+
              '<div class="form-group">'+
                '<label class="form-label">ID ของรายการ <span style="font-size:.78rem;color:#818cf8;margin-left:6px">⚡ สร้างให้อัตโนมัติ</span>:</label>'+
                '<input type="text" class="form-input" id="new-template-id" placeholder="ระบบจะสร้าง ID ให้อัตโนมัติ..." readonly style="background:rgba(255,255,255,0.05);color:var(--primary-light);cursor:default">'+
              '</div>'+
              '<div class="form-group">'+
                '<label class="form-label">Prompt ค้นหาข่าว (Search Prompt):</label>'+
                '<textarea class="form-textarea" id="new-search-prompt" placeholder="ใส่ข้อความคำสั่งสำหรับการค้นหาข้อมูลข่าว..."></textarea>'+
              '</div>'+
              '<div class="form-group">'+
                '<label class="form-label">Prompt Audio Overview:</label>'+
                '<textarea class="form-textarea" id="new-audio-prompt" placeholder="ใส่สคริปต์แนะนำผู้ดำเนินรายการ..."></textarea>'+
              '</div>'+
              '<div class="form-group">'+
                '<label class="form-label">Prompt Report Facebook:</label>'+
                '<textarea class="form-textarea" id="new-report-prompt" placeholder="ใส่สคริปต์โพสต์บทวิเคราะห์..."></textarea>'+
              '</div>'+
              '<div class="form-group">'+
                '<label class="form-label">Prompt Infographic:</label>'+
                '<textarea class="form-textarea" id="new-info-prompt" placeholder="ใส่คำสั่งสร้างกราฟิกสรุปข้อมูล..."></textarea>'+
              '</div>'+
              '<div style="text-align:right;margin-top:20px">'+
                '<button type="button" class="btn-sm" style="margin-right:10px" onclick="closeAddModal()">ยกเลิก</button>'+
                '<button type="submit" class="btn-primary-add" id="btn-submit-template">💾 บันทึกรายการใหม่</button>'+
              '</div>'+
            '</form>'+
          '</div>'+
        '</div>'+
      '</div>';
      document.getElementById('add-modal-container').innerHTML = modalHtml;
    }

    window.closeAddModal = function() {
      document.getElementById('add-modal-container').innerHTML = '';
    }

    window.submitNewTemplate = async function(e) {
      e.preventDefault();
      const id = document.getElementById('new-template-id').value.trim();
      const name = document.getElementById('new-template-name').value.trim();
      const searchPrompt = document.getElementById('new-search-prompt').value;
      const audioPrompt = document.getElementById('new-audio-prompt').value;
      const reportPrompt = document.getElementById('new-report-prompt').value;
      const infoPrompt = document.getElementById('new-info-prompt').value;

      const btn = document.getElementById('btn-submit-template');
      btn.disabled = true;
      btn.textContent = '⏳ กำลังบันทึก...';

      const cleanId = id.toLowerCase().replace(/\\s+/g, '_');
      const newTmpl = {
        id: cleanId,
        name: name,
        searchPrompt: searchPrompt || '',
        audioPrompt: audioPrompt || '',
        reportPrompt: reportPrompt || '',
        infoPrompt: infoPrompt || ''
      };

      const existingIdx = DATA.templates.findIndex(t => t.id === cleanId);
      if (existingIdx >= 0) {
        DATA.templates[existingIdx] = Object.assign(DATA.templates[existingIdx], newTmpl);
      } else {
        DATA.templates.push(newTmpl);
      }
      saveLocalState();
      render();
      closeAddModal();

      try {
        const resp = await fetch('/api/add-template', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: cleanId, name, searchPrompt, audioPrompt, reportPrompt, infoPrompt })
        });
        const result = await resp.json();
        if (result.success) {
          showToast('🎉 เพิ่มรายการใหม่ "' + name + '" เรียบร้อย!');
          return;
        }
      } catch (err) {
        showToast('🎉 เพิ่มรายการใหม่ "' + name + '" เรียบร้อย!');
      }
    }

    function toggleAccordion(btn) {
      const body = btn.nextElementSibling;
      body.classList.toggle('show');
      btn.classList.toggle('open');
    }

    function toggleLogs(e, id) {
      e.stopPropagation();
      const row = document.getElementById(id);
      if (row) row.style.display = row.style.display === 'none' ? 'table-row' : 'none';
    }

    function copyText(taId, btn) {
      const ta = document.getElementById(taId);
      navigator.clipboard.writeText(ta.value).then(() => {
        btn.textContent = '✅ Copied!';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = '📋 Copy'; btn.classList.remove('copied'); }, 2000);
      });
    }

    function onPromptEdit(templateId, promptType) {
      const saveBtn = document.getElementById('save_'+templateId+'_'+promptType);
      if (saveBtn) saveBtn.disabled = false;
    }

    async function savePrompt(templateId, promptType, templateIdx) {
      const ta = document.getElementById('ta_'+templateId+'_'+promptType);
      const saveBtn = document.getElementById('save_'+templateId+'_'+promptType);
      const value = ta.value;

      saveBtn.disabled = true;
      saveBtn.textContent = '⏳ กำลังบันทึก...';

      const propKey = getPromptPropKey(promptType);
      DATA.templates[templateIdx][propKey] = value;
      saveLocalState();

      saveBtn.textContent = '✅ บันทึกแล้ว!';
      saveBtn.classList.add('saved');
      showToast('💾 บันทึก Prompt สำเร็จ!');

      const section = ta.closest('.prompt-section');
      const statusEl = section.querySelector('.prompt-status');
      if (statusEl) statusEl.textContent = value.trim() ? '✅ ตั้งค่าแล้ว' : '⬜ ยังไม่ได้ตั้ง';

      ta.classList.toggle('no-data', !value.trim());

      setTimeout(() => {
        saveBtn.textContent = '💾 Save';
        saveBtn.classList.remove('saved');
        saveBtn.disabled = false;
      }, 2000);

      render();

      try {
        await fetch('/api/save-prompt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ templateId, promptType, value })
        });
      } catch (e) {}
    }

    function filterCards() {
      const q = document.getElementById('album-search').value.trim().toLowerCase();
      const cards = document.querySelectorAll('.album-card');
      let found = 0;
      cards.forEach(c => {
        const name = (c.getAttribute('data-name')||'').toLowerCase();
        const id = (c.getAttribute('data-id')||'').toLowerCase();
        if (name.includes(q) || id.includes(q)) { c.style.display=''; found++; }
        else { c.style.display='none'; }
      });
      document.getElementById('no-results').style.display = found===0 ? 'block' : 'none';
    }

    function showToast(msg, isErr=false) {
      const t = document.getElementById('toast');
      t.textContent = msg;
      t.className = 'toast show' + (isErr ? ' error' : '');
      setTimeout(() => { t.className = 'toast'; }, 3000);
    }

    async function deployToGithub() {
      const btn = document.getElementById('btn-deploy');
      btn.textContent = '⏳ Deploying...';
      btn.classList.add('deploying');
      try {
        const resp = await fetch('/api/deploy', { method: 'POST' });
        const res = await resp.json();
        if (res.success) {
          btn.textContent = '✅ ' + (res.message || 'Deployed!');
          btn.classList.add('success');
          showToast('🚀 Deploy ขึ้น GitHub สำเร็จ!');
        } else {
          throw new Error(res.error || 'Deploy failed');
        }
      } catch (e) {
        btn.textContent = '❌ Deploy Failed';
        showToast('❌ Deploy ล้มเหลว: ' + e.message, true);
      }
      setTimeout(() => {
        btn.textContent = '🚀 Deploy';
        btn.classList.remove('deploying', 'success');
      }, 3000);
    }

    render();
  `;
}

// Export initial HTML files on load
exportAlbumHtml();
