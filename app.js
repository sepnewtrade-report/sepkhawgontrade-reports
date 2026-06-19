// State Management
let appState = {
    reports: [],
    activeCategory: 'all',
    searchQuery: '',
    sortBy: 'newest',
    selectedReport: null,
    viewMode: 'html' // 'html' or 'raw'
};

// DOM Elements
const elements = {
    searchInput: document.getElementById('search-input'),
    clearSearch: document.getElementById('clear-search'),
    categoryList: document.getElementById('category-list'),
    reportsGrid: document.getElementById('reports-grid'),
    sortSelect: document.getElementById('sort-select'),
    resultsInfo: document.getElementById('results-info'),
    
    // Views
    catalogView: document.getElementById('catalog-view'),
    readerView: document.getElementById('reader-view'),
    sectionTitle: document.getElementById('section-title'),
    
    // Stats
    statTotal: document.getElementById('stat-total-reports'),
    statPreMarket: document.getElementById('stat-pre-market'),
    statCosmic: document.getElementById('stat-cosmic'),
    
    // Reader Elements
    backBtn: document.getElementById('back-to-catalog'),
    readerTitle: document.getElementById('reader-title'),
    readerCategory: document.getElementById('reader-category'),
    readerDate: document.getElementById('reader-date'),
    readerSize: document.getElementById('reader-size'),
    markdownContainer: document.getElementById('markdown-container'),
    
    // Action Buttons
    btnCopyLink: document.getElementById('btn-copy-link'),
    btnPrint: document.getElementById('btn-print'),
    btnRaw: document.getElementById('btn-raw'),
    
    // Mobile Drawer
    mobileToggle: document.getElementById('mobile-toggle'),
    sidebar: document.getElementById('sidebar'),
    sidebarBackdrop: document.getElementById('sidebar-backdrop')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    setupEventListeners();
    await fetchReportsIndex();
    handleRouting();
}

// Event Listeners Configuration
function setupEventListeners() {
    // Search
    elements.searchInput.addEventListener('input', (e) => {
        appState.searchQuery = e.target.value.trim();
        elements.clearSearch.style.display = appState.searchQuery ? 'block' : 'none';
        renderCatalog();
    });
    
    elements.clearSearch.addEventListener('click', () => {
        elements.searchInput.value = '';
        appState.searchQuery = '';
        elements.clearSearch.style.display = 'none';
        renderCatalog();
    });
    
    // Sorting
    elements.sortSelect.addEventListener('change', (e) => {
        appState.sortBy = e.target.value;
        renderCatalog();
    });
    
    // Navigation back
    elements.backBtn.addEventListener('click', () => {
        window.location.hash = '';
    });
    
    // Mobile drawer toggles
    elements.mobileToggle.addEventListener('click', toggleMobileSidebar);
    elements.sidebarBackdrop.addEventListener('click', closeMobileSidebar);
    
    // Reader Actions
    elements.btnCopyLink.addEventListener('click', copyReportLink);
    elements.btnPrint.addEventListener('click', () => window.print());
    elements.btnRaw.addEventListener('click', toggleRawMarkdown);
    
    // Listen for hash change for routing
    window.addEventListener('hashchange', handleRouting);
}

// Fetch Reports Database
async function fetchReportsIndex() {
    try {
        const response = await fetch('reports-index.json');
        if (!response.ok) throw new Error('Failed to load reports database');
        
        appState.reports = await response.json();
        
        // Precompute which reports are the latest for each category
        const latestReports = {};
        appState.reports.forEach(report => {
            const cat = report.category;
            // Since the reports are already sorted newest-first, the first one encountered is the latest
            if (!latestReports[cat]) {
                latestReports[cat] = report.filename;
            }
        });
        
        appState.reports.forEach(report => {
            report.isLatest = (latestReports[report.category] === report.filename);
        });
        
        // Populate stats & filters
        renderStats();
        renderCategoriesMenu();
    } catch (error) {
        console.error('Error fetching index:', error);
        elements.reportsGrid.innerHTML = `
            <div class="error-state">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <h3>ไม่สามารถโหลดคลังรายงานได้</h3>
                <p>กรุณาตรวจสอบว่าคุณได้รันสคริปต์ <code>node generate-index.js</code> เพื่อสร้างฐานข้อมูลแล้ว</p>
            </div>
        `;
    }
}

