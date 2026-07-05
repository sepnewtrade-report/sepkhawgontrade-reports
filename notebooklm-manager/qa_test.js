const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function runQaTest() {
  console.log('🚀 Starting Automated UI QA Test Suite...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Track console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`⚠️ Browser Console Error (Logged): ${msg.text()}`);
    }
  });
  
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push(error.message);
    console.log(`❌ Page Crash/Runtime Error: ${error.message}`);
  });

  page.on('requestfailed', request => {
    console.log(`❌ Request Failed: ${request.url()} - Error: ${request.failure() ? request.failure().errorText : 'Unknown'}`);
  });

  try {
    console.log('📡 Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 15000 });
    
    console.log('🔍 Verifying page title and header...');
    const pageTitle = await page.title();
    console.log(`✓ Page Title: "${pageTitle}"`);
    
    // Check if the manager tab exists
    const hasManagerTab = await page.$('button[data-tab="manager-tab"]');
    if (!hasManagerTab) {
      throw new Error('Manager Tab button not found in DOM!');
    }
    console.log('✓ Found Manager Tab button.');

    // Check if the market trends tab exists
    const hasTrendsTab = await page.$('button[data-tab="market-trends-tab"]');
    if (!hasTrendsTab) {
      throw new Error('US Market Trends / Whale Tracker Tab button not found!');
    }
    console.log('✓ Found US Market Trends / Whale Tracker Tab button.');

    // Switch to US Market Trends Tab
    console.log('🖱️ Switching to US Market Trends & Whale Tracker Tab...');
    await page.click('button[data-tab="market-trends-tab"]');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Switch to Whale Tracker sub-tab
    console.log('🖱️ Switching to Whale Tracker sub-tab...');
    await page.waitForSelector('button[data-sub-tab="whale-tracker-view"]', { visible: true, timeout: 5000 });
    await page.click('button[data-sub-tab="whale-tracker-view"]');
    
    // Wait for the dashboard grid to load and become visible
    console.log('⏳ Waiting for Whale Dashboard Grid to load and render...');
    await page.waitForSelector('#whales-dashboard-grid', { visible: true, timeout: 15000 });
    console.log('✓ Whale Dashboard Grid is visible.');
    
    // Check if the Whales dashboard toggle bar exists
    const hasWhaleOverview = await page.$('#btn-whale-show-overview');
    if (!hasWhaleOverview) {
      throw new Error('Whale Overview toggle button (#btn-whale-show-overview) not found!');
    }
    console.log('✓ Found Whale Tracker Overview toggle.');

    // Click Individual Whale tab toggle
    console.log('🖱️ Switching to Individual Whale Portfolios panel...');
    await page.waitForSelector('#btn-whale-show-individual', { visible: true, timeout: 5000 });
    await page.click('#btn-whale-show-individual');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if individual select dropdown exists
    const hasDropdown = await page.$('#whale-dropdown');
    if (!hasDropdown) {
      throw new Error('Whale dropdown selector (#whale-dropdown) not found!');
    }
    console.log('✓ Found Whale selector dropdown.');

    // Capture visual verification screenshot
    const screenshotPath = path.join(__dirname, 'qa_test_result.png');
    console.log(`📸 Saving verification screenshot to ${screenshotPath}...`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    
    if (pageErrors.length > 0) {
      throw new Error(`Test failed with ${pageErrors.length} page runtime error(s) during execution.`);
    }

    console.log('\n=========================================');
    console.log('🎉 Automated UI QA Test completed: SUCCESS');
    console.log('=========================================');
    await browser.close();
    process.exit(0);
  } catch (error) {
    console.error('\n=========================================');
    console.error(`❌ QA Test Suite FAILED: ${error.message}`);
    console.error('=========================================');
    await browser.close();
    process.exit(1);
  }
}

runQaTest();
