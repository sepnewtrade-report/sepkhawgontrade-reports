// State Management
let appState = {
    reports: [],
    activeCategory: 'all',
    searchQuery: '',
    sortBy: 'newest',
    selectedReport: null,
    viewMode: 'html', // 'html' or 'raw'
    lang: localStorage.getItem('sep_lang') || 'th',
    portfolioStocks: [],
    totalVisits: 128450,
    activeOnline: 12
};

const translations = {
    th: {
        channelTitle: "เสพข่าวก่อนเทรด",
        channelSubtitle: "หุ้นอเมริกา",
        searchPlaceholder: "ค้นหาบทวิเคราะห์...",
        dimensionsTitle: "มิติต่างๆ ในตลาดการเงิน",
        allReports: "รายงานทั้งหมด",
        vaultTitle: "คลังบทวิเคราะห์และรายงานล่าสุด",
        vaultSubtitle: "อัปเดตข้อมูลเจาะลึกตลาดหุ้นสหรัฐฯ เรียลไทม์ส่งตรงจากห้องเทรด",
        statusConnected: "เชื่อมต่อฐานข้อมูลข่าวแล้ว",
        statTotalReports: "รายงานทั้งหมด",
        statSummary: "สรุปจบ ทันโลกหุ้น",
        statSmallCap: "Small Cap Radar",
        foundCount: "พบทั้งหมด {count} รายการ",
        sortByLabel: "เรียงตาม:",
        sortNewest: "ใหม่ที่สุด",
        sortOldest: "เก่าที่สุด",
        sortAlphabetical: "ชื่อบทความ A-Z",
        backToCatalog: "กลับไปหน้าคลังรายงาน",
        copyLinkTitle: "คัดลอกลิงก์รายงาน",
        printTitle: "พิมพ์หน้านี้ / บันทึกเป็น PDF",
        rawCodeTitle: "ดูซอร์สโค้ด Markdown",
        viewNormalTitle: "ดูหน้าเอกสารปกติ (HTML)",
        metaSize: "ขนาด {size} KB",
        errorLoading: "ไม่สามารถโหลดคลังรายงานได้",
        errorLoadingSub: "กรุณาตรวจสอบว่าคุณได้รันสคริปต์ {code} เพื่อสร้างฐานข้อมูลแล้ว",
        noResults: "ไม่พบผลการค้นหา",
        noResultsSub: "กรุณาลองป้อนคำค้นหาอื่นหรือเลือกหมวดหมู่ที่ต่างออกไป",
        loadingSpinner: "กำลังดึงข้อมูลบทวิเคราะห์...",
        reportNotFound: "ไม่พบไฟล์รายงาน",
        reportNotFoundSub: "ไฟล์รายงานที่ระบุ ({path}) ไม่มีอยู่ในสารบบคลังบทวิเคราะห์",
        btnHome: "กลับสู่หน้าหลัก",
        loadingDocument: "กำลังค้นหาเอกสารในสารบบ...",
        failedToOpen: "ไม่สามารถเปิดไฟล์บทวิเคราะห์ได้",
        failedToOpenSub: "อาจเกิดจากไฟล์ถูกลบ ย้าย หรือระบบการเข้าถึงขัดข้อง ({error})",
        readDetails: "อ่านรายละเอียด",
        otherReports: "รายงานทั่วไป",
        readFullReport: "อ่านรายงานฉบับเต็ม",
        latestReportBadge: "รายงานล่าสุด",
        lblMemberTools: "เครื่องมือสมาชิก",
        lblNavPortfolio: "Portfolio หุ้น",
        portfolioTitle: "📊 Portfolio หุ้น",
        portfolioSubtitle: "ระบบคำนวณและวางแผนต้นทุนเฉลี่ยสะสมหักล้างกำไรพอร์ตลงทุน",
        portfolioOverview: "ภาพรวม Portfolio",
        lblPtCost: "ต้นทุนรวมทั้ง portfolio",
        lblPtRealized: "กำไร/ขาดทุนที่ขายแล้ว",
        lblPtHolding: "ต้นทุนหุ้นที่ถืออยู่",
        lblPtCount: "จำนวนหุ้นในพอร์ต",
        stocksCountUnit: "{count} ตัว",
        addStockBtn: "+ เพิ่มหุ้นใหม่",
        refreshBtn: "↺ รีเฟรช",
        emptyBuys: "ยังไม่มีรายการซื้อ",
        emptySells: "ยังไม่มีรายการขาย",
        avgLabel: "เฉลี่ย {price}",
        tagBuy: "ซื้อ",
        tagSell: "ขาย",
        lblCost: "ต้นทุนรวม",
        lblTotalShares: "หุ้นทั้งหมด",
        sharesUnit: "{shares} หุ้น",
        lblAvgCostPerShare: "ต้นทุนเฉลี่ย/หุ้น",
        lblRemainShares: "หุ้นที่เหลือ",
        lblRealizedPL: "กำไร/ขาดทุนที่ขายแล้วรวม",
        lblBreakEvenForRemain: "ราคา break-even ของหุ้นที่เหลือ {remain} หุ้น",
        beSoldOut: "ขายหุ้นหมดแล้ว",
        beNoData: "ยังไม่มีข้อมูล",
        placeholderStockName: "ชื่อหุ้น",
        placeholderPrice: "ราคา ฿",
        placeholderQty: "จำนวน",
        visitLabel: "ผู้เข้าชม:",
        onlineLabel: "ออนไลน์:",
        statusConnected: "เชื่อมต่อฐานข้อมูลข่าวแล้ว"
    },
    en: {
        channelTitle: "SepKhawGonTrade",
        channelSubtitle: "US Stocks",
        searchPlaceholder: "Search analysis...",
        dimensionsTitle: "Market Dimensions",
        allReports: "All Reports",
        vaultTitle: "Latest Analysis & Reports Hub",
        vaultSubtitle: "In-depth US stock market updates, real-time from the trading floor",
        statusConnected: "News Database Connected",
        statTotalReports: "Total Reports",
        statSummary: "Market Summary",
        statSmallCap: "Small Cap Radar",
        foundCount: "Found {count} items",
        sortByLabel: "Sort by:",
        sortNewest: "Newest First",
        sortOldest: "Oldest First",
        sortAlphabetical: "Title A-Z",
        backToCatalog: "Back to Catalog",
        copyLinkTitle: "Copy Permalink",
        printTitle: "Print / Save as PDF",
        rawCodeTitle: "View Markdown Source",
        viewNormalTitle: "View Normal Document (HTML)",
        metaSize: "Size {size} KB",
        errorLoading: "Failed to Load Reports Hub",
        errorLoadingSub: "Please check if you have run {code} to generate the database.",
        noResults: "No Results Found",
        noResultsSub: "Please try a different search query or select another category.",
        loadingSpinner: "Fetching analysis reports...",
        reportNotFound: "Report Not Found",
        reportNotFoundSub: "The specified report ({path}) does not exist in the catalog directory.",
        btnHome: "Back to Home",
        loadingDocument: "Searching for document...",
        failedToOpen: "Failed to Open Analysis File",
        failedToOpenSub: "The file might be deleted, moved, or access is blocked ({error})",
        readDetails: "Read Details",
        otherReports: "General Reports",
        readFullReport: "Read Full Report",
        latestReportBadge: "Latest Report",
        lblMemberTools: "Member Tools",
        lblNavPortfolio: "Stock Portfolio",
        portfolioTitle: "📊 Stock Portfolio",
        portfolioSubtitle: "Calculate average cost, break-even price, and track realized P&L",
        portfolioOverview: "Portfolio Overview",
        lblPtCost: "Total Portfolio Cost",
        lblPtRealized: "Realized P&L",
        lblPtHolding: "Holding Cost",
        lblPtCount: "Stocks in Portfolio",
        stocksCountUnit: "{count} stocks",
        addStockBtn: "+ Add New Stock",
        refreshBtn: "↺ Refresh",
        emptyBuys: "No buy transactions yet",
        emptySells: "No sell transactions yet",
        avgLabel: "Avg {price}",
        tagBuy: "BUY",
        tagSell: "SELL",
        lblCost: "Total Cost",
        lblTotalShares: "Total Shares",
        sharesUnit: "{shares} shares",
        lblAvgCostPerShare: "Avg Cost / Share",
        lblRemainShares: "Remaining Shares",
        lblRealizedPL: "Total Realized P&L",
        lblBreakEvenForRemain: "Break-even price for remaining {remain} shares",
        beSoldOut: "All shares sold out",
        beNoData: "No data available",
        placeholderStockName: "Stock name",
        placeholderPrice: "Price ฿",
        placeholderQty: "Qty",
        visitLabel: "Visits:",
        onlineLabel: "Online:",
        statusConnected: "Connected to News Database"
    }
};