// Router to handle URL Hash Changes (Permalinks)
function handleRouting() {
    const hash = window.location.hash;
    
    // Expected hash format: #report=category/file.md or #report=file.md
    if (hash && hash.startsWith('#report=')) {
        const filePath = decodeURIComponent(hash.substring(8));
        openReport(filePath);
    } else {
        closeReport();
    }
}

// Toggle Mobile Sidebar Drawer
function toggleMobileSidebar() {
    elements.sidebar.classList.toggle('mobile-open');
    elements.sidebarBackdrop.classList.toggle('active');
}

function closeMobileSidebar() {
    elements.sidebar.classList.remove('mobile-open');
    elements.sidebarBackdrop.classList.remove('active');
}

// Render Stats Section
function renderStats() {
    const total = appState.reports.length;
    const preMarket = appState.reports.filter(r => r.category === 'Pre-Market Analysis').length;
    const cosmic = appState.reports.filter(r => r.category === 'Cosmic Trade Signal').length;
    
    elements.statTotal.textContent = total;
    elements.statPreMarket.textContent = preMarket;
    elements.statCosmic.textContent = cosmic;
    document.getElementById('count-all').textContent = total;
}

// Render Categories Menu in Sidebar
function renderCategoriesMenu() {
    // Count reports per category
    const categoriesCount = {};
    appState.reports.forEach(report => {
        const cat = report.category;
        categoriesCount[cat] = (categoriesCount[cat] || 0) + 1;
    });
    
    // Get unique categories list
    const uniqueCategories = [...new Set(appState.reports.map(r => r.category))];
    
    // Clear dynamic items (keep first "all" item)
    const allItem = elements.categoryList.querySelector('[data-category="all"]');
    elements.categoryList.innerHTML = '';
    elements.categoryList.appendChild(allItem);
    
    // Sort categories alphabetically
    uniqueCategories.sort().forEach(catName => {
        const thaiName = appState.reports.find(r => r.category === catName)?.categoryThai || catName;
        
        // Assign icon based on category type
        let iconClass = 'fa-file-lines';
        const nameLower = catName.toLowerCase();
        if (nameLower.includes('pre-market')) iconClass = 'fa-bolt';
        else if (nameLower.includes('cosmic')) iconClass = 'fa-meteor';
        else if (nameLower.includes('small cap') || nameLower.includes('radar')) iconClass = 'fa-rocket';
        else if (nameLower.includes('whale') || nameLower.includes('วาฬ')) iconClass = 'fa-water';
        else if (nameLower.includes('oversold')) iconClass = 'fa-arrow-trend-down';
        else if (nameLower.includes('calendar') || nameLower.includes('economic')) iconClass = 'fa-calendar-days';
        else if (nameLower.includes('script')) iconClass = 'fa-microphone-lines';
        else if (nameLower.includes('hot stock') || nameLower.includes('hot')) iconClass = 'fa-fire';
        
        // New categories icons
        else if (nameLower.includes('market summary') || nameLower.includes('recap') || nameLower.includes('สรุปจบ')) iconClass = 'fa-newspaper';
        else if (nameLower.includes('bear squeeze') || nameLower.includes('หมี')) iconClass = 'fa-arrow-trend-up';
        else if (nameLower.includes('whats next') || nameLower.includes('next')) iconClass = 'fa-forward';
        else if (nameLower.includes('thai')) iconClass = 'fa-landmark';
        else if (nameLower.includes('astro economy')) iconClass = 'fa-moon';

        const li = document.createElement('li');
        li.className = 'category-item';
        li.setAttribute('data-category', catName);
        li.innerHTML = `
            <i class="fa-solid ${iconClass}"></i>
            <span>${thaiName}</span>
            <span class="badge count-badge">${categoriesCount[catName]}</span>
        `;
        
        li.addEventListener('click', () => {
            // Remove active classes
            document.querySelectorAll('.category-item').forEach(item => item.classList.remove('active'));
            li.classList.add('active');
            
            appState.activeCategory = catName;
            window.location.hash = ''; // Back to catalog list
            renderCatalog();
            closeMobileSidebar();
        });
        
        elements.categoryList.appendChild(li);
    });
    
    // Setup listener for "All" tab
    allItem.addEventListener('click', () => {
        document.querySelectorAll('.category-item').forEach(item => item.classList.remove('active'));
        allItem.classList.add('active');
        appState.activeCategory = 'all';
        window.location.hash = ''; // Back to catalog list
        renderCatalog();
        closeMobileSidebar();
    });
}

