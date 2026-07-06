// State Management
let state = {
    notebooks: [],
    selectedIds: new Set(),
    searchQuery: '',
    isAuthenticated: false,
    isPollingStatus: false,
    pollInterval: null,
    
    // Workflow additions
    templates: [],
    activeTemplateId: '',
    activePromptType: 'search', // default prompt tab
    workflowPollingInterval: null,
    selectedWorkflowId: null,
    isReviewing: false,
    lastWorkflowsJson: '',
    lastLogsJson: '',
    countdownInterval: null,
    estRemainingSeconds: 0,
    currentProgress: -1,
    createNewTaskMode: false,
    
    // Whale Tracker additions
    whaleData: null,
    selectedWhaleIndex: 0
};

// DOM Elements
const statusCard = document.getElementById('status-card');
const trendsLastUpdated = document.getElementById('trends-last-updated');
const btnRefreshTrends = document.getElementById('btn-refresh-trends');
const btnRefreshTrendsEmpty = document.getElementById('btn-refresh-trends-empty');
const trendsLoadingOverlay = document.getElementById('trends-loading-overlay');
const trendsEmptyPlaceholder = document.getElementById('trends-empty-placeholder');
const trendsDashboardGrid = document.getElementById('trends-dashboard-grid');
const sectorsGridContainer = document.getElementById('sectors-grid-container');
const socialCardsContainer = document.getElementById('social-cards-container');

// Whale Tracker elements
const whalesLastUpdated = document.getElementById('whales-last-updated');
const btnRefreshWhales = document.getElementById('btn-refresh-whales');
const btnRefreshWhalesEmpty = document.getElementById('btn-refresh-whales-empty');
const whalesLoadingOverlay = document.getElementById('whales-loading-overlay');
const whalesEmptyPlaceholder = document.getElementById('whales-empty-placeholder');
const whalesDashboardGrid = document.getElementById('whales-dashboard-grid');
const subTabBtns = document.querySelectorAll('.sub-tab-btn');
const sectorSocialView = document.getElementById('sector-social-view');
const whaleTrackerView = document.getElementById('whale-tracker-view');

const btnWhaleShowOverview = document.getElementById('btn-whale-show-overview');
const btnWhaleShowIndividual = document.getElementById('btn-whale-show-individual');
const whaleSelectContainer = document.getElementById('whale-select-container');
const whaleDropdown = document.getElementById('whale-dropdown');

const whalesOverviewView = document.getElementById('whales-overview-view');
const whalesIndividualView = document.getElementById('whales-individual-view');

const whaleOverviewSentiment = document.getElementById('whale-overview-sentiment');
const whaleOverviewSectors = document.getElementById('whale-overview-sectors');
const whalesOverviewTimeline = document.getElementById('whales-overview-timeline');

const individualWhaleMeta = document.getElementById('individual-whale-meta');
const whaleLongTable = document.getElementById('whale-long-table');
const whaleOptionsTable = document.getElementById('whale-options-table');
const whaleShortsContainer = document.getElementById('whale-shorts-container');
const whaleTransactionsTimeline = document.getElementById('whale-transactions-timeline');
const statusDot = document.getElementById('status-dot');
const statusLabel = document.getElementById('status-label');
const btnLogin = document.getElementById('btn-login');

const searchInput = document.getElementById('search-input');
const clearSearch = document.getElementById('clear-search');

const btnSelectAll = document.getElementById('btn-select-all');
const btnDeleteSelected = document.getElementById('btn-delete-selected');
const selectedCountEl = document.getElementById('selected-count');
const btnDeleteAll = document.getElementById('btn-delete-all');

const loadingState = document.getElementById('loading-state');
const emptyState = document.getElementById('empty-state');
const emptyTitle = document.getElementById('empty-title');
const emptySubtitle = document.getElementById('empty-subtitle');
const notebooksGrid = document.getElementById('notebooks-grid');

// Modals
const confirmModal = document.getElementById('confirm-modal');
const modalDeleteCount = document.getElementById('modal-delete-count');
const confirmInput = document.getElementById('confirm-input');
const btnConfirmCancel = document.getElementById('btn-confirm-cancel');
const btnConfirmExecute = document.getElementById('btn-confirm-execute');

const progressModal = document.getElementById('progress-modal');
const progressPct = document.getElementById('progress-pct');
const currentDeletingTitle = document.getElementById('current-deleting-title');
const progressBarFill = document.getElementById('progress-bar-fill');
const progressFraction = document.getElementById('progress-fraction');

// Profile Switcher selectors
const profileSelect = document.getElementById('profile-select');
const btnAddProfile = document.getElementById('btn-add-profile');
const btnDeleteProfile = document.getElementById('btn-delete-profile');

const addProfileModal = document.getElementById('add-profile-modal');
const newProfileInput = document.getElementById('new-profile-input');
const btnProfileCancel = document.getElementById('btn-profile-cancel');
const btnProfileConfirm = document.getElementById('btn-profile-confirm');

// Tabs selectors
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

// Workflow Selectors
const workflowTemplateSelect = document.getElementById('workflow-template-select');
const workflowFileSelect = document.getElementById('workflow-file-select');
const workflowDateInput = document.getElementById('workflow-date-input');
const btnRunWorkflow = document.getElementById('btn-run-workflow');

// Template Manager Selectors
const btnAddTemplate = document.getElementById('btn-add-template');
const btnEditTemplate = document.getElementById('btn-edit-template');
const btnDeleteTemplate = document.getElementById('btn-delete-template');

const addTemplateModal = document.getElementById('add-template-modal');
const newTemplateInput = document.getElementById('new-template-input');
const btnTemplateCancel = document.getElementById('btn-template-cancel');
const btnTemplateConfirm = document.getElementById('btn-template-confirm');

const editTemplateModal = document.getElementById('edit-template-modal');
const editTemplateInput = document.getElementById('edit-template-input');
const btnEditTemplateCancel = document.getElementById('btn-edit-template-cancel');
const btnEditTemplateConfirm = document.getElementById('btn-edit-template-confirm');

// Prompt Editor Selectors
const promptTabBtns = document.querySelectorAll('.prompt-tab-btn');
const promptTextarea = document.getElementById('prompt-textarea');
const btnSavePrompts = document.getElementById('btn-save-prompts');

// Progress & Results selectors
const workflowProgressSection = document.getElementById('workflow-progress-section');
const workflowProgressFill = document.getElementById('workflow-progress-fill');
const workflowProgressText = document.getElementById('workflow-progress-text');
const workflowStepText = document.getElementById('workflow-step-text');
const workflowLogs = document.getElementById('workflow-logs');

const workflowResultSection = document.getElementById('workflow-result-section');
const workflowIdleSection = document.getElementById('workflow-idle-section');
const resAudioPath = document.getElementById('res-audio-path');
const resInfoPath = document.getElementById('res-info-path');
const resFbPost = document.getElementById('res-fb-post');
const btnCopyFbPost = document.getElementById('btn-copy-fb-post');

// Stock Price Verification Selectors
const priceCheckModal = document.getElementById('price-check-modal');
const priceCheckTableBody = document.getElementById('price-check-table-body');
const checkAllPrices = document.getElementById('check-all-prices');
const btnPriceCancel = document.getElementById('btn-price-cancel');
const btnPriceSkipUpdate = document.getElementById('btn-price-skip-update');
const btnPriceConfirm = document.getElementById('btn-price-confirm');

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    fetchProfiles();
    checkAuthStatus();
    checkWorkflowStatusOnLoad();
    
    // Set default local date to today (local timezone)
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    
    // Initialize Flatpickr calendar on the date input
    flatpickr("#workflow-date-input", {
        dateFormat: "Y-m-d",
        defaultDate: `${yyyy}-${mm}-${dd}`,
        theme: "dark",
        onChange: function(selectedDates, dateStr, instance) {
            workflowDateInput.dispatchEvent(new Event('change'));
        }
    });

    loadWorkflowData();
});