function updateUILanguage() {
    const lang = appState.lang;
    const t = translations[lang];
    
    // Save language to localStorage
    localStorage.setItem('sep_lang', lang);
    
    // Update text elements
    document.querySelectorAll('.sidebar-title').forEach(el => el.textContent = t.channelTitle);
    document.querySelectorAll('.sidebar-subtitle').forEach(el => el.textContent = t.channelSubtitle);
    document.querySelectorAll('.mobile-logo-title span').forEach(el => el.textContent = t.channelTitle);
    
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.placeholder = t.searchPlaceholder;
    
    const navSecTitle = document.querySelector('.nav-section-title');
    if (navSecTitle) navSecTitle.textContent = t.dimensionsTitle;
    
    // Update Featured Report badge and read more button if visible
    if (elements.featuredBadge) {
        elements.featuredBadge.innerHTML = `<i class="fa-solid fa-star"></i> ${t.latestReportBadge}`;
    }
    if (elements.featuredReadMoreBtn) {
        elements.featuredReadMoreBtn.innerHTML = `${t.readFullReport} <i class="fa-solid fa-arrow-right"></i>`;
    }
    
    // Update Controls Sort By label
    const sortLabel = document.querySelector('.sort-control label');
    if (sortLabel) sortLabel.textContent = t.sortByLabel;
    
    // Update Sort Options
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect && sortSelect.options.length >= 3) {
        sortSelect.options[0].text = t.sortNewest;
        sortSelect.options[1].text = t.sortOldest;
        sortSelect.options[2].text = t.sortAlphabetical;
    }
    
    // Back to Catalog Button text
    const backBtnSpan = document.querySelector('#back-to-catalog span');
    if (backBtnSpan) backBtnSpan.textContent = t.backToCatalog;
    
    // Action buttons titles
    if (elements.btnCopyLink) elements.btnCopyLink.title = t.copyLinkTitle;
    if (elements.btnPrint) elements.btnPrint.title = t.printTitle;
    if (elements.btnRaw) elements.btnRaw.title = appState.viewMode === 'html' ? t.rawCodeTitle : t.viewNormalTitle;
    
    // Update active class on switcher buttons
    document.querySelectorAll('.lang-switcher').forEach(switcher => {
        switcher.querySelectorAll('.lang-btn').forEach(btn => {
            if (btn.getAttribute('data-lang') === lang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    });
    
    // Refresh menus and catalog
    renderCategoriesMenu();
    renderCatalog();
    
    // Localize opened report headers if visible
    if (appState.selectedReport) {
        const report = appState.selectedReport;
        if (elements.readerCategory) elements.readerCategory.textContent = lang === 'th' ? report.categoryThai : report.category;
        if (elements.readerSize) elements.readerSize.innerHTML = `<i class="fa-regular fa-file-lines"></i> ${t.metaSize.replace('{size}', (report.size / 1024).toFixed(1))}`;
    }
    
    // Update Portfolio View translations
    const portfolioTitleEl = document.getElementById('portfolio-title');
    if (portfolioTitleEl) portfolioTitleEl.textContent = t.portfolioTitle;
    
    const portfolioSubtitleEl = document.getElementById('portfolio-subtitle');
    if (portfolioSubtitleEl) portfolioSubtitleEl.textContent = t.portfolioSubtitle;
    
    const overviewEl = document.getElementById('lbl-portfolio-overview');
    if (overviewEl) overviewEl.textContent = t.portfolioOverview;
    
    const memberToolsEl = document.getElementById('lbl-member-tools');
    if (memberToolsEl) memberToolsEl.textContent = t.lblMemberTools;
    
    const navPortfolioEl = document.getElementById('lbl-nav-portfolio');
    if (navPortfolioEl) navPortfolioEl.textContent = t.lblNavPortfolio;
    
    if (elements.lblPtCost) elements.lblPtCost.textContent = t.lblPtCost;
    if (elements.lblPtRealized) elements.lblPtRealized.textContent = t.lblPtRealized;
    if (elements.lblPtHolding) elements.lblPtHolding.textContent = t.lblPtHolding;
    if (elements.lblPtCount) elements.lblPtCount.textContent = t.lblPtCount;
    if (elements.addStockBtn) elements.addStockBtn.textContent = t.addStockBtn;
    if (elements.refreshBtn) elements.refreshBtn.textContent = t.refreshBtn;
    
    // Re-render portfolio content if it's currently active
    if (elements.portfolioView && elements.portfolioView.classList.contains('active')) {
        renderPortfolio();
    }
    
    // Update visitor counter translation and connected status labels
    document.querySelectorAll('.lbl-status-connected').forEach(el => el.textContent = t.statusConnected);
    document.querySelectorAll('.lbl-online').forEach(el => el.textContent = t.onlineLabel);
    document.querySelectorAll('.lbl-visits').forEach(el => el.textContent = t.visitLabel);
    
    // Update visitor stats in the DOM
    if (typeof updateVisitorStatsDOM === 'function') {
        updateVisitorStatsDOM();
    }
}

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
    
    // Featured Report elements
    featuredContainer: document.getElementById('featured-report-container'),
    featuredTitle: document.getElementById('featured-title'),
    featuredCategory: document.getElementById('featured-category'),
    featuredDate: document.getElementById('featured-date'),
    featuredMarkdown: document.getElementById('featured-markdown-container'),
    featuredReadMoreBtn: document.getElementById('featured-read-more-btn'),
    featuredBadge: document.querySelector('.featured-badge'),
    
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
    sidebarBackdrop: document.getElementById('sidebar-backdrop'),
    
    // Portfolio Elements
    portfolioView: document.getElementById('portfolio-view'),
    lblPtCost: document.getElementById('lbl-pt-cost'),
    lblPtRealized: document.getElementById('lbl-pt-realized'),
    lblPtHolding: document.getElementById('lbl-pt-holding'),
    lblPtCount: document.getElementById('lbl-pt-count'),
    addStockBtn: document.getElementById('add-stock-btn'),
    refreshBtn: document.getElementById('refresh-btn'),
    stockList: document.getElementById('stock-list')
};

// Initialize Application
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initApp();
    });
} else {
    initApp();
}

