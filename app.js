/* ==========================================================================
   เสพข่าวก่อนเทรด (SepKhawGonTrade) - Main Application Script v3.0.0
   ========================================================================== */

// State Management
let appState = {
    reports: [],
    activeCategory: 'all',
    searchQuery: '',
    sortBy: 'newest',
    selectedReport: null,
    viewMode: 'html',
    lang: localStorage.getItem('sep_lang') || 'th',
    portfolioStocks: [],
    totalVisits: 128450,
    activeOnline: 14
};

// Comprehensive Localization Dictionary
const translations = {
    th: {
        channelTitle: "เสพข่าวก่อนเทรด",
        channelSubtitle: "หุ้นอเมริกา • US Stock Intelligence",
        searchPlaceholder: "ค้นหาบทวิเคราะห์ / หุ้น...",
        categoriesTitle: "คลังรายงานบทวิเคราะห์",
        toolsTitle: "เครื่องมือเทรด & สื่อ",
        allReports: "รายงานทั้งหมด",
        vaultTitle: "คลังบทวิเคราะห์และรายงานล่าสุด",
        vaultSubtitle: "อัปเดตข้อมูลเจาะลึกตลาดหุ้นสหรัฐฯ เรียลไทม์ส่งตรงจากห้องเทรด",
        statusConnected: "เชื่อมต่อฐานข้อมูลข่าวแล้ว",
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
        readDetails: "อ่านรายละเอียด",
        otherReports: "รายงานทั่วไป",
        readFullReport: "อ่านรายงานฉบับเต็ม",
        latestReportBadge: "รายงานล่าสุด",
        lblNavPortfolio: "คำนวณต้นทุนเฉลี่ย & Break Even",
        lblNavBotTrade: "บอทเทรด & ผลงาน",
        lblNavWebAlbum: "Album รายการผลิตคลิป",
        lblNavYoutube: "รับชมช่อง YouTube",
        legendTitle: "คู่มือการอ่านสัญญาณ CMF (Whale Flow) ในตารางรายงาน",
        legendDesc: "ค่า CMF (Chaikin Money Flow) เป็นตัวชี้วัดกระแสเงินทุนไหลเข้า/ออกสะสมของสถาบันรายใหญ่ (วาฬ) ย้อนหลัง 20 วัน:",
        legendAccumText: "วาฬกำลังซื้อสะสมอย่างมีนัยสำคัญ",
        legendBuyText: "มีเงินไหลเข้าสะสมทั่วไป",
        legendDistribText: "วาฬกำลังทยอยเทขายอย่างมีนัยสำคัญ",
        legendSellText: "มีเงินไหลออกสะสมทั่วไป",
        portfolioTitle: "🧮 คำนวณต้นทุนเฉลี่ย & หา Break Even",
        portfolioSubtitle: "ระบบคำนวณต้นทุนเฉลี่ยสะสม ราคา Break Even และสรุปผลตอบแทนกำไร/ขาดทุนของหุ้น",
        portfolioOverview: "ภาพรวมต้นทุน & พอร์ตลงทุน",
        lblPtCost: "ต้นทุนรวมทั้งหมด",
        lblPtRealized: "กำไร/ขาดทุนที่ขายแล้ว",
        lblPtHolding: "ต้นทุนหุ้นที่ถืออยู่",
        lblPtCount: "จำนวนหุ้นในระบบ",
        stocksCountUnit: "{count} ตัว",
        addStockBtn: "+ เพิ่มหุ้นใหม่",
        refreshBtn: "↺ รีเฟรช",
        emptyBuys: "ยังไม่มีรายการซื้อ",
        emptySells: "ยังไม่มีรายการขาย",
        avgLabel: "เฉลี่ย ${price}",
        tagBuy: "ซื้อ",
        tagSell: "ขาย",
        lblCost: "ต้นทุนซื้อรวม",
        lblTotalShares: "หุ้นทั้งหมดที่ซื้อ",
        sharesUnit: "{shares} หุ้น",
        lblAvgCostPerShare: "ต้นทุนเฉลี่ย/หุ้น",
        lblRemainShares: "หุ้นที่ถืออยู่คงเหลือ",
        lblRealizedPL: "กำไร/ขาดทุนที่ขายแล้วรวม",
        lblBreakEvenForRemain: "ราคา Break-Even ของหุ้นที่เหลือ {remain} หุ้น",
        beSoldOut: "ขายหุ้นหมดแล้ว",
        beNoData: "ยังไม่มีข้อมูล",
        placeholderStockName: "ชื่อหุ้น (เช่น NVDA, AAPL)",
        placeholderPrice: "ราคา $",
        placeholderQty: "จำนวนหุ้น",
        visitLabel: "ผู้เข้าชม:",
        onlineLabel: "ออนไลน์:",
        lblNavSrCalc: "ตารางคำนวณ แนวรับ-แนวต้าน",
        srCalcTitle: "📐 ตารางคำนวณ แนวรับ-แนวต้าน (Support & Resistance)",
        srCalcSubtitle: "เครื่องมือคำนวณสัดส่วนกำไร/ขาดทุน และเป้าหมายผลตอบแทนจากโซนแนวรับ-แนวต้าน",
        lblSrInvestment: "ใส่เงินลงทุนเพิ่ม (USD)",
        lblSrRemember: "จดจำจำนวนเงินนี้ไว้",
        lblSrUseS0: "ใช้ราคาปัจจุบันเป็น S0",
        lblSrTickerSelect: "เลือกหุ้นจากบทวิเคราะห์",
        optSrCustom: "-- ป้อนข้อมูลเอง (Custom) --",
        lblSrCurrentPrice: "ราคาปัจจุบัน (USD)",
        lblSrManualTitle: "กำหนดระดับราคาแนวรับ-แนวต้าน",
        lblSrSupports: "ระดับแนวรับ (Buy at Support)",
        lblSrResistances: "ระดับแนวต้าน (Sell at Resistance)",
        srAddSupport: "+ เพิ่มแนวรับ",
        srAddResistance: "+ เพิ่มแนวต้าน",
        lblSrTableTitle: "ตารางคำนวณ แนวรับ-แนวต้าน",
        lblSrTickerSearch: "ค้นหาหุ้นในตลาด (เช่น NVDA, AAPL)",
        placeholderTickerSearch: "พิมพ์ Ticker หรือชื่อหุ้น...",
        lblSrCustomName: "ชื่อหุ้น / Ticker (ระบุเอง)",
        placeholderCustomName: "พิมพ์ชื่อหุ้น (เช่น TSLA)",
        noStocksFound: "ไม่พบข้อมูลหุ้นนี้",
        lblSrWatchlistTitle: "Watchlist ของฉัน",
        srWatchlistEmpty: "ไม่มีหุ้นใน Watchlist (พิมพ์ค้นหาหุ้นแล้วบันทึกเพื่อติดตาม)"
    },
    en: {
        channelTitle: "SepKhawGonTrade",
        channelSubtitle: "US Stock Intelligence",
        searchPlaceholder: "Search analysis / ticker...",
        categoriesTitle: "Analysis Hub",
        toolsTitle: "Calculators & Media",
        allReports: "All Reports",
        vaultTitle: "Latest Analysis & Reports Hub",
        vaultSubtitle: "In-depth US stock market updates, real-time from the trading floor",
        statusConnected: "News Database Connected",
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
        readDetails: "Read Details",
        otherReports: "General Reports",
        readFullReport: "Read Full Report",
        latestReportBadge: "Latest Report",
        lblNavPortfolio: "Average Cost & Break-Even",
        lblNavBotTrade: "Bot Trade & Stats",
        lblNavWebAlbum: "Video Production Album",
        lblNavYoutube: "YouTube Channel",
        legendTitle: "CMF (Whale Flow) Signal Reading Guide",
        legendDesc: "CMF (Chaikin Money Flow) measures accumulated capital flow of large institutional investors (whales) over 20 days:",
        legendAccumText: "Whales actively accumulating shares",
        legendBuyText: "General capital inflow",
        legendDistribText: "Whales actively distributing shares",
        legendSellText: "General capital outflow",
        portfolioTitle: "🧮 Average Cost & Break-Even Calculator",
        portfolioSubtitle: "Calculate average cost per share, break-even prices, and profit/loss metrics",
        portfolioOverview: "Portfolio Overview & Cost Summary",
        lblPtCost: "Total Portfolio Cost",
        lblPtRealized: "Realized P&L",
        lblPtHolding: "Holding Cost",
        lblPtCount: "Tracked Stocks",
        stocksCountUnit: "{count} stocks",
        addStockBtn: "+ Add New Stock",
        refreshBtn: "↺ Refresh",
        emptyBuys: "No buy transactions yet",
        emptySells: "No sell transactions yet",
        avgLabel: "Avg ${price}",
        tagBuy: "BUY",
        tagSell: "SELL",
        lblCost: "Total Buy Cost",
        lblTotalShares: "Total Shares Bought",
        sharesUnit: "{shares} shares",
        lblAvgCostPerShare: "Avg Cost / Share",
        lblRemainShares: "Remaining Shares Held",
        lblRealizedPL: "Total Realized P&L",
        lblBreakEvenForRemain: "Break-even price for remaining {remain} shares",
        beSoldOut: "All shares sold out",
        beNoData: "No data available",
        placeholderStockName: "Stock Ticker (e.g. NVDA, AAPL)",
        placeholderPrice: "Price $",
        placeholderQty: "Qty",
        visitLabel: "Visits:",
        onlineLabel: "Online:",
        lblNavSrCalc: "Support & Resistance Calculator",
        srCalcTitle: "📐 Support & Resistance Calculator",
        srCalcSubtitle: "Calculate profit margins and return targets from support & resistance zones",
        lblSrInvestment: "Investment Amount (USD)",
        lblSrRemember: "Remember this investment",
        lblSrUseS0: "Use current price as S0",
        lblSrTickerSelect: "Select Ticker from Reports",
        optSrCustom: "-- Manual Input (Custom) --",
        lblSrCurrentPrice: "Current Price (USD)",
        lblSrManualTitle: "Configure Support & Resistance Levels",
        lblSrSupports: "Support Levels (Buy)",
        lblSrResistances: "Resistance Levels (Sell)",
        srAddSupport: "+ Add Support",
        srAddResistance: "+ Add Resistance",
        lblSrTableTitle: "Support & Resistance Grid",
        lblSrTickerSearch: "Search Stock (e.g. NVDA, AAPL)",
        placeholderTickerSearch: "Type ticker or stock name...",
        lblSrCustomName: "Stock Ticker / Name (Custom)",
        placeholderCustomName: "Enter stock name (e.g. TSLA)",
        noStocksFound: "No stocks found",
        lblSrWatchlistTitle: "My Watchlist",
        srWatchlistEmpty: "No stocks in watchlist"
    }
};