// Event Listeners Setup
function setupEventListeners() {
    // Profile Switcher Event Listeners
    profileSelect.addEventListener('change', handleProfileChange);
    
    btnAddProfile.addEventListener('click', () => {
        newProfileInput.value = '';
        btnProfileConfirm.disabled = true;
        addProfileModal.classList.add('show');
        newProfileInput.focus();
    });
    
    btnDeleteProfile.addEventListener('click', handleProfileDelete);
    
    btnProfileCancel.addEventListener('click', () => {
        addProfileModal.classList.remove('show');
    });
    
    newProfileInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        const isValid = /^[a-zA-Z0-9_-]{2,20}$/.test(val);
        btnProfileConfirm.disabled = !isValid;
    });
    
    btnProfileConfirm.addEventListener('click', handleProfileCreate);

    // Login Button
    btnLogin.addEventListener('click', handleLogin);

    // Search input
    searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value.trim().toLowerCase();
        clearSearch.style.display = state.searchQuery ? 'block' : 'none';
        renderNotebooks();
    });

    clearSearch.addEventListener('click', () => {
        searchInput.value = '';
        state.searchQuery = '';
        clearSearch.style.display = 'none';
        renderNotebooks();
    });

    // Select All Button
    btnSelectAll.addEventListener('click', handleSelectAllToggle);

    // Bulk Delete Selected
    btnDeleteSelected.addEventListener('click', () => {
        openConfirmModal(Array.from(state.selectedIds));
    });

    // Delete All in Account
    btnDeleteAll.addEventListener('click', () => {
        const allIds = state.notebooks.map(nb => nb.id);
        openConfirmModal(allIds);
    });

    // Modal Actions
    btnConfirmCancel.addEventListener('click', closeConfirmModal);
    
    confirmInput.addEventListener('input', (e) => {
        btnConfirmExecute.disabled = e.target.value !== 'DELETE';
    });

    btnConfirmExecute.addEventListener('click', handleConfirmExecute);

    // Tab switching event listener
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            // Switch tabs styling
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Switch panels visibility
            tabPanels.forEach(panel => {
                if (panel.id === targetTab) {
                    panel.classList.add('active');
                    panel.style.display = 'block';
                } else {
                    panel.classList.remove('active');
                    panel.style.display = 'none';
                }
            });
            
            // Load workflow data if switching to workflow tab
            if (targetTab === 'workflow-tab') {
                loadWorkflowData();
            } else if (targetTab === 'market-trends-tab') {
                loadMarketTrends();
            }
        });
    });

    const btnApproveWorkflow = document.getElementById('btn-approve-workflow');
    const btnCancelWorkflow = document.getElementById('btn-cancel-workflow');
    const btnCreateNewTask = document.getElementById('btn-create-new-task');

    btnApproveWorkflow.addEventListener('click', handleApproveWorkflow);
    btnCancelWorkflow.addEventListener('click', handleCancelWorkflow);
    if (btnCreateNewTask) {
        btnCreateNewTask.addEventListener('click', () => {
            state.createNewTaskMode = true;
            state.selectedWorkflowId = null;
            document.querySelectorAll('.task-item').forEach(el => el.classList.remove('active'));
            showActiveSection(workflowIdleSection);
            btnRunWorkflow.disabled = false;
        });
    }

    // Workflow Template select change
    workflowTemplateSelect.addEventListener('change', (e) => {
        handleTemplateChange(e.target.value);
    });

    // Prompt Editor tabs switching
    promptTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const promptType = btn.getAttribute('data-prompt-type');
            switchPromptTab(promptType);
        });
    });

    // Prompt textarea change - update state in memory immediately
    promptTextarea.addEventListener('input', (e) => {
        updatePromptState(e.target.value);
        updateCharCounter(e.target.value);
    });

    // Save prompts to database button
    btnSavePrompts.addEventListener('click', handleSavePrompts);

    // Start workflow button
    btnRunWorkflow.addEventListener('click', handleRunWorkflow);

    // Copy Facebook post content button
    btnCopyFbPost.addEventListener('click', handleCopyFbPost);

    // US Market Scan event listeners
    if (btnRefreshTrends) btnRefreshTrends.addEventListener('click', handleRefreshMarketTrends);
    if (btnRefreshTrendsEmpty) btnRefreshTrendsEmpty.addEventListener('click', handleRefreshMarketTrends);

    // Sub-tab switching logic inside Market Scan
    subTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetSub = btn.getAttribute('data-sub-tab');
            
            // Toggle active styling
            subTabBtns.forEach(b => {
                b.classList.remove('active');
                b.style.background = 'rgba(255, 255, 255, 0.05)';
                b.style.color = 'var(--text-secondary)';
                b.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            });
            btn.classList.add('active');
            btn.style.background = targetSub === 'sector-social-view' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)';
            btn.style.color = targetSub === 'sector-social-view' ? '#60a5fa' : '#34d399';
            btn.style.borderColor = targetSub === 'sector-social-view' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(16, 185, 129, 0.3)';
            
            // Toggle view visibility
            if (targetSub === 'sector-social-view') {
                sectorSocialView.style.display = 'block';
                whaleTrackerView.style.display = 'none';
                loadMarketTrends();
            } else {
                sectorSocialView.style.display = 'none';
                whaleTrackerView.style.display = 'block';
                loadWhalePortfolios();
            }
        });
    });

    // Whale view switches (Overview vs. Individual)
    if (btnWhaleShowOverview) {
        btnWhaleShowOverview.addEventListener('click', () => {
            btnWhaleShowOverview.classList.add('active');
            btnWhaleShowIndividual.classList.remove('active');
            whaleSelectContainer.style.display = 'none';
            whalesOverviewView.style.display = 'flex';
            whalesIndividualView.style.display = 'none';
        });
    }

    if (btnWhaleShowIndividual) {
        btnWhaleShowIndividual.addEventListener('click', () => {
            btnWhaleShowIndividual.classList.add('active');
            btnWhaleShowOverview.classList.remove('active');
            whaleSelectContainer.style.display = 'flex';
            whalesOverviewView.style.display = 'none';
            whalesIndividualView.style.display = 'grid';
            // Render selected whale
            triggerWhaleRender();
        });
    }

    if (whaleDropdown) {
        whaleDropdown.addEventListener('change', () => {
            triggerWhaleRender();
        });
    }

    // Whale refresh button listeners
    if (btnRefreshWhales) btnRefreshWhales.addEventListener('click', handleRefreshWhales);
    if (btnRefreshWhalesEmpty) btnRefreshWhalesEmpty.addEventListener('click', handleRefreshWhales);

    // Add/Delete Template event listeners
    btnAddTemplate.addEventListener('click', () => {
        newTemplateInput.value = '';
        btnTemplateConfirm.disabled = true;
        addTemplateModal.classList.add('show');
        newTemplateInput.focus();
    });

    btnTemplateCancel.addEventListener('click', () => {
        addTemplateModal.classList.remove('show');
    });

    newTemplateInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        btnTemplateConfirm.disabled = val.length < 2;
    });

    btnTemplateConfirm.addEventListener('click', handleTemplateCreate);

    // Edit Template event listeners
    btnEditTemplate.addEventListener('click', () => {
        const template = state.templates.find(t => t.id === state.activeTemplateId);
        if (!template) return;
        editTemplateInput.value = template.name;
        btnEditTemplateConfirm.disabled = false;
        editTemplateModal.classList.add('show');
        editTemplateInput.focus();
        editTemplateInput.select();
    });

    btnEditTemplateCancel.addEventListener('click', () => {
        editTemplateModal.classList.remove('show');
    });

    editTemplateInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        btnEditTemplateConfirm.disabled = val.length < 2;
    });

    btnEditTemplateConfirm.addEventListener('click', handleTemplateEditSave);

    btnDeleteTemplate.addEventListener('click', handleTemplateDelete);

    // Workflow Date change - refresh files select dropdown
    workflowDateInput.addEventListener('change', () => {
        loadWorkflowData();
    });

    const checkboxShowAllFiles = document.getElementById('workflow-show-all-files');
    if (checkboxShowAllFiles) {
        checkboxShowAllFiles.addEventListener('change', () => {
            loadWorkflowData();
        });
    }

    // Price check modal listeners
    btnPriceCancel.addEventListener('click', () => {
        priceCheckModal.classList.remove('show');
        btnRunWorkflow.disabled = false;
        workflowIdleSection.style.display = 'flex';
        workflowProgressSection.style.display = 'none';
    });

    btnPriceSkipUpdate.addEventListener('click', () => {
        priceCheckModal.classList.remove('show');
        executeWorkflowRunDirectly();
    });

    btnPriceConfirm.addEventListener('click', async () => {
        const checkboxes = document.querySelectorAll('.price-update-checkbox');
        const updatesToApply = [];
        
        checkboxes.forEach(chk => {
            if (chk.checked && !chk.disabled) {
                const index = parseInt(chk.dataset.index);
                const tickerData = scannedTickers[index];
                updatesToApply.push({
                    lineIndex: tickerData.lineIndex,
                    ticker: tickerData.ticker,
                    oldPrice: tickerData.filePrice,
                    newPrice: tickerData.currentPrice
                });
            }
        });
        
        priceCheckModal.classList.remove('show');
        
        if (updatesToApply.length > 0) {
            workflowLogs.innerHTML = '<div class="log-line">กำลังอัปเดตราคาในไฟล์บทวิเคราะห์ `.md` เป็นราคาตลาดปัจจุบัน...</div>';
            try {
                const selectedFile = workflowFileSelect.value;
                const updateRes = await fetch('/api/workflow/update-prices', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        file: selectedFile,
                        updates: updatesToApply
                    })
                });
                const updateData = await updateRes.json();
                if (updateData.success) {
                    workflowLogs.innerHTML += '<div class="log-line" style="color: #10B981;">อัปเดตราคาในไฟล์สำเร็จ! เริ่มกระบวนการส่งต่อข้อมูล...</div>';
                } else {
                    workflowLogs.innerHTML += '<div class="log-line" style="color: #EF4444;">อัปเดตราคาบางส่วนไม่สำเร็จ: ' + updateData.error + ' (จะรันกระบวนการต่อโดยไม่เปลี่ยนไฟล์)</div>';
                }
            } catch (err) {
                console.error('Failed to update prices:', err);
                workflowLogs.innerHTML += '<div class="log-line" style="color: #EF4444;">เกิดข้อผิดพลาดในการแก้ไฟล์ (จะรันกระบวนการต่อโดยไม่เปลี่ยนไฟล์)</div>';
            }
        }
        
        executeWorkflowRunDirectly();
    });

    checkAllPrices.addEventListener('change', (e) => {
        const checkboxes = document.querySelectorAll('.price-update-checkbox');
        checkboxes.forEach(chk => {
            if (!chk.disabled) {
                chk.checked = e.target.checked;
            }
        });
    });
}

// Check if user is authenticated with Google NotebookLM
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/status');
        const data = await response.json();
        state.isAuthenticated = data.authenticated;

        if (state.isAuthenticated) {
            // Logged in
            statusDot.className = 'pulse-dot active';
            statusLabel.textContent = 'เชื่อมต่อ Google Account แล้ว';
            btnLogin.style.display = 'none';
            statusCard.style.borderColor = 'rgba(16, 185, 129, 0.3)';
            
            // Stop polling if we were polling
            if (state.isPollingStatus) {
                stopStatusPolling();
            }

            // Fetch list
            fetchNotebooks();
        } else {
            // Disconnected
            statusDot.className = 'pulse-dot inactive';
            statusLabel.textContent = 'ยังไม่ได้เชื่อมต่อบัญชี Google';
            btnLogin.style.display = 'inline-flex';
            statusCard.style.borderColor = 'rgba(239, 68, 68, 0.3)';
            
            showEmptyState('กรุณาล็อกอินก่อนใช้งาน', 'คลิกปุ่มล็อกอินเพื่อเข้าใช้บัญชี Google ของคุณบนหน้าต่างเบราว์เซอร์');
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
        statusLabel.textContent = 'การเชื่อมต่อขัดข้อง';
    }
}

// Trigger browser login flow
async function handleLogin() {
    try {
        statusLabel.textContent = 'กำลังเปิดหน้าต่างล็อกอิน...';
        const response = await fetch('/api/login', { method: 'POST' });
        const data = await response.json();
        
        if (data.success) {
            statusLabel.textContent = 'กรุณาล็อกอินให้เสร็จบนเบราว์เซอร์ที่เปิดขึ้นมา...';
            // Start polling for status changes to detect successful login
            startStatusPolling();
        }
    } catch (error) {
        console.error('Error launching login flow:', error);
        alert('ไม่สามารถเปิดหน้าต่างเข้าสู่ระบบได้');
    }
}

function startStatusPolling() {
    if (state.isPollingStatus) return;
    state.isPollingStatus = true;
    
    state.pollInterval = setInterval(() => {
        checkAuthStatus();
    }, 3000);
}

function stopStatusPolling() {
    state.isPollingStatus = false;
    if (state.pollInterval) {
        clearInterval(state.pollInterval);
        state.pollInterval = null;
    }
}

// Fetch all Notebooks
async function fetchNotebooks() {
    showLoading(true);
    try {
        const response = await fetch('/api/notebooks');
        const data = await response.json();
        
        if (data.success) {
            state.notebooks = data.notebooks;
            state.selectedIds.clear();
            renderNotebooks();
        } else {
            showEmptyState('เกิดข้อผิดพลาดในการดึงข้อมูล', data.error || 'กรุณาลองใหม่อีกครั้ง');
        }
    } catch (error) {
        console.error('Error fetching notebooks:', error);
        showEmptyState('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้', 'กรุณาตรวจสอบการรัน Backend server.js ใน Terminal');
    } finally {
        showLoading(false);
    }
}

// Render Notebook cards
function renderNotebooks() {
    notebooksGrid.innerHTML = '';
    
    // Filter
    const filtered = state.notebooks.filter(nb => {
        return nb.title.toLowerCase().includes(state.searchQuery);
    });

    if (filtered.length === 0) {
        notebooksGrid.style.display = 'none';
        showEmptyState('ไม่พบรายการ', state.searchQuery ? `ไม่พบ Notebook ที่มีคำค้นหา "${state.searchQuery}"` : 'บัญชีของคุณไม่มี Notebook เลย');
        updateActionButtons();
        return;
    }

    emptyState.style.display = 'none';
    notebooksGrid.style.display = 'grid';

    filtered.forEach(nb => {
        const card = document.createElement('div');
        const isSelected = state.selectedIds.has(nb.id);
        
        card.className = `notebook-card ${isSelected ? 'selected' : ''}`;
        card.setAttribute('data-id', nb.id);
        
        // Format date string
        const dateStr = nb.created_at ? new Date(nb.created_at).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }) : 'ไม่ระบุวันที่';

        card.innerHTML = `
            <div class="card-top">
                <label class="card-checkbox" onclick="event.stopPropagation();">
                    <input type="checkbox" ${isSelected ? 'checked' : ''} onchange="toggleSelectCard('${nb.id}')">
                    <span class="checkbox-visual"></span>
                </label>
                <button class="btn-card-delete" title="ลบ Notebook นี้ทันที" onclick="event.stopPropagation(); triggerSingleDelete('${nb.id}', '${escapeHtml(nb.title)}')">
                    <i class="fa-regular fa-trash-can"></i>
                </button>
            </div>
            <h3 class="card-title">${escapeHtml(nb.title)}</h3>
            <div class="card-bottom">
                <span class="card-sources">
                    <i class="fa-regular fa-file-lines"></i>
                    ${nb.sources_count} แหล่งข้อมูล
                </span>
                <span class="card-date">${dateStr}</span>
            </div>
        `;

        // Card click toggles selection
        card.addEventListener('click', () => {
            toggleSelectCard(nb.id);
        });

        notebooksGrid.appendChild(card);
    });

    updateActionButtons();
}

