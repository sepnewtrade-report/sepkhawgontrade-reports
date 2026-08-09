/* ==========================================================================
   📊 INVESTOR CALCULATOR — Main Engine & Controller v4.0.0
   100% Client-side Calculation Engine & Interactive UX Logic
   ========================================================================== */

// Global Application State
const state = {
    currency: 'USD',         // 'USD' ($) or 'THB' (฿)
    sharesMode: 'whole',     // 'whole' or 'fractional'
    theme: 'dark',           // 'dark' or 'light'
    activeTab: 'home',
    
    // Dynamic Table State Lists
    avgCostRows: [
        { shares: 100, price: 100.00 },
        { shares: 50, price: 80.00 },
        { shares: 100, price: 70.00 }
    ],
    dcaRows: [
        { shares: 50, price: 100.00 },
        { shares: 50, price: 95.00 },
        { shares: 50, price: 105.00 },
        { shares: 50, price: 100.00 }
    ],
    multiEntryRows: [
        { allocPct: 20, price: 100.00 },
        { allocPct: 30, price: 90.00 },
        { allocPct: 30, price: 80.00 },
        { allocPct: 20, price: 70.00 }
    ],
    portfolioAllocRows: [
        { name: 'Stock A (NVDA)', value: 20000, targetPct: 30 },
        { name: 'Stock B (AAPL)', value: 15000, targetPct: 25 },
        { name: 'Stock C (MSFT)', value: 10000, targetPct: 20 },
        { name: 'Cash (เงินสด)', value: 15000, targetPct: 25 }
    ],
    rebalanceRows: [
        { name: 'Stock A (NVDA)', value: 40000, targetPct: 30 },
        { name: 'Stock B (AAPL)', value: 30000, targetPct: 30 },
        { name: 'Cash (เงินสด)', value: 30000, targetPct: 40 }
    ],
    cashDeployRows: [
        { allocPct: 25 },
        { allocPct: 25 },
        { allocPct: 25 },
        { allocPct: 25 }
    ]
};