// DOM References Elements
let elements = {};

// Initialize App Lifecycle
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

async function initApp() {
    cacheElements();
    setupEventListeners();
    initVisitorStats();
    await loadMarketPrices();
    loadPortfolio();
    await fetchReportsIndex();
    updateUILanguage();
    handleRouting();
}

function cacheElements() {
    elements = {
        sidebar: document.getElementById('sidebar'),
        sidebarBackdrop: document.getElementById('sidebar-backdrop'),
        mobileToggle: document.getElementById('mobile-toggle'),
        searchInput: document.getElementById('search-input'),
        clearSearch: document.getElementById('clear-search'),
        categoryList: document.getElementById('category-list'),
        sortSelect: document.getElementById('sort-select'),
        reportsGrid: document.getElementById('reports-grid'),
        resultsInfo: document.getElementById('results-info'),
        catalogView: document.getElementById('catalog-view'),
        readerView: document.getElementById('reader-view'),
        portfolioView: document.getElementById('portfolio-view'),
        srCalcView: document.getElementById('sr-calc-view'),
        featuredBadge: document.querySelector('.featured-badge'),
        featuredTitle: document.getElementById('featured-title'),
        featuredCategory: document.getElementById('featured-category'),
        featuredDate: document.getElementById('featured-date'),
        featuredContainer: document.getElementById('featured-report-container'),
        featuredMarkdown: document.getElementById('featured-markdown-container'),
        featuredReadMoreBtn: document.getElementById('featured-read-more-btn'),
        backBtn: document.getElementById('back-to-catalog'),
        btnCopyLink: document.getElementById('btn-copy-link'),
        btnPrint: document.getElementById('btn-print'),
        btnRaw: document.getElementById('btn-raw'),
        readerCategory: document.getElementById('reader-category'),
        readerTitle: document.getElementById('reader-title'),
        readerDate: document.getElementById('reader-date'),
        readerSize: document.getElementById('reader-size'),
        markdownContainer: document.getElementById('markdown-container'),
        stockList: document.getElementById('stock-list'),
        addStockBtn: document.getElementById('add-stock-btn'),
        refreshBtn: document.getElementById('refresh-btn'),
        srInvestment: document.getElementById('sr-investment'),
        srRememberInvestment: document.getElementById('sr-remember-investment'),
        srUseCurrentAsS0: document.getElementById('sr-use-current-as-s0'),
        srTickerSelect: document.getElementById('sr-ticker-select'),
        srCurrentPrice: document.getElementById('sr-current-price'),
        srCurrentPriceGroup: document.getElementById('sr-current-price-group'),
        supportInputsContainer: document.getElementById('support-inputs-container'),
        resistanceInputsContainer: document.getElementById('resistance-inputs-container'),
        srAddSupport: document.getElementById('sr-add-support'),
        srAddResistance: document.getElementById('sr-add-resistance'),
        srOutputTable: document.getElementById('sr-output-table'),
        srTableTickerBadge: document.getElementById('sr-table-ticker-badge'),
        srTickerSearch: document.getElementById('sr-ticker-search'),
        srSuggestionsDropdown: document.getElementById('sr-suggestions-dropdown'),
        srCustomName: document.getElementById('sr-custom-name'),
        srBtnRefreshPrice: document.getElementById('sr-btn-refresh-price'),
        srBtnSaveWatchlist: document.getElementById('sr-btn-save-watchlist'),
        srBtnClearCustom: document.getElementById('sr-btn-clear-custom'),
        srWatchlistList: document.getElementById('sr-watchlist-list'),
        navBotTrade: document.getElementById('nav-bot-trade'),
        btnClearCache: document.getElementById('btn-clear-cache')
    };
}