// Toggle individual notebook selection
function toggleSelectCard(id) {
    if (state.selectedIds.has(id)) {
        state.selectedIds.delete(id);
    } else {
        state.selectedIds.add(id);
    }
    
    // Rerender specific card style directly to be super fast
    const cardEl = document.querySelector(`.notebook-card[data-id="${id}"]`);
    if (cardEl) {
        const checkbox = cardEl.querySelector('.card-checkbox input');
        if (state.selectedIds.has(id)) {
            cardEl.classList.add('selected');
            if (checkbox) checkbox.checked = true;
        } else {
            cardEl.classList.remove('selected');
            if (checkbox) checkbox.checked = false;
        }
    }
    
    updateActionButtons();
}

// Select All / Deselect All
function handleSelectAllToggle() {
    const visibleCards = document.querySelectorAll('.notebook-card');
    const allVisibleIds = Array.from(visibleCards).map(card => card.getAttribute('data-id'));
    
    // Check if all visible are already selected
    const allSelected = allVisibleIds.every(id => state.selectedIds.has(id));
    
    if (allSelected) {
        // Deselect all visible
        allVisibleIds.forEach(id => state.selectedIds.delete(id));
    } else {
        // Select all visible
        allVisibleIds.forEach(id => state.selectedIds.add(id));
    }
    
    renderNotebooks();
}

// Update Action Buttons States
function updateActionButtons() {
    const selectedCount = state.selectedIds.size;
    selectedCountEl.textContent = selectedCount;
    btnDeleteSelected.disabled = selectedCount === 0;
    
    // Enable/disable Select All button styling
    if (state.notebooks.length > 0 && selectedCount === state.notebooks.length) {
        btnSelectAll.innerHTML = `<i class="fa-solid fa-square-minus"></i> ยกเลิกเลือกทั้งหมด`;
    } else {
        btnSelectAll.innerHTML = `<i class="fa-regular fa-square-check"></i> เลือกทั้งหมด`;
    }

    btnDeleteAll.disabled = state.notebooks.length === 0;
}

// Show/Hide UI States
function showLoading(isLoading) {
    loadingState.style.display = isLoading ? 'flex' : 'none';
    if (isLoading) {
        emptyState.style.display = 'none';
        notebooksGrid.style.display = 'none';
    }
}

function showEmptyState(title, subtitle) {
    emptyState.style.display = 'flex';
    emptyTitle.textContent = title;
    emptySubtitle.textContent = subtitle;
    notebooksGrid.style.display = 'none';
    loadingState.style.display = 'none';
}

// Confirmation Modal Logics
let pendingDeleteIds = [];

function openConfirmModal(ids) {
    pendingDeleteIds = ids;
    modalDeleteCount.textContent = ids.length;
    confirmInput.value = '';
    btnConfirmExecute.disabled = true;
    confirmModal.classList.add('show');
    confirmInput.focus();
}

function closeConfirmModal() {
    confirmModal.classList.remove('show');
    pendingDeleteIds = [];
}

function triggerSingleDelete(id, title) {
    openConfirmModal([id]);
}

// Execute deletion loop
async function handleConfirmExecute() {
    const idsToDelete = [...pendingDeleteIds];
    closeConfirmModal();
    
    if (idsToDelete.length === 0) return;
    
    openProgressModal(idsToDelete.length);
    
    let completedCount = 0;
    
    for (let i = 0; i < idsToDelete.length; i++) {
        const id = idsToDelete[i];
        const nb = state.notebooks.find(n => n.id === id) || { title: id };
        
        updateProgress(i, idsToDelete.length, nb.title);
        
        try {
            // Delete one by one for real-time frontend feedback
            const response = await fetch('/api/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: [id] })
            });
            const data = await response.json();
            
            if (data.success && data.deleted > 0) {
                completedCount++;
            }
        } catch (error) {
            console.error(`Error deleting notebook ${id}:`, error);
        }
    }
    
    updateProgress(idsToDelete.length, idsToDelete.length, 'เสร็จสมบูรณ์!');
    
    // Small timeout to let user see 100% before reloading
    setTimeout(() => {
        closeProgressModal();
        fetchNotebooks(); // Reload list
    }, 1500);
}

// Progress Modal Logics
function openProgressModal(total) {
    progressPct.textContent = '0%';
    currentDeletingTitle.textContent = 'กำลังเตรียมระบบ...';
    progressBarFill.style.width = '0%';
    progressFraction.textContent = `0 / ${total} รายการเสร็จสิ้น`;
    progressModal.classList.add('show');
}

function updateProgress(current, total, currentTitle) {
    const percentage = Math.round((current / total) * 100);
    progressPct.textContent = `${percentage}%`;
    currentDeletingTitle.textContent = current === total ? currentTitle : `กำลังลบ: ${currentTitle}`;
    progressBarFill.style.width = `${percentage}%`;
    progressFraction.textContent = `${current} / ${total} รายการเสร็จสิ้น`;
}

function closeProgressModal() {
    progressModal.classList.remove('show');
}

// Helper Utilities
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Format and render QC Content Report
function formatQcReport(qcReport) {
    if (!qcReport) return '';
    
    let html = `<div style="font-weight: 600; color: #818cf8; margin-bottom: 12px; font-size: 13.5px; border-left: 3px solid #6366f1; padding-left: 8px;">`;
    html += escapeHtml(qcReport.overall_summary);
    html += `</div>`;
    
    if (qcReport.audit_log && qcReport.audit_log.length > 0) {
        html += `<div style="display: grid; grid-template-columns: 1fr; gap: 8px; margin-top: 10px;">`;
        qcReport.audit_log.forEach(check => {
            let icon = '';
            let badgeStyle = '';
            let statusText = '';
            
            if (check.status === 'verified_ok') {
                icon = '<i class="fa-solid fa-circle-check" style="color: #10b981;"></i>';
                badgeStyle = 'background: rgba(16, 185, 129, 0.1); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.2);';
                statusText = 'ถูกต้อง';
            } else if (check.status === 'corrected') {
                icon = '<i class="fa-solid fa-circle-exclamation" style="color: #f59e0b;"></i>';
                badgeStyle = 'background: rgba(245, 158, 11, 0.1); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.2);';
                statusText = 'แก้ไขแล้ว';
            } else if (check.status === 'info_added') {
                icon = '<i class="fa-solid fa-circle-info" style="color: #3b82f6;"></i>';
                badgeStyle = 'background: rgba(59, 130, 246, 0.1); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.2);';
                statusText = 'เพิ่มข้อมูล';
            } else {
                icon = '<i class="fa-solid fa-question-circle" style="color: #9ca3af;"></i>';
                badgeStyle = 'background: rgba(156, 163, 175, 0.1); color: #d1d5db; border: 1px solid rgba(156, 163, 175, 0.2);';
                statusText = check.status;
            }
            
            html += `
            <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 6px; padding: 10px 12px; display: flex; align-items: start; gap: 10px;">
                <div style="font-size: 16px; margin-top: 2px; display: flex; align-items: center; justify-content: center;">${icon}</div>
                <div style="flex: 1;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; gap: 8px;">
                        <span style="font-weight: 600; color: var(--text-primary); font-size: 13px;">${escapeHtml(check.item)}</span>
                        <span style="font-size: 11px; padding: 2px 6px; border-radius: 4px; font-weight: 500; ${badgeStyle}">${statusText}</span>
                    </div>
                    <div style="color: var(--text-secondary); font-size: 12px; line-height: 1.5;">${escapeHtml(check.details)}</div>
                </div>
            </div>`;
        });
        html += `</div>`;
    }
    
    return html;
}

// Fetch all profiles from backend
async function fetchProfiles() {
    try {
        const response = await fetch('/api/profiles');
        const data = await response.json();
        if (data.success) {
            profileSelect.innerHTML = '';
            data.profiles.forEach(prof => {
                const opt = document.createElement('option');
                opt.value = prof.name;
                opt.textContent = prof.account ? `${prof.name} (${prof.account})` : prof.name;
                if (prof.active) {
                    opt.selected = true;
                    // Disable delete button for default profile
                    btnDeleteProfile.disabled = prof.name === 'default';
                }
                profileSelect.appendChild(opt);
            });
        }
    } catch (error) {
        console.error('Error fetching profiles:', error);
    }
}

// Handle profile change dropdown selection
async function handleProfileChange() {
    const selected = profileSelect.value;
    try {
        showLoading(true);
        const response = await fetch('/api/profiles/switch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: selected })
        });
        const data = await response.json();
        if (data.success) {
            await fetchProfiles();
            await checkAuthStatus();
        }
    } catch (error) {
        console.error('Error switching profile:', error);
        alert('สลับบัญชีไม่สำเร็จ');
    }
}

// Handle profile creation and login
async function handleProfileCreate() {
    const name = newProfileInput.value.trim();
    if (!name) return;
    
    addProfileModal.classList.remove('show');
    showLoading(true);
    
    try {
        const response = await fetch('/api/profiles/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });
        const data = await response.json();
        if (data.success) {
            await fetchProfiles();
            await checkAuthStatus();
            startStatusPolling();
        } else {
            alert('สร้างบัญชีไม่สำเร็จ: ' + data.error);
        }
    } catch (error) {
        console.error('Error creating profile:', error);
        alert('สร้างบัญชีไม่สำเร็จ');
    }
}

// Handle profile deletion
async function handleProfileDelete() {
    const active = profileSelect.value;
    if (active === 'default') {
        alert('ไม่สามารถลบบัญชี default ได้');
        return;
    }
    
    const confirmDelete = confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบบัญชี "${active}" และข้อมูลเซสชันทั้งหมดแบบถาวร?`);
    if (!confirmDelete) return;
    
    try {
        showLoading(true);
        const response = await fetch('/api/profiles/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: active })
        });
        const data = await response.json();
        if (data.success) {
            // Switch back to default profile
            await fetch('/api/profiles/switch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'default' })
            });
            await fetchProfiles();
            await checkAuthStatus();
        } else {
            alert('ลบบัญชีไม่สำเร็จ: ' + data.error);
        }
    } catch (error) {
        console.error('Error deleting profile:', error);
        alert('ลบบัญชีไม่สำเร็จ');
    }
}

// ==========================================
// Workflow Section Logics
// ==========================================

// Initialize/Load Workflow Tab data
async function loadWorkflowData() {
    try {
        // Fetch workspace MD files list
        const showAll = document.getElementById('workflow-show-all-files')?.checked || false;
        const queryDate = showAll ? '' : (workflowDateInput.value || '');
        const filesResponse = await fetch('/api/workspace-files?date=' + queryDate);
        const filesData = await filesResponse.json();
        
        if (filesData.success) {
            workflowFileSelect.innerHTML = '';
            
            // Prepend "-- ไม่ใช้ไฟล์ (ดึงข้อมูลผ่านระบบค้นหาข่าว) --" option
            const defaultOpt = document.createElement('option');
            defaultOpt.value = '';
            defaultOpt.textContent = '-- ไม่ใช้ไฟล์ (ดึงข้อมูลผ่านระบบค้นหาข่าว) --';
            workflowFileSelect.appendChild(defaultOpt);
            
            // Set the date input value to the suggested date if it is different (only if not showing all and queryDate was not empty)
            if (!showAll && queryDate && filesData.suggestedDate && workflowDateInput.value !== filesData.suggestedDate) {
                const fp = document.getElementById('workflow-date-input')._flatpickr;
                if (fp) {
                    fp.setDate(filesData.suggestedDate, false);
                } else {
                    workflowDateInput.value = filesData.suggestedDate;
                }
            }
            
            filesData.files.forEach(f => {
                const opt = document.createElement('option');
                opt.value = f.filename;
                opt.textContent = `${f.filename} (${f.actualFileDateStr})`;
                workflowFileSelect.appendChild(opt);
            });
            btnRunWorkflow.disabled = false; // Always enabled because web search is always a fallback option!
        }

        // Fetch prompt templates
        const templatesResponse = await fetch('/api/templates');
        const templatesData = await templatesResponse.json();
        
        if (templatesData.success) {
            state.templates = templatesData.templates;
            
            // Populate template select dropdown
            workflowTemplateSelect.innerHTML = '';
            state.templates.forEach(t => {
                const opt = document.createElement('option');
                opt.value = t.id;
                opt.textContent = t.name;
                workflowTemplateSelect.appendChild(opt);
            });
            btnDeleteTemplate.disabled = state.templates.length <= 1;

            // Set default active template if not set
            if (!state.activeTemplateId && state.templates.length > 0) {
                state.activeTemplateId = state.templates[0].id;
            }
            
            workflowTemplateSelect.value = state.activeTemplateId;
            
            // Auto select matching file type if files are loaded
            autoSelectFileForShow();
            
            // Load prompts for current active template
            loadPromptsForActiveTemplate();
        }
    } catch (error) {
        console.error('Error loading workflow data:', error);
    }
}

// Auto-select files matching the show pattern
function autoSelectFileForShow() {
    const templateId = workflowTemplateSelect.value;
    const options = Array.from(workflowFileSelect.options);
    if (options.length === 0 || options[0].value === '') return;

    let pattern = '';
    if (templateId === 'daily') {
        pattern = 'market_summary_';
    } else if (templateId === 'weekly') {
        pattern = 'global_market_recap_';
    } else if (templateId === 'whale') {
        pattern = 'whale_flow_analysis_';
    }

    const matchedOption = options.find(opt => opt.value.toLowerCase().startsWith(pattern));
    if (matchedOption) {
        workflowFileSelect.value = matchedOption.value;
    }
}

// Switch template dropdown selection
function handleTemplateChange(templateId) {
    state.activeTemplateId = templateId;
    autoSelectFileForShow();
    loadPromptsForActiveTemplate();
}

// Load prompts into the editor fields based on state.activeTemplateId
function loadPromptsForActiveTemplate() {
    const template = state.templates.find(t => t.id === state.activeTemplateId);
    if (!template) return;
    
    // Set textarea content for the active prompt tab type
    let promptKey = getPromptKey(state.activePromptType);
    promptTextarea.value = template[promptKey] || '';
    updateCharCounter(promptTextarea.value);
}

// Map frontend data-prompt-type attributes to templates.json fields
function getPromptKey(type) {
    switch (type) {
        case 'search': return 'searchPrompt';
        case 'audio': return 'audioPrompt';
        case 'report': return 'reportPrompt';
        case 'info': return 'infoPrompt';
        default: return 'searchPrompt';
    }
}

// Switch prompt tab buttons inside the prompt editor
function switchPromptTab(promptType) {
    // Save current textarea value to state before switching
    updatePromptState(promptTextarea.value);

    state.activePromptType = promptType;
    
    // Update active tab class styling
    promptTabBtns.forEach(btn => {
        if (btn.getAttribute('data-prompt-type') === promptType) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Load new prompt type content
    loadPromptsForActiveTemplate();
}

// Update the current prompt type text in state
function updatePromptState(text) {
    const template = state.templates.find(t => t.id === state.activeTemplateId);
    if (template) {
        const promptKey = getPromptKey(state.activePromptType);
        template[promptKey] = text;
    }
}

// Update the character counter element based on text length and active prompt type
function updateCharCounter(text) {
    const charCounter = document.getElementById('char-counter');
    if (!charCounter) return;
    const len = text.length;
    charCounter.style.color = 'var(--text-secondary)';
    charCounter.innerHTML = `${len.toLocaleString()} ตัวอักษร`;
}

// Save prompt templates to server
async function handleSavePrompts() {
    // Make sure current textarea text is saved to state first
    updatePromptState(promptTextarea.value);
    
    btnSavePrompts.disabled = true;
    const originalText = btnSavePrompts.innerHTML;
    btnSavePrompts.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> กำลังบันทึก...';
    
    try {
        const response = await fetch('/api/templates/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ templates: state.templates })
        });
        const data = await response.json();
        
        if (data.success) {
            alert('บันทึก Prompt เรียบร้อยแล้ว!');
        } else {
            alert('บันทึก Prompt ไม่สำเร็จ: ' + data.error);
        }
    } catch (error) {
        console.error('Error saving prompts:', error);
        alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
        btnSavePrompts.disabled = false;
        btnSavePrompts.innerHTML = originalText;
    }
}

// Copy Facebook Post content to clipboard
function handleCopyFbPost() {
    resFbPost.select();
    resFbPost.setSelectionRange(0, 99999); // For mobile devices
    
    try {
        navigator.clipboard.writeText(resFbPost.value);
        const originalText = btnCopyFbPost.innerHTML;
        btnCopyFbPost.innerHTML = '<i class="fa-solid fa-circle-check"></i> คัดลอกสำเร็จแล้ว!';
        btnCopyFbPost.classList.add('btn-success');
        
        setTimeout(() => {
            btnCopyFbPost.innerHTML = originalText;
            btnCopyFbPost.classList.remove('btn-success');
        }, 2000);
    } catch (err) {
        console.error('Failed to copy text:', err);
        alert('คัดลอกไม่สำเร็จ กรุณากดเลือกครอบแล้วคลิกขวาคัดลอกด้วยตนเอง');
    }
}

// Run Video Production Workflow Pipeline (Pre-check prices first)
async function handleRunWorkflow() {
    // Save current editor changes in prompt state
    updatePromptState(promptTextarea.value);
    
    const templateId = workflowTemplateSelect.value;
    const selectedFile = workflowFileSelect.value;
    const dateStr = workflowDateInput.value;
    
    if (!dateStr) {
        alert('กรุณาเลือกวันที่ก่อนจัดส่งข้อมูลเข้าระบบ');
        return;
    }

    const template = state.templates.find(t => t.id === templateId);
    if (!template) {
        alert('ไม่สามารถวิเคราะห์แทมเพลตที่เลือกได้');
        return;
    }

    // Validation: if no file is selected, searchPrompt MUST be provided
    if (!selectedFile) {
        const searchPromptText = (template.searchPrompt || '').trim();
        if (!searchPromptText) {
            alert('เนื่องจากคุณไม่ได้เลือกไฟล์บทวิเคราะห์ กรุณาระบุคำสั่งในแท็บ "ค้นหาข่าว" ก่อนเริ่มรันกระบวนการ');
            return;
        }
    }

    btnRunWorkflow.disabled = true;
    workflowIdleSection.style.display = 'none';
    workflowResultSection.style.display = 'none';
    workflowProgressSection.style.display = 'block';
    
    // Clear logs
    workflowLogs.innerHTML = '<div class="log-line">กำลังวิเคราะห์ข้อมูลราคาหุ้นในไฟล์บทวิเคราะห์...</div>';
    
    // If a file is selected, perform the stock price check first!
    if (selectedFile) {
        try {
            const checkRes = await fetch('/api/workflow/check-prices?file=' + encodeURIComponent(selectedFile));
            const checkData = await checkRes.json();
            
            if (checkData.success && checkData.tickers && checkData.tickers.length > 0) {
                // Save results in memory
                scannedTickers = checkData.tickers;
                
                // Show modal to compare prices
                populatePriceCheckTable(scannedTickers);
                priceCheckModal.classList.add('show');
                return; // Wait for modal action to continue!
            }
        } catch (err) {
            console.error('Error doing pre-run price check:', err);
            // In case of error, just proceed directly so we don't block the user
        }
    }
    
    // If no tickers found or check failed, proceed directly
    executeWorkflowRunDirectly();
}

// Actual workflow post command
async function executeWorkflowRunDirectly() {
    const templateId = workflowTemplateSelect.value;
    const selectedFile = workflowFileSelect.value;
    const dateStr = workflowDateInput.value;
    const genFacebook = document.getElementById('workflow-gen-fb-checkbox').checked;
    const resumeWorkflow = document.getElementById('workflow-resume-checkbox').checked;
    const pauseForReview = document.getElementById('workflow-pause-checkbox').checked;
    const template = state.templates.find(t => t.id === templateId);

    btnRunWorkflow.disabled = true;
    workflowIdleSection.style.display = 'none';
    workflowResultSection.style.display = 'none';
    workflowProgressSection.style.display = 'block';
    
    workflowLogs.innerHTML += '<div class="log-line">กำลังส่งคำร้องเริ่มการรันระบบอัตโนมัติ...</div>';
    
    try {
        const response = await fetch('/api/workflow/run', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                templateId: templateId,
                selectedFile: selectedFile,
                dateStr: dateStr,
                searchPrompt: template.searchPrompt || '',
                audioPrompt: template.audioPrompt || '',
                reportPrompt: template.reportPrompt || '',
                infoPrompt: template.infoPrompt || '',
                genFacebook: genFacebook,
                resumeWorkflow: resumeWorkflow,
                pauseForReview: pauseForReview
            })
        });
        const data = await response.json();
        
        if (data.success) {
            state.selectedWorkflowId = data.workflowId;
            state.createNewTaskMode = false;
            btnRunWorkflow.disabled = false; // Re-enable so they can run another task in parallel!
            startWorkflowPolling();
        } else {
            alert('เริ่มกระบวนการล้มเหลว: ' + data.error);
            btnRunWorkflow.disabled = false;
            workflowIdleSection.style.display = 'flex';
            workflowProgressSection.style.display = 'none';
        }
    } catch (error) {
        console.error('Error starting workflow:', error);
        alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
        btnRunWorkflow.disabled = false;
        workflowIdleSection.style.display = 'flex';
        workflowProgressSection.style.display = 'none';
    }
}

// Update Time Remaining display on UI
function updateTimeRemainingUI() {
    const timeRemainingEl = document.getElementById('workflow-time-remaining');
    if (!timeRemainingEl) return;
    
    if (state.selectedWorkflowId && state.estRemainingSeconds > 0) {
        const mins = Math.floor(state.estRemainingSeconds / 60);
        const secs = state.estRemainingSeconds % 60;
        
        let timeStr = '';
        if (mins > 0) {
            timeStr = `${mins} นาที ${secs} วินาที`;
        } else {
            timeStr = `${secs} วินาที`;
        }
        
        timeRemainingEl.innerHTML = `<i class="fa-regular fa-clock"></i> เหลืออีกประมาณ: ${timeStr}`;
    } else {
        timeRemainingEl.innerHTML = `<i class="fa-regular fa-clock"></i> ประเมินเวลา: -`;
    }
}

// Start polling for workflow status updates
function startWorkflowPolling() {
    stopWorkflowPolling();
    // Immediate poll
    pollWorkflowStatus();
    // Poll status every 2 seconds
    state.workflowPollingInterval = setInterval(pollWorkflowStatus, 2000);
    
    // Countdown timer interval (ticks every 1 second)
    if (!state.countdownInterval) {
        state.countdownInterval = setInterval(() => {
            if (state.selectedWorkflowId && state.estRemainingSeconds > 0) {
                const wSection = document.getElementById('workflow-progress-section');
                if (wSection && wSection.style.display === 'block') {
                    state.estRemainingSeconds--;
                    
                    // Enforce minimum limit based on progress to avoid hitting 0 too early
                    let minLimit = 5;
                    if (state.currentProgress >= 90) minLimit = 2;
                    if (state.estRemainingSeconds < minLimit) {
                        state.estRemainingSeconds = minLimit;
                    }
                    
                    updateTimeRemainingUI();
                }
            }
        }, 1000);
    }
}

// Stop polling for workflow status updates
function stopWorkflowPolling() {
    if (state.workflowPollingInterval) {
        clearInterval(state.workflowPollingInterval);
        state.workflowPollingInterval = null;
    }
    if (state.countdownInterval) {
        clearInterval(state.countdownInterval);
        state.countdownInterval = null;
    }
}

// Show/hide main layout panels only when state changes (prevents flickering)
function showActiveSection(sectionToShow) {
    const sections = [
        { el: document.getElementById('workflow-review-section'), display: 'block' },
        { el: document.getElementById('workflow-progress-section'), display: 'block' },
        { el: document.getElementById('workflow-result-section'), display: 'block' },
        { el: document.getElementById('workflow-idle-section'), display: 'flex' }
    ];
    
    sections.forEach(s => {
        if (s.el) {
            const targetDisplay = s.el === sectionToShow ? s.display : 'none';
            if (s.el.style.display !== targetDisplay) {
                s.el.style.display = targetDisplay;
            }
        }
    });
}

// Poll workflow status from Express server
async function pollWorkflowStatus() {
    try {
        // 1. Fetch overall status (which returns activeWorkflows array)
        const response = await fetch('/api/workflow/status' + (state.selectedWorkflowId ? `?workflowId=${state.selectedWorkflowId}` : ''));
        const data = await response.json();
        
        const reviewSection = document.getElementById('workflow-review-section');
        
        // If we don't have a selected ID but the server returned a list and one is running, auto-select it
        if (!state.selectedWorkflowId) {
            if (state.createNewTaskMode) {
                // Keep showing idle configuration section, do not auto-select running task
                const listResponse = await fetch('/api/workflow/status');
                const listData = await listResponse.json();
                renderActiveTasksList(listData.activeWorkflows);
                if (!listData.activeWorkflows || listData.activeWorkflows.length === 0) {
                    document.getElementById('workflow-tasks-section').style.display = 'none';
                }
                showActiveSection(workflowIdleSection);
                btnRunWorkflow.disabled = false;
                return;
            }

            const listResponse = await fetch('/api/workflow/status');
            const listData = await listResponse.json();
            if (listData.activeWorkflows && listData.activeWorkflows.length > 0) {
                // Render tasks list
                renderActiveTasksList(listData.activeWorkflows);
                
                // Auto-select the first running or waiting workflow
                const runningTask = listData.activeWorkflows.find(w => w.status === 'running' || w.status === 'waiting_approval');
                if (runningTask) {
                    state.selectedWorkflowId = runningTask.id;
                } else {
                    state.selectedWorkflowId = listData.activeWorkflows[0].id;
                }
                
                // Fetch again for the selected one
                return pollWorkflowStatus();
            } else {
                // No active workflows in system
                stopWorkflowPolling();
                btnRunWorkflow.disabled = false;
                showActiveSection(workflowIdleSection);
                document.getElementById('workflow-tasks-section').style.display = 'none';
                state.lastWorkflowsJson = '';
                return;
            }
        }
        
        // Also fetch the list of all workflows in parallel to keep sidebar updated
        const listResponse = await fetch('/api/workflow/status');
        const listData = await listResponse.json();
        renderActiveTasksList(listData.activeWorkflows);
        
        // Update progress UI for the selected workflow
        const activeW = data; // since we queried specifically for selectedWorkflowId
        
        // If selected workflow doesn't exist anymore, reset
        if (!activeW || (activeW.error && activeW.error === 'Workflow not found')) {
            state.selectedWorkflowId = null;
            return;
        }

        // Auto-switch: If current selected workflow is completed/failed, and there is another task waiting for approval, switch to it immediately
        if (activeW && (activeW.status === 'completed' || activeW.status === 'failed')) {
            const waitingTask = listData.activeWorkflows.find(w => w.status === 'waiting_approval');
            if (waitingTask && waitingTask.id !== state.selectedWorkflowId) {
                state.selectedWorkflowId = waitingTask.id;
                state.isReviewing = false;
                // Re-poll immediately to show the correct review section
                return pollWorkflowStatus();
            }
        }
        
        // Update progress display
        workflowProgressFill.style.width = `${activeW.progress}%`;
        workflowProgressText.textContent = `${activeW.progress}%`;
        workflowStepText.textContent = activeW.currentStep || 'กำลังดำเนินขั้นตอน...';
        
        // Handle time remaining text inside poll status
        const timeRemainingEl = document.getElementById('workflow-time-remaining');
        if (timeRemainingEl) {
            if (activeW.status === 'waiting_approval') {
                timeRemainingEl.innerHTML = `<i class="fa-regular fa-clock"></i> รออนุมัติเนื้อหา`;
                state.estRemainingSeconds = 0;
            } else if (activeW.status === 'completed') {
                timeRemainingEl.innerHTML = `<i class="fa-regular fa-clock"></i> เสร็จสมบูรณ์`;
                state.estRemainingSeconds = 0;
            } else if (activeW.status === 'failed') {
                timeRemainingEl.innerHTML = `<i class="fa-regular fa-clock"></i> ล้มเหลว`;
                state.estRemainingSeconds = 0;
            } else {
                // status === 'running'
                if (state.currentProgress !== activeW.progress) {
                    state.currentProgress = activeW.progress;
                    
                    let baseline = 10;
                    if (activeW.progress <= 5) baseline = 280;
                    else if (activeW.progress <= 15) baseline = 260;
                    else if (activeW.progress <= 20) baseline = 240;
                    else if (activeW.progress <= 25) baseline = 230;
                    else if (activeW.progress <= 40) baseline = 220;
                    else if (activeW.progress <= 55) baseline = 200;
                    else if (activeW.progress <= 70) baseline = 40;
                    else if (activeW.progress <= 85) baseline = 25;
                    else if (activeW.progress <= 99) baseline = 10;
                    
                    state.estRemainingSeconds = baseline;
                }
                updateTimeRemainingUI();
            }
        }
        
        // Render log lines only if they changed (prevents logs flashing)
        const logsJson = JSON.stringify(activeW.logs);
        if (activeW.logs && activeW.logs.length > 0 && logsJson !== state.lastLogsJson) {
            state.lastLogsJson = logsJson;
            const atBottom = isScrolledToBottom(workflowLogs);
            
            workflowLogs.innerHTML = activeW.logs.map(log => {
                let logClass = '';
                if (log.includes('❌') || log.includes('error') || log.includes('ล้มเหลว')) logClass = 'log-error';
                else if (log.includes('สำเร็จ') || log.includes('เสร็จสิ้น') || log.includes('[อนุมัติ]')) logClass = 'log-success';
                else if (log.includes('ขั้นตอนที่') || log.includes('[รอการอนุมัติ]')) logClass = 'log-header';
                return `<div class="log-line ${logClass}">${escapeHtml(log)}</div>`;
            }).join('');
            
            if (atBottom) {
                workflowLogs.scrollTop = workflowLogs.scrollHeight;
            }
        }
        
        // Handle different statuses with optimized transitions
        if (activeW.status === 'waiting_approval') {
            showActiveSection(reviewSection);
            
            const reviewEditor = document.getElementById('review-markdown-editor');
            if (reviewEditor.value !== activeW.tempContent && !state.isReviewing) {
                reviewEditor.value = activeW.tempContent || '';
                state.isReviewing = true;
            }
            
            // Render and show QC Report if available
            const qcContainer = document.getElementById('workflow-qc-container');
            const qcContentEl = document.getElementById('workflow-qc-content');
            if (qcContainer && qcContentEl) {
                if (activeW.qcReport) {
                    qcContainer.style.display = 'block';
                    qcContentEl.innerHTML = formatQcReport(activeW.qcReport);
                } else {
                    qcContainer.style.display = 'none';
                }
            }
        } else {
            // Hide QC Container when not in waiting approval
            const qcContainer = document.getElementById('workflow-qc-container');
            if (qcContainer) {
                qcContainer.style.display = 'none';
            }
            
            if (activeW.status === 'completed') {
                showActiveSection(workflowResultSection);
                
                resAudioPath.textContent = activeW.result.audioPath || '-';
                resInfoPath.textContent = activeW.result.infoPath || '-';
                resFbPost.value = activeW.result.fbPost || '';
                
                // Stop polling since it's completed
                stopWorkflowPolling();
                btnRunWorkflow.disabled = false;
            } else if (activeW.status === 'failed') {
                showActiveSection(workflowProgressSection); // keep visible for log check
                
                alert('เกิดข้อผิดพลาดในกระบวนการทำงาน: ' + activeW.error);
                stopWorkflowPolling();
                btnRunWorkflow.disabled = false;
            } else {
                // status === 'running'
                showActiveSection(workflowProgressSection);
                state.isReviewing = false;
            }
        }
        
    } catch (error) {
        console.error('Error polling workflow status:', error);
    }
}

// Check status on page load to recover UI if workflow is already running in background
async function checkWorkflowStatusOnLoad() {
    try {
        const response = await fetch('/api/workflow/status');
        const data = await response.json();
        
        if (data.activeWorkflows && data.activeWorkflows.length > 0) {
            renderActiveTasksList(data.activeWorkflows);
            
            // Find any running or waiting workflow to auto-select
            const runningTask = data.activeWorkflows.find(w => w.status === 'running' || w.status === 'waiting_approval');
            if (runningTask) {
                state.selectedWorkflowId = runningTask.id;
                btnRunWorkflow.disabled = false; // Keep enabled for other parallel tasks
                
                if (runningTask.status === 'waiting_approval') {
                    showActiveSection(document.getElementById('workflow-review-section'));
                } else {
                    showActiveSection(workflowProgressSection);
                }
                
                startWorkflowPolling();
            } else {
                // Select first completed/failed one
                state.selectedWorkflowId = data.activeWorkflows[0].id;
                pollWorkflowStatus(); // Trigger single fetch
            }
        }
    } catch (error) {
        console.error('Error checking workflow status on load:', error);
    }
}

// Render the active tasks sidebar list
function renderActiveTasksList(activeWorkflows) {
    const tasksSection = document.getElementById('workflow-tasks-section');
    const tasksList = document.getElementById('workflow-tasks-list');
    
    if (!activeWorkflows || activeWorkflows.length === 0) {
        tasksSection.style.display = 'none';
        state.lastWorkflowsJson = '';
        return;
    }
    
    tasksSection.style.display = 'block';
    
    // Check if task states or selection changed before re-rendering DOM (prevents sidebar flashing)
    const currentJson = JSON.stringify(activeWorkflows) + '_' + state.selectedWorkflowId;
    if (currentJson === state.lastWorkflowsJson) {
        return;
    }
    state.lastWorkflowsJson = currentJson;
    
    tasksList.innerHTML = activeWorkflows.map(w => {
        let statusText = 'กำลังรัน';
        let badgeClass = 'status-running';
        
        if (w.status === 'waiting_approval') {
            statusText = 'รออนุมัติ ⏳';
            badgeClass = 'status-waiting_approval';
        } else if (w.status === 'completed') {
            statusText = 'เสร็จสมบูรณ์';
            badgeClass = 'status-completed';
        } else if (w.status === 'failed') {
            statusText = 'ล้มเหลว';
            badgeClass = 'status-failed';
        }
        
        const isActive = w.id === state.selectedWorkflowId ? 'active' : '';
        
        return `
            <div class="task-item ${isActive}" data-id="${w.id}" style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                <div class="task-info" style="flex: 1; min-width: 0;">
                    <div class="task-title" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(w.title)}</div>
                    <div class="task-status-row">
                        <span class="status-badge ${badgeClass}">${statusText}</span>
                        <span style="color: var(--text-secondary);">${w.progress}%</span>
                    </div>
                </div>
                <div class="task-actions" style="display: flex; align-items: center; gap: 6px;">
                    <i class="fa-solid fa-trash-can remove-task-btn" data-id="${w.id}" style="color: #ef4444; font-size: 13px; cursor: pointer; padding: 4px;" title="ลบรายการ"></i>
                    <i class="fa-solid fa-chevron-right" style="font-size: 10px; color: var(--text-muted);"></i>
                </div>
            </div>
        `;
    }).join('');
    
    // Add click event listeners to task items
    document.querySelectorAll('.task-item').forEach(item => {
        item.addEventListener('click', (e) => {
            // Do not switch task if clicking the delete icon
            if (e.target.classList.contains('remove-task-btn') || e.target.closest('.remove-task-btn')) {
                return;
            }
            const taskId = item.getAttribute('data-id');
            state.selectedWorkflowId = taskId;
            state.isReviewing = false; // Reset reviewing state
            
            // Highlight active task item immediately
            document.querySelectorAll('.task-item').forEach(el => el.classList.remove('active'));
            item.classList.add('active');
            
            // Start polling if it was stopped, or just poll immediately
            btnRunWorkflow.disabled = false; // Do not disable run button when task is clicked
            pollWorkflowStatus();
            startWorkflowPolling();
        });
    });

    // Add click listeners to remove buttons
    document.querySelectorAll('.remove-task-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const taskId = btn.getAttribute('data-id');
            if (confirm('คุณต้องการลบรายการงานนี้จากแถบสถานะใช่หรือไม่?')) {
                await deleteWorkflow(taskId);
            }
        });
    });
}

// Approve and resume workflow
async function handleApproveWorkflow() {
    if (!state.selectedWorkflowId) return;
    
    const approveBtn = document.getElementById('btn-approve-workflow');
    const cancelBtn = document.getElementById('btn-cancel-workflow');
    const editor = document.getElementById('review-markdown-editor');
    
    approveBtn.disabled = true;
    cancelBtn.disabled = true;
    
    try {
        const response = await fetch('/api/workflow/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                workflowId: state.selectedWorkflowId,
                content: editor.value
            })
        });
        const data = await response.json();
        
        if (data.success) {
            state.isReviewing = false;
            document.getElementById('workflow-review-section').style.display = 'none';
            workflowProgressSection.style.display = 'block';
            approveBtn.disabled = false;
            cancelBtn.disabled = false;
            startWorkflowPolling();
        } else {
            alert('อนุมัติไม่สำเร็จ: ' + data.error);
            approveBtn.disabled = false;
            cancelBtn.disabled = false;
        }
    } catch (err) {
        console.error('Error approving workflow:', err);
        approveBtn.disabled = false;
        cancelBtn.disabled = false;
    }
}

// Cancel workflow
async function handleCancelWorkflow() {
    if (!state.selectedWorkflowId) return;
    
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการยกเลิกกระบวนการทำงานนี้?')) return;
    
    const approveBtn = document.getElementById('btn-approve-workflow');
    const cancelBtn = document.getElementById('btn-cancel-workflow');
    
    approveBtn.disabled = true;
    cancelBtn.disabled = true;
    
    try {
        const response = await fetch('/api/workflow/cancel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                workflowId: state.selectedWorkflowId
            })
        });
        const data = await response.json();
        
        if (data.success) {
            state.isReviewing = false;
            document.getElementById('workflow-review-section').style.display = 'none';
            workflowIdleSection.style.display = 'flex';
            approveBtn.disabled = false;
            cancelBtn.disabled = false;
            btnRunWorkflow.disabled = false;
            stopWorkflowPolling();
            
            // Re-fetch all workflows list to refresh sidebar
            const listResponse = await fetch('/api/workflow/status');
            const listData = await listResponse.json();
            renderActiveTasksList(listData.activeWorkflows);
        } else {
            alert('ยกเลิกไม่สำเร็จ: ' + data.error);
            approveBtn.disabled = false;
            cancelBtn.disabled = false;
        }
    } catch (err) {
        console.error('Error canceling workflow:', err);
        approveBtn.disabled = false;
        cancelBtn.disabled = false;
    }
}

// Helper to check if a scrollable element is scrolled to the bottom
function isScrolledToBottom(el) {
    return (el.scrollHeight - el.clientHeight) - el.scrollTop < 50;
}

// Create new show template
async function handleTemplateCreate() {
    const name = newTemplateInput.value.trim();
    if (!name) return;

    addTemplateModal.classList.remove('show');
    
    // Generate clean ID from name (alphanumeric only, lowercase)
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/^_+|_+$/g, '') || 'custom_' + Date.now();
    
    // Check if ID already exists
    if (state.templates.some(t => t.id === id)) {
        alert('ชื่อรายการนี้ซ้ำกับรายการที่มีอยู่แล้ว');
        return;
    }

    const newTemplate = {
        id: id,
        name: name,
        searchPrompt: `ค้นหาข่าวสารสำคัญที่เกี่ยวข้องกับหัวข้อ ${name}`,
        audioPrompt: `สนทนาวิเคราะห์ข้อมูลในระดับลึกเกี่ยวกับประเด็นหลักในเอกสารสำหรับรายการ ${name}`,
        reportPrompt: `สรุปใจความสำคัญและเรียบเรียงเนื้อหาสำหรับโพสต์ Facebook ชวนดูคลิปรายการ ${name}`,
        infoPrompt: `สรุปข้อมูลสรุปสำคัญสำหรับการจัดทำ Infographic สำหรับรายการ ${name}`
    };

    state.templates.push(newTemplate);
    state.activeTemplateId = id;

    // Save templates to backend database
    try {
        const response = await fetch('/api/templates/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ templates: state.templates })
        });
        const data = await response.json();
        
        if (data.success) {
            // Reload select options
            workflowTemplateSelect.innerHTML = '';
            state.templates.forEach(t => {
                const opt = document.createElement('option');
                opt.value = t.id;
                opt.textContent = t.name;
                workflowTemplateSelect.appendChild(opt);
            });
            workflowTemplateSelect.value = id;
            btnDeleteTemplate.disabled = state.templates.length <= 1;
            
            // Trigger switch logic
            handleTemplateChange(id);
            alert(`เพิ่มรายการ "${name}" เรียบร้อยแล้ว!`);
        } else {
            alert('เพิ่มรายการไม่สำเร็จ: ' + data.error);
        }
    } catch (error) {
        console.error('Error saving templates:', error);
        alert('เกิดข้อผิดพลาดในการเซฟข้อมูลรายการใหม่');
    }
}

// Delete current active show template
async function handleTemplateDelete() {
    if (state.templates.length <= 1) {
        alert('ไม่สามารถลบได้เนื่องจากต้องมีอย่างน้อย 1 รายการ');
        return;
    }

    const template = state.templates.find(t => t.id === state.activeTemplateId);
    if (!template) return;

    const confirmDelete = confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบรายการ "${template.name}" พร้อมทั้ง Prompt ทั้งหมดของรายการนี้เป็นการถาวร?`);
    if (!confirmDelete) return;

    state.templates = state.templates.filter(t => t.id !== state.activeTemplateId);
    
    // Select first template as active
    state.activeTemplateId = state.templates[0].id;

    try {
        const response = await fetch('/api/templates/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ templates: state.templates })
        });
        const data = await response.json();
        
        if (data.success) {
            // Reload select options
            workflowTemplateSelect.innerHTML = '';
            state.templates.forEach(t => {
                const opt = document.createElement('option');
                opt.value = t.id;
                opt.textContent = t.name;
                workflowTemplateSelect.appendChild(opt);
            });
            workflowTemplateSelect.value = state.activeTemplateId;
            btnDeleteTemplate.disabled = state.templates.length <= 1;
            
            // Trigger switch logic
            handleTemplateChange(state.activeTemplateId);
            alert('ลบรายการวิเคราะห์เรียบร้อยแล้ว');
        } else {
            alert('ลบรายการไม่สำเร็จ: ' + data.error);
        }
    } catch (error) {
        console.error('Error saving templates after delete:', error);
        alert('เกิดข้อผิดพลาดในการลบรายการ');
    }
}