// ==========================================================================
// 1. PURE CALCULATION UTILITY ENGINE (No UI Side Effects - 100% Testable)
// ==========================================================================
const CalculationEngine = {

    calculatePositionSize({ portfolioValue, riskPct, entryPrice, stopLossPrice, sharesMode }) {
        if (!portfolioValue || !riskPct || !entryPrice || !stopLossPrice) return null;
        if (entryPrice <= 0 || stopLossPrice <= 0 || portfolioValue <= 0 || riskPct <= 0) return null;
        if (stopLossPrice >= entryPrice) {
            return { error: '⚠️ Stop Loss ต้องต่ำกว่าราคาซื้อสำหรับ Long Position' };
        }

        const maxRiskDollars = portfolioValue * (riskPct / 100);
        const riskPerShare = entryPrice - stopLossPrice;
        let rawShares = maxRiskDollars / riskPerShare;
        let shares = sharesMode === 'whole' ? Math.floor(rawShares) : parseFloat(rawShares.toFixed(4));

        const positionValue = shares * entryPrice;
        const portfolioAllocPct = (positionValue / portfolioValue) * 100;

        let allocRiskLevel = 'normal'; // normal, high, very-high
        if (portfolioAllocPct > 20) allocRiskLevel = 'very-high';
        else if (portfolioAllocPct > 10) allocRiskLevel = 'high';

        let riskPerTradeBadge = 'low'; // low, moderate, elevated, high
        if (riskPct > 5) riskPerTradeBadge = 'high';
        else if (riskPct > 2) riskPerTradeBadge = 'elevated';
        else if (riskPct > 1) riskPerTradeBadge = 'moderate';

        return {
            maxRiskDollars,
            riskPerShare,
            shares,
            positionValue,
            portfolioAllocPct,
            allocRiskLevel,
            riskPerTradeBadge
        };
    },

    calculateRiskReward({ entryPrice, targetPrice, stopLossPrice, shares }) {
        if (!entryPrice || !targetPrice || !stopLossPrice || !shares) return null;
        if (entryPrice <= 0 || targetPrice <= 0 || stopLossPrice <= 0 || shares <= 0) return null;
        if (targetPrice <= entryPrice) {
            return { error: '⚠️ ราคาเป้าหมาย (Target) ต้องสูงกว่าราคาซื้อ (Entry)' };
        }
        if (stopLossPrice >= entryPrice) {
            return { error: '⚠️ จุดตัดขาดทุน (Stop Loss) ต้องต่ำกว่าราคาซื้อ (Entry)' };
        }

        const profitPerShare = targetPrice - entryPrice;
        const lossPerShare = entryPrice - stopLossPrice;
        const totalProfit = profitPerShare * shares;
        const totalLoss = lossPerShare * shares;
        const upsidePct = (profitPerShare / entryPrice) * 100;
        const downsidePct = (lossPerShare / entryPrice) * 100;
        const rrRatio = profitPerShare / lossPerShare;

        let rating = 'poor';
        if (rrRatio >= 3.0) rating = 'excellent';
        else if (rrRatio >= 2.0) rating = 'good';
        else if (rrRatio >= 1.0) rating = 'moderate';

        return {
            profitPerShare,
            lossPerShare,
            totalProfit,
            totalLoss,
            upsidePct,
            downsidePct,
            rrRatio,
            rating
        };
    },

    calculateProfitLoss({ buyPrice, sellPrice, shares, commPct, otherFees }) {
        if (!buyPrice || !sellPrice || !shares) return null;
        if (buyPrice <= 0 || sellPrice <= 0 || shares <= 0) return null;

        const investmentCost = buyPrice * shares;
        const grossProceeds = sellPrice * shares;
        const grossPL = grossProceeds - investmentCost;
        
        const cPct = parseFloat(commPct) || 0;
        const oFees = parseFloat(otherFees) || 0;
        const commissionCost = (investmentCost + grossProceeds) * (cPct / 100);
        const totalFees = commissionCost + oFees;

        const netPL = grossPL - totalFees;
        const returnPct = (netPL / investmentCost) * 100;

        return {
            investmentCost,
            grossProceeds,
            grossPL,
            totalFees,
            netPL,
            returnPct
        };
    },

    calculateAverageCost(entries) {
        const valid = entries.filter(e => e.shares > 0 && e.price > 0);
        if (valid.length === 0) return { totalShares: 0, totalCost: 0, avgCost: 0 };

        const totalShares = valid.reduce((a, b) => a + b.shares, 0);
        const totalCost = valid.reduce((a, b) => a + (b.shares * b.price), 0);
        const avgCost = totalShares > 0 ? totalCost / totalShares : 0;

        return { totalShares, totalCost, avgCost };
    },

    calculateTargetPriceModeA({ entryPrice, desiredReturnPct, shares }) {
        if (!entryPrice || entryPrice <= 0) return null;
        const retPct = parseFloat(desiredReturnPct) || 0;
        const targetPrice = entryPrice * (1 + (retPct / 100));
        const profitPerShare = targetPrice - entryPrice;
        const totalProfit = profitPerShare * (shares || 100);

        return { targetPrice, profitPerShare, totalProfit, returnPct: retPct };
    },

    calculateTargetPriceModeB({ entryPrice, targetPrice, shares }) {
        if (!entryPrice || !targetPrice || entryPrice <= 0 || targetPrice <= 0) return null;
        const profitPerShare = targetPrice - entryPrice;
        const returnPct = (profitPerShare / entryPrice) * 100;
        const totalProfit = profitPerShare * (shares || 100);

        return { targetPrice, profitPerShare, totalProfit, returnPct };
    },

    calculateBreakEven({ costPrice, currentPrice }) {
        if (!costPrice || !currentPrice || costPrice <= 0 || currentPrice <= 0) return null;
        if (costPrice < currentPrice) {
            return { error: 'ℹ️ ราคาปัจจุบันสูงกว่าราคาต้นทุน (พอร์ตมีกำไรอยู่แล้ว)' };
        }

        const lossPct = ((currentPrice - costPrice) / costPrice) * 100; // Negative value
        const requiredRecoveryPct = ((costPrice - currentPrice) / currentPrice) * 100;

        return {
            lossPct,
            requiredRecoveryPct
        };
    },

    calculateDCA({ currentPrice, entries }) {
        const valid = entries.filter(e => e.shares > 0 && e.price > 0);
        const totalShares = valid.reduce((a, b) => a + b.shares, 0);
        const totalCost = valid.reduce((a, b) => a + (b.shares * b.price), 0);
        const avgCost = totalShares > 0 ? totalCost / totalShares : 0;

        const curP = parseFloat(currentPrice) || avgCost;
        const marketValue = totalShares * curP;
        const unrealizedPL = marketValue - totalCost;
        const unrealizedReturnPct = totalCost > 0 ? (unrealizedPL / totalCost) * 100 : 0;

        return {
            totalShares,
            totalCost,
            avgCost,
            marketValue,
            unrealizedPL,
            unrealizedReturnPct
        };
    },

    calculateMultiEntry({ totalCapital, entries }) {
        if (!totalCapital || totalCapital <= 0) return null;
        const allocSum = entries.reduce((a, b) => a + (parseFloat(b.allocPct) || 0), 0);
        const isValidAlloc = Math.abs(allocSum - 100) < 0.01;

        let totalShares = 0;
        let totalCapitalUsed = 0;

        const breakdown = entries.map((e, i) => {
            const alloc = parseFloat(e.allocPct) || 0;
            const price = parseFloat(e.price) || 0;
            const capital = totalCapital * (alloc / 100);
            const shares = price > 0 ? capital / price : 0;

            totalCapitalUsed += capital;
            totalShares += shares;

            return {
                index: i + 1,
                allocPct: alloc,
                price,
                capital,
                shares
            };
        });

        const weightedAvgPrice = totalShares > 0 ? totalCapitalUsed / totalShares : 0;

        return {
            allocSum,
            isValidAlloc,
            totalShares,
            totalCapitalUsed,
            weightedAvgPrice,
            breakdown
        };
    },

    calculatePortfolioAllocation(assets) {
        const totalVal = assets.reduce((a, b) => a + (parseFloat(b.value) || 0), 0);
        if (totalVal <= 0) return { totalVal: 0, items: [] };

        let cashValue = 0;
        const items = assets.map(a => {
            const val = parseFloat(a.value) || 0;
            const target = parseFloat(a.targetPct) || 0;
            const currentWeight = (val / totalVal) * 100;
            const diffPct = currentWeight - target;

            if (a.name.toLowerCase().includes('cash') || a.name.includes('เงินสด')) {
                cashValue += val;
            }

            let status = 'on-target';
            if (diffPct > 2) status = 'overweight';
            else if (diffPct < -2) status = 'underweight';

            return {
                name: a.name || 'Asset',
                value: val,
                targetPct: target,
                currentWeight,
                diffPct,
                status
            };
        });

        const cashWeight = (cashValue / totalVal) * 100;

        return {
            totalVal,
            cashWeight,
            items
        };
    },

    calculateRebalancing(assets) {
        const totalVal = assets.reduce((a, b) => a + (parseFloat(b.value) || 0), 0);
        if (totalVal <= 0) return { totalVal: 0, items: [] };

        const items = assets.map(a => {
            const val = parseFloat(a.value) || 0;
            const target = parseFloat(a.targetPct) || 0;
            const targetVal = totalVal * (target / 100);
            const adjustment = targetVal - val; // + Need to Buy, - Need to Sell

            return {
                name: a.name || 'Asset',
                currentVal: val,
                targetPct: target,
                targetVal,
                adjustment
            };
        });

        return { totalVal, items };
    },

    calculateCashDeployment({ availableCash, entries }) {
        if (!availableCash || availableCash <= 0) return null;
        const allocSum = entries.reduce((a, b) => a + (parseFloat(b.allocPct) || 0), 0);
        const isValidAlloc = Math.abs(allocSum - 100) < 0.01;

        const breakdown = entries.map((e, i) => {
            const alloc = parseFloat(e.allocPct) || 0;
            const capital = availableCash * (alloc / 100);
            return {
                index: i + 1,
                allocPct: alloc,
                capital
            };
        });

        return { allocSum, isValidAlloc, breakdown };
    },

    calculateDrawdownRecovery({ peakValue, currentValue }) {
        if (!peakValue || !currentValue || peakValue <= 0 || currentValue <= 0) return null;
        if (currentValue > peakValue) {
            return { error: 'ℹ️ มูลค่าปัจจุบันสูงกว่าจุดสูงสุดเดิม (พอร์ตทำ All-Time High)' };
        }

        const drawdownPct = ((currentValue - peakValue) / peakValue) * 100; // Negative
        const requiredRecoveryPct = ((peakValue - currentValue) / currentValue) * 100;

        return { drawdownPct, requiredRecoveryPct };
    }
};

// ==========================================================================
// 2. UI CONTROLLER & EVENT BINDINGS
// ==========================================================================

const globalObj = typeof window !== 'undefined' ? window : global;

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        initTabNavigation();
        initGlobalControls();
        initCalculatorListeners();
        renderAllCalculators();
    });
}