// Filter, Sort, and Render Reports List
function renderCatalog() {
    let filtered = [...appState.reports];
    
    // Update main section title
    if (appState.activeCategory === 'all') {
        elements.sectionTitle.textContent = "คลังบทวิเคราะห์และรายงานล่าสุด";
    } else {
        const currentCat = appState.reports.find(r => r.category === appState.activeCategory);
        elements.sectionTitle.textContent = currentCat ? currentCat.categoryThai : "บทวิเคราะห์";
    }
    
    // 1. Filter by category (On home page 'all', show ONLY the latest report of each category)
    if (appState.activeCategory === 'all') {
        filtered = filtered.filter(r => r.isLatest);
    } else {
        filtered = filtered.filter(r => r.category === appState.activeCategory);
    }
    
    // 2. Filter by Search Query
    if (appState.searchQuery) {
        const query = appState.searchQuery.toLowerCase();
        filtered = filtered.filter(r => 
            r.title.toLowerCase().includes(query) || 
            r.filename.toLowerCase().includes(query) ||
            r.categoryThai.toLowerCase().includes(query) ||
            r.date.includes(query)
        );
    }
    
    // 3. Sort
    if (appState.sortBy === 'newest') {
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date) || b.timestamp - a.timestamp);
    } else if (appState.sortBy === 'oldest') {
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date) || a.timestamp - b.timestamp);
    } else if (appState.sortBy === 'alphabetical') {
        filtered.sort((a, b) => a.title.localeCompare(b.title, 'th'));
    }
    
    elements.resultsInfo.textContent = `พบทั้งหมด ${filtered.length} รายการ`;
    
    // Clear grid
    elements.reportsGrid.innerHTML = '';
    
    if (filtered.length === 0) {
        elements.reportsGrid.innerHTML = `
            <div class="no-results">
                <i class="fa-regular fa-folder-open"></i>
                <h3>ไม่พบผลการค้นหา</h3>
                <p>กรุณาลองป้อนคำค้นหาอื่นหรือเลือกหมวดหมู่ที่ต่างออกไป</p>
            </div>
        `;
        return;
    }
    
    // Generate Cards
    filtered.forEach(report => {
        const card = document.createElement('div');
        
        // Define card border/theme classes based on category
        let categoryClass = 'general-report';
        const catLower = report.category.toLowerCase();
        if (catLower.includes('pre-market')) categoryClass = 'pre-market-analysis';
        else if (catLower.includes('cosmic')) categoryClass = 'cosmic-trade-signal';
        else if (catLower.includes('small cap') || catLower.includes('radar')) categoryClass = 'small-cap-research';
        else if (catLower.includes('whale')) categoryClass = 'whale-flow';
        else if (catLower.includes('oversold')) categoryClass = 'oversold-opportunity';
        else if (catLower.includes('script')) categoryClass = 'daily-script';
        else if (catLower.includes('hot stock')) categoryClass = 'hot-stock-today';
        else if (catLower.includes('market summary')) categoryClass = 'market-summary-card';
        else if (catLower.includes('bear squeeze')) categoryClass = 'bear-squeeze-card';
        else if (catLower.includes('global market recap')) categoryClass = 'global-recap-card';
        else if (catLower.includes('whats next')) categoryClass = 'whats-next-card';
        else if (catLower.includes('thai')) categoryClass = 'thai-stock-card';
        else if (catLower.includes('astro economy')) categoryClass = 'astro-economy-card';

        card.className = `report-card ${categoryClass}`;
        
        // Format file size
        const kbSize = (report.size / 1024).toFixed(1);
        const newBadgeHtml = report.isLatest ? `<span class="new-badge"><i class="fa-solid fa-fire"></i> NEW</span>` : '';
        
        card.innerHTML = `
            <div class="card-badge-row">
                <div style="display: flex; align-items: center; gap: 8px;">
                    ${newBadgeHtml}
                    <span class="card-date">${formatThaiDate(report.date)}</span>
                </div>
            </div>
            <h3 class="card-title">${report.title}</h3>
            <div class="card-footer">
                <span class="card-size"><i class="fa-regular fa-file"></i> ${kbSize} KB</span>
                <span class="card-action-text">อ่านรายละเอียด <i class="fa-solid fa-arrow-right"></i></span>
            </div>
        `;
        
        card.addEventListener('click', () => {
            // Navigate via hash router
            window.location.hash = `report=${encodeURIComponent(report.path)}`;
        });
        
        // If on Home page, wrap the card with the category title outside
        if (appState.activeCategory === 'all') {
            const group = document.createElement('div');
            group.className = 'report-card-group';
            group.innerHTML = `<h4 class="report-group-title">${report.categoryThai}</h4>`;
            group.appendChild(card);
            elements.reportsGrid.appendChild(group);
        } else {
            elements.reportsGrid.appendChild(card);
        }
    });
}