// Edit template name and save
async function handleTemplateEditSave() {
    const newName = editTemplateInput.value.trim();
    if (!newName) return;

    editTemplateModal.classList.remove('show');

    const template = state.templates.find(t => t.id === state.activeTemplateId);
    if (!template) return;

    const oldName = template.name;
    if (oldName === newName) return; // No change

    template.name = newName;

    // Save templates to backend database
    try {
        const response = await fetch('/api/templates/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ templates: state.templates })
        });
        const data = await response.json();
        
        if (data.success) {
            // Reload select options
            const currentSelectedId = state.activeTemplateId;
            workflowTemplateSelect.innerHTML = '';
            state.templates.forEach(t => {
                const opt = document.createElement('option');
                opt.value = t.id;
                opt.textContent = t.name;
                workflowTemplateSelect.appendChild(opt);
            });
            workflowTemplateSelect.value = currentSelectedId;
            
            alert(`แก้ไขชื่อรายการเป็น "${newName}" เรียบร้อยแล้ว!`);
        } else {
            // Revert on error
            template.name = oldName;
            alert('แก้ไขชื่อรายการไม่สำเร็จ: ' + data.error);
        }
    } catch (error) {
        console.error('Error saving templates:', error);
        template.name = oldName;
        alert('เกิดข้อผิดพลาดในการบันทึกชื่อรายการ');
    }
}