// Tab Navigation Logic
function initTabNavigation() {
    const navLinks = document.querySelectorAll('.nav-item, .b-nav-item');
    
    function switchTab(tabId) {
        state.activeTab = tabId;
        
        // Toggle view sections
        document.querySelectorAll('.tab-view').forEach(view => {
            view.classList.remove('active');
        });
        const targetView = document.getElementById(`view-${tabId}`);
        if (targetView) targetView.classList.add('active');

        // Toggle nav active links
        navLinks.forEach(link => {
            if (link.getAttribute('data-tab') === tabId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    globalObj.switchTab = switchTab;

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = link.getAttribute('data-tab');
            if (tab) switchTab(tab);
        });
    });

    // Handle hash URL routing
    if (typeof window !== 'undefined' && window.location.hash) {
        const hashTab = window.location.hash.substring(1);
        const exists = document.getElementById(`view-${hashTab}`);
        if (exists) switchTab(hashTab);
    }
}

// Global Controls (Currency, Shares Mode, Theme, Privacy Banner)
function initGlobalControls() {
    // Currency Switcher
    const currBtns = document.querySelectorAll('#currency-switcher .segment-btn');
    currBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.currency = btn.getAttribute('data-currency');
            updateCurrencySymbols();
            renderAllCalculators();
        });
    });

    // Shares Mode Switcher
    const sharesBtns = document.querySelectorAll('#shares-mode-switcher .segment-btn');
    sharesBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            sharesBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.sharesMode = btn.getAttribute('data-shares');
            renderAllCalculators();
        });
    });

    // Theme Switcher
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            state.theme = state.theme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', state.theme);
            themeBtn.innerHTML = state.theme === 'dark' ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
            renderDonutChart();
        });
    }

    // Mobile Drawer Toggle
    const mobileNavBtn = document.getElementById('mobile-nav-toggle');
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('mobile-backdrop');

    if (mobileNavBtn && sidebar && backdrop) {
        mobileNavBtn.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-open');
            backdrop.classList.toggle('active');
        });
        backdrop.addEventListener('click', () => {
            sidebar.classList.remove('mobile-open');
            backdrop.classList.remove('active');
        });
    }

    // Privacy Banner Close
    const closePrivBtn = document.getElementById('close-privacy-btn');
    if (closePrivBtn) {
        closePrivBtn.addEventListener('click', () => {
            closePrivBtn.parentElement.style.display = 'none';
        });
    }
}

function updateCurrencySymbols() {
    const sym = state.currency === 'USD' ? '$' : '฿';
    document.querySelectorAll('.curr-symbol').forEach(el => el.textContent = sym);
}

// Attach Live Calculation Input Event Listeners
function initCalculatorListeners() {
    // 1. Position Size
    ['pos-portfolio', 'pos-risk-pct', 'pos-entry', 'pos-stop'].forEach(id => {
        const input = document.getElementById(id);
        if (input) input.addEventListener('input', renderPositionSize);
    });

    // 2. Risk / Reward
    ['rr-entry', 'rr-target', 'rr-stop', 'rr-shares'].forEach(id => {
        const input = document.getElementById(id);
        if (input) input.addEventListener('input', renderRiskReward);
    });

    // 3. Profit / Loss
    ['pl-buy-price', 'pl-sell-price', 'pl-shares', 'pl-comm-pct', 'pl-other-fees'].forEach(id => {
        const input = document.getElementById(id);
        if (input) input.addEventListener('input', renderProfitLoss);
    });

    // 4. Target Price Mode Selector
    const modeBtns = document.querySelectorAll('#target-mode-selector .segment-btn');
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const mode = btn.getAttribute('data-mode');
            document.getElementById('target-panel-A').style.display = mode === 'A' ? 'block' : 'none';
            document.getElementById('target-panel-B').style.display = mode === 'B' ? 'block' : 'none';
            renderTargetPrice();
        });
    });

    ['target-a-entry', 'target-a-pct', 'target-b-entry', 'target-b-target', 'target-b-shares'].forEach(id => {
        const input = document.getElementById(id);
        if (input) input.addEventListener('input', renderTargetPrice);
    });

    // 5. Average Cost Dynamic Table Buttons
    const avgAddBtn = document.getElementById('avg-add-row-btn');
    if (avgAddBtn) {
        avgAddBtn.addEventListener('click', () => {
            state.avgCostRows.push({ shares: 50, price: 100.00 });
            renderAverageCostTable();
            renderAverageCost();
        });
    }

    // 6. DCA Dynamic Table Buttons
    const dcaAddBtn = document.getElementById('dca-add-row-btn');
    if (dcaAddBtn) {
        dcaAddBtn.addEventListener('click', () => {
            state.dcaRows.push({ shares: 50, price: 100.00 });
            renderDCATable();
            renderDCA();
        });
    }
    const dcaCurP = document.getElementById('dca-current-price');
    if (dcaCurP) dcaCurP.addEventListener('input', renderDCA);

    // 7. Break Even
    ['be-cost', 'be-current'].forEach(id => {
        const input = document.getElementById(id);
        if (input) input.addEventListener('input', renderBreakEven);
    });

    // 8. Multi-Entry
    const meCapital = document.getElementById('me-capital');
    if (meCapital) meCapital.addEventListener('input', renderMultiEntry);
    const meAddBtn = document.getElementById('me-add-row-btn');
    if (meAddBtn) {
        meAddBtn.addEventListener('click', () => {
            state.multiEntryRows.push({ allocPct: 10, price: 70.00 });
            renderMultiEntryTable();
            renderMultiEntry();
        });
    }

    // 9. Portfolio Allocation Table
    const paAddBtn = document.getElementById('pa-add-row-btn');
    if (paAddBtn) {
        paAddBtn.addEventListener('click', () => {
            state.portfolioAllocRows.push({ name: `Stock ${state.portfolioAllocRows.length + 1}`, value: 5000, targetPct: 10 });
            renderPortfolioAllocTable();
            renderPortfolioAlloc();
        });
    }

    // 10. Rebalancing Table
    const rebAddBtn = document.getElementById('reb-add-row-btn');
    if (rebAddBtn) {
        rebAddBtn.addEventListener('click', () => {
            state.rebalanceRows.push({ name: `Asset ${state.rebalanceRows.length + 1}`, value: 10000, targetPct: 10 });
            renderRebalanceTable();
            renderRebalance();
        });
    }

    // 11. Cash Deployment Table
    const cdCash = document.getElementById('cd-cash');
    if (cdCash) cdCash.addEventListener('input', renderCashDeployment);
    const cdAddBtn = document.getElementById('cd-add-row-btn');
    if (cdAddBtn) {
        cdAddBtn.addEventListener('click', () => {
            state.cashDeployRows.push({ allocPct: 10 });
            renderCashDeployTable();
            renderCashDeployment();
        });
    }

    // 12. Drawdown & Recovery
    ['dd-peak', 'dd-current'].forEach(id => {
        const input = document.getElementById(id);
        if (input) input.addEventListener('input', renderDrawdown);
    });
}

