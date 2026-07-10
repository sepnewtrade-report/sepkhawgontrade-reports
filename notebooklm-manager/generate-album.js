#!/usr/bin/env node
/**
 * 📚 NotebookLM Album — Standalone Program
 * 
 * แสดงรายการผลิตคลิป NotebookLM ทั้งหมด พร้อม Prompt 4 ประเภท
 * สามารถแก้ไข Prompt และบันทึกกลับลง templates.json ได้ทันที
 * 
 * วิธีใช้: node generate-album.js
 * จากนั้นเปิด http://localhost:3457 ในเบราว์เซอร์
 * กด Ctrl+C เพื่อปิดโปรแกรม
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const url = require('url');

const PORT = 3457;
const TEMPLATES_FILE = path.join(__dirname, 'templates.json');
const WORKFLOWS_FILE = path.join(__dirname, 'workflows_history.json');

// Auto-shutdown: เข้าโหมดพักหลังไม่มีคนใช้ 5 นาที
const AUTO_SHUTDOWN_MS = 5 * 60 * 1000;
let shutdownTimer = null;
let isPaused = false;

function resetShutdownTimer() {
  if (shutdownTimer) clearTimeout(shutdownTimer);
  if (isPaused) return; // ไม่ตั้ง timer ถ้าพักอยู่แล้ว
  shutdownTimer = setTimeout(() => {
    console.log('\n⏱️  ไม่มีการใช้งาน 5 นาที — เข้าโหมดพักอัตโนมัติ');
    isPaused = true;
    console.log('💤 Server เข้าสู่โหมดพัก (กดเปิดได้จากหน้าเว็บ)');
  }, AUTO_SHUTDOWN_MS);
}

function getTimeRemaining() {
  return AUTO_SHUTDOWN_MS;
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

// --- Server ---
const server = http.createServer((req, res) => {
  const parsed = new URL(req.url, `http://localhost:${PORT}`);

  // Reset auto-shutdown timer on every request
  resetShutdownTimer();

  // API: Heartbeat (reset timer, return remaining time + paused state)
  if (parsed.pathname === '/api/heartbeat' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ alive: true, paused: isPaused, autoShutdownMs: AUTO_SHUTDOWN_MS }));
    return;
  }

  // API: Pause (เข้าโหมดพัก)
  if (parsed.pathname === '/api/pause' && req.method === 'POST') {
    isPaused = true;
    if (shutdownTimer) clearTimeout(shutdownTimer);
    console.log('\n💤 เข้าโหมดพักตามคำสั่งจากหน้าเว็บ');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, paused: true }));
    return;
  }

  // API: Resume (กลับมาทำงาน)
  if (parsed.pathname === '/api/resume' && req.method === 'POST') {
    isPaused = false;
    resetShutdownTimer();
    console.log('\n🟢 กลับมาทำงานตามคำสั่งจากหน้าเว็บ');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, paused: false }));
    return;
  }

  // API: GET data
  if (parsed.pathname === '/api/album-data' && req.method === 'GET') {
    try {
      const templates = loadTemplates();
      const workflows = loadWorkflows();
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ templates, workflows }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // API: SAVE prompt
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
        const keyMap = { search: 'searchPrompt', audio: 'audioPrompt', report: 'reportPrompt', info: 'infoPrompt' };
        const key = keyMap[promptType];
        if (!key) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid prompt type' }));
          return;
        }
        tmpl[key] = value;
        saveTemplates(templates);
        console.log(`💾 บันทึก ${promptType} prompt ของ "${tmpl.name}" สำเร็จ`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // Serve HTML page
  if (parsed.pathname === '/' || parsed.pathname === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(generateHtml(isPaused));
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, () => {
  resetShutdownTimer();
  console.log('');
  console.log('━'.repeat(55));
  console.log('  📚 NotebookLM Album — Standalone Program');
  console.log('━'.repeat(55));
  console.log(`  🌐 เปิดเบราว์เซอร์ไปที่: http://localhost:${PORT}`);
  console.log('  ⏱️  Auto-shutdown: ปิดอัตโนมัติหลังไม่มีการใช้ 5 นาที');
  console.log('  🛑 หรือกดปุ่ม "ปิดระบบ" บนหน้าเว็บ');
  console.log('━'.repeat(55));
  console.log('');
});

// --- HTML Generator ---
function generateHtml(paused) {
  const templates = loadTemplates();
  const workflows = loadWorkflows();

  const generatedDate = new Date().toLocaleDateString('th-TH', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  const totalWorkflows = Object.keys(workflows).length;
  const totalCompleted = Object.values(workflows).filter(w => w.status === 'completed').length;

  // Build templates data as JSON for the frontend
  const workflowsByTemplate = {};
  Object.values(workflows).forEach(wf => {
    const tid = wf.templateId;
    if (!workflowsByTemplate[tid]) workflowsByTemplate[tid] = [];
    workflowsByTemplate[tid].push(wf);
  });
  Object.keys(workflowsByTemplate).forEach(tid => {
    workflowsByTemplate[tid].sort((a, b) => (b.dateStr || '').localeCompare(a.dateStr || ''));
  });

  // Serialize data for frontend
  const clientData = JSON.stringify({ templates, workflowsByTemplate, totalWorkflows, totalCompleted, isPaused: paused });

  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>📚 Album รายการผลิตคลิป — เสพข่าวก่อนเทรด หุ้นอเมริกา</title>
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
        <span id="server-status-text">Server กำลังทำงาน</span>
        <span class="countdown" id="countdown">⏱️ ปิดอัตโนมัติใน 5:00</span>
      </div>
      <div class="toggle-group">
        <span class="toggle-label" id="toggle-label">ON</span>
        <label class="toggle-switch" id="toggle-switch">
          <input type="checkbox" id="server-toggle" checked onchange="handleToggle(this)">
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>

    <header class="page-header">
      <h1>📚 Album รายการผลิตคลิป</h1>
      <p>รวบรวมทุกรายการที่ผลิตผ่าน NotebookLM พร้อม Prompt และประวัติ Workflow — แก้ไข Prompt ได้ทันที</p>
      <div class="stats-bar" id="stats-bar"></div>
      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input type="text" id="album-search" placeholder="ค้นหารายการ..." oninput="filterCards()">
      </div>
    </header>
    <div class="album-grid" id="album-grid"></div>
    <div class="no-results" id="no-results">ไม่พบรายการที่ค้นหา</div>
    <footer class="page-footer">
      <p>🎙️ เสพข่าวก่อนเทรด หุ้นอเมริกา — Album Generator (Standalone)</p>
      <p>อัปเดตล่าสุด: ${generatedDate}</p>
    </footer>
  </div>

  <!-- Modal container -->
  <div id="modal-container"></div>

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
    .page-header { text-align:center; padding:48px 20px 36px; }
    .page-header h1 { font-family:var(--font-heading); font-size:2.6rem; font-weight:700; background:linear-gradient(135deg,#818cf8,#a855f7,#ec4899); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; margin-bottom:10px; }
    .page-header p { color:var(--text-secondary); font-size:1.05rem; max-width:650px; margin:0 auto; }
    .stats-bar { display:flex; justify-content:center; gap:36px; margin-top:28px; flex-wrap:wrap; }
    .stat-item { text-align:center; }
    .stat-value { font-family:var(--font-heading); font-size:2rem; font-weight:700; color:var(--primary-light); }
    .stat-label { font-size:.85rem; color:var(--text-muted); margin-top:2px; }
    .search-bar { max-width:480px; margin:32px auto 0; position:relative; }
    .search-bar input { width:100%; padding:12px 16px 12px 44px; border-radius:999px; border:1px solid var(--border-color); background:var(--bg-surface); color:var(--text-primary); font-size:15px; font-family:var(--font-body); outline:none; transition:border-color .2s,box-shadow .2s; }
    .search-bar input:focus { border-color:var(--border-glow); box-shadow:0 0 0 3px rgba(99,102,241,.12); }
    .search-bar input::placeholder { color:var(--text-muted); }
    .search-bar .search-icon { position:absolute; left:16px; top:50%; transform:translateY(-50%); color:var(--text-muted); font-size:16px; pointer-events:none; }

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
    .card-prompts-preview { display:flex; gap:8px; margin-bottom:16px; }
    .prompt-dot { font-size:1.1rem; width:34px; height:34px; display:flex; align-items:center; justify-content:center; border-radius:8px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.06); }
    .card-action { text-align:right; font-size:.85rem; color:var(--primary-light); font-weight:500; opacity:0; transform:translateX(-6px); transition:all .25s; }
    .album-card:hover .card-action { opacity:1; transform:translateX(0); }

    /* Modal */
    .modal-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,.72); backdrop-filter:blur(8px); z-index:1000; justify-content:center; align-items:flex-start; padding:40px 20px; overflow-y:auto; }
    .modal-overlay.show { display:flex; }
    .modal-content { background:linear-gradient(180deg,rgba(18,18,35,.98),rgba(12,12,24,.98)); border:1px solid rgba(99,102,241,.2); border-radius:var(--radius-lg); width:100%; max-width:960px; max-height:90vh; overflow-y:auto; box-shadow:0 24px 80px rgba(0,0,0,.5),0 0 60px rgba(99,102,241,.06); animation:modalIn .3s ease; }
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
    .no-data { color:var(--text-muted); font-style:italic; }
    .no-data-cell { text-align:center; color:var(--text-muted); padding:24px !important; }

    /* Server Control Bar */
    .server-bar { display:flex; justify-content:space-between; align-items:center; padding:10px 20px; background:rgba(16,185,129,.08); border:1px solid rgba(16,185,129,.15); border-radius:var(--radius-sm); margin-bottom:8px; position:sticky; top:0; z-index:100; backdrop-filter:blur(16px); transition:background .4s ease, border-color .4s ease; }
    .server-status { display:flex; align-items:center; gap:10px; font-size:.85rem; color:var(--text-secondary); }
    .pulse-dot { width:8px; height:8px; background:#10b981; border-radius:50%; animation:pulse 2s ease-in-out infinite; transition:background .3s; }
    @keyframes pulse { 0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(16,185,129,.4)} 50%{opacity:.7;box-shadow:0 0 0 6px rgba(16,185,129,0)} }
    .countdown { color:var(--text-muted); font-size:.8rem; font-family:var(--font-heading); }
    .server-bar.offline { background:rgba(239,68,68,.08); border-color:rgba(239,68,68,.15); }
    .server-bar.offline .pulse-dot { background:#ef4444; animation:none; }

    /* Toggle Switch */
    .toggle-group { display:flex; align-items:center; gap:12px; }
    .toggle-label { font-family:var(--font-heading); font-size:.82rem; font-weight:600; letter-spacing:.5px; color:#34d399; transition:color .3s; min-width:28px; text-align:right; }
    .toggle-label.off { color:#f87171; }
    .toggle-switch { position:relative; display:inline-block; width:52px; height:28px; cursor:pointer; }
    .toggle-switch input { opacity:0; width:0; height:0; }
    .toggle-slider { position:absolute; inset:0; background:rgba(239,68,68,.25); border:1px solid rgba(239,68,68,.35); border-radius:999px; transition:all .35s cubic-bezier(.4,.0,.2,1); }
    .toggle-slider::before { content:''; position:absolute; left:3px; top:50%; transform:translateY(-50%); width:20px; height:20px; background:#fff; border-radius:50%; transition:all .35s cubic-bezier(.4,.0,.2,1); box-shadow:0 2px 6px rgba(0,0,0,.25); }
    .toggle-switch input:checked + .toggle-slider { background:rgba(16,185,129,.3); border-color:rgba(16,185,129,.45); box-shadow:0 0 12px rgba(16,185,129,.15); }
    .toggle-switch input:checked + .toggle-slider::before { transform:translateY(-50%) translateX(24px); background:#34d399; box-shadow:0 0 10px rgba(16,185,129,.4),0 2px 6px rgba(0,0,0,.2); }
    .toggle-switch:hover .toggle-slider { box-shadow:0 0 16px rgba(99,102,241,.12); }
    .toggle-switch:active .toggle-slider::before { width:24px; }

    /* Sleep Overlay */
    #sleep-overlay { position:fixed; inset:0; z-index:50; background:rgba(6,6,12,.85); backdrop-filter:blur(12px); display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity .4s ease; pointer-events:none; }
    #sleep-overlay.show { opacity:1; pointer-events:auto; }
    .sleep-content { text-align:center; animation:sleepFloat 3s ease-in-out infinite; }
    .sleep-icon { font-size:4rem; margin-bottom:16px; }
    .sleep-content h2 { font-family:var(--font-heading); font-size:1.8rem; color:var(--text-primary); margin-bottom:8px; }
    .sleep-content p { color:var(--text-secondary); font-size:1rem; max-width:400px; }
    @keyframes sleepFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }

    /* Toast */
    .toast { position:fixed; bottom:30px; left:50%; transform:translateX(-50%) translateY(100px); background:rgba(16,185,129,.9); color:#fff; padding:12px 28px; border-radius:999px; font-size:.9rem; font-weight:500; z-index:9999; opacity:0; transition:all .35s ease; pointer-events:none; backdrop-filter:blur(10px); }
    .toast.show { opacity:1; transform:translateX(-50%) translateY(0); }
    .toast.error { background:rgba(239,68,68,.9); }

    /* Footer */
    .page-footer { text-align:center; padding:40px 20px 20px; color:var(--text-muted); font-size:.82rem; }
    .no-results { display:none; text-align:center; padding:60px 20px; color:var(--text-muted); font-size:1.1rem; }

    /* Scrollbar */
    ::-webkit-scrollbar { width:6px; height:6px; }
    ::-webkit-scrollbar-track { background:transparent; }
    ::-webkit-scrollbar-thumb { background:rgba(255,255,255,.1); border-radius:3px; }
    ::-webkit-scrollbar-thumb:hover { background:rgba(255,255,255,.2); }

    @media (max-width:768px) {
      .page-header h1 { font-size:1.8rem; }
      .album-grid { grid-template-columns:1fr; }
      .modal-content { max-width:100%; }
      .modal-body { padding:20px 16px 28px; }
      .modal-header { padding:20px 16px; }
    }
  `;
}

// ============================================================
function getJS() {
  return `
    // --- Helpers ---
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

    // --- Render ---
    function render() {
      const {templates, workflowsByTemplate, totalWorkflows, totalCompleted} = DATA;

      // Stats
      document.getElementById('stats-bar').innerHTML = [
        {v:templates.length,l:'รายการทั้งหมด'},
        {v:totalWorkflows,l:'Workflow ที่รัน'},
        {v:totalCompleted,l:'สำเร็จ'}
      ].map(s => '<div class="stat-item"><div class="stat-value">'+s.v+'</div><div class="stat-label">'+s.l+'</div></div>').join('');

      // Cards
      const grid = document.getElementById('album-grid');
      grid.innerHTML = templates.map((t,i) => {
        const icon = getIcon(t.id,t.name);
        const badge = getBadge(t.id,t.name);
        const wfs = workflowsByTemplate[t.id] || [];
        const completed = wfs.filter(w=>w.status==='completed').length;
        const has = [t.searchPrompt,t.audioPrompt,t.reportPrompt,t.infoPrompt].filter(p=>p&&p.trim()).length;
        const hasS=!!(t.searchPrompt&&t.searchPrompt.trim()), hasA=!!(t.audioPrompt&&t.audioPrompt.trim()), hasR=!!(t.reportPrompt&&t.reportPrompt.trim()), hasI=!!(t.infoPrompt&&t.infoPrompt.trim());

        return '<div class="album-card" onclick="openDetail('+i+')" data-name="'+esc(t.name)+'" data-id="'+esc(t.id)+'">'+
          '<div class="card-header"><span class="card-icon">'+icon+'</span><span class="card-badge '+badge.cls+'">'+badge.text+'</span></div>'+
          '<h3 class="card-title">'+esc(t.name)+'</h3>'+
          '<div class="card-meta">'+
            '<div class="meta-item"><span>📝</span><span>'+has+' Prompts ตั้งค่า</span></div>'+
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

    // --- Detail Modal ---
    function openDetail(idx) {
      const t = DATA.templates[idx];
      const wfs = DATA.workflowsByTemplate[t.id] || [];
      const icon = getIcon(t.id,t.name);

      const prompts = [
        {key:'search',label:'🔍 Prompt ค้นหาข่าว (Search)',cls:'prompt-search',val:t.searchPrompt||''},
        {key:'audio',label:'🎙️ Prompt Audio Overview',cls:'prompt-audio',val:t.audioPrompt||''},
        {key:'report',label:'📱 Prompt Report Facebook',cls:'prompt-report',val:t.reportPrompt||''},
        {key:'info',label:'🖼️ Prompt Infographic',cls:'prompt-info',val:t.infoPrompt||''},
      ];

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
            '<h3 class="section-title">🎛️ การตั้งค่า Prompt ทั้ง 4 ประเภท <span style="font-size:.78rem;color:var(--text-muted);font-weight:400">— แก้ไขได้ กด Save เพื่อบันทึก</span></h3>'+
            '<div class="prompt-accordion">'+
            prompts.map(p => {
              const hasVal = !!(p.val && p.val.trim());
              return '<div class="prompt-section '+p.cls+'">'+
                '<button class="prompt-header-btn" onclick="toggleAccordion(this)"><span>'+p.label+'</span><span class="prompt-status">'+(hasVal?'✅ ตั้งค่าแล้ว':'⬜ ยังไม่ได้ตั้ง')+'</span><span class="chevron">▼</span></button>'+
                '<div class="prompt-body">'+
                  '<div class="prompt-actions">'+
                    '<button class="btn-sm btn-copy" onclick="copyText(\\'ta_'+t.id+'_'+p.key+'\\',this)">📋 Copy</button>'+
                    '<button class="btn-sm btn-save" id="save_'+t.id+'_'+p.key+'" onclick="savePrompt(\\''+t.id+'\\',\\''+p.key+'\\','+idx+')" disabled>💾 Save</button>'+
                  '</div>'+
                  '<textarea class="prompt-textarea'+(hasVal?'':' no-data')+'" id="ta_'+t.id+'_'+p.key+'" oninput="onPromptEdit(\\''+t.id+'\\',\\''+p.key+'\\')" placeholder="ยังไม่ได้ตั้งค่า Prompt นี้ — พิมพ์เพื่อเพิ่ม...">'+(p.val||'')+'</textarea>'+
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

      try {
        const resp = await fetch('/api/save-prompt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ templateId, promptType, value })
        });
        const result = await resp.json();
        if (result.success) {
          // Update local data
          const keyMap = {search:'searchPrompt',audio:'audioPrompt',report:'reportPrompt',info:'infoPrompt'};
          DATA.templates[templateIdx][keyMap[promptType]] = value;

          saveBtn.textContent = '✅ บันทึกแล้ว!';
          saveBtn.classList.add('saved');
          showToast('💾 บันทึก Prompt สำเร็จ!');

          // Update status text
          const section = ta.closest('.prompt-section');
          const statusEl = section.querySelector('.prompt-status');
          if (statusEl) statusEl.textContent = value.trim() ? '✅ ตั้งค่าแล้ว' : '⬜ ยังไม่ได้ตั้ง';

          // Update textarea styling
          ta.classList.toggle('no-data', !value.trim());

          setTimeout(() => {
            saveBtn.textContent = '💾 Save';
            saveBtn.classList.remove('saved');
          }, 2000);

          // Re-render cards to update prompt count
          render();
        } else {
          throw new Error(result.error || 'Unknown error');
        }
      } catch (e) {
        saveBtn.textContent = '❌ ผิดพลาด';
        showToast('❌ บันทึกล้มเหลว: ' + e.message);
        setTimeout(() => { saveBtn.textContent = '💾 Save'; saveBtn.disabled = false; }, 2000);
      }
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

    // --- Pause/Resume & Countdown ---
    let countdownSec = 5 * 60;
    let countdownInterval = null;
    let heartbeatInterval = null;
    let isServerPaused = DATA.isPaused || false;

    function startCountdown() {
      countdownSec = 5 * 60;
      updateCountdownDisplay();
      if (countdownInterval) clearInterval(countdownInterval);
      countdownInterval = setInterval(() => {
        countdownSec--;
        updateCountdownDisplay();
        if (countdownSec <= 0) {
          clearInterval(countdownInterval);
          // Auto-pause เมื่อหมดเวลา
          pauseServer(true);
        }
      }, 1000);
    }

    function updateCountdownDisplay() {
      const m = Math.floor(countdownSec / 60);
      const s = countdownSec % 60;
      const el = document.getElementById('countdown');
      if (el) el.textContent = '⏱️ พักอัตโนมัติใน ' + m + ':' + String(s).padStart(2,'0');
    }

    function resetCountdown() {
      if (!isServerPaused) countdownSec = 5 * 60;
    }

    // Heartbeat: keep server alive while page is open + reset countdown
    function startHeartbeat() {
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      heartbeatInterval = setInterval(async () => {
        try {
          const resp = await fetch('/api/heartbeat');
          if (resp.ok) {
            const data = await resp.json();
            if (data.paused && !isServerPaused) {
              markPaused();
            } else if (!data.paused && isServerPaused) {
              markActive();
            } else if (!data.paused) {
              resetCountdown();
            }
          }
        } catch (e) {
          // Server truly dead
        }
      }, 30 * 1000); // every 30s
    }

    function markPaused() {
      isServerPaused = true;
      const bar = document.getElementById('server-bar');
      if (bar) bar.classList.add('offline');
      const statusText = document.getElementById('server-status-text');
      if (statusText) statusText.textContent = '💤 โหมดพัก';
      const el = document.getElementById('countdown');
      if (el) el.textContent = '⏸️ กดเปิดเพื่อใช้งานต่อ';
      const toggleLabel = document.getElementById('toggle-label');
      if (toggleLabel) { toggleLabel.textContent = 'OFF'; toggleLabel.classList.add('off'); }
      const toggle = document.getElementById('server-toggle');
      if (toggle) toggle.checked = false;
      if (countdownInterval) clearInterval(countdownInterval);
      // Show sleep overlay
      showSleepOverlay(true);
    }

    function markActive() {
      isServerPaused = false;
      const bar = document.getElementById('server-bar');
      if (bar) bar.classList.remove('offline');
      const statusText = document.getElementById('server-status-text');
      if (statusText) statusText.textContent = 'Server กำลังทำงาน';
      const toggleLabel = document.getElementById('toggle-label');
      if (toggleLabel) { toggleLabel.textContent = 'ON'; toggleLabel.classList.remove('off'); }
      const toggle = document.getElementById('server-toggle');
      if (toggle) toggle.checked = true;
      showSleepOverlay(false);
      startCountdown();
    }

    function showSleepOverlay(show) {
      let overlay = document.getElementById('sleep-overlay');
      if (show) {
        if (!overlay) {
          overlay = document.createElement('div');
          overlay.id = 'sleep-overlay';
          overlay.innerHTML = '<div class="sleep-content">' +
            '<div class="sleep-icon">💤</div>' +
            '<h2>โหมดพัก</h2>' +
            '<p>Server กำลังพัก — กดปุ่ม toggle ด้านบนเพื่อเปิดใช้งานอีกครั้ง</p>' +
          '</div>';
          document.body.appendChild(overlay);
        }
        requestAnimationFrame(() => overlay.classList.add('show'));
      } else {
        if (overlay) {
          overlay.classList.remove('show');
          setTimeout(() => overlay.remove(), 400);
        }
      }
    }

    async function pauseServer(isAuto) {
      try {
        await fetch('/api/pause', { method: 'POST' });
        showToast(isAuto ? '💤 ไม่มีการใช้งาน — เข้าโหมดพัก' : '💤 เข้าโหมดพักแล้ว');
        markPaused();
      } catch (e) { /* ignore */ }
    }

    async function resumeServer() {
      try {
        const resp = await fetch('/api/resume', { method: 'POST' });
        if (resp.ok) {
          showToast('🟢 กลับมาทำงานแล้ว!');
          markActive();
          return true;
        }
      } catch (e) { /* ignore */ }
      return false;
    }

    async function handleToggle(checkbox) {
      if (!checkbox.checked) {
        // Turning OFF — pause server
        await pauseServer(false);
      } else {
        // Turning ON — resume server
        const ok = await resumeServer();
        if (!ok) {
          checkbox.checked = false;
          showToast('❌ ไม่สามารถเปิดได้', true);
        }
      }
    }

    function showToast(msg, isError) {
      const t = document.getElementById('toast');
      t.textContent = msg;
      t.className = 'toast show' + (isError ? ' error' : '');
      setTimeout(() => t.className = 'toast', 3000);
    }

    // Escape key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeDetail();
    });

    // User activity resets countdown
    ['click','mousemove','keydown','scroll','touchstart'].forEach(evt => {
      document.addEventListener(evt, () => resetCountdown(), { passive:true });
    });

    // Init
    render();
    if (isServerPaused) {
      markPaused();
    } else {
      startCountdown();
    }
    startHeartbeat();
  `;
}