// Open and Render Selected Report
async function openReport(filePath) {
    const reportMeta = appState.reports.find(r => r.path === filePath);
    
    // Fallback if index hasn't loaded yet or path is not found
    if (!reportMeta) {
        elements.markdownContainer.innerHTML = `
            <div class="loading-spinner">
                <i class="fa-solid fa-circle-notch fa-spin"></i>
                <p>กำลังค้นหาเอกสารในสารบบ...</p>
            </div>
        `;
        // Toggle views
        elements.catalogView.classList.remove('active');
        elements.readerView.classList.add('active');
        
        // Retry shortly in case index is still loading
        setTimeout(() => {
            const retryMeta = appState.reports.find(r => r.path === filePath);
            if (retryMeta) {
                renderReportContent(retryMeta);
            } else {
                elements.markdownContainer.innerHTML = `
                    <div class="error-state">
                        <i class="fa-solid fa-file-excel"></i>
                        <h3>ไม่พบไฟล์รายงาน</h3>
                        <p>ไฟล์รายงานที่ระบุ (<code>${filePath}</code>) ไม่มีอยู่ในสารบบคลังบทวิเคราะห์</p>
                        <button class="back-btn" onclick="window.location.hash=''"><i class="fa-solid fa-house"></i> กลับสู่หน้าหลัก</button>
                    </div>
                `;
            }
        }, 1000);
        return;
    }

    renderReportContent(reportMeta);
}

async function renderReportContent(reportMeta) {
    appState.selectedReport = reportMeta;
    appState.viewMode = 'html';
    elements.btnRaw.innerHTML = '<i class="fa-solid fa-code"></i>';
    elements.btnRaw.title = 'ดูซอร์สโค้ด Markdown';

    // Set Header details
    elements.readerTitle.textContent = reportMeta.title;
    elements.readerCategory.textContent = reportMeta.categoryThai;
    elements.readerDate.innerHTML = `<i class="fa-regular fa-calendar"></i> ${formatThaiDate(reportMeta.date)}`;
    elements.readerSize.innerHTML = `<i class="fa-regular fa-file-lines"></i> ขนาด ${(reportMeta.size / 1024).toFixed(1)} KB`;

    // Toggle views
    elements.catalogView.classList.remove('active');
    elements.readerView.classList.add('active');
    
    // Scroll content area back to top
    elements.readerView.parentElement.scrollTop = 0;

    // Load and Compile Markdown file content
    try {
        const response = await fetch(reportMeta.path);
        if (!response.ok) throw new Error('File not found');
        
        const markdown = await response.text();
        
        // Store raw markdown in memory
        appState.rawMarkdown = markdown;
        
        // Render
        displayParsedHTML(markdown);
    } catch (error) {
        console.error('Error loading report file:', error);
        elements.markdownContainer.innerHTML = `
            <div class="error-state">
                <i class="fa-solid fa-file-excel"></i>
                <h3>ไม่สามารถเปิดไฟล์บทวิเคราะห์ได้</h3>
                <p>อาจเกิดจากไฟล์ถูกลบ ย้าย หรือระบบการเข้าถึงขัดข้อง (<code>${error.message}</code>)</p>
            </div>
        `;
    }
}

// Convert Markdown to HTML & Format Custom Elements (Alerts)
function displayParsedHTML(markdown) {
    // 1. Compile Markdown using marked
    let rawHtml = marked.parse(markdown);
    
    // 2. Sanitize HTML
    let cleanHtml = DOMPurify.sanitize(rawHtml);
    
    // Inject into container
    elements.markdownContainer.innerHTML = cleanHtml;
    
    // 3. Post-process elements (like blockquotes for alerts)
    const blockquotes = elements.markdownContainer.querySelectorAll('blockquote');
    blockquotes.forEach(bq => {
        const html = bq.innerHTML;
        
        // Replace marked alert formats with styled alert boxes
        if (html.includes('[!NOTE]')) {
            bq.classList.add('alert-note');
            bq.innerHTML = cleanAlertText(html, '[!NOTE]');
        } else if (html.includes('[!TIP]')) {
            bq.classList.add('alert-tip');
            bq.innerHTML = cleanAlertText(html, '[!TIP]');
        } else if (html.includes('[!IMPORTANT]')) {
            bq.classList.add('alert-important');
            bq.innerHTML = cleanAlertText(html, '[!IMPORTANT]');
        } else if (html.includes('[!WARNING]')) {
            bq.classList.add('alert-warning');
            bq.innerHTML = cleanAlertText(html, '[!WARNING]');
        } else if (html.includes('[!CAUTION]')) {
            bq.classList.add('alert-caution');
            bq.innerHTML = cleanAlertText(html, '[!CAUTION]');
        }
    });

    // 4. Adjust image source paths to make sure they display correctly
    // If the image tag refers to "Logo master.png" or "logo.png" and is in a folder, fix it.
    const images = elements.markdownContainer.querySelectorAll('img');
    images.forEach(img => {
        const src = img.getAttribute('src');
        if (src && !src.startsWith('http') && !src.startsWith('data:')) {
            // If the report is in a subdirectory (e.g. 'MEMBERSHIP CONTENT SYSTEM/file.md'),
            // but the image is actually at the root level, adjust the image path.
            if (appState.selectedReport.path.includes('/')) {
                // If img path is just 'Logo master.png', make it '../Logo master.png'
                if (!src.includes('/')) {
                    img.setAttribute('src', '../' + src);
                }
            }
        }
    });
}

// Clean [!ALERT] syntax out of blockquote paragraph markup
function cleanAlertText(html, token) {
    // Replace the token and any leading breaks or lines
    return html
        .replace(token, '')
        .replace(/^<p>\s*<br>/i, '<p>')
        .replace(/<p>\s*<br\s*\/?>\s*/i, '<p>')
        .replace(/<p>\s*&nbsp;\s*/i, '<p>')
        .replace(/&nbsp;/g, '');
}

// Close Reader View and Show Catalog
function closeReport() {
    appState.selectedReport = null;
    appState.rawMarkdown = null;
    
    elements.readerView.classList.remove('active');
    elements.catalogView.classList.add('active');
}

// Toggle between Rendered HTML and Raw Markdown view
function toggleRawMarkdown() {
    if (appState.viewMode === 'html') {
        appState.viewMode = 'raw';
        elements.btnRaw.innerHTML = '<i class="fa-solid fa-eye"></i>';
        elements.btnRaw.title = 'ดูหน้าเอกสารปกติ (HTML)';
        
        // Escape HTML tags to display raw markdown
        const escapedMarkdown = appState.rawMarkdown
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
            
        elements.markdownContainer.innerHTML = `
            <div style="font-family: monospace; font-size:14px; white-space: pre-wrap; background:#0f172a; padding: 24px; border-radius: 8px; border:1px solid var(--border-color); color:#cbd5e1; line-height:1.6;">
                ${escapedMarkdown}
            </div>
        `;
    } else {
        appState.viewMode = 'html';
        elements.btnRaw.innerHTML = '<i class="fa-solid fa-code"></i>';
        elements.btnRaw.title = 'ดูซอร์สโค้ด Markdown';
        displayParsedHTML(appState.rawMarkdown);
    }
}

// Copy Permalink of the Report to clipboard
function copyReportLink() {
    const permalink = `${window.location.origin}${window.location.pathname}#report=${encodeURIComponent(appState.selectedReport.path)}`;
    
    navigator.clipboard.writeText(permalink).then(() => {
        // Change icon temporarily to checkmark
        const originalIcon = elements.btnCopyLink.innerHTML;
        elements.btnCopyLink.innerHTML = '<i class="fa-solid fa-check" style="color:var(--accent-primary)"></i>';
        
        setTimeout(() => {
            elements.btnCopyLink.innerHTML = originalIcon;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy link:', err);
    });
}

// Helpers: Thai Date formatter
function formatThaiDate(dateString) {
    if (!dateString) return '';
    
    // Check if the format is YYYY-MM-DD
    const parts = dateString.split('-');
    if (parts.length === 3) {
        const months = [
            'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
            'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
        ];
        
        const day = parseInt(parts[2], 10);
        const monthName = months[parseInt(parts[1], 10) - 1];
        const year = parseInt(parts[0], 10) + 543; // Convert to Buddhist Era (BE)
        
        return `${day} ${monthName} ${year}`;
    }
    
    // Return original string if it is formatted like 'June 2026'
    return dateString;
}