// Master Render All Calculators
function renderAllCalculators() {
    renderPositionSize();
    renderRiskReward();
    renderProfitLoss();
    renderTargetPrice();
    renderAverageCostTable();
    renderAverageCost();
    renderDCATable();
    renderDCA();
    renderBreakEven();
    renderMultiEntryTable();
    renderMultiEntry();
    renderPortfolioAllocTable();
    renderPortfolioAlloc();
    renderRebalanceTable();
    renderRebalance();
    renderCashDeployTable();
    renderCashDeployment();
    renderDrawdown();
}

// ==========================================================================
// 3. RENDER FUNCTIONS FOR EACH CALCULATOR
// ==========================================================================

// --- 1. Position Size Calculator ---
function renderPositionSize() {
    const portfolioValue = parseFloat(document.getElementById('pos-portfolio').value);
    const riskPct = parseFloat(document.getElementById('pos-risk-pct').value);
    const entryPrice = parseFloat(document.getElementById('pos-entry').value);
    const stopLossPrice = parseFloat(document.getElementById('pos-stop').value);

    const errorEl = document.getElementById('pos-error');
    const res = CalculationEngine.calculatePositionSize({
        portfolioValue, riskPct, entryPrice, stopLossPrice, sharesMode: state.sharesMode
    });

    if (!res) return;

    if (res.error) {
        errorEl.style.display = 'block';
        errorEl.textContent = res.error;
        return;
    } else {
        errorEl.style.display = 'none';
    }

    document.getElementById('pos-res-shares').textContent = `${formatNum(res.shares)} หุ้น`;
    document.getElementById('pos-res-max-risk').textContent = formatCurrency(res.maxRiskDollars);
    document.getElementById('pos-res-risk-share').textContent = formatCurrency(res.riskPerShare);
    document.getElementById('pos-res-pos-val').textContent = formatCurrency(res.positionValue);
    document.getElementById('pos-res-alloc').textContent = `${res.portfolioAllocPct.toFixed(2)}%`;

    // Risk badge update
    const badgeEl = document.getElementById('pos-risk-badge');
    if (res.allocRiskLevel === 'very-high') {
        badgeEl.className = 'risk-badge badge-red';
        badgeEl.textContent = '🔴 Very High (> 20%)';
    } else if (res.allocRiskLevel === 'high') {
        badgeEl.className = 'risk-badge badge-yellow';
        badgeEl.textContent = '🟡 High (10–20%)';
    } else {
        badgeEl.className = 'risk-badge badge-green';
        badgeEl.textContent = '🟢 Normal (≤ 10%)';
    }

    // Insight Callout
    document.getElementById('pos-insight-text').innerHTML = `
        💡 <b>Decision Insight:</b> หากราคาลงถึง Stop Loss (${formatCurrency(stopLossPrice)}) ความเสียหายที่คำนวณได้จะอยู่ที่ประมาณ <b>${formatCurrency(res.maxRiskDollars)}</b> คิดเป็น <b>${riskPct.toFixed(2)}%</b> ของมูลค่าพอร์ตรวม
    `;
}

// --- 2. Risk / Reward Calculator ---
function renderRiskReward() {
    const entryPrice = parseFloat(document.getElementById('rr-entry').value);
    const targetPrice = parseFloat(document.getElementById('rr-target').value);
    const stopLossPrice = parseFloat(document.getElementById('rr-stop').value);
    const shares = parseFloat(document.getElementById('rr-shares').value);

    const errorEl = document.getElementById('rr-error');
    const res = CalculationEngine.calculateRiskReward({ entryPrice, targetPrice, stopLossPrice, shares });

    if (!res) return;

    if (res.error) {
        errorEl.style.display = 'block';
        errorEl.textContent = res.error;
        return;
    } else {
        errorEl.style.display = 'none';
    }

    document.getElementById('rr-res-ratio').textContent = `${res.rrRatio.toFixed(2)}x`;
    document.getElementById('rr-res-profit-share').textContent = `+${formatCurrency(res.profitPerShare)} (+${res.upsidePct.toFixed(2)}%)`;
    document.getElementById('rr-res-loss-share').textContent = `-${formatCurrency(res.lossPerShare)} (-${res.downsidePct.toFixed(2)}%)`;
    document.getElementById('rr-res-total-profit').textContent = `+${formatCurrency(res.totalProfit)}`;
    document.getElementById('rr-res-total-loss').textContent = `-${formatCurrency(res.totalLoss)}`;

    const ratingEl = document.getElementById('rr-res-rating');
    if (res.rating === 'excellent') {
        ratingEl.className = 'rating-badge rating-excellent';
        ratingEl.textContent = '⭐ Excellent (ดีเยี่ยม ≥ 3.0x)';
    } else if (res.rating === 'good') {
        ratingEl.className = 'rating-badge rating-good';
        ratingEl.textContent = '🟢 Good (ดี 2.0–2.99x)';
    } else if (res.rating === 'moderate') {
        ratingEl.className = 'rating-badge rating-moderate';
        ratingEl.textContent = '🟡 Moderate (ปานกลาง 1.0–1.99x)';
    } else {
        ratingEl.className = 'rating-badge rating-poor';
        ratingEl.textContent = '🔴 Poor (ต่ำ < 1.0x)';
    }

    document.getElementById('rr-insight-text').innerHTML = `
        💡 <b>Risk/Reward Evaluation:</b> อัตราส่วน Risk/Reward อยู่ในระดับ <b>${res.rrRatio.toFixed(2)}x</b> (ทุกความเสี่ยง 1 ส่วน มีโอกาสทำกำไร ${res.rrRatio.toFixed(2)} ส่วน)
    `;
}

// --- 3. Profit / Loss Calculator ---
function renderProfitLoss() {
    const buyPrice = parseFloat(document.getElementById('pl-buy-price').value);
    const sellPrice = parseFloat(document.getElementById('pl-sell-price').value);
    const shares = parseFloat(document.getElementById('pl-shares').value);
    const commPct = parseFloat(document.getElementById('pl-comm-pct').value);
    const otherFees = parseFloat(document.getElementById('pl-other-fees').value);

    const res = CalculationEngine.calculateProfitLoss({ buyPrice, sellPrice, shares, commPct, otherFees });
    if (!res) return;

    const isProf = res.netPL >= 0;
    const netEl = document.getElementById('pl-res-net-pl');
    netEl.className = `res-value-main ${isProf ? 'text-green' : 'text-red'}`;
    netEl.textContent = `${isProf ? '+' : ''}${formatCurrency(res.netPL)}`;

    document.getElementById('pl-res-return-pct').innerHTML = `ผลตอบแทนสุทธิ: <b class="${isProf ? 'text-green' : 'text-red'}">${isProf ? '+' : ''}${res.returnPct.toFixed(2)}%</b>`;
    document.getElementById('pl-res-cost').textContent = formatCurrency(res.investmentCost);
    document.getElementById('pl-res-proceeds').textContent = formatCurrency(res.grossProceeds);
    
    const grossEl = document.getElementById('pl-res-gross-pl');
    grossEl.className = `res-card-value ${res.grossPL >= 0 ? 'text-green' : 'text-red'}`;
    grossEl.textContent = `${res.grossPL >= 0 ? '+' : ''}${formatCurrency(res.grossPL)}`;

    document.getElementById('pl-res-total-fees').textContent = `-${formatCurrency(res.totalFees)}`;

    document.getElementById('pl-insight-text').innerHTML = `
        💡 <b>Net Return Overview:</b> จากการขายหุ้นครั้งนี้ คุณได้รับกำไร/ขาดทุนสุทธิหลังหักค่าธรรมเนียม <b>${formatCurrency(res.netPL)}</b> คิดเป็นผลตอบแทน <b>${res.returnPct.toFixed(2)}%</b> ของต้นทุน
    `;
}