function setupEventListeners() {
    // Search input listener
    if (elements.searchInput) {
        elements.searchInput.addEventListener('input', (e) => {
            appState.searchQuery = e.target.value.trim();
            elements.clearSearch.style.display = appState.searchQuery ? 'block' : 'none';
            renderCatalog();
        });
    }

    if (elements.clearSearch) {
        elements.clearSearch.addEventListener('click', () => {
            elements.searchInput.value = '';
            appState.searchQuery = '';
            elements.clearSearch.style.display = 'none';
            renderCatalog();
        });
    }

    // Sort select listener
    if (elements.sortSelect) {
        elements.sortSelect.addEventListener('change', (e) => {
            appState.sortBy = e.target.value;
            renderCatalog();
        });
    }

    // Navigation back button
    if (elements.backBtn) {
        elements.backBtn.addEventListener('click', () => {
            window.location.hash = '';
        });
    }

    // Mobile drawer listeners
    if (elements.mobileToggle) {
        elements.mobileToggle.addEventListener('click', () => {
            elements.sidebar.classList.toggle('mobile-open');
            elements.sidebarBackdrop.classList.toggle('active');
        });
    }

    if (elements.sidebarBackdrop) {
        elements.sidebarBackdrop.addEventListener('click', closeMobileSidebar);
    }

    // Reader action buttons
    if (elements.btnCopyLink) elements.btnCopyLink.addEventListener('click', copyReportLink);
    if (elements.btnPrint) elements.btnPrint.addEventListener('click', () => window.print());
    if (elements.btnRaw) elements.btnRaw.addEventListener('click', toggleRawMarkdown);

    // Clear Cache Button
    if (elements.btnClearCache) {
        elements.btnClearCache.addEventListener('click', () => {
            if (confirm(appState.lang === 'th' ? 'คุณต้องการล้างแคชและรีเซ็ตข้อมูลเว็บใช่หรือไม่?' : 'Do you want to clear browser cache and reset site state?')) {
                try {
                    localStorage.clear();
                    sessionStorage.clear();
                } catch(e) {}
                window.location.href = window.location.pathname + '?nocache=' + Date.now();
            }
        });
    }

    // Language switcher
    document.querySelectorAll('.lang-switcher').forEach(switcher => {
        switcher.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.getAttribute('data-lang');
                if (lang !== appState.lang) {
                    appState.lang = lang;
                    updateUILanguage();
                }
            });
        });
    });

    // Portfolio controls
    if (elements.addStockBtn) {
        elements.addStockBtn.addEventListener('click', () => {
            const defaultName = appState.lang === 'th' ? `หุ้น ${appState.portfolioStocks.length + 1}` : `Stock ${appState.portfolioStocks.length + 1}`;
            appState.portfolioStocks.push({
                name: defaultName,
                open: true,
                buys: [{ price: 0, shares: 0 }],
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

    // Menu Nav Click Handlers
    const navPort = document.getElementById('nav-portfolio');
    if (navPort) {
        navPort.addEventListener('click', () => {
            window.location.hash = 'portfolio';
            closeMobileSidebar();
        });
    }

    const navSr = document.getElementById('nav-sr-calc');
    if (navSr) {
        navSr.addEventListener('click', () => {
            window.location.hash = 'sr-calc';
            closeMobileSidebar();
        });
    }

    const navAlbum = document.getElementById('nav-web-album');
    if (navAlbum) {
        navAlbum.addEventListener('click', () => {
            window.open('album.html', '_blank');
            closeMobileSidebar();
        });
    }

    if (elements.navBotTrade) {
        elements.navBotTrade.addEventListener('click', () => {
            document.querySelectorAll('.category-item').forEach(item => item.classList.remove('active'));
            elements.navBotTrade.classList.add('active');
            appState.activeCategory = 'Bot Trade Combined';
            window.location.hash = '';
            renderCatalog();
            closeMobileSidebar();
        });
    }

    window.addEventListener('hashchange', handleRouting);
}

function closeMobileSidebar() {
    if (elements.sidebar) elements.sidebar.classList.remove('mobile-open');
    if (elements.sidebarBackdrop) elements.sidebarBackdrop.classList.remove('active');
}

// Fetch Reports Database
async function fetchReportsIndex() {
    try {
        let reportsData = null;
        try {
            const rawRes = await fetch(`https://raw.githubusercontent.com/sepnewtrade-report/sepkhawgontrade-reports/main/reports-index.json?v=${Date.now()}`, { cache: 'no-store' });
            if (rawRes.ok) {
                const data = await rawRes.json();
                if (data && Array.isArray(data) && data.length > 0) {
                    reportsData = data;
                }
            }
        } catch (e) {
            console.warn('GitHub raw fetch failed, trying local index:', e);
        }

        if (!reportsData) {
            const localRes = await fetch(`reports-index.json?v=${Date.now()}`, { cache: 'no-store' });
            if (localRes.ok) {
                reportsData = await localRes.json();
            }
        }

        if (!reportsData) throw new Error('Failed to load reports index');
        
        appState.reports = reportsData;

        // Mark latest report per category
        const latestReports = {};
        appState.reports.forEach(report => {
            if (!latestReports[report.category]) {
                latestReports[report.category] = report.filename;
            }
        });
        appState.reports.forEach(report => {
            report.isLatest = (latestReports[report.category] === report.filename);
        });

        renderCategoriesMenu();
    } catch (error) {
        console.error('Error fetching index:', error);
        if (elements.reportsGrid) {
            const t = translations[appState.lang];
            elements.reportsGrid.innerHTML = `
                <div class="error-state" style="padding: 40px; text-align: center;">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size: 32px; color: var(--accent-gold); margin-bottom: 12px;"></i>
                    <h3>${t.errorLoading}</h3>
                    <p>${t.errorLoadingSub.replace('{code}', '<code>node generate-index.js</code>')}</p>
                </div>
            `;
        }
    }
}

// URL Hash Router
function handleRouting() {
    const hash = window.location.hash;
    
    if (hash && hash.startsWith('#report=')) {
        closePortfolio();
        closeSrCalc();
        const filePath = decodeURIComponent(hash.substring(8));
        openReport(filePath);
    } else if (hash === '#portfolio') {
        closeReport();
        closeSrCalc();
        openPortfolio();
    } else if (hash === '#sr-calc') {
        closeReport();
        closePortfolio();
        openSrCalc();
    } else {
        closePortfolio();
        closeReport();
        closeSrCalc();
        renderCatalog();
    }
}

function renderCategoriesMenu() {
    if (!elements.categoryList) return;
    
    const categoriesCount = {};
    appState.reports.forEach(r => {
        categoriesCount[r.category] = (categoriesCount[r.category] || 0) + 1;
    });

    const countAllEl = document.getElementById('count-all');
    if (countAllEl) countAllEl.textContent = appState.reports.length;

    const uniqueCategories = [...new Set(appState.reports.map(r => r.category))].filter(cat => cat !== 'Bot Trade Todays' && cat !== 'Bot Trade Stats');

    // Keep first 'all' item, clear rest
    while (elements.categoryList.children.length > 1) {
        elements.categoryList.removeChild(elements.categoryList.lastChild);
    }

    uniqueCategories.forEach(cat => {
        const sampleReport = appState.reports.find(r => r.category === cat);
        const thaiName = sampleReport ? sampleReport.categoryThai : cat;
        const count = categoriesCount[cat] || 0;

        const li = document.createElement('li');
        li.className = 'category-item' + (appState.activeCategory === cat ? ' active' : '');
        li.setAttribute('data-category', cat);

        let iconClass = 'fa-file-lines';
        if (cat.includes('Pre-Market')) iconClass = 'fa-bolt';
        else if (cat.includes('Daily Script') || cat.includes('สรุปจบ')) iconClass = 'fa-newspaper';
        else if (cat.includes('Whale Flow') || cat.includes('วาฬ')) iconClass = 'fa-fish-fins';
        else if (cat.includes('Small Cap')) iconClass = 'fa-radar';
        else if (cat.includes('Cosmic')) iconClass = 'fa-atom';
        else if (cat.includes('Options')) iconClass = 'fa-sliders';
        else if (cat.includes('Gold')) iconClass = 'fa-coins';

        li.innerHTML = `
            <i class="fa-solid ${iconClass}"></i>
            <span>${appState.lang === 'th' ? thaiName : cat}</span>
            <span class="badge count-badge">${count}</span>
        `;

        li.addEventListener('click', () => {
            document.querySelectorAll('.category-item').forEach(item => item.classList.remove('active'));
            li.classList.add('active');
            appState.activeCategory = cat;
            window.location.hash = '';
            renderCatalog();
            closeMobileSidebar();
        });

        elements.categoryList.appendChild(li);
    });

    // Handle 'all' click
    const allItem = elements.categoryList.querySelector('[data-category="all"]');
    if (allItem) {
        allItem.addEventListener('click', () => {
            document.querySelectorAll('.category-item').forEach(item => item.classList.remove('active'));
            allItem.classList.add('active');
            appState.activeCategory = 'all';
            window.location.hash = '';
            renderCatalog();
            closeMobileSidebar();
        });
    }
}

function renderCatalog() {
    if (!elements.reportsGrid) return;
    
    let filtered = appState.reports;

    // Filter by Category
    if (appState.activeCategory === 'Bot Trade Combined') {
        filtered = filtered.filter(r => r.category === 'Bot Trade Todays' || r.category === 'Bot Trade Stats');
    } else if (appState.activeCategory !== 'all') {
        filtered = filtered.filter(r => r.category === appState.activeCategory);
    }

    // Filter by Search Query
    if (appState.searchQuery) {
        const q = appState.searchQuery.toLowerCase();
        filtered = filtered.filter(r => 
            r.title.toLowerCase().includes(q) || 
            r.filename.toLowerCase().includes(q) ||
            r.category.toLowerCase().includes(q) ||
            r.categoryThai.toLowerCase().includes(q)
        );
    }

    // Sorting
    filtered.sort((a, b) => {
        if (appState.sortBy === 'newest') return b.timestamp - a.timestamp;
        if (appState.sortBy === 'oldest') return a.timestamp - b.timestamp;
        if (appState.sortBy === 'alphabetical') return a.title.localeCompare(b.title);
        return 0;
    });

    const t = translations[appState.lang];
    if (elements.resultsInfo) {
        elements.resultsInfo.textContent = t.foundCount.replace('{count}', filtered.length);
    }

    // Featured Latest Report Logic
    if (filtered.length > 0 && appState.activeCategory === 'all' && !appState.searchQuery) {
        const latest = filtered[0];
        if (elements.featuredContainer) elements.featuredContainer.style.display = 'block';
        if (elements.featuredTitle) elements.featuredTitle.textContent = latest.title;
        if (elements.featuredCategory) elements.featuredCategory.textContent = appState.lang === 'th' ? latest.categoryThai : latest.category;
        if (elements.featuredDate) elements.featuredDate.textContent = latest.date;

        if (elements.featuredReadMoreBtn) {
            elements.featuredReadMoreBtn.onclick = () => {
                window.location.hash = `report=${encodeURIComponent(latest.path)}`;
            };
        }

        // Load preview text
        fetchReportContent(latest.path).then(md => {
            if (elements.featuredMarkdown && md) {
                const html = window.DOMPurify ? DOMPurify.sanitize(marked.parse(md)) : marked.parse(md);
                elements.featuredMarkdown.innerHTML = html;
            }
        });
    } else {
        if (elements.featuredContainer) elements.featuredContainer.style.display = 'none';
    }

    // Render Grid Cards
    if (filtered.length === 0) {
        elements.reportsGrid.innerHTML = `
            <div class="no-results" style="grid-column: 1/-1; padding: 40px; text-align: center;">
                <i class="fa-solid fa-folder-open" style="font-size: 32px; color: var(--text-muted); margin-bottom: 12px;"></i>
                <h3>${t.noResults}</h3>
                <p style="color: var(--text-muted);">${t.noResultsSub}</p>
            </div>
        `;
        return;
    }

    elements.reportsGrid.innerHTML = filtered.map(r => `
        <div class="report-card" onclick="window.location.hash='report=${encodeURIComponent(r.path)}'">
            <div>
                <div class="card-category">${appState.lang === 'th' ? r.categoryThai : r.category}</div>
                <h3 class="card-title">${r.title}</h3>
            </div>
            <div class="card-footer">
                <span><i class="fa-regular fa-calendar"></i> ${r.date}</span>
                <span class="read-link">${t.readDetails} <i class="fa-solid fa-arrow-right"></i></span>
            </div>
        </div>
    `).join('');
}

// Fetch Content of a Markdown Report
async function fetchReportContent(filePath) {
    try {
        let text = null;
        try {
            const rawRes = await fetch(`https://raw.githubusercontent.com/sepnewtrade-report/sepkhawgontrade-reports/main/${filePath}?v=${Date.now()}`, { cache: 'no-store' });
            if (rawRes.ok) text = await rawRes.text();
        } catch (e) {
            console.warn('Raw fetch failed, fallback to local:', e);
        }

        if (!text) {
            const localRes = await fetch(`${filePath}?v=${Date.now()}`, { cache: 'no-store' });
            if (localRes.ok) text = await localRes.text();
        }
        return text;
    } catch (e) {
        console.error('Error fetching report content:', e);
        return null;
    }
}

// Open Report Reader View
async function openReport(filePath) {
    appState.selectedReport = appState.reports.find(r => r.path === filePath) || { title: filePath, path: filePath, category: 'Report', categoryThai: 'รายงาน', date: '', size: 0 };
    
    const t = translations[appState.lang];
    if (elements.readerTitle) elements.readerTitle.textContent = appState.selectedReport.title;
    if (elements.readerCategory) elements.readerCategory.textContent = appState.lang === 'th' ? appState.selectedReport.categoryThai : appState.selectedReport.category;
    if (elements.readerDate) elements.readerDate.textContent = appState.selectedReport.date;
    if (elements.readerSize) elements.readerSize.textContent = `${(appState.selectedReport.size / 1024).toFixed(1)} KB`;

    // Toggle Whale Flow legend card if applicable
    const isWhale = filePath.includes('whale') || filePath.includes('options_screen');
    const legendCard = document.getElementById('whale-legend-card-reader');
    if (legendCard) legendCard.style.display = isWhale ? 'block' : 'none';

    if (elements.catalogView) elements.catalogView.classList.remove('active');
    if (elements.portfolioView) elements.portfolioView.classList.remove('active');
    if (elements.srCalcView) elements.srCalcView.classList.remove('active');
    if (elements.readerView) elements.readerView.classList.add('active');

    if (elements.markdownContainer) {
        elements.markdownContainer.innerHTML = `<div class="loading-spinner" style="padding: 40px; text-align: center;"><i class="fa-solid fa-circle-notch fa-spin"></i><p>${t.loadingSpinner}</p></div>`;
    }

    const content = await fetchReportContent(filePath);
    if (content && elements.markdownContainer) {
        appState.rawMarkdownContent = content;
        renderMarkdownView();
    }
}

function renderMarkdownView() {
    if (!elements.markdownContainer || !appState.rawMarkdownContent) return;
    
    if (appState.viewMode === 'raw') {
        elements.markdownContainer.innerHTML = `<pre style="white-space: pre-wrap; font-family: monospace; background: var(--bg-tertiary); padding: 20px; border-radius: 10px; color: var(--accent-cyan);">${escapeHtml(appState.rawMarkdownContent)}</pre>`;
    } else {
        const parsed = window.DOMPurify ? DOMPurify.sanitize(marked.parse(appState.rawMarkdownContent)) : marked.parse(appState.rawMarkdownContent);
        elements.markdownContainer.innerHTML = parsed;
    }
}

function toggleRawMarkdown() {
    appState.viewMode = appState.viewMode === 'html' ? 'raw' : 'html';
    const t = translations[appState.lang];
    if (elements.btnRaw) elements.btnRaw.title = appState.viewMode === 'html' ? t.rawCodeTitle : t.viewNormalTitle;
    renderMarkdownView();
}

function copyReportLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        alert(appState.lang === 'th' ? 'คัดลอกลิงก์รายงานเรียบร้อยแล้ว' : 'Permalink copied to clipboard.');
    }).catch(e => {
        console.error('Copy failed:', e);
    });
}

function closeReport() {
    if (elements.readerView) elements.readerView.classList.remove('active');
}

// ==========================================================================
// Average Cost & Break-Even Calculator Logic
// ==========================================================================

function calculateStockMetrics(s) {
    const vb = s.buys.filter(b => b.shares > 0);
    const vs = s.sells.filter(v => v.shares > 0);
    
    const totalCost = vb.reduce((a, b) => a + (b.price * b.shares), 0);
    const totalShares = vb.reduce((a, b) => a + b.shares, 0);
    const avg = totalShares > 0 ? totalCost / totalShares : 0;
    
    const soldShares = vs.reduce((a, v) => a + v.shares, 0);
    const soldRevenue = vs.reduce((a, v) => a + (v.price * v.shares), 0);
    const realized = soldRevenue - (soldShares * avg);
    
    const remain = Math.max(0, totalShares - soldShares);
    const remainCost = remain * avg;
    const bePrice = remain > 0 ? (remainCost - realized) / remain : null;
    
    return { totalCost, totalShares, avg, soldShares, realized, remain, remainCost, bePrice };
}

function savePortfolio() {
    try {
        localStorage.setItem('sep_portfolio_stocks', JSON.stringify(appState.portfolioStocks));
    } catch (e) {
        console.warn('Failed to save portfolio:', e);
    }
}

function loadPortfolio() {
    try {
        const saved = localStorage.getItem('sep_portfolio_stocks');
        if (saved) {
            appState.portfolioStocks = JSON.parse(saved);
        } else {
            // Default mockup US stocks
            appState.portfolioStocks = [
                { name: 'NVDA (NVIDIA)', open: true, buys: [{ price: 120, shares: 50 }, { price: 110, shares: 50 }], sells: [{ price: 135, shares: 30 }] },
                { name: 'AAPL (Apple)', open: false, buys: [{ price: 220, shares: 25 }], sells: [] }
            ];
        }
    } catch (e) {
        appState.portfolioStocks = [];
    }
}

function openPortfolio() {
    document.querySelectorAll('.category-item').forEach(item => item.classList.remove('active'));
    const navPort = document.getElementById('nav-portfolio');
    if (navPort) navPort.classList.add('active');

    if (elements.catalogView) elements.catalogView.classList.remove('active');
    if (elements.readerView) elements.readerView.classList.remove('active');
    if (elements.srCalcView) elements.srCalcView.classList.remove('active');
    if (elements.portfolioView) elements.portfolioView.classList.add('active');

    renderPortfolio();
}

function closePortfolio() {
    if (elements.portfolioView) elements.portfolioView.classList.remove('active');
    const navPort = document.getElementById('nav-portfolio');
    if (navPort) navPort.classList.remove('active');
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
        hdr.onclick = () => { s.open = !s.open; savePortfolio(); renderPortfolio(); };

        const hl = document.createElement('div');
        hl.className = 'portfolio-stock-header-left';

        const nw = document.createElement('div');
        nw.className = 'portfolio-name-wrap';

        const ni = document.createElement('input');
        ni.className = 'portfolio-name-inp';
        ni.value = s.name;
        ni.placeholder = t.placeholderStockName;
        ni.onclick = e => e.stopPropagation();
        ni.onchange = () => { s.name = ni.value; savePortfolio(); };

        nw.append(ni);

        const badge = document.createElement('span');
        badge.className = 'portfolio-badge ' + (r.realized > 0 ? 'portfolio-bp' : r.realized < 0 ? 'portfolio-bl2' : 'portfolio-bz');
        badge.textContent = r.realized > 0 ? `+$${fmt(r.realized)}` : r.realized < 0 ? `-$${fmt(Math.abs(r.realized))}` : '$0.00';
        hl.append(nw, badge);

        const hr2 = document.createElement('div');
        hr2.style.cssText = 'display:flex;align-items:center;gap:12px';

        const avgSp = document.createElement('span');
        avgSp.style.cssText = 'font-size:14px;color:var(--text-secondary)';
        avgSp.textContent = t.avgLabel.replace('{price}', r.totalShares > 0 ? '$' + fmt(r.avg) : '-');

        const tb = document.createElement('button');
        tb.className = 'portfolio-trash-btn';
        tb.innerHTML = '<i class="fa-regular fa-trash-can"></i>';
        tb.onclick = e => { e.stopPropagation(); appState.portfolioStocks.splice(si, 1); savePortfolio(); renderPortfolio(); };

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

function renderPortfolioBody(s, body, si) {
    const t = translations[appState.lang];

    // BUY Section
    body.appendChild(makeSecDiv('portfolio-tb', t.tagBuy));
    s.buys.forEach((b, bi) => {
        body.appendChild(makeEntryRow(
            t.placeholderPrice, b.price, false, '0.00', v => { s.buys[bi].price = parseFloat(v) || 0; },
            t.placeholderQty, b.shares, true, '0', v => { s.buys[bi].shares = parseInt(v) || 0; },
            () => { s.buys.splice(bi, 1); savePortfolio(); renderPortfolio(); }
        ));
    });

    const ab = document.createElement('button');
    ab.className = 'portfolio-add-btn';
    ab.textContent = appState.lang === 'th' ? '+ เพิ่มรายการซื้อ' : '+ Add Buy Order';
    ab.onclick = () => { s.buys.push({ price: 0, shares: 0 }); savePortfolio(); renderPortfolio(); };
    body.appendChild(ab);

    // SELL Section
    body.appendChild(makeSecDiv('portfolio-ts', t.tagSell));
    s.sells.forEach((sv, vi) => {
        body.appendChild(makeEntryRow(
            t.placeholderPrice, sv.price, false, '0.00', v => { s.sells[vi].price = parseFloat(v) || 0; },
            t.placeholderQty, sv.shares, true, '0', v => { s.sells[vi].shares = parseInt(v) || 0; },
            () => { s.sells.splice(vi, 1); savePortfolio(); renderPortfolio(); }
        ));
    });

    const as = document.createElement('button');
    as.className = 'portfolio-add-btn';
    as.textContent = appState.lang === 'th' ? '+ เพิ่มรายการขาย' : '+ Add Sell Order';
    as.onclick = () => { s.sells.push({ price: 0, shares: 0 }); savePortfolio(); renderPortfolio(); };
    body.appendChild(as);

    // Metrics Summary Grid
    const r = calculateStockMetrics(s);
    const mg = document.createElement('div');
    mg.className = 'portfolio-metrics-grid';
    mg.innerHTML = `
        <div class="portfolio-metric"><p class="portfolio-ml">${t.lblCost}</p><p class="portfolio-mv">$${fmt(r.totalCost)}</p></div>
        <div class="portfolio-metric"><p class="portfolio-ml">${t.lblTotalShares}</p><p class="portfolio-mv">${fmtI(r.totalShares)} หุ้น</p></div>
        <div class="portfolio-metric"><p class="portfolio-ml">${t.lblAvgCostPerShare}</p><p class="portfolio-mv">${r.totalShares > 0 ? '$' + fmt(r.avg) : '-'}</p></div>
        <div class="portfolio-metric"><p class="portfolio-ml">${t.lblRemainShares}</p><p class="portfolio-mv">${fmtI(r.remain)} หุ้น</p></div>
    `;
    body.appendChild(mg);

    // Break Even Card
    const be = document.createElement('div');
    if (r.bePrice !== null) {
        be.className = `portfolio-be-box ${r.bePrice <= r.avg ? 'green' : 'red'}`;
        const beLabel = t.lblBreakEvenForRemain.replace('{remain}', fmtI(r.remain));
        const target5 = (r.bePrice * 1.05).toFixed(2);
        const target10 = (r.bePrice * 1.10).toFixed(2);
        const target20 = (r.bePrice * 1.20).toFixed(2);

        be.innerHTML = `
            <p class="portfolio-bll">${beLabel}</p>
            <p class="portfolio-bv">$${fmt(r.bePrice)} / หุ้น</p>
            <div style="margin-top: 10px; padding-top: 8px; border-top: 1px dashed rgba(255,255,255,0.15); display: flex; gap: 12px; font-size: 12px; justify-content: space-around;">
                <span>🎯 เป้ากำไร +5%: <b>$${target5}</b></span>
                <span>🎯 เป้ากำไร +10%: <b>$${target10}</b></span>
                <span>🚀 เป้ากำไร +20%: <b>$${target20}</b></span>
            </div>
        `;
    } else {
        be.className = 'portfolio-be-box gray';
        const statusText = r.remain === 0 && r.totalShares > 0 ? t.beSoldOut : t.beNoData;
        be.innerHTML = `<p class="portfolio-bll">Break-even</p><p class="portfolio-bv">${statusText}</p>`;
    }
    body.appendChild(be);
}

function makeSecDiv(tagClass, tagText) {
    const d = document.createElement('div');
    d.className = 'portfolio-sec-div';
    const sp = document.createElement('span');
    sp.className = `portfolio-tag ${tagClass}`;
    sp.textContent = tagText;
    d.appendChild(sp);
    return d;
}

function makeEntryRow(lblA, valA, isIntA, placeA, onChangeA, lblB, valB, isIntB, placeB, onChangeB, onDel) {
    const row = document.createElement('div');
    row.className = 'portfolio-entry-row';

    const u1 = document.createElement('span');
    u1.className = 'portfolio-unit';
    u1.textContent = lblA;

    const u2 = document.createElement('span');
    u2.className = 'portfolio-unit';
    u2.textContent = lblB;

    const del = document.createElement('button');
    del.className = 'portfolio-del-row-btn';
    del.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
    del.onclick = onDel;

    row.append(
        u1, makeInputWrap(valA, isIntA, placeA, onChangeA),
        u2, makeInputWrap(valB, isIntB, placeB, onChangeB),
        del
    );
    return row;
}

function makeInputWrap(val, isInt, placeholder, onChange) {
    const wrap = document.createElement('div');
    wrap.className = 'portfolio-iw';
    const inp = document.createElement('input');
    inp.type = 'number';
    inp.step = isInt ? '1' : '0.01';
    inp.value = val > 0 ? val : '';
    inp.placeholder = placeholder;
    inp.oninput = () => { onChange(inp.value); savePortfolio(); updatePortfolioSummary(); };

    const clr = document.createElement('button');
    clr.className = 'portfolio-ic';
    clr.textContent = '✕';
    clr.onclick = () => { inp.value = ''; onChange(''); savePortfolio(); updatePortfolioSummary(); };

    wrap.append(inp, clr);
    return wrap;
}

function updatePortfolioSummary() {
    let c = 0, rv = 0, h = 0;
    appState.portfolioStocks.forEach(s => {
        const r = calculateStockMetrics(s);
        c += r.totalCost;
        rv += r.realized;
        h += r.remainCost;
    });

    const costEl = document.getElementById('pt-cost');
    if (costEl) costEl.textContent = '$' + fmt(c);

    const rEl = document.getElementById('pt-realized');
    if (rEl) {
        rEl.textContent = (rv >= 0 ? '+' : '') + '$' + fmt(Math.abs(rv));
        rEl.style.color = rv > 0 ? 'var(--accent-emerald)' : rv < 0 ? 'var(--accent-red)' : 'var(--text-primary)';
    }

    const holdEl = document.getElementById('pt-holding');
    if (holdEl) holdEl.textContent = '$' + fmt(h);

    const countEl = document.getElementById('pt-count');
    if (countEl) countEl.textContent = `${appState.portfolioStocks.length} ตัว`;
}

// ==========================================================================
// Support & Resistance Calculator Module
// ==========================================================================

const defaultSrLevels = {
    custom: { supports: [50.10, 42.50, 36.50], resistances: [63.50, 74.10, 80.80, 90.00], currentPrice: 55.00 },
    AMD: { supports: [515.00, 495.00, 450.00], resistances: [565.00, 580.00, 615.00, 630.00], currentPrice: 535.00 },
    TSMC: { supports: [430.00, 420.00, 410.00], resistances: [460.00, 465.00, 480.00, 500.00], currentPrice: 440.00 },
    UNH: { supports: [415.00, 410.00, 405.00], resistances: [440.00, 460.00, 480.00], currentPrice: 420.00 },
    SNPS: { supports: [580.00, 560.00, 540.00], resistances: [620.00, 640.00, 660.00, 680.00], currentPrice: 600.00 },
    CCXI: { supports: [38.00, 36.00, 34.00], resistances: [42.00, 44.00, 46.00, 48.00], currentPrice: 40.00 },
    GW: { supports: [140.00, 135.00, 130.00], resistances: [155.00, 160.00, 165.00, 170.00], currentPrice: 148.00 }
};

let marketPrices = {};
let marketStocks = [];
let watchlist = [];

async function loadMarketPrices() {
    try {
        const res = await fetch('raw_market_today.json');
        if (res.ok) {
            const data = await res.json();
            if (data && data.sectors) {
                data.sectors.forEach(s => {
                    if (s.stocks) {
                        s.stocks.forEach(st => {
                            if (st.ticker && st.price) {
                                const p = parseFloat(st.price.replace(/[$,]/g, ''));
                                if (!isNaN(p)) {
                                    marketPrices[st.ticker] = p;
                                    marketStocks.push({ ticker: st.ticker, name: st.name, price: p });
                                }
                            }
                        });
                    }
                });
            }
        }
    } catch (e) {
        console.warn('Unable to load live prices:', e);
    }
}

function openSrCalc() {
    document.querySelectorAll('.category-item').forEach(item => item.classList.remove('active'));
    const navSr = document.getElementById('nav-sr-calc');
    if (navSr) navSr.classList.add('active');

    if (elements.catalogView) elements.catalogView.classList.remove('active');
    if (elements.readerView) elements.readerView.classList.remove('active');
    if (elements.portfolioView) elements.portfolioView.classList.remove('active');
    if (elements.srCalcView) elements.srCalcView.classList.add('active');

    setupSrListeners();
    handleTickerChange();
    renderSrCalc();
}

function closeSrCalc() {
    if (elements.srCalcView) elements.srCalcView.classList.remove('active');
    const navSr = document.getElementById('nav-sr-calc');
    if (navSr) navSr.classList.remove('active');
}

function setupSrListeners() {
    if (window.srListenersAttached) return;
    window.srListenersAttached = true;

    if (elements.srInvestment) elements.srInvestment.oninput = renderSrCalc;
    if (elements.srCurrentPrice) elements.srCurrentPrice.oninput = renderSrCalc;
    if (elements.srTickerSelect) elements.srTickerSelect.onchange = handleTickerChange;
    if (elements.srBtnSaveWatchlist) elements.srBtnSaveWatchlist.onclick = saveCurrentToWatchlist;
    if (elements.srBtnClearCustom) elements.srBtnClearCustom.onclick = clearCalculator;
    if (elements.srAddSupport) elements.srAddSupport.onclick = () => addManualLevelInput('support');
    if (elements.srAddResistance) elements.srAddResistance.onclick = () => addManualLevelInput('resistance');

    setupAutocomplete();
    renderWatchlist();
}

function setupAutocomplete() {
    const input = elements.srTickerSearch;
    const dropdown = elements.srSuggestionsDropdown;
    if (!input || !dropdown) return;

    input.oninput = () => {
        const query = input.value.trim().toLowerCase();
        if (!query) { dropdown.style.display = 'none'; return; }

        const matches = marketStocks.filter(s => s.ticker.toLowerCase().includes(query) || s.name.toLowerCase().includes(query)).slice(0, 8);
        if (matches.length === 0) {
            dropdown.innerHTML = `<div class="sr-suggestion-item">${translations[appState.lang].noStocksFound}</div>`;
        } else {
            dropdown.innerHTML = matches.map(s => `
                <div class="sr-suggestion-item" data-ticker="${s.ticker}" data-price="${s.price}">
                    <span class="sugg-ticker">${s.ticker}</span>
                    <span class="sugg-name">${s.name}</span>
                    <span class="sugg-price">$${s.price.toFixed(2)}</span>
                </div>
            `).join('');

            dropdown.querySelectorAll('.sr-suggestion-item').forEach(item => {
                item.onclick = () => {
                    const t = item.getAttribute('data-ticker');
                    const p = parseFloat(item.getAttribute('data-price'));
                    selectStockFromSearch(t, p);
                    dropdown.style.display = 'none';
                    input.value = '';
                };
            });
        }
        dropdown.style.display = 'block';
    };

    document.addEventListener('click', e => {
        if (e.target !== input && !dropdown.contains(e.target)) dropdown.style.display = 'none';
    });
}

function selectStockFromSearch(ticker, price) {
    if (elements.srTickerSelect) elements.srTickerSelect.value = 'custom';
    if (elements.srCustomName) elements.srCustomName.value = ticker;
    if (elements.srCurrentPrice) elements.srCurrentPrice.value = price;

    populateLevelInputs('support', [(price * 0.95), (price * 0.90), (price * 0.85)].map(v => parseFloat(v.toFixed(2))));
    populateLevelInputs('resistance', [(price * 1.05), (price * 1.10), (price * 1.15), (price * 1.20)].map(v => parseFloat(v.toFixed(2))));
    renderSrCalc();
}

function handleTickerChange() {
    if (!elements.srTickerSelect) return;
    const ticker = elements.srTickerSelect.value;
    const levels = defaultSrLevels[ticker] || defaultSrLevels.custom;

    if (elements.srCurrentPrice) elements.srCurrentPrice.value = levels.currentPrice;
    populateLevelInputs('support', levels.supports);
    populateLevelInputs('resistance', levels.resistances);
    renderSrCalc();
}

function populateLevelInputs(type, values) {
    const container = type === 'support' ? elements.supportInputsContainer : elements.resistanceInputsContainer;
    if (!container) return;

    container.innerHTML = '';
    values.forEach((val, idx) => {
        const div = document.createElement('div');
        div.className = 'sr-level-input-item';
        div.innerHTML = `
            <span>${type === 'support' ? 'S' + (idx + 1) : 'R' + (idx + 1)}</span>
            <input type="number" class="${type}-input" value="${val}" step="0.01">
            <button class="sr-delete-level-btn" onclick="this.parentElement.remove(); renderSrCalc();"><i class="fa-solid fa-trash-can"></i></button>
        `;
        div.querySelector('input').oninput = renderSrCalc;
        container.appendChild(div);
    });
}

function addManualLevelInput(type) {
    const container = type === 'support' ? elements.supportInputsContainer : elements.resistanceInputsContainer;
    if (!container) return;
    const inputs = container.querySelectorAll(`.${type}-input`);
    const nextIdx = inputs.length + 1;
    const lastVal = inputs.length > 0 ? parseFloat(inputs[inputs.length - 1].value) || 100 : 100;
    const val = type === 'support' ? (lastVal * 0.95).toFixed(2) : (lastVal * 1.05).toFixed(2);

    const div = document.createElement('div');
    div.className = 'sr-level-input-item';
    div.innerHTML = `
        <span>${type === 'support' ? 'S' + nextIdx : 'R' + nextIdx}</span>
        <input type="number" class="${type}-input" value="${val}" step="0.01">
        <button class="sr-delete-level-btn" onclick="this.parentElement.remove(); renderSrCalc();"><i class="fa-solid fa-trash-can"></i></button>
    `;
    div.querySelector('input').oninput = renderSrCalc;
    container.appendChild(div);
    renderSrCalc();
}

function renderSrCalc() {
    if (!elements.srOutputTable) return;
    const investment = parseFloat(elements.srInvestment.value) || 1000;
    const supports = [];
    const resistances = [];

    if (elements.supportInputsContainer) {
        elements.supportInputsContainer.querySelectorAll('.support-input').forEach((inp, i) => {
            const v = parseFloat(inp.value);
            if (!isNaN(v) && v > 0) supports.push({ name: `S${i + 1}`, price: v });
        });
    }

    if (elements.resistanceInputsContainer) {
        elements.resistanceInputsContainer.querySelectorAll('.resistance-input').forEach((inp, i) => {
            const v = parseFloat(inp.value);
            if (!isNaN(v) && v > 0) resistances.push({ name: `R${i + 1}`, price: v });
        });
    }

    let html = '<thead><tr><th>แนวรับ \\ แนวต้าน</th>';
    resistances.forEach(r => {
        html += `<th><div class="sr-r-header-col">${r.name}</div><div class="sr-r-price-val">$${r.price.toFixed(2)}</div></th>`;
    });
    html += '</tr></thead><tbody>';

    supports.forEach(s => {
        html += `<tr><td><div class="sr-s-header-row">${s.name}</div><div class="sr-s-price-val">$${s.price.toFixed(2)}</div></td>`;
        resistances.forEach(r => {
            const pct = ((r.price / s.price) - 1) * 100;
            const profit = investment * ((r.price / s.price) - 1);
            const isPos = profit >= 0;
            html += `
                <td class="${isPos ? 'sr-cell-positive' : 'sr-cell-negative'}">
                    <div class="sr-cell-profit">${isPos ? '+' : ''}$${profit.toFixed(2)}</div>
                    <div class="sr-cell-pct">(${isPos ? '+' : ''}${pct.toFixed(2)}%)</div>
                </td>
            `;
        });
        html += '</tr>';
    });
    html += '</tbody>';
    elements.srOutputTable.innerHTML = html;
}

function saveCurrentToWatchlist() {
    const name = elements.srCustomName ? elements.srCustomName.value.trim().toUpperCase() : 'CUSTOM';
    const price = parseFloat(elements.srCurrentPrice.value) || 0;
    watchlist.push({ ticker: name, price });
    renderWatchlist();
}

function renderWatchlist() {
    if (!elements.srWatchlistList) return;
    if (watchlist.length === 0) {
        elements.srWatchlistList.innerHTML = `<div class="sr-watchlist-empty">${translations[appState.lang].srWatchlistEmpty}</div>`;
        return;
    }
    elements.srWatchlistList.innerHTML = watchlist.map((item, i) => `
        <div class="sr-watchlist-item">
            <span class="sr-wl-ticker">${item.ticker}</span>
            <span class="sr-wl-price">$${item.price.toFixed(2)}</span>
            <button class="sr-wl-delete-btn" onclick="watchlist.splice(${i}, 1); renderWatchlist();"><i class="fa-solid fa-trash-can"></i></button>
        </div>
    `).join('');
}

function clearCalculator() {
    if (elements.supportInputsContainer) elements.supportInputsContainer.innerHTML = '';
    if (elements.resistanceInputsContainer) elements.resistanceInputsContainer.innerHTML = '';
    renderSrCalc();
}

// Visitor Counter Simulation
function initVisitorStats() {
    fetch('https://api.counterapi.dev/v1/sepkhawgontrade/visits/up')
        .then(r => r.json())
        .then(data => {
            if (data && typeof data.count === 'number') {
                appState.totalVisits = 128450 + data.count;
                updateStatsDOM();
            }
        }).catch(() => {
            appState.totalVisits = 128450 + Math.floor(Math.random() * 50);
            updateStatsDOM();
        });

    setInterval(() => {
        appState.activeOnline = Math.max(8, Math.min(28, appState.activeOnline + (Math.floor(Math.random() * 5) - 2)));
        updateStatsDOM();
    }, 5000);
}

function updateStatsDOM() {
    const v = appState.totalVisits.toLocaleString();
    document.querySelectorAll('.visit-count-val').forEach(el => el.textContent = v);
    document.querySelectorAll('.online-count-val').forEach(el => el.textContent = appState.activeOnline);
}

function updateUILanguage() {
    const t = translations[appState.lang];
    document.querySelectorAll('.sidebar-title').forEach(el => el.textContent = t.channelTitle);
    document.querySelectorAll('.sidebar-subtitle').forEach(el => el.textContent = t.channelSubtitle);

    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.placeholder = t.searchPlaceholder;

    const catTitle = document.getElementById('lbl-categories-title');
    if (catTitle) catTitle.textContent = t.categoriesTitle;

    const toolsTitle = document.getElementById('lbl-tools-title');
    if (toolsTitle) toolsTitle.textContent = t.toolsTitle;

    const navPort = document.getElementById('lbl-nav-portfolio');
    if (navPort) navPort.textContent = t.lblNavPortfolio;

    const navSr = document.getElementById('lbl-nav-sr-calc');
    if (navSr) navSr.textContent = t.lblNavSrCalc;

    const portTitle = document.getElementById('portfolio-title');
    if (portTitle) portTitle.textContent = t.portfolioTitle;

    const portSub = document.getElementById('portfolio-subtitle');
    if (portSub) portSub.textContent = t.portfolioSubtitle;

    const srTitle = document.getElementById('sr-calc-title');
    if (srTitle) srTitle.textContent = t.srCalcTitle;

    const srSub = document.getElementById('sr-calc-subtitle');
    if (srSub) srSub.textContent = t.srCalcSubtitle;

    renderCategoriesMenu();
    renderCatalog();
}

// Format Helper Functions
function fmt(num) {
    if (num === null || num === undefined || isNaN(num)) return '0.00';
    return Number(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtI(num) {
    if (num === null || num === undefined || isNaN(num)) return '0';
    return Number(num).toLocaleString('en-US');
}

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
