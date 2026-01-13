process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const puppeteer = require('puppeteer');
const http = require('http');
const https = require('https');

// Parse arguments
const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, value] = arg.replace('--', '').split('=');
  acc[key] = value;
  return acc;
}, {});

const CONFIG = {
  url: args.url ,
  users: parseInt(args.users) || 5,
  duration: args.duration ? parseInt(args.duration) * 1000 : null,
  minPageViewInterval: parseInt(args.minPageViewInterval) || 7000,
  maxPageViewInterval: parseInt(args.maxPageViewInterval) || 17000,
};

const ROUTES = ['/', '/about', '/contact', '/demo'];

const USER_AGENTS = [
  { name: 'Chrome Windows', ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
  { name: 'Chrome Linux', ua: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36' },
  { name: 'Firefox Windows', ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0' },
  { name: 'Firefox Linux', ua: 'Mozilla/5.0 (X11; Linux x86_64; rv:143.0) Gecko/20100101 Firefox/143.0' },
  { name: 'Safari Mac', ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15' },
  { name: 'Edge Windows', ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0' },
  { name: 'Opera Windows', ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 OPR/125.0.0.0' },
];

const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function checkUrlAccessible(url) {
  return new Promise((resolve) => {
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === 'https:' ? https : http;

    const req = client.get(url, { timeout: 10000 }, (res) => {
      resolve({ accessible: true, status: res.statusCode });
    });

    req.on('error', (err) => {
      resolve({ accessible: false, error: err.code || err.message });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ accessible: false, error: 'TIMEOUT' });
    });
  });
}

async function simulateUser(browser, userId) {
  let context = null;
  let page = null;

  try {
    console.log(`[User ${userId}] 🔧 Creating browser context...`);
    context = await browser.createBrowserContext();
    page = await context.newPage();

    let pageViewCount = 0;
    const startTime = Date.now();

    // Pick a random browser
    const browserInfo = USER_AGENTS[random(0, USER_AGENTS.length - 1)];
    await page.setUserAgent(browserInfo.ua);
    await page.setViewport({ width: 1920, height: 1080 });

    console.log(`[User ${userId}] Started (${browserInfo.name})`);

    // Log console messages from the page
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('RUM') || text.includes('error') || text.includes('Error')) {
        console.log(`[User ${userId}] 🖥️  ${msg.type()}: ${text}`);
      }
    });

    // Log page errors
    page.on('pageerror', error => {
      console.log(`[User ${userId}] ❌ Page error: ${error.message}`);
    });

    // Monitor RUM requests
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('rum')) {
      console.log(`[User ${userId}] ✅ RUM Response: ${response.status()} ${url}`);
      }
    });

    // Initial page load - start with home page to be safe
    const initialRoute = '/';
    const targetUrl = `${CONFIG.url}${initialRoute}`;
    console.log(`[User ${userId}] 🚀 Loading: ${targetUrl}`);

    await page.goto(targetUrl, {
      waitUntil: 'networkidle0',
      timeout: 40000
    });

    console.log(`[User ${userId}] ✅ Page loaded`);
    
    // Wait for Next.js to hydrate
    await sleep(2500);

    pageViewCount++;
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);

    // Main loop
    while (true) {
      const currentPath = await page.evaluate(() => window.location.pathname);
      
      // Perform more actions on demo page since it has interactive buttons
      const numActions = currentPath === '/demo' ? random(5, 8) : random(2, 5);
      
      console.log(`[User ${userId}] 🎯 Performing ${numActions} actions on ${currentPath}`);
      
      for (let i = 0; i < numActions; i++) {
        await performAction(page, userId, currentPath);
        await sleep(random(800, 2000));
      }

      // Navigate to a different page
      const availableRoutes = ROUTES.filter(r => r !== currentPath);
      
      if (availableRoutes.length === 0) {
        await sleep(2000);
        continue;
      }

      const newRoute = availableRoutes[random(0, availableRoutes.length - 1)];
      console.log(`[User ${userId}] 🔄 Navigating: ${currentPath} → ${newRoute}`);

      // Try to click a link first (most realistic for Next.js)
      const navigated = await page.evaluate((targetRoute) => {
        const links = Array.from(document.querySelectorAll('a[href]'));
        const matchingLink = links.find(link => {
          const href = link.getAttribute('href');
          return href === targetRoute || href?.endsWith(targetRoute);
        });

        if (matchingLink) {
          console.log(`Clicking link to: ${targetRoute}`);
          matchingLink.click();
          return true;
        }
        return false;
      }, newRoute);

      if (navigated) {
        // Wait for Next.js navigation
        await sleep(1500);
        
        // Verify navigation happened
        const newPath = await page.evaluate(() => window.location.pathname);
        if (newPath === newRoute) {
          pageViewCount++;
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
        } else {
          console.log(`[User ${userId}] ⚠️  Navigation didn't complete (at ${newPath})`);
        }
      } else {
        // Fallback: direct navigation
        console.log(`[User ${userId}] 🔧 No link found, using goto`);
        await page.goto(`${CONFIG.url}${newRoute}`, {
          waitUntil: 'networkidle0',
          timeout: 30000
        });
        
        await sleep(1000);
        
        pageViewCount++;
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
      }

      // Wait before next navigation
      await sleep(random(CONFIG.minPageViewInterval, CONFIG.maxPageViewInterval));
    }

  } catch (error) {
    
    // Clean up
    try {
      if (page && !page.isClosed()) {
        await page.close();
      }
      if (context) {
        await context.close();
      }
    } catch (e) {
      // Ignore cleanup errors
    }

  }
}