// --- 4. Target Price Calculator ---
function renderTargetPrice() {
    const activeModeBtn = document.querySelector('#target-mode-selector .segment-btn.active');
    const mode = activeModeBtn ? activeModeBtn.getAttribute('data-mode') : 'A';

    if (mode === 'A') {
        const entryPrice = parseFloat(document.getElementById('target-a-entry').value);
        const desiredReturnPct = parseFloat(document.getElementById('target-a-pct').value);

        const res = CalculationEngine.calculateTargetPriceModeA({ entryPrice, desiredReturnPct });
        if (!res) return;

        document.getElementById('target-res-label').textContent = 'ราคาขายเป้าหมายที่ต้องตั้ง (Target Price)';
        document.getElementById('target-res-main').className = 'res-value-main text-green';
        document.getElementById('target-res-main').textContent = formatCurrency(res.targetPrice);
        document.getElementById('target-res-sub').innerHTML = `ผลตอบแทนเป้าหมาย: <b class="text-green">+${res.returnPct.toFixed(2)}%</b>`;
        document.getElementById('target-res-diff').textContent = `+${formatCurrency(res.profitPerShare)}`;
        document.getElementById('target-res-total-prof').textContent = `+${formatCurrency(res.totalProfit)}`;

        document.getElementById('target-insight-text').innerHTML = `
            💡 <b>Target Goal Insight:</b> หากต้องการกำไร <b>${res.returnPct.toFixed(2)}%</b> จากราคาซื้อ ${formatCurrency(entryPrice)} คุณต้องตั้งราคาขายเป้าหมายที่ <b>${formatCurrency(res.targetPrice)}</b>
        `;
    } else {
        const entryPrice = parseFloat(document.getElementById('target-b-entry').value);
        const targetPrice = parseFloat(document.getElementById('target-b-target').value);
        const shares = parseFloat(document.getElementById('target-b-shares').value);

        const res = CalculationEngine.calculateTargetPriceModeB({ entryPrice, targetPrice, shares });
        if (!res) return;

        const isProf = res.returnPct >= 0;
        document.getElementById('target-res-label').textContent = 'ผลตอบแทนคาดการณ์ (Potential Return)';
        document.getElementById('target-res-main').className = `res-value-main ${isProf ? 'text-green' : 'text-red'}`;
        document.getElementById('target-res-main').textContent = `${isProf ? '+' : ''}${res.returnPct.toFixed(2)}%`;
        document.getElementById('target-res-sub').innerHTML = `ราคาเป้าหมาย: <b>${formatCurrency(targetPrice)}</b>`;
        document.getElementById('target-res-diff').textContent = `${isProf ? '+' : ''}${formatCurrency(res.profitPerShare)}`;
        document.getElementById('target-res-total-prof').textContent = `${isProf ? '+' : ''}${formatCurrency(res.totalProfit)}`;

        document.getElementById('target-insight-text').innerHTML = `
            💡 <b>Target Goal Insight:</b> การขายที่ราคาเป้าหมาย ${formatCurrency(targetPrice)} จะสร้างกำไรส่วนต่าง <b>${formatCurrency(res.profitPerShare)} ต่อหุ้น</b> (${res.returnPct.toFixed(2)}%)
        `;
    }
}

// --- 5. Average Cost Calculator ---
function renderAverageCostTable() {
    const tbody = document.getElementById('avg-cost-tbody');
    if (!tbody) return;

    tbody.innerHTML = state.avgCostRows.map((r, i) => `
        <tr>
            <td>ไม้ที่ ${i + 1}</td>
            <td><input type="number" value="${r.shares}" step="1" min="0" oninput="updateAvgCostRow(${i}, 'shares', this.value)"></td>
            <td><input type="number" value="${r.price}" step="0.01" min="0" oninput="updateAvgCostRow(${i}, 'price', this.value)"></td>
            <td><b>${formatCurrency(r.shares * r.price)}</b></td>
            <td><button class="del-row-btn" onclick="deleteAvgCostRow(${i})"><i class="fa-solid fa-trash-can"></i></button></td>
        </tr>
    `).join('');
}

globalObj.updateAvgCostRow = (i, field, val) => {
    state.avgCostRows[i][field] = parseFloat(val) || 0;
    renderAverageCostTable();
    renderAverageCost();
};

globalObj.deleteAvgCostRow = (i) => {
    state.avgCostRows.splice(i, 1);
    renderAverageCostTable();
    renderAverageCost();
};

function renderAverageCost() {
    const res = CalculationEngine.calculateAverageCost(state.avgCostRows);
    document.getElementById('avg-res-cost').textContent = `${formatCurrency(res.avgCost)} / หุ้น`;
    document.getElementById('avg-res-shares').textContent = `${formatNum(res.totalShares)} หุ้น`;
    document.getElementById('avg-res-total-cost').textContent = formatCurrency(res.totalCost);

    document.getElementById('avg-insight-text').innerHTML = `
        💡 <b>Average Summary:</b> จากการเข้าซื้อรวม ${state.avgCostRows.length} ครั้ง จำนวน ${formatNum(res.totalShares)} หุ้น ทำให้ได้ราคาต้นทุนเฉลี่ยใหม่สะสมอยู่ที่ <b>${formatCurrency(res.avgCost)} ต่อหุ้น</b>
    `;
}

// --- 6. DCA Calculator ---
function renderDCATable() {
    const tbody = document.getElementById('dca-tbody');
    if (!tbody) return;

    tbody.innerHTML = state.dcaRows.map((r, i) => `
        <tr>
            <td>งวดที่ ${i + 1}</td>
            <td><input type="number" value="${r.shares}" step="1" min="0" oninput="updateDCARow(${i}, 'shares', this.value)"></td>
            <td><input type="number" value="${r.price}" step="0.01" min="0" oninput="updateDCARow(${i}, 'price', this.value)"></td>
            <td><b>${formatCurrency(r.shares * r.price)}</b></td>
            <td><button class="del-row-btn" onclick="deleteDCARow(${i})"><i class="fa-solid fa-trash-can"></i></button></td>
        </tr>
    `).join('');
}