async function initApp() {
    setupEventListeners();
    
    // Initialize visitor statistics
    initVisitorStats();
    
    // Load portfolio stocks from local storage
    try {
        const savedStocks = localStorage.getItem('sep_portfolio_stocks');
        if (savedStocks) {
            appState.portfolioStocks = JSON.parse(savedStocks);
        } else {
            // Fallback default mockup data
            appState.portfolioStocks = [
                {name: 'หุ้น A', open: true, buys: [{price: 100, shares: 100}, {price: 80, shares: 50}], sells: [{price: 90, shares: 50}]},
                {name: 'หุ้น B', open: false, buys: [{price: 50, shares: 200}], sells: []}
            ];
        }
    } catch (e) {
        console.error('Failed to load portfolio:', e);
        appState.portfolioStocks = [];
    }
    
    await fetchReportsIndex();
    updateUILanguage();
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
    
    // Language Switchers
    document.querySelectorAll('.lang-switcher').forEach(switcher => {
        switcher.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetLang = btn.getAttribute('data-lang');
                if (appState.lang !== targetLang) {
                    appState.lang = targetLang;
                    updateUILanguage();
                }
            });
        });
    });
    
    // Portfolio triggers
    if (elements.addStockBtn) {
        elements.addStockBtn.addEventListener('click', () => {
            const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
            const stockName = appState.lang === 'th' 
                ? 'หุ้น ' + (labels[appState.portfolioStocks.length] || appState.portfolioStocks.length + 1)
                : 'Stock ' + (labels[appState.portfolioStocks.length] || appState.portfolioStocks.length + 1);
            appState.portfolioStocks.push({
                name: stockName,
                open: true,
                buys: [{price: 0, shares: 0}],
                sells: []
            });
            savePortfolio();
            renderPortfolio();
        });
    }
    
    if (elements.refreshBtn) {
        elements.refreshBtn.addEventListener('click', () => {
            elements.refreshBtn.classList.add('spin');
            setTimeout(() => elements.refreshBtn.classList.remove('spin'), 500);
            renderPortfolio();
        });
    }
    
    const navPort = document.getElementById('nav-portfolio');
    if (navPort) {
        navPort.addEventListener('click', () => {
            window.location.hash = 'portfolio';
            closeMobileSidebar();
        });
    }
    
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
        renderCategoriesMenu();
    } catch (error) {
        console.error('Error fetching index:', error);
        const t = translations[appState.lang];
        elements.reportsGrid.innerHTML = `
            <div class="error-state">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <h3>${t.errorLoading}</h3>
                <p>${t.errorLoadingSub.replace('{code}', '<code>node generate-index.js</code>')}</p>
            </div>
        `;
    }
}

// Router to handle URL Hash Changes (Permalinks)
function handleRouting() {
    const hash = window.location.hash;
    
    // Expected hash format: #report=category/file.md or #report=file.md
    if (hash && hash.startsWith('#report=')) {
        closePortfolio();
        const filePath = decodeURIComponent(hash.substring(8));
        openReport(filePath);
    } else if (hash === '#portfolio') {
        closeReport();
        openPortfolio();
    } else {
        closePortfolio();
        closeReport();
        renderCatalog();
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

// Stats section removed

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
    if (allItem) {
        const t = translations[appState.lang];
        const textSpan = allItem.querySelector('span');
        if (textSpan) {
            textSpan.textContent = t.allReports;
        }
    }
    
    elements.categoryList.innerHTML = '';
    if (allItem) {
        elements.categoryList.appendChild(allItem);
    }
    
    // Sort categories alphabetically
    uniqueCategories.sort().forEach(catName => {
        const catObj = appState.reports.find(r => r.category === catName);
        const displayName = appState.lang === 'th' ? (catObj?.categoryThai || catName) : catName;
        
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
        else if (nameLower.includes('bot trade') || nameLower.includes('บอทเทรด')) iconClass = 'fa-robot';
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
            <span>${displayName}</span>
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
    if (allItem) {
        allItem.addEventListener('click', () => {
            document.querySelectorAll('.category-item').forEach(item => item.classList.remove('active'));
            allItem.classList.add('active');
            appState.activeCategory = 'all';
            window.location.hash = ''; // Back to catalog list
            renderCatalog();
            closeMobileSidebar();
        });
    }

    // Update count-all badge
    const countAllEl = document.getElementById('count-all');
    if (countAllEl) {
        countAllEl.textContent = appState.reports.length;
    }
}

// Filter, Sort, and Render Reports List
function renderCatalog() {
    let filtered = [...appState.reports];
    const t = translations[appState.lang];
    
    // Update main section title
    if (appState.activeCategory === 'all') {
        elements.sectionTitle.textContent = t.vaultTitle;
    } else {
        const currentCat = appState.reports.find(r => r.category === appState.activeCategory);
        const catNameDisplay = appState.lang === 'th' ? currentCat?.categoryThai : currentCat?.category;
        elements.sectionTitle.textContent = catNameDisplay || appState.activeCategory;
    }
    
    // Show/hide featured report container
    if (elements.featuredContainer) {
        if (appState.activeCategory === 'all' && !appState.searchQuery && appState.reports.length > 0) {
            elements.featuredContainer.style.display = 'block';
            loadFeaturedReport(appState.reports[0]);
        } else {
            elements.featuredContainer.style.display = 'none';
        }
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
    
    elements.resultsInfo.textContent = t.foundCount.replace('{count}', filtered.length);
    
    // Clear grid
    elements.reportsGrid.innerHTML = '';
    
    if (filtered.length === 0) {
        elements.reportsGrid.innerHTML = `
            <div class="no-results">
                <i class="fa-regular fa-folder-open"></i>
                <h3>${t.noResults}</h3>
                <p>${t.noResultsSub}</p>
            </div>
        `;
        return;
    }
    
    // Generate Cards
    filtered.forEach(report => {
        const card = document.createElement('div');
        
        // Define card border/theme classes based on category
        const categoryClass = getCategoryClass(report.category);

        card.className = `report-card ${categoryClass}`;
        
        // Format file size
        const kbSize = (report.size / 1024).toFixed(1);
        const newBadgeHtml = report.isLatest ? `<span class="new-badge"><i class="fa-solid fa-fire"></i> NEW</span>` : '';
        
        card.innerHTML = `
            <div class="card-badge-row">
                <div style="display: flex; align-items: center; gap: 8px;">
                    ${newBadgeHtml}
                    <span class="card-date">${formatReportDate(report.date, appState.lang)}</span>
                </div>
            </div>
            <h3 class="card-title">${report.title}</h3>
            <div class="card-footer">
                <span class="card-size"><i class="fa-regular fa-file"></i> ${kbSize} KB</span>
                <span class="card-action-text">${t.readDetails} <i class="fa-solid fa-arrow-right"></i></span>
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
            const catDisplayName = appState.lang === 'th' ? report.categoryThai : report.category;
            group.innerHTML = `<h4 class="report-group-title">${catDisplayName}</h4>`;
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
    const t = translations[appState.lang];
    
    // Fallback if index hasn't loaded yet or path is not found
    if (!reportMeta) {
        elements.markdownContainer.innerHTML = `
            <div class="loading-spinner">
                <i class="fa-solid fa-circle-notch fa-spin"></i>
                <p>${t.loadingDocument}</p>
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
                        <h3>${t.reportNotFound}</h3>
                        <p>${t.reportNotFoundSub.replace('{path}', `<code>${filePath}</code>`)}</p>
                        <button class="back-btn" onclick="window.location.hash=''"><i class="fa-solid fa-house"></i> ${t.btnHome}</button>
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
    
    const t = translations[appState.lang];
    
    elements.btnRaw.innerHTML = '<i class="fa-solid fa-code"></i>';
    elements.btnRaw.title = t.rawCodeTitle;

    // Set Header details
    elements.readerTitle.textContent = reportMeta.title;
    elements.readerCategory.textContent = appState.lang === 'th' ? reportMeta.categoryThai : reportMeta.category;
    elements.readerDate.innerHTML = `<i class="fa-regular fa-calendar"></i> ${formatReportDate(reportMeta.date, appState.lang)}`;
    elements.readerSize.innerHTML = `<i class="fa-regular fa-file-lines"></i> ${t.metaSize.replace('{size}', (reportMeta.size / 1024).toFixed(1))}`;

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
        await displayParsedHTML(markdown);
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

let mermaidLoaded = null;

async function loadMermaid() {
    if (mermaidLoaded) return mermaidLoaded;
    try {
        const { default: mermaid } = await import('https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs');
        mermaid.initialize({
            startOnLoad: false,
            theme: 'dark',
            securityLevel: 'loose'
        });
        window.mermaid = mermaid;
        mermaidLoaded = mermaid;
        return mermaid;
    } catch (err) {
        console.error('Failed to load Mermaid dynamically:', err);
        throw err;
    }
}

// Convert Markdown to HTML & Format Custom Elements (Alerts)
async function displayParsedHTML(markdown) {
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
    const images = elements.markdownContainer.querySelectorAll('img');
    images.forEach(img => {
        const src = img.getAttribute('src');
        if (src && !src.startsWith('http') && !src.startsWith('data:') && !src.startsWith('/')) {
            // URL decode and normalize to handle spaces, %20, and capitalization
            const decodedSrc = decodeURIComponent(src).trim().toLowerCase();
            
            if (decodedSrc === 'logo master.png' || decodedSrc === 'logo.png') {
                // The logo is always at the root of the site.
                // Since index.html runs at the root, the path relative to index.html is simply 'Logo master.png'
                img.setAttribute('src', 'Logo master.png');
            } else {
                // For other images, resolve them relative to the report's directory
                const reportPath = appState.selectedReport.path;
                const lastSlashIndex = reportPath.lastIndexOf('/');
                if (lastSlashIndex !== -1) {
                    const reportDir = reportPath.substring(0, lastSlashIndex + 1); // e.g. "Folder/"
                    img.setAttribute('src', reportDir + src);
                }
            }
        }
    });

    // 5. Post-process code blocks for Mermaid diagrams
    const mermaidBlocks = elements.markdownContainer.querySelectorAll('pre code.language-mermaid');
    if (mermaidBlocks.length > 0) {
        mermaidBlocks.forEach((codeEl, index) => {
            const preEl = codeEl.parentElement;
            const mermaidCode = codeEl.textContent;
            
            const div = document.createElement('div');
            div.className = 'mermaid';
            div.textContent = mermaidCode;
            
            preEl.parentNode.replaceChild(div, preEl);
        });
        
        // Dynamically load Mermaid and render
        try {
            const mermaid = await loadMermaid();
            await mermaid.run({
                querySelector: '.mermaid'
            });
        } catch (err) {
            console.error('Error rendering Mermaid diagram:', err);
        }
    }
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

function openPortfolio() {
    // Remove active category indicators
    document.querySelectorAll('.category-item').forEach(item => item.classList.remove('active'));
    
    // Add active class to portfolio menu item
    const navPort = document.getElementById('nav-portfolio');
    if (navPort) navPort.classList.add('active');
    
    elements.catalogView.classList.remove('active');
    elements.readerView.classList.remove('active');
    if (elements.portfolioView) elements.portfolioView.classList.add('active');
    
    renderPortfolio();
}

function closePortfolio() {
    if (elements.portfolioView) elements.portfolioView.classList.remove('active');
    const navPort = document.getElementById('nav-portfolio');
    if (navPort) navPort.classList.remove('active');
}

// Toggle between Rendered HTML and Raw Markdown view
async function toggleRawMarkdown() {
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
        await displayParsedHTML(appState.rawMarkdown);
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

// Helpers: localized Date formatter
function formatReportDate(dateString, lang) {
    if (!dateString) return '';
    
    // Check if the format is YYYY-MM-DD
    const parts = dateString.split('-');
    if (parts.length === 3) {
        const thaiMonths = [
            'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
            'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
        ];
        const enMonths = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        const day = parseInt(parts[2], 10);
        const monthIndex = parseInt(parts[1], 10) - 1;
        
        if (lang === 'th') {
            const year = parseInt(parts[0], 10) + 543; // Convert to Buddhist Era (BE)
            return `${day} ${thaiMonths[monthIndex]} ${year}`;
        } else {
            const year = parseInt(parts[0], 10); // Standard Common Era (CE)
            return `${day} ${enMonths[monthIndex]} ${year}`;
        }
    }
    
    // Return original string if it is formatted like 'June 2026'
    return dateString;
}

function getCategoryClass(category) {
    if (!category) return 'general-report';
    const catLower = category.toLowerCase();
    if (catLower.includes('pre-market')) return 'pre-market-analysis';
    if (catLower.includes('cosmic')) return 'cosmic-trade-signal';
    if (catLower.includes('small cap') || catLower.includes('radar')) return 'small-cap-research';
    if (catLower.includes('whale')) return 'whale-flow';
    if (catLower.includes('oversold')) return 'oversold-opportunity';
    if (catLower.includes('script')) return 'daily-script';
    if (catLower.includes('hot stock')) return 'hot-stock-today';
    if (catLower.includes('market summary')) return 'market-summary-card';
    if (catLower.includes('bear squeeze')) return 'bear-squeeze-card';
    if (catLower.includes('global market recap')) return 'global-recap-card';
    if (catLower.includes('whats next')) return 'whats-next-card';
    if (catLower.includes('thai')) return 'thai-stock-card';
    if (catLower.includes('astro economy')) return 'astro-economy-card';
    return 'general-report';
}

let currentFeaturedPath = null;

async function loadFeaturedReport(report) {
    if (!report) {
        elements.featuredContainer.style.display = 'none';
        return;
    }
    
    currentFeaturedPath = report.path;
    
    // Set static text first
    elements.featuredTitle.textContent = report.title;
    elements.featuredCategory.textContent = appState.lang === 'th' ? report.categoryThai : report.category;
    elements.featuredCategory.className = `featured-category-badge ${getCategoryClass(report.category)}`;
    elements.featuredDate.innerHTML = `<i class="fa-regular fa-calendar"></i> ${formatReportDate(report.date, appState.lang)}`;
    
    // Render button translation
    const t = translations[appState.lang];
    elements.featuredBadge.innerHTML = `<i class="fa-solid fa-star"></i> ${t.latestReportBadge}`;
    elements.featuredReadMoreBtn.innerHTML = `${t.readFullReport} <i class="fa-solid fa-arrow-right"></i>`;
    
    // Set up click handler to open the full report
    elements.featuredReadMoreBtn.onclick = () => {
        window.location.hash = `report=${encodeURIComponent(report.path)}`;
    };
    
    try {
        const response = await fetch(report.path);
        if (!response.ok) throw new Error('File not found');
        const markdown = await response.text();
        
        // Ensure this response is still the latest one requested
        if (currentFeaturedPath !== report.path) return;
        
        // Parse and display HTML
        let rawHtml = marked.parse(markdown);
        let cleanHtml = DOMPurify.sanitize(rawHtml);
        
        // Inject into container
        elements.featuredMarkdown.innerHTML = cleanHtml;
        
        // Post-process blockquotes (alerts)
        const blockquotes = elements.featuredMarkdown.querySelectorAll('blockquote');
        blockquotes.forEach(bq => {
            const html = bq.innerHTML;
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
        
        // Adjust image paths
        const images = elements.featuredMarkdown.querySelectorAll('img');
        images.forEach(img => {
            const src = img.getAttribute('src');
            if (src && !src.startsWith('http') && !src.startsWith('data:') && !src.startsWith('/')) {
                const decodedSrc = decodeURIComponent(src).trim().toLowerCase();
                if (decodedSrc === 'logo master.png' || decodedSrc === 'logo.png') {
                    img.setAttribute('src', 'Logo master.png');
                } else {
                    const lastSlashIndex = report.path.lastIndexOf('/');
                    if (lastSlashIndex !== -1) {
                        const reportDir = report.path.substring(0, lastSlashIndex + 1);
                        img.setAttribute('src', reportDir + src);
                    }
                }
            }
        });
        
        // Process Mermaid diagrams
        const mermaidBlocks = elements.featuredMarkdown.querySelectorAll('pre code.language-mermaid');
        if (mermaidBlocks.length > 0) {
            mermaidBlocks.forEach((codeEl, index) => {
                const preEl = codeEl.parentElement;
                const mermaidCode = codeEl.textContent;
                
                const div = document.createElement('div');
                div.className = 'mermaid';
                div.textContent = mermaidCode;
                
                preEl.parentNode.replaceChild(div, preEl);
            });
            
            try {
                const mermaid = await loadMermaid();
                await mermaid.run({
                    querySelector: '.mermaid'
                });
            } catch (err) {
                console.error('Error rendering Mermaid diagram:', err);
            }
        }
        
    } catch (error) {
        console.error('Error loading featured report file:', error);
        elements.featuredMarkdown.innerHTML = `
            <div class="error-state">
                <i class="fa-solid fa-file-excel"></i>
                <h3>ไม่สามารถเปิดไฟล์บทวิเคราะห์ได้</h3>
                <p>อาจเกิดจากไฟล์ถูกลบ ย้าย หรือระบบการเข้าถึงขัดข้อง (<code>${error.message}</code>)</p>
            </div>
        `;
    }
}

// ==========================================================================
// Portfolio Tracker Functionality
// ==========================================================================

const fmt = n => isNaN(n) ? '0.00' : n.toLocaleString(appState.lang === 'th' ? 'th-TH' : 'en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
const fmtI = n => isNaN(n) ? '0' : Math.max(0, n).toLocaleString(appState.lang === 'th' ? 'th-TH' : 'en-US');

function savePortfolio() {
    localStorage.setItem('sep_portfolio_stocks', JSON.stringify(appState.portfolioStocks));
}

function calculateStockMetrics(s) {
    const vb = s.buys.filter(b => b.shares > 0);
    const vs = s.sells.filter(v => v.shares > 0);
    const totalCost = vb.reduce((a, b) => a + b.price * b.shares, 0);
    const totalShares = vb.reduce((a, b) => a + b.shares, 0);
    const avg = totalShares > 0 ? totalCost / totalShares : 0;
    const soldShares = vs.reduce((a, v) => a + v.shares, 0);
    const soldRevenue = vs.reduce((a, v) => a + v.price * v.shares, 0);
    const realized = soldRevenue - soldShares * avg;
    const remain = Math.max(0, totalShares - soldShares);
    const remainCost = remain * avg;
    const bePrice = remain > 0 ? (remainCost - realized) / remain : null;
    return {totalCost, totalShares, avg, soldShares, realized, remain, remainCost, bePrice};
}

function makePortfolioInputWrap(val, isInt, placeholder, onChange) {
    const wrap = document.createElement('div');
    wrap.className = 'portfolio-iw';
    
    const inp = document.createElement('input');
    inp.type = 'number';
    inp.min = '0';
    inp.step = isInt ? '1' : '0.01';
    inp.value = val > 0 ? val : '';
    inp.placeholder = placeholder;
    
    inp.addEventListener('input', () => {
        onChange(inp.value);
        savePortfolio();
        updatePortfolioSummary();
    });
    
    const clr = document.createElement('button');
    clr.className = 'portfolio-ic';
    clr.textContent = '✕';
    clr.addEventListener('click', () => {
        inp.value = '';
        onChange('');
        savePortfolio();
        updatePortfolioSummary();
    });
    
    wrap.append(inp, clr);
    return wrap;
}

function makePortfolioEntryRow(labelA, valA, isIntA, placeA, onChangeA, labelB, valB, isIntB, placeB, onChangeB, onDel) {
    const row = document.createElement('div');
    row.className = 'portfolio-entry-row';
    
    const u1 = document.createElement('span');
    u1.className = 'portfolio-unit';
    u1.textContent = labelA;
    
    const u2 = document.createElement('span');
    u2.className = 'portfolio-unit';
    u2.textContent = labelB;
    
    const u3 = document.createElement('span');
    u3.className = 'portfolio-unit';
    u3.textContent = appState.lang === 'th' ? 'หุ้น' : 'shares';
    
    const del = document.createElement('button');
    del.className = 'portfolio-del-row-btn';
    del.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
    del.addEventListener('click', onDel);
    
    row.append(
        u1, 
        makePortfolioInputWrap(valA, isIntA, placeA, onChangeA), 
        u2, 
        makePortfolioInputWrap(valB, isIntB, placeB, onChangeB), 
        u3, 
        del
    );
    return row;
}

function makePortfolioSecDiv(tagClass, tagText) {
    const d = document.createElement('div');
    d.className = 'portfolio-sec-div';
    
    const sp = document.createElement('span');
    sp.className = `portfolio-tag ${tagClass}`;
    sp.textContent = tagText;
    
    d.appendChild(sp);
    return d;
}

function renderPortfolioBody(s, body, stockIndex) {
    const t = translations[appState.lang];
    
    // BUY
    body.appendChild(makePortfolioSecDiv('portfolio-tb', t.tagBuy));
    if (s.buys.length === 0) {
        const p = document.createElement('p');
        p.className = 'portfolio-empty-hint';
        p.textContent = t.emptyBuys;
        body.appendChild(p);
    } else {
        s.buys.forEach((b, bi) => {
            body.appendChild(makePortfolioEntryRow(
                t.placeholderPrice, b.price, false, '0.00', v => { s.buys[bi].price = parseFloat(v) || 0; },
                t.placeholderQty, b.shares, true, '0', v => { s.buys[bi].shares = parseInt(v) || 0; },
                () => {
                    s.buys.splice(bi, 1);
                    savePortfolio();
                    renderPortfolio();
                }
            ));
        });
    }
    
    const ab = document.createElement('button');
    ab.className = 'portfolio-add-btn';
    ab.textContent = appState.lang === 'th' ? '+ เพิ่มรายการซื้อ' : '+ Add Buy Order';
    ab.addEventListener('click', () => {
        s.buys.push({price: 0, shares: 0});
        savePortfolio();
        renderPortfolio();
    });
    body.appendChild(ab);

    // SELL
    body.appendChild(makePortfolioSecDiv('portfolio-ts', t.tagSell));
    if (s.sells.length === 0) {
        const p = document.createElement('p');
        p.className = 'portfolio-empty-hint';
        p.textContent = t.emptySells;
        body.appendChild(p);
    } else {
        s.sells.forEach((sv, vi) => {
            body.appendChild(makePortfolioEntryRow(
                t.placeholderPrice, sv.price, false, '0.00', v => { s.sells[vi].price = parseFloat(v) || 0; },
                t.placeholderQty, sv.shares, true, '0', v => { s.sells[vi].shares = parseInt(v) || 0; },
                () => {
                    s.sells.splice(vi, 1);
                    savePortfolio();
                    renderPortfolio();
                }
            ));
        });
    }
    
    const as = document.createElement('button');
    as.className = 'portfolio-add-btn';
    as.textContent = appState.lang === 'th' ? '+ เพิ่มรายการขาย' : '+ Add Sell Order';
    as.addEventListener('click', () => {
        s.sells.push({price: 0, shares: 0});
        savePortfolio();
        renderPortfolio();
    });
    body.appendChild(as);

    // Metrics grid
    const r = calculateStockMetrics(s);
    const mg = document.createElement('div');
    mg.className = 'portfolio-metrics-grid';
    
    const sharesUnitText = t.sharesUnit.replace('{shares}', fmtI(r.totalShares));
    const remainUnitText = t.sharesUnit.replace('{shares}', fmtI(r.remain));
    
    mg.innerHTML = `
        <div class="portfolio-metric"><p class="portfolio-ml">${t.lblCost}</p><p class="portfolio-mv">฿${fmt(r.totalCost)}</p></div>
        <div class="portfolio-metric"><p class="portfolio-ml">${t.lblTotalShares}</p><p class="portfolio-mv">${sharesUnitText}</p></div>
        <div class="portfolio-metric"><p class="portfolio-ml">${t.lblAvgCostPerShare}</p><p class="portfolio-mv">${r.totalShares > 0 ? '฿' + fmt(r.avg) : '-'}</p></div>
        <div class="portfolio-metric"><p class="portfolio-ml">${t.lblRemainShares}</p><p class="portfolio-mv">${remainUnitText}</p></div>
    `;
    body.appendChild(mg);

    const hr = document.createElement('hr');
    hr.className = 'portfolio-divider';
    body.appendChild(hr);

    const vs = s.sells.filter(v => v.shares > 0);
    vs.forEach((sv, vi) => {
        const pnl = sv.price * sv.shares - sv.shares * r.avg;
        const sr = document.createElement('div');
        sr.className = 'portfolio-srow';
        const saleText = appState.lang === 'th' 
            ? `ขาย ${vi + 1}: ${fmtI(sv.shares)} หุ้น × ฿${fmt(sv.price)}`
            : `Sell ${vi + 1}: ${fmtI(sv.shares)} sh × ฿${fmt(sv.price)}`;
        sr.innerHTML = `<span class="portfolio-k">${saleText}</span><span class="${pnl >= 0 ? 'portfolio-profit' : 'portfolio-loss'}">${pnl >= 0 ? '+' : ''}฿${fmt(pnl)}</span>`;
        body.appendChild(sr);
    });

    if (vs.length > 0) {
        const tr = document.createElement('div');
        tr.className = 'portfolio-srow';
        tr.style.marginTop = '8px';
        tr.innerHTML = `<span class="portfolio-k" style="font-weight:600">${t.lblRealizedPL}</span><span class="${r.realized >= 0 ? 'portfolio-profit' : 'portfolio-loss'}">${r.realized >= 0 ? '+' : ''}฿${fmt(r.realized)}</span>`;
        body.appendChild(tr);
    }

    const be = document.createElement('div');
    if (r.bePrice !== null) {
        be.className = `portfolio-be-box ${r.bePrice <= r.avg ? 'green' : 'red'}`;
        const beLabel = t.lblBreakEvenForRemain.replace('{remain}', fmtI(r.remain));
        be.innerHTML = `<p class="portfolio-bll">${beLabel}</p><p class="portfolio-bv">฿${fmt(r.bePrice)} / หุ้น</p>`;
    } else {
        be.className = 'portfolio-be-box gray';
        const statusText = r.remain === 0 && r.totalShares > 0 ? t.beSoldOut : t.beNoData;
        be.innerHTML = `<p class="portfolio-bll">Break-even</p><p class="portfolio-bv">${statusText}</p>`;
    }
    body.appendChild(be);
}

function renderPortfolio() {
    if (!elements.stockList) return;
    elements.stockList.innerHTML = '';
    
    const t = translations[appState.lang];
    
    appState.portfolioStocks.forEach((s, si) => {
        const r = calculateStockMetrics(s);
        const card = document.createElement('div');
        card.className = 'portfolio-stock-card';
        
        // Header
        const hdr = document.createElement('div');
        hdr.className = 'portfolio-stock-header' + (s.open ? '' : ' is-collapsed');
        hdr.addEventListener('click', () => {
            s.open = !s.open;
            savePortfolio();
            renderPortfolio();
        });
        
        const hl = document.createElement('div');
        hl.className = 'portfolio-stock-header-left';
        
        const nw = document.createElement('div');
        nw.className = 'portfolio-name-wrap';
        
        const ni = document.createElement('input');
        ni.className = 'portfolio-name-inp';
        ni.value = s.name;
        ni.placeholder = t.placeholderStockName;
        ni.addEventListener('click', e => e.stopPropagation());
        ni.addEventListener('change', () => {
            s.name = ni.value;
            savePortfolio();
        });
        
        const nc = document.createElement('button');
        nc.className = 'portfolio-name-clr';
        nc.textContent = '✕';
        nc.addEventListener('click', e => {
            e.stopPropagation();
            s.name = '';
            ni.value = '';
            savePortfolio();
        });
        
        nw.append(ni, nc);
        
        const badge = document.createElement('span');
        badge.className = 'portfolio-badge ' + (r.realized > 0 ? 'portfolio-bp' : r.realized < 0 ? 'portfolio-bl2' : 'portfolio-bz');
        badge.textContent = r.realized > 0 ? `+฿${fmt(r.realized)}` : r.realized < 0 ? `-฿${fmt(Math.abs(r.realized))}` : '฿0.00';
        hl.append(nw, badge);
        
        const hr2 = document.createElement('div');
        hr2.style.cssText = 'display:flex;align-items:center;gap:12px';
        
        const avgSp = document.createElement('span');
        avgSp.style.cssText = 'font-size:14px;color:var(--text-secondary)';
        const avgPriceText = r.totalShares > 0 ? '฿' + fmt(r.avg) : '-';
        avgSp.textContent = t.avgLabel.replace('{price}', avgPriceText);
        
        const tb = document.createElement('button');
        tb.className = 'portfolio-trash-btn';
        tb.innerHTML = '<i class="fa-regular fa-trash-can"></i>';
        tb.addEventListener('click', e => {
            e.stopPropagation();
            appState.portfolioStocks.splice(si, 1);
            savePortfolio();
            renderPortfolio();
        });
        
        const chev = document.createElement('span');
        chev.className = 'portfolio-chevron';
        chev.innerHTML = '<i class="fa-solid fa-chevron-down"></i>';
        
        hr2.append(avgSp, tb, chev);
        hdr.append(hl, hr2);
        card.appendChild(hdr);
        
        if (s.open) {
            const body = document.createElement('div');
            body.className = 'portfolio-stock-body';
            renderPortfolioBody(s, body, si);
            card.appendChild(body);
        }
        
        elements.stockList.appendChild(card);
    });
    
    updatePortfolioSummary();
}

function updatePortfolioSummary() {
    let c = 0, rv = 0, h = 0;
    appState.portfolioStocks.forEach(s => {
        const r = calculateStockMetrics(s);
        c += r.totalCost;
        rv += r.realized;
        h += r.remainCost;
    });
    
    document.getElementById('pt-cost').textContent = '฿' + fmt(c);
    
    const rEl = document.getElementById('pt-realized');
    rEl.textContent = (rv >= 0 ? '+' : '') + '฿' + fmt(Math.abs(rv));
    rEl.style.color = rv > 0 ? 'var(--accent-primary)' : rv < 0 ? 'var(--accent-red)' : 'var(--text-primary)';
    
    document.getElementById('pt-holding').textContent = '฿' + fmt(h);
    
    const countUnit = translations[appState.lang].stocksCountUnit.replace('{count}', appState.portfolioStocks.length);
    document.getElementById('pt-count').textContent = countUnit;
}

// ==========================================================================
// Visitor Counter & Online Simulation Functionality
// ==========================================================================

function initVisitorStats() {
    // 1. Total Visits - Load from real API
    // We increment count using CounterAPI's /up endpoint
    fetch('https://api.counterapi.dev/v1/sepkhawgontrade/visits/up')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            if (data && typeof data.count === 'number') {
                // Add a premium base count (e.g., 128,450) to the real global count
                appState.totalVisits = 128450 + data.count;
                updateVisitorStatsDOM();
            } else {
                throw new Error('Invalid data format');
            }
        })
        .catch(error => {
            console.error('Failed to fetch real visits, using localStorage fallback:', error);
            // Fallback: load from localStorage
            try {
                let visits = localStorage.getItem('sep_total_visits');
                if (!visits) {
                    visits = Math.floor(Math.random() * 4000) + 128000;
                } else {
                    visits = parseInt(visits, 10) || 128000;
                }
                const increment = Math.floor(Math.random() * 3) + 1;
                appState.totalVisits = visits + increment;
                localStorage.setItem('sep_total_visits', appState.totalVisits);
                updateVisitorStatsDOM();
            } catch (e) {
                appState.totalVisits = 128452;
                updateVisitorStatsDOM();
            }
        });
    
    // 2. Active Online Users (Fluctuates between 8 and 22 dynamically)
    appState.activeOnline = Math.floor(Math.random() * 15) + 8;
    
    // Periodically update active users to simulate organic traffic fluctuations
    setInterval(() => {
        // Step change of -2, -1, 0, +1, +2
        const delta = Math.floor(Math.random() * 5) - 2;
        appState.activeOnline = Math.max(6, Math.min(25, appState.activeOnline + delta));
        updateVisitorStatsDOM();
    }, Math.floor(Math.random() * 3000) + 4000); // 4-7 seconds interval
    
    updateVisitorStatsDOM();
}

function updateVisitorStatsDOM() {
    const visits = appState.totalVisits.toLocaleString(appState.lang === 'th' ? 'th-TH' : 'en-US');
    const online = appState.activeOnline;
    
    document.querySelectorAll('.visit-count-val').forEach(el => el.textContent = visits);
    document.querySelectorAll('.online-count-val').forEach(el => el.textContent = online);
}