// Variable to store scanned price check result in memory
let scannedTickers = [];

// Populate the price check comparison table
function populatePriceCheckTable(tickers) {
    priceCheckTableBody.innerHTML = '';
    
    tickers.forEach((t, index) => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid var(--border-color)';
        
        // Checkbox cell
        const tdCheck = document.createElement('td');
        tdCheck.style.padding = '10px';
        tdCheck.style.textAlign = 'center';
        
        const chk = document.createElement('input');
        chk.type = 'checkbox';
        chk.className = 'price-update-checkbox';
        chk.dataset.index = index;
        chk.checked = (t.filePrice !== null && t.currentPrice !== null);
        chk.disabled = (t.filePrice === null || t.currentPrice === null);
        tdCheck.appendChild(chk);
        tr.appendChild(tdCheck);
        
        // Ticker cell
        const tdTicker = document.createElement('td');
        tdTicker.style.padding = '10px';
        tdTicker.style.fontWeight = 'bold';
        tdTicker.textContent = `${t.ticker} (${t.exchange})`;
        tr.appendChild(tdTicker);
        
        // File Price cell
        const tdFilePrice = document.createElement('td');
        tdFilePrice.style.padding = '10px';
        tdFilePrice.textContent = t.filePrice !== null ? `$${t.filePrice.toLocaleString()}` : 'ไม่พบราคา';
        tr.appendChild(tdFilePrice);
        
        // Current Price cell
        const tdCurrentPrice = document.createElement('td');
        tdCurrentPrice.style.padding = '10px';
        tdCurrentPrice.style.fontWeight = '500';
        tdCurrentPrice.textContent = t.currentPrice !== null ? `$${t.currentPrice.toLocaleString()}` : 'ดึงราคาไม่สำเร็จ';
        tr.appendChild(tdCurrentPrice);
        
        // Deviation cell
        const tdDeviation = document.createElement('td');
        tdDeviation.style.padding = '10px';
        tdDeviation.style.textAlign = 'right';
        tdDeviation.style.fontWeight = 'bold';
        
        if (t.deviationPercent !== null) {
            const dev = t.deviationPercent;
            tdDeviation.textContent = dev > 0 ? `+${dev}%` : `${dev}%`;
            if (dev > 0) {
                tdDeviation.style.color = '#10B981'; // Green
            } else if (dev < 0) {
                tdDeviation.style.color = '#EF4444'; // Red
            } else {
                tdDeviation.style.color = 'var(--text-secondary)'; // Gray
            }
        } else {
            tdDeviation.textContent = '-';
            tdDeviation.style.color = 'var(--text-secondary)';
        }
        tr.appendChild(tdDeviation);
        
        priceCheckTableBody.appendChild(tr);
    });
    
    checkAllPrices.checked = tickers.some(t => t.filePrice !== null && t.currentPrice !== null);
}

// Delete a workflow task from history
async function deleteWorkflow(workflowId) {
    try {
        const response = await fetch('/api/workflow/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ workflowId })
        });
        const data = await response.json();
        
        if (data.success) {
            if (state.selectedWorkflowId === workflowId) {
                state.selectedWorkflowId = null;
            }
            
            // Refresh list
            const listResponse = await fetch('/api/workflow/status');
            const listData = await listResponse.json();
            renderActiveTasksList(listData.activeWorkflows);
            
            // Re-select another task if available, else go to idle
            if (!state.selectedWorkflowId) {
                const runningTask = listData.activeWorkflows.find(w => w.status === 'running' || w.status === 'waiting_approval');
                if (runningTask) {
                    state.selectedWorkflowId = runningTask.id;
                    pollWorkflowStatus();
                } else if (listData.activeWorkflows && listData.activeWorkflows.length > 0) {
                    state.selectedWorkflowId = listData.activeWorkflows[0].id;
                    pollWorkflowStatus();
                } else {
                    stopWorkflowPolling();
                    btnRunWorkflow.disabled = false;
                    showActiveSection(workflowIdleSection);
                    document.getElementById('workflow-tasks-section').style.display = 'none';
                    state.lastWorkflowsJson = '';
                }
            } else {
                pollWorkflowStatus();
            }
        } else {
            alert('ลบงานไม่สำเร็จ: ' + data.error);
        }
    } catch (err) {
        console.error('Error deleting workflow:', err);
    }
}

// Load and render US Market trends
async function loadMarketTrends() {
    try {
        const response = await fetch('/api/market-trends');
        const data = await response.json();
        
        if (data.success && data.data) {
            trendsLastUpdated.textContent = 'อัปเดตล่าสุด: ' + data.lastUpdated;
            trendsEmptyPlaceholder.style.display = 'none';
            trendsLoadingOverlay.style.display = 'none';
            trendsDashboardGrid.style.display = 'flex';
            renderMarketTrends(data.data);
        } else {
            trendsEmptyPlaceholder.style.display = 'flex';
            trendsLoadingOverlay.style.display = 'none';
            trendsDashboardGrid.style.display = 'none';
        }
    } catch (err) {
        console.error('Error loading market trends:', err);
    }
}

// Trigger live refresh scan
async function handleRefreshMarketTrends() {
    // Disable buttons and show loading overlay
    btnRefreshTrends.disabled = true;
    btnRefreshTrendsEmpty.disabled = true;
    
    const originalText = btnRefreshTrends.innerHTML;
    btnRefreshTrends.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> กำลังวิจัยตลาด...';
    
    trendsEmptyPlaceholder.style.display = 'none';
    trendsDashboardGrid.style.display = 'none';
    trendsLoadingOverlay.style.display = 'flex';
    
    try {
        const response = await fetch('/api/market-trends/refresh', { method: 'POST' });
        const data = await response.json();
        
        if (data.success && data.data) {
            trendsLastUpdated.textContent = 'อัปเดตล่าสุด: ' + data.lastUpdated;
            trendsLoadingOverlay.style.display = 'none';
            trendsDashboardGrid.style.display = 'flex';
            renderMarketTrends(data.data);
            alert('ดึงข้อมูลตลาดหุ้นและโซเชียลเรียบร้อยแล้ว!');
        } else {
            alert('ดึงข้อมูลไม่สำเร็จ: ' + (data.error || 'ไม่ทราบสาเหตุ'));
            loadMarketTrends(); // Fallback to cache if any
        }
    } catch (err) {
        console.error('Error refreshing trends:', err);
        alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
        loadMarketTrends(); // Fallback to cache if any
    } finally {
        btnRefreshTrends.disabled = false;
        btnRefreshTrendsEmpty.disabled = false;
        btnRefreshTrends.innerHTML = originalText;
    }
}

// Render dynamic stock lists and social buzz feed
function renderMarketTrends(trends) {
    sectorsGridContainer.innerHTML = '';
    socialCardsContainer.innerHTML = '';
    
    // Render sectors (Top 10 volume per sector)
    if (trends.sectors && Array.isArray(trends.sectors)) {
        trends.sectors.forEach(sec => {
            const card = document.createElement('div');
            card.className = 'glass-card sector-card';
            
            const titleRow = document.createElement('div');
            titleRow.className = 'sector-title-row';
            titleRow.innerHTML = `<h4 class="sector-title-text"><i class="fa-solid fa-folder-open" style="color: #60a5fa; margin-right: 8px;"></i>${sec.sectorName}</h4>`;
            card.appendChild(titleRow);
            
            const table = document.createElement('table');
            table.className = 'stock-table';
            
            // Header
            table.innerHTML = `
                <thead>
                    <tr>
                        <th style="width: 25%;">Ticker</th>
                        <th style="width: 25%;">ราคา</th>
                        <th style="width: 25%;">% +/-</th>
                        <th style="width: 25%;">Volume</th>
                    </tr>
                </thead>
            `;
            
            const tbody = document.createElement('tbody');
            if (sec.stocks && Array.isArray(sec.stocks)) {
                // Parse volume helper
                const parseVolumeVal = (v) => {
                    if (!v) return 0;
                    const c = v.replace(/[$,\s]/g, '').toLowerCase();
                    let m = 1;
                    let n = c;
                    if (c.endsWith('b')) { m = 1e9; n = c.slice(0, -1); }
                    else if (c.endsWith('m')) { m = 1e6; n = c.slice(0, -1); }
                    else if (c.endsWith('k')) { m = 1e3; n = c.slice(0, -1); }
                    const p = parseFloat(n);
                    return isNaN(p) ? 0 : p * m;
                };
                
                // Sort stocks descending by parsed volume
                const sortedStocks = [...sec.stocks].sort((a, b) => parseVolumeVal(b.volume) - parseVolumeVal(a.volume));
                
                sortedStocks.forEach(stock => {
                    const tr = document.createElement('tr');
                    
                    // Determine color class for change
                    const changeStr = (stock.change || '').trim();
                    let changeClass = 'stock-val-neutral';
                    if (changeStr.startsWith('+')) {
                        changeClass = 'stock-val-positive';
                    } else if (changeStr.startsWith('-')) {
                        changeClass = 'stock-val-negative';
                    }
                    
                    tr.innerHTML = `
                        <td>
                            <span class="stock-ticker-badge" title="${stock.name || stock.ticker}">${stock.ticker}</span>
                        </td>
                        <td><strong>${stock.price || '-'}</strong></td>
                        <td><span class="${changeClass}">${stock.change || '0%'}</span></td>
                        <td style="color: var(--text-secondary); font-family: monospace;">${stock.volume || '-'}</td>
                    `;
                    
                    // Attach hover tool-tip describing the catalyst/reason
                    tr.title = `${stock.name || stock.ticker} - ${stock.reason || ''}`;
                    tbody.appendChild(tr);
                });
            }
            
            table.appendChild(tbody);
            card.appendChild(table);
            sectorsGridContainer.appendChild(card);
        });
    }
    
    // Render Social media trends
    if (trends.socialTrends && Array.isArray(trends.socialTrends)) {
        trends.socialTrends.forEach(soc => {
            const card = document.createElement('div');
            card.className = 'glass-card social-card';
            
            const sentiment = (soc.sentiment || 'Neutral').trim();
            const sentimentClass = `sentiment-${sentiment.toLowerCase()}`;
            
            // Format changes color
            const changeStr = (soc.change || '').trim();
            let changeStyle = 'color: var(--text-secondary);';
            if (changeStr.startsWith('+')) {
                changeStyle = 'color: #34d399; font-weight: 600;';
            } else if (changeStr.startsWith('-')) {
                changeStyle = 'color: #f87171; font-weight: 600;';
            }
            
            card.innerHTML = `
                <div class="social-header-row">
                    <div class="social-ticker-area">
                        <span class="social-ticker">${soc.ticker}</span>
                        <span class="social-name">${soc.name || ''}</span>
                    </div>
                    <span class="sentiment-badge ${sentimentClass}">${sentiment}</span>
                </div>
                <div style="font-size: 13px; margin: 4px 0 8px 0; color: var(--text-primary);">
                    ราคา: <span style="font-weight: 600; color: #fff;">${soc.price || '-'}</span> 
                    (<span style="${changeStyle}">${soc.change || '0%'}</span>)
                </div>
                <p class="social-summary-text">${soc.summary || ''}</p>
                <div class="social-meta-row">
                    <span><i class="fa-regular fa-comment"></i> ${soc.mentions || '0 mentions'}</span>
                    <span class="platform-pill"><i class="fa-solid fa-hashtag"></i> ${soc.platforms || 'Social Media'}</span>
                </div>
            `;
            socialCardsContainer.appendChild(card);
        });
    }
}

// Load whale portfolios from backend cache
async function loadWhalePortfolios() {
    try {
        const response = await fetch('/api/whale-portfolios');
        const data = await response.json();
        
        if (data.success && data.data) {
            whalesLastUpdated.textContent = 'อัปเดตล่าสุด: ' + data.lastUpdated;
            whalesEmptyPlaceholder.style.display = 'none';
            whalesLoadingOverlay.style.display = 'none';
            whalesDashboardGrid.style.display = 'flex';
            
            state.whaleData = data.data;
            populateWhaleDropdown(data.data.whales);
            renderWhalesOverview(data.data.overview);
            triggerWhaleRender();
        } else {
            whalesEmptyPlaceholder.style.display = 'flex';
            whalesLoadingOverlay.style.display = 'none';
            whalesDashboardGrid.style.display = 'none';
        }
    } catch (err) {
        console.error('Error loading whale portfolios:', err);
    }
}