globalObj.updateDCARow = (i, field, val) => {
    state.dcaRows[i][field] = parseFloat(val) || 0;
    renderDCATable();
    renderDCA();
};

globalObj.deleteDCARow = (i) => {
    state.dcaRows.splice(i, 1);
    renderDCATable();
    renderDCA();
};

function renderDCA() {
    const curP = parseFloat(document.getElementById('dca-current-price').value);
    const res = CalculationEngine.calculateDCA({ currentPrice: curP, entries: state.dcaRows });

    const isProf = res.unrealizedPL >= 0;
    const unrealEl = document.getElementById('dca-res-unrealized');
    unrealEl.className = `res-value-main ${isProf ? 'text-green' : 'text-red'}`;
    unrealEl.textContent = `${isProf ? '+' : ''}${formatCurrency(res.unrealizedPL)}`;

    document.getElementById('dca-res-unrealized-pct').innerHTML = `ผลตอบแทนสะสม: <b class="${isProf ? 'text-green' : 'text-red'}">${isProf ? '+' : ''}${res.unrealizedReturnPct.toFixed(2)}%</b>`;
    document.getElementById('dca-res-total-shares').textContent = `${formatNum(res.totalShares)} หุ้น`;
    document.getElementById('dca-res-total-cost').textContent = formatCurrency(res.totalCost);
    document.getElementById('dca-res-avg-cost').textContent = formatCurrency(res.avgCost);
    document.getElementById('dca-res-market-val').textContent = formatCurrency(res.marketValue);
}

// --- 7. Break-Even Calculator ---
function renderBreakEven() {
    const costPrice = parseFloat(document.getElementById('be-cost').value);
    const currentPrice = parseFloat(document.getElementById('be-current').value);

    const errorEl = document.getElementById('be-error');
    const res = CalculationEngine.calculateBreakEven({ costPrice, currentPrice });

    if (!res) return;

    if (res.error) {
        errorEl.style.display = 'block';
        errorEl.textContent = res.error;
        return;
    } else {
        errorEl.style.display = 'none';
    }

    document.getElementById('be-res-recovery').textContent = `+${res.requiredRecoveryPct.toFixed(2)}%`;
    document.getElementById('be-res-loss').innerHTML = `เปอร์เซ็นต์ที่ขาดทุนอยู่ปัจจุบัน: <b>${res.lossPct.toFixed(2)}%</b>`;

    document.getElementById('be-step-cost').textContent = formatCurrency(costPrice);
    document.getElementById('be-step-current').textContent = formatCurrency(currentPrice);
    document.getElementById('be-step-target').textContent = formatCurrency(costPrice);

    document.getElementById('be-insight-text').innerHTML = `
        ⚠️ <b>Asymmetric Recovery Warning:</b> หากราคาลดลง <b>${Math.abs(res.lossPct).toFixed(2)}%</b> จากต้นทุนเดิม (${formatCurrency(costPrice)} &rarr; ${formatCurrency(currentPrice)}) ราคาหุ้นจะต้องเพิ่มขึ้นถึง <b>+${res.requiredRecoveryPct.toFixed(2)}%</b> จากราคาปัจจุบันเพื่อกลับมาที่จุดเท่าทุน
    `;
}

// --- 8. Multi-Entry Planner ---
function renderMultiEntryTable() {
    const tbody = document.getElementById('me-tbody');
    if (!tbody) return;

    tbody.innerHTML = state.multiEntryRows.map((r, i) => `
        <tr>
            <td>ไม้ที่ ${i + 1}</td>
            <td><input type="number" value="${r.allocPct}" step="5" min="0" max="100" oninput="updateMultiEntryRow(${i}, 'allocPct', this.value)"></td>
            <td><input type="number" value="${r.price}" step="0.01" min="0" oninput="updateMultiEntryRow(${i}, 'price', this.value)"></td>
            <td><button class="del-row-btn" onclick="deleteMultiEntryRow(${i})"><i class="fa-solid fa-trash-can"></i></button></td>
        </tr>
    `).join('');
}

globalObj.updateMultiEntryRow = (i, field, val) => {
    state.multiEntryRows[i][field] = parseFloat(val) || 0;
    renderMultiEntryTable();
    renderMultiEntry();
};

globalObj.deleteMultiEntryRow = (i) => {
    state.multiEntryRows.splice(i, 1);
    renderMultiEntryTable();
    renderMultiEntry();
};

