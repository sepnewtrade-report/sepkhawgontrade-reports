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
    createNewTaskMode: false
};

// DOM Elements
const statusCard = document.getElementById('status-card');
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
    workflowDateInput.value = `${yyyy}-${mm}-${dd}`;

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
        const queryDate = workflowDateInput.value || '';
        const filesResponse = await fetch('/api/workspace-files?date=' + queryDate);
        const filesData = await filesResponse.json();
        
        if (filesData.success) {
            workflowFileSelect.innerHTML = '';
            
            // Prepend "-- ไม่ใช้ไฟล์ (ดึงข้อมูลผ่านระบบค้นหาข่าว) --" option
            const defaultOpt = document.createElement('option');
            defaultOpt.value = '';
            defaultOpt.textContent = '-- ไม่ใช้ไฟล์ (ดึงข้อมูลผ่านระบบค้นหาข่าว) --';
            workflowFileSelect.appendChild(defaultOpt);
            
            // Set the date input value to the suggested date if it is different (only if queryDate was not empty)
            if (queryDate && filesData.suggestedDate && workflowDateInput.value !== filesData.suggestedDate) {
                workflowDateInput.value = filesData.suggestedDate;
            }
            
            filesData.files.forEach(f => {
                const opt = document.createElement('option');
                opt.value = f.filename;
                opt.textContent = f.filename;
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
        } else if (activeW.status === 'completed') {
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
            statusText = 'รอตรวจทาน';
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