// Trigger live refresh of Whale Tracker
async function handleRefreshWhales() {
    btnRefreshWhales.disabled = true;
    btnRefreshWhalesEmpty.disabled = true;
    
    const originalText = btnRefreshWhales.innerHTML;
    btnRefreshWhales.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> กำลังวิจัยบอร์ดวาฬ...';
    
    whalesEmptyPlaceholder.style.display = 'none';
    whalesDashboardGrid.style.display = 'none';
    whalesLoadingOverlay.style.display = 'flex';
    
    try {
        const response = await fetch('/api/whale-portfolios/refresh', { method: 'POST' });
        const data = await response.json();
        
        if (data.success && data.data) {
            whalesLastUpdated.textContent = 'อัปเดตล่าสุด: ' + data.lastUpdated;
            whalesLoadingOverlay.style.display = 'none';
            whalesDashboardGrid.style.display = 'flex';
            
            state.whaleData = data.data;
            populateWhaleDropdown(data.data.whales);
            renderWhalesOverview(data.data.overview);
            triggerWhaleRender();
            alert('ดึงพอร์ตและการชอร์ตของวาฬยักษ์สำเร็จแล้ว!');
        } else {
            alert('ดึงข้อมูลวาฬไม่สำเร็จ: ' + (data.error || 'ไม่ทราบสาเหตุ'));
            loadWhalePortfolios();
        }
    } catch (err) {
        console.error('Error refreshing whales:', err);
        alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
        loadWhalePortfolios();
    } finally {
        btnRefreshWhales.disabled = false;
        btnRefreshWhalesEmpty.disabled = false;
        btnRefreshWhales.innerHTML = originalText;
    }
}

// Populate dropdown select with whale names
function populateWhaleDropdown(whales) {
    if (!whaleDropdown) return;
    
    const currentSelectVal = whaleDropdown.value;
    whaleDropdown.innerHTML = '';
    
    if (whales && Array.isArray(whales)) {
        whales.forEach((whale, index) => {
            const opt = document.createElement('option');
            opt.value = index;
            opt.textContent = `${whale.investorName} (${whale.firmName})`;
            whaleDropdown.appendChild(opt);
        });
        
        if (currentSelectVal !== null && currentSelectVal !== "" && currentSelectVal < whales.length) {
            whaleDropdown.value = currentSelectVal;
        }
    }
}

// Render the high-level overview highlights
function renderWhalesOverview(overview) {
    if (!overview) return;
    
    // Sentiment
    if (whaleOverviewSentiment) {
        whaleOverviewSentiment.textContent = overview.marketSentiment || 'Mixed';
        
        // Color depending on sentiment value
        const sent = (overview.marketSentiment || '').toLowerCase();
        if (sent.includes('bullish') || sent.includes('buy') || sent.includes('long')) {
            whaleOverviewSentiment.style.color = '#34d399';
        } else if (sent.includes('bearish') || sent.includes('sell') || sent.includes('short')) {
            whaleOverviewSentiment.style.color = '#f87171';
        } else {
            whaleOverviewSentiment.style.color = '#fbbf24';
        }
    }
    
    // Sectors
    if (whaleOverviewSectors && overview.topSectorRotation) {
        whaleOverviewSectors.innerHTML = '';
        overview.topSectorRotation.forEach(sec => {
            const span = document.createElement('span');
            span.style.padding = '4px 12px';
            span.style.backgroundColor = 'rgba(96, 165, 250, 0.15)';
            span.style.color = '#93c5fd';
            span.style.borderRadius = '12px';
            span.style.fontSize = '12px';
            span.style.fontWeight = '500';
            span.textContent = sec;
            whaleOverviewSectors.appendChild(span);
        });
    }
    
    // Timeline
    if (whalesOverviewTimeline && overview.criticalPeriodHighlights) {
        whalesOverviewTimeline.innerHTML = '';
        // Sort highlights by timestamp descending (newest first)
        const sortedHighlights = [...overview.criticalPeriodHighlights].sort((a, b) => {
            const dateA = new Date(a.timestamp);
            const dateB = new Date(b.timestamp);
            return dateB - dateA;
        });
        sortedHighlights.forEach(hl => {
            const item = document.createElement('div');
            item.className = 'timeline-item';
            item.innerHTML = `
                <div class="timeline-timestamp">${hl.timestamp || ''}</div>
                <h4 class="timeline-title">${hl.marketEvent || ''}</h4>
                <p class="timeline-desc" style="margin-bottom: 5px;"><strong>ความเคลื่อนไหววาฬ:</strong> ${hl.whaleActivity || ''}</p>
                <p class="timeline-desc" style="color: var(--text-muted);"><strong>ผลกระทบต่อตลาด:</strong> ${hl.impact || ''}</p>
            `;
            whalesOverviewTimeline.appendChild(item);
        });
    }
}

// Render selected individual whale detailed lists
function triggerWhaleRender() {
    if (!state.whaleData || !state.whaleData.whales || !whaleDropdown) return;
    
    const index = parseInt(whaleDropdown.value || 0, 10);
    const whale = state.whaleData.whales[index];
    if (!whale) return;
    
    // Render metadata
    if (individualWhaleMeta) {
        individualWhaleMeta.textContent = `AUM: ${whale.aum || 'N/A'} | สไตล์: ${whale.style || 'N/A'}`;
    }
    
    // Render Long Portfolio Table
    const longTbody = whaleLongTable.querySelector('tbody');
    longTbody.innerHTML = '';
    if (whale.longPortfolio && Array.isArray(whale.longPortfolio)) {
        whale.longPortfolio.forEach(item => {
            const tr = document.createElement('tr');
            
            const changeStr = (item.change || '').trim();
            let changeClass = 'stock-val-neutral';
            if (changeStr.startsWith('+')) {
                changeClass = 'stock-val-positive';
            } else if (changeStr.startsWith('-')) {
                changeClass = 'stock-val-negative';
            }
            
            tr.innerHTML = `
                <td><span class="stock-ticker-badge" style="background-color: rgba(96, 165, 250, 0.12); color: #93c5fd;">${item.ticker}</span></td>
                <td><strong>${item.name || ''}</strong></td>
                <td><strong>${item.price || '-'}</strong></td>
                <td><span class="${changeClass}">${item.change || '0%'}</span></td>
                <td>${item.shares || '-'}</td>
                <td><strong style="color: #60a5fa;">${item.value || '-'}</strong></td>
                <td style="font-family: monospace;">${item.weight || '-'}</td>
            `;
            longTbody.appendChild(tr);
        });
    }
    
    // Render Options Portfolio Table
    const optTbody = whaleOptionsTable.querySelector('tbody');
    optTbody.innerHTML = '';
    if (whale.optionsPositions && Array.isArray(whale.optionsPositions) && whale.optionsPositions.length > 0) {
        whale.optionsPositions.forEach(item => {
            const tr = document.createElement('tr');
            
            const typeStr = (item.type || '').trim().toUpperCase();
            let typeStyle = 'background-color: rgba(245, 158, 11, 0.15); color: #fbbf24;';
            if (typeStr.includes('PUT')) {
                typeStyle = 'background-color: rgba(239, 68, 68, 0.15); color: #f87171;';
            } else if (typeStr.includes('CALL')) {
                typeStyle = 'background-color: rgba(16, 185, 129, 0.15); color: #34d399;';
            }
            
            const changeStr = (item.change || '').trim();
            let changeClass = 'stock-val-neutral';
            if (changeStr.startsWith('+')) {
                changeClass = 'stock-val-positive';
            } else if (changeStr.startsWith('-')) {
                changeClass = 'stock-val-negative';
            }
            
            tr.innerHTML = `
                <td><span class="stock-ticker-badge" style="background-color: rgba(251, 191, 36, 0.12); color: #fbbf24;">${item.ticker}</span></td>
                <td><span class="tx-badge" style="${typeStyle}">${item.type || 'Option'}</span></td>
                <td><strong style="color: #60a5fa;">${item.underlyingPrice || '-'}</strong></td>
                <td><strong>${item.strikePrice || '-'}</strong></td>
                <td><span style="font-family: monospace; color: var(--text-secondary);">${item.expiryDate || '-'}</span></td>
                <td><strong>${item.price || '-'}</strong></td>
                <td><span class="${changeClass}">${item.change || '0%'}</span></td>
                <td>${item.contracts || '-'}</td>
                <td><strong style="color: #fbbf24;">${item.value || '-'}</strong></td>
            `;
            optTbody.appendChild(tr);
        });
    } else {
        optTbody.innerHTML = '<tr><td colspan="9" class="text-center" style="color: var(--text-muted); padding: 15px;">ไม่มีรายการอนุพันธ์แจ้งตรวจสิทธิในระบบ</td></tr>';
    }
    
    // Render Short Sell cards
    if (whaleShortsContainer) {
        whaleShortsContainer.innerHTML = '';
        if (whale.shortPositions && Array.isArray(whale.shortPositions) && whale.shortPositions.length > 0) {
            whale.shortPositions.forEach(item => {
                const card = document.createElement('div');
                card.className = 'short-position-card';
                
                const changeStr = (item.change || '').trim();
                let changeStyle = 'color: var(--text-secondary);';
                if (changeStr.startsWith('+')) {
                    changeStyle = 'color: #34d399;';
                } else if (changeStr.startsWith('-')) {
                    changeStyle = 'color: #f87171;';
                }
                
                card.innerHTML = `
                    <div class="short-header">
                        <span class="short-ticker">${item.ticker}</span>
                        <span class="short-size">${item.size || ''}</span>
                    </div>
                    <div style="font-size: 11px; color: var(--text-primary);">
                        ราคาหุ้น: <strong>${item.price || ''}</strong> 
                        (<span style="${changeStyle}">${item.change || '0%'}</span>)
                    </div>
                    <p class="short-reason">${item.reason || ''}</p>
                `;
                whaleShortsContainer.appendChild(card);
            });
        } else {
            whaleShortsContainer.innerHTML = '<div style="color: var(--text-muted); font-size: 12px; text-align: center; padding: 20px;">ไม่มีการรายงานชอร์ตเซลล่าสุดทางสาธารณะ</div>';
        }
    }
    
    // Render Recent Transactions (1 Month) Timeline
    if (whaleTransactionsTimeline) {
        whaleTransactionsTimeline.innerHTML = '';
        if (whale.recentTransactions && Array.isArray(whale.recentTransactions) && whale.recentTransactions.length > 0) {
            // Sort transactions by date descending (newest first)
            const sortedTxs = [...whale.recentTransactions].sort((a, b) => new Date(b.date) - new Date(a.date));
            sortedTxs.forEach(tx => {
                const action = (tx.action || 'Buy').toLowerCase();
                let actionClass = 'tx-buy';
                let badgeClass = 'tx-badge-buy';
                
                if (action.includes('sell') || action.includes('close')) {
                    actionClass = action.includes('close') ? 'tx-close' : 'tx-sell';
                    badgeClass = action.includes('close') ? 'tx-badge-close' : 'tx-badge-sell';
                }
                
                const item = document.createElement('div');
                item.className = `tx-timeline-item ${actionClass}`;
                item.innerHTML = `
                    <div class="timeline-timestamp">${tx.date || ''}</div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span class="tx-badge ${badgeClass}">${tx.action || 'TRADE'}</span>
                        <strong style="color: #fff; font-size: 13.5px;">${tx.ticker}</strong>
                    </div>
                    <p class="timeline-desc" style="margin-top: 4px; font-size: 12px;">
                        ทำรายการที่ราคา: <strong>${tx.price || '-'}</strong> | ขนาดรายการ: <strong>${tx.size || '-'}</strong>
                    </p>
                `;
                whaleTransactionsTimeline.appendChild(item);
            });
        } else {
            whaleTransactionsTimeline.innerHTML = '<div style="color: var(--text-muted); font-size: 12px; text-align: center; padding: 20px;">ไม่มีรายการซื้อขายในรอบ 30 วันที่รายงานล่าสุด</div>';
        }
    }
}