function renderMultiEntry() {
    const totalCapital = parseFloat(document.getElementById('me-capital').value);
    const res = CalculationEngine.calculateMultiEntry({ totalCapital, entries: state.multiEntryRows });

    const warnEl = document.getElementById('me-alloc-warning');
    if (!res.isValidAlloc) {
        warnEl.style.display = 'block';
        warnEl.textContent = `⚠️ สัดส่วน Allocation รวม = ${res.allocSum.toFixed(1)}% (ต้องรวมเท่ากับ 100% พอดี)`;
    } else {
        warnEl.style.display = 'none';
    }

    document.getElementById('me-res-weighted-avg').textContent = formatCurrency(res.weightedAvgPrice);
    document.getElementById('me-res-total-shares').textContent = `${formatNum(res.totalShares)} หุ้น`;
    document.getElementById('me-res-total-used').textContent = `${formatCurrency(res.totalCapitalUsed)} (${res.allocSum.toFixed(0)}%)`;

    // Render Breakdown Table
    const box = document.getElementById('me-breakdown-box');
    box.innerHTML = `
        <table class="entry-table">
            <thead>
                <tr>
                    <th>ไม้ที่</th>
                    <th>สัดส่วน</th>
                    <th>เงินทุน ($)</th>
                    <th>ราคา ($)</th>
                    <th>จำนวนหุ้น</th>
                </tr>
            </thead>
            <tbody>
                ${res.breakdown.map(b => `
                    <tr>
                        <td>ไม้ที่ ${b.index}</td>
                        <td>${b.allocPct}%</td>
                        <td>${formatCurrency(b.capital)}</td>
                        <td>${formatCurrency(b.price)}</td>
                        <td><b>${formatNum(b.shares)}</b></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// --- 9. Portfolio Allocation Calculator ---
function renderPortfolioAllocTable() {
    const tbody = document.getElementById('pa-tbody');
    if (!tbody) return;

    tbody.innerHTML = state.portfolioAllocRows.map((r, i) => `
        <tr>
            <td><input type="text" value="${r.name}" oninput="updatePortfolioAllocRow(${i}, 'name', this.value)"></td>
            <td><input type="number" value="${r.value}" step="1000" min="0" oninput="updatePortfolioAllocRow(${i}, 'value', this.value)"></td>
            <td><input type="number" value="${r.targetPct}" step="5" min="0" max="100" oninput="updatePortfolioAllocRow(${i}, 'targetPct', this.value)"></td>
            <td><button class="del-row-btn" onclick="deletePortfolioAllocRow(${i})"><i class="fa-solid fa-trash-can"></i></button></td>
        </tr>
    `).join('');
}

globalObj.updatePortfolioAllocRow = (i, field, val) => {
    state.portfolioAllocRows[i][field] = field === 'name' ? val : (parseFloat(val) || 0);
    renderPortfolioAllocTable();
    renderPortfolioAlloc();
};

globalObj.deletePortfolioAllocRow = (i) => {
    state.portfolioAllocRows.splice(i, 1);
    renderPortfolioAllocTable();
    renderPortfolioAlloc();
};

function renderPortfolioAlloc() {
    const res = CalculationEngine.calculatePortfolioAllocation(state.portfolioAllocRows);

    document.getElementById('pa-res-total-val').textContent = formatCurrency(res.totalVal);
    document.getElementById('pa-res-cash-weight').textContent = `${res.cashWeight.toFixed(2)}%`;

    // Status breakdown table
    const box = document.getElementById('pa-status-table-box');
    box.innerHTML = `
        <table class="entry-table">
            <thead>
                <tr>
                    <th>สินทรัพย์</th>
                    <th>สัดส่วนปัจจุบัน</th>
                    <th>เป้าหมาย</th>
                    <th>สถานะ (Status)</th>
                </tr>
            </thead>
            <tbody>
                ${res.items.map(item => `
                    <tr>
                        <td><b>${item.name}</b></td>
                        <td>${item.currentWeight.toFixed(2)}%</td>
                        <td>${item.targetPct.toFixed(2)}%</td>
                        <td>
                            ${item.status === 'overweight' ? '<span class="risk-badge badge-yellow">Overweight</span>' : 
                              item.status === 'underweight' ? '<span class="risk-badge badge-red">Underweight</span>' : 
                              '<span class="risk-badge badge-green">On Target</span>'}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    renderDonutChart(res.items);
}

// Native Canvas Donut Chart Rendering
function renderDonutChart(items) {
    const canvas = document.getElementById('pa-donut-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const dataItems = items || CalculationEngine.calculatePortfolioAllocation(state.portfolioAllocRows).items;
    const colors = ['#06b6d4', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#3b82f6'];

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const outerRadius = 100;
    const innerRadius = 60;

    let startAngle = -Math.PI / 2;

    dataItems.forEach((item, idx) => {
        const sliceAngle = (item.currentWeight / 100) * (Math.PI * 2);
        const endAngle = startAngle + sliceAngle;

        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
        ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
        ctx.closePath();

        ctx.fillStyle = colors[idx % colors.length];
        ctx.fill();

        startAngle = endAngle;
    });

    // Inner text
    ctx.fillStyle = state.theme === 'dark' ? '#f8fafc' : '#0f172a';
    ctx.font = 'bold 14px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PORTFOLIO', centerX, centerY - 8);
    ctx.font = '12px Inter, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('ALLOCATION', centerX, centerY + 10);
}

// --- 10. Rebalancing Calculator ---
function renderRebalanceTable() {
    const tbody = document.getElementById('reb-tbody');
    if (!tbody) return;

    tbody.innerHTML = state.rebalanceRows.map((r, i) => `
        <tr>
            <td><input type="text" value="${r.name}" oninput="updateRebalanceRow(${i}, 'name', this.value)"></td>
            <td><input type="number" value="${r.value}" step="1000" min="0" oninput="updateRebalanceRow(${i}, 'value', this.value)"></td>
            <td><input type="number" value="${r.targetPct}" step="5" min="0" max="100" oninput="updateRebalanceRow(${i}, 'targetPct', this.value)"></td>
            <td><button class="del-row-btn" onclick="deleteRebalanceRow(${i})"><i class="fa-solid fa-trash-can"></i></button></td>
        </tr>
    `).join('');
}

globalObj.updateRebalanceRow = (i, field, val) => {
    state.rebalanceRows[i][field] = field === 'name' ? val : (parseFloat(val) || 0);
    renderRebalanceTable();
    renderRebalance();
};

globalObj.deleteRebalanceRow = (i) => {
    state.rebalanceRows.splice(i, 1);
    renderRebalanceTable();
    renderRebalance();
};

function renderRebalance() {
    const res = CalculationEngine.calculateRebalancing(state.rebalanceRows);
    document.getElementById('reb-res-total').textContent = formatCurrency(res.totalVal);

    const box = document.getElementById('reb-output-box');
    box.innerHTML = `
        <table class="entry-table">
            <thead>
                <tr>
                    <th>สินทรัพย์</th>
                    <th>มูลค่าปัจจุบัน</th>
                    <th>มูลค่าเป้าหมาย</th>
                    <th>จำนวนเงินที่ต้องปรับตาม Target</th>
                </tr>
            </thead>
            <tbody>
                ${res.items.map(item => `
                    <tr>
                        <td><b>${item.name}</b></td>
                        <td>${formatCurrency(item.currentVal)}</td>
                        <td>${formatCurrency(item.targetVal)} (${item.targetPct}%)</td>
                        <td>
                            ${item.adjustment > 0 ? `<span class="text-green font-bold">🟢 เพิ่ม +${formatCurrency(item.adjustment)}</span>` :
                              item.adjustment < 0 ? `<span class="text-red font-bold">🔴 ลด -${formatCurrency(Math.abs(item.adjustment))}</span>` :
                              '<span>On Target</span>'}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// --- 11. Cash Deployment Calculator ---
function renderCashDeployTable() {
    const tbody = document.getElementById('cd-tbody');
    if (!tbody) return;

    tbody.innerHTML = state.cashDeployRows.map((r, i) => `
        <tr>
            <td>ไม้ที่ ${i + 1}</td>
            <td><input type="number" value="${r.allocPct}" step="5" min="0" max="100" oninput="updateCashDeployRow(${i}, 'allocPct', this.value)"></td>
            <td><button class="del-row-btn" onclick="deleteCashDeployRow(${i})"><i class="fa-solid fa-trash-can"></i></button></td>
        </tr>
    `).join('');
}

globalObj.updateCashDeployRow = (i, field, val) => {
    state.cashDeployRows[i][field] = parseFloat(val) || 0;
    renderCashDeployTable();
    renderCashDeployment();
};

globalObj.deleteCashDeployRow = (i) => {
    state.cashDeployRows.splice(i, 1);
    renderCashDeployTable();
    renderCashDeployment();
};

function renderCashDeployment() {
    const cash = parseFloat(document.getElementById('cd-cash').value);
    const res = CalculationEngine.calculateCashDeployment({ availableCash: cash, entries: state.cashDeployRows });

    const warnEl = document.getElementById('cd-alloc-warning');
    if (!res.isValidAlloc) {
        warnEl.style.display = 'block';
        warnEl.textContent = `⚠️ สัดส่วน Allocation รวม = ${res.allocSum.toFixed(1)}% (ต้องรวมเท่ากับ 100% พอดี)`;
    } else {
        warnEl.style.display = 'none';
    }

    document.getElementById('cd-res-total').textContent = formatCurrency(cash);

    const box = document.getElementById('cd-breakdown-box');
    box.innerHTML = `
        <table class="entry-table">
            <thead>
                <tr>
                    <th>ไม้ที่</th>
                    <th>สัดส่วน (%)</th>
                    <th>จำนวนเงินที่จัดสรร (Capital)</th>
                </tr>
            </thead>
            <tbody>
                ${res.breakdown.map(b => `
                    <tr>
                        <td>ไม้ที่ ${b.index}</td>
                        <td>${b.allocPct}%</td>
                        <td><b class="text-green">${formatCurrency(b.capital)}</b></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// --- 12. Drawdown & Recovery Calculator ---
function renderDrawdown() {
    const peakValue = parseFloat(document.getElementById('dd-peak').value);
    const currentValue = parseFloat(document.getElementById('dd-current').value);

    const errorEl = document.getElementById('dd-error');
    const res = CalculationEngine.calculateDrawdownRecovery({ peakValue, currentValue });

    if (!res) return;

    if (res.error) {
        errorEl.style.display = 'block';
        errorEl.textContent = res.error;
        return;
    } else {
        errorEl.style.display = 'none';
    }

    document.getElementById('dd-res-drawdown').textContent = `${res.drawdownPct.toFixed(2)}%`;
    document.getElementById('dd-res-recovery').innerHTML = `ผลตอบแทนที่ต้องทำได้เพิ่มขึ้น: <b>+${res.requiredRecoveryPct.toFixed(2)}%</b>`;

    document.getElementById('dd-step-peak').textContent = formatCurrency(peakValue);
    document.getElementById('dd-step-current').textContent = formatCurrency(currentValue);
    document.getElementById('dd-step-target').textContent = formatCurrency(peakValue);

    document.getElementById('dd-insight-text').innerHTML = `
        💡 <b>Recovery Insight:</b> เมื่อพอร์ตย่อตัวลง <b>${Math.abs(res.drawdownPct).toFixed(2)}%</b> คุณต้องทำผลตอบแทนให้ได้ <b>+${res.requiredRecoveryPct.toFixed(2)}%</b> จากเงินทุนที่เหลือเพื่อดึงพอร์ตกลับไปที่ ${formatCurrency(peakValue)}
    `;
}

// Reset Calculator Inputs
globalObj.resetCalculator = (type) => {
    if (type === 'position') {
        document.getElementById('pos-portfolio').value = 100000;
        document.getElementById('pos-risk-pct').value = 1.0;
        document.getElementById('pos-entry').value = 50.00;
        document.getElementById('pos-stop').value = 45.00;
        renderPositionSize();
    } else if (type === 'rr') {
        document.getElementById('rr-entry').value = 100.00;
        document.getElementById('rr-target').value = 130.00;
        document.getElementById('rr-stop').value = 90.00;
        document.getElementById('rr-shares').value = 100;
        renderRiskReward();
    } else if (type === 'pl') {
        document.getElementById('pl-buy-price').value = 100.00;
        document.getElementById('pl-sell-price').value = 125.00;
        document.getElementById('pl-shares').value = 100;
        document.getElementById('pl-comm-pct').value = 0.10;
        document.getElementById('pl-other-fees').value = 2.00;
        renderProfitLoss();
    } else if (type === 'target') {
        document.getElementById('target-a-entry').value = 100.00;
        document.getElementById('target-a-pct').value = 20.0;
        renderTargetPrice();
    } else if (type === 'avg-cost') {
        state.avgCostRows = [{ shares: 100, price: 100.00 }, { shares: 50, price: 80.00 }, { shares: 100, price: 70.00 }];
        renderAverageCostTable();
        renderAverageCost();
    } else if (type === 'dca') {
        state.dcaRows = [{ shares: 50, price: 100.00 }, { shares: 50, price: 95.00 }, { shares: 50, price: 105.00 }, { shares: 50, price: 100.00 }];
        renderDCATable();
        renderDCA();
    } else if (type === 'breakeven') {
        document.getElementById('be-cost').value = 100.00;
        document.getElementById('be-current').value = 70.00;
        renderBreakEven();
    } else if (type === 'multi-entry') {
        document.getElementById('me-capital').value = 10000;
        state.multiEntryRows = [{ allocPct: 20, price: 100.00 }, { allocPct: 30, price: 90.00 }, { allocPct: 30, price: 80.00 }, { allocPct: 20, price: 70.00 }];
        renderMultiEntryTable();
        renderMultiEntry();
    } else if (type === 'port-alloc') {
        state.portfolioAllocRows = [
            { name: 'Stock A (NVDA)', value: 20000, targetPct: 30 },
            { name: 'Stock B (AAPL)', value: 15000, targetPct: 25 },
            { name: 'Stock C (MSFT)', value: 10000, targetPct: 20 },
            { name: 'Cash (เงินสด)', value: 15000, targetPct: 25 }
        ];
        renderPortfolioAllocTable();
        renderPortfolioAlloc();
    } else if (type === 'rebalance') {
        state.rebalanceRows = [{ name: 'Stock A (NVDA)', value: 40000, targetPct: 30 }, { name: 'Stock B (AAPL)', value: 30000, targetPct: 30 }, { name: 'Cash (เงินสด)', value: 30000, targetPct: 40 }];
        renderRebalanceTable();
        renderRebalance();
    } else if (type === 'cash-deploy') {
        document.getElementById('cd-cash').value = 20000;
        state.cashDeployRows = [{ allocPct: 25 }, { allocPct: 25 }, { allocPct: 25 }, { allocPct: 25 }];
        renderCashDeployTable();
        renderCashDeployment();
    } else if (type === 'drawdown') {
        document.getElementById('dd-peak').value = 100000;
        document.getElementById('dd-current').value = 70000;
        renderDrawdown();
    }
};

// ==========================================================================
// 4. NUMBER FORMATTING HELPERS
// ==========================================================================
function formatCurrency(num) {
    if (num === null || num === undefined || isNaN(num)) return state.currency === 'USD' ? '$0.00' : '฿0.00';
    const sym = state.currency === 'USD' ? '$' : '฿';
    const mult = state.currency === 'THB' ? 35.0 : 1.0;
    const converted = num * mult;
    return `${sym}${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatNum(num) {
    if (num === null || num === undefined || isNaN(num)) return '0';
    return Number(num).toLocaleString('en-US', { maximumFractionDigits: state.sharesMode === 'whole' ? 0 : 4 });
}

// Export Calculation Engine for unit tests
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CalculationEngine };
}