async function performAction(page, userId, currentPath) {
  try {
    const actionType = random(1, 5);
    
    if (actionType === 1) {
      // Scroll
      await page.evaluate(() => {
        window.scrollBy({
          top: Math.random() * 300 + 100,
          behavior: 'smooth'
        });
      });
      console.log(`[User ${userId}] 📜 Scrolled`);
    } 
    else if (actionType === 2 || actionType === 3) {
      // Click interactive buttons (not navigation links)
      // Look for buttons that might trigger actions, errors, forms, etc.
      const clicked = await page.evaluate(() => {
        // Find buttons that are NOT navigation links
        const buttons = Array.from(document.querySelectorAll('button:not([type="submit"])'));
        
        // Filter out buttons that might be navigation (contain links or have href-like text)
        const actionButtons = buttons.filter(btn => {
          const text = btn.textContent?.toLowerCase() || '';
          const isActionButton = 
            text.includes('trigger') ||
            text.includes('error') ||
            text.includes('submit') ||
            text.includes('send') ||
            text.includes('try') ||
            text.includes('test') ||
            text.includes('click') ||
            text.includes('demo') ||
            btn.getAttribute('onclick') ||
            btn.getAttribute('data-action');
          
          // Avoid navigation buttons
          const isNavButton = 
            text.includes('home') ||
            text.includes('about') ||
            text.includes('contact') ||
            text.includes('back') ||
            btn.closest('nav') !== null;
          
          return isActionButton && !isNavButton;
        });

        if (actionButtons.length > 0) {
          const randomBtn = actionButtons[Math.floor(Math.random() * actionButtons.length)];
          const btnText = randomBtn.textContent?.trim() || 'Unknown';
          console.log(`Clicking action button: "${btnText}"`);
          randomBtn.click();
          return btnText;
        }
        return null;
      });

      if (clicked) {
        console.log(`[User ${userId}] 🔘 Clicked button: "${clicked}"`);
        await sleep(500); // Wait for any modal/toast/effect
      }
    }
    else if (actionType === 4) {
      // Fill form fields if present
      const filled = await page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input[type="text"], input[type="email"], textarea'));
        if (inputs.length > 0) {
          const input = inputs[Math.floor(Math.random() * inputs.length)];
          const type = input.getAttribute('type') || input.tagName.toLowerCase();
          
          if (type === 'email' || input.name?.includes('email')) {
            input.value = 'test' + Math.floor(Math.random() * 1000) + '@example.com';
          } else if (type === 'text' || type === 'textarea') {
            input.value = 'Test message ' + Math.floor(Math.random() * 1000);
          }
          
          // Trigger input event for React
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          
          return input.name || input.placeholder || 'form field';
        }
        return null;
      });

      if (filled) {
        console.log(`[User ${userId}] ⌨️  Filled: ${filled}`);
      }
    }
    else {
      // Hover over elements
      const buttons = await page.$$('button, a, [role="button"]');
      if (buttons.length > 0) {
        const btn = buttons[random(0, buttons.length - 1)];
        await btn.hover();
        console.log(`[User ${userId}] 👀 Hovered element`);
      }
    }
  } catch (e) {
    // Ignore action errors silently
  }
}

async function main() {
  console.log(`
╔════════════════════════════════════════╗
║   RUM Simulator - Next.js Enhanced     ║
╠════════════════════════════════════════╣
║  URL:   ${CONFIG.url.padEnd(29)}║
║  Users: ${String(CONFIG.users).padEnd(29)}║
╚════════════════════════════════════════╝
`);


  const urlCheck = await checkUrlAccessible(CONFIG.url);

  if (!urlCheck.accessible) {
    console.error(`\n❌ ERROR: Cannot connect to ${CONFIG.url}`);
    console.error(`   Reason: ${urlCheck.error}`);
    console.error(`\n   Please make sure: The application is running at ${CONFIG.url}`);
    process.exit(1);
  }

  console.log('🚀 Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--ignore-certificate-errors',
      '--allow-insecure-localhost',

      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-software-rasterizer',
      '--disable-extensions',
      '--no-first-run',
      '--no-zygote',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-breakpad',
      '--disable-component-extensions-with-background-pages',
      '--disable-features=TranslateUI,BlinkGenPropertyTrees',
      '--disable-ipc-flooding-protection',
      '--disable-renderer-backgrounding',
      '--force-color-profile=srgb',
      '--metrics-recording-only',
      '--mute-audio',
      '--no-default-browser-check',
      '--disable-hang-monitor',
      '--disable-prompt-on-repost',
      '--disable-sync',
      '--disk-cache-size=33554432',
      '--media-cache-size=33554432',
      '--disable-crash-reporter'
    ],
    ignoreHTTPSErrors: true,
  });

  console.log('✅ Browser launched\n');

  // Start users with staggered delays
  for (let i = 1; i <= CONFIG.users; i++) {
    const delay = i * 2000; // 2 seconds apart
    console.log(`   Starting User ${i} in ${delay}ms`);
    setTimeout(() => simulateUser(browser, i), delay);
  }

  if (CONFIG.duration) {
    setTimeout(async () => {
      console.log('\n⏱️  Duration reached. Stopping...');
      await browser.close();
      process.exit(0);
    }, CONFIG.duration);
  } else {
    console.log('\n💡 Press Ctrl+C to stop\n');
  }

  process.on('SIGINT', async () => {
    console.log('\n🛑 Stopping...');
    try {
      await browser.close();
    } catch (e) {
      // Ignore
    }
    process.exit(0);
  });
}

main().catch(err => {
  console.error;
  process.exit(1);
});