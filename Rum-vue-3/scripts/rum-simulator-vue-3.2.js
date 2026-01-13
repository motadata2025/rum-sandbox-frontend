/**
 * RUM Simulator
 *
 * Just copy this single file to server and run:
 *   npm install puppeteer
 *   node rum-simulator.js --url=http://serverIP:8082 --users=5
 *
 * Or with PM2:
 *   pm2 start rum-simulator.js -- --url=http://serverIP:8082 --users=5
 */
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
  // New config for controlling page view frequency
  minPageViewInterval: parseInt(args.minPageViewInterval) || 2000,  // 7 seconds
  maxPageViewInterval: parseInt(args.maxPageViewInterval) || 7000, // 17 seconds
};

const ROUTES = [
  '/dashboard',
  '/tables',
  '/billing',
  '/virtual-reality',
  '/profile',
  '/rtl-page',
  '/sign-in',
  '/sign-up'
];

// Different browser user agents - SDK will detect these and set x-browser-name header
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

// Check if URL is accessible before starting
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
  // Create isolated browser context for each user (separate session/cookies/localStorage)
  const context = await browser.createBrowserContext();
  const page = await context.newPage();

  let pageViewCount = 0;
  const startTime = Date.now();

  // Intercept and log RUM requests
  await page.setRequestInterception(true);
  page.on('request', (request) => {
    const url = request.url();
    // Check if this is a RUM request (adjust the pattern based on your collector)
    if (url.includes('rum') || url.includes('intake')) {
      console.log(`\n📡 [User ${userId}] RUM REQUEST:`);
      console.log(`   URL: ${url}`);
      console.log(`   Method: ${request.method()}`);
      const postData = request.postData();
      if (postData) {
        console.log(`   Payload: ${postData.substring(0, 500)}${postData.length > 500 ? '...' : ''}`);
      }
    }
    request.continue();
  });

  // Pick a random browser for this user
  const browserInfo = USER_AGENTS[random(0, USER_AGENTS.length - 1)];
  await page.setUserAgent(browserInfo.ua);

  // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });

  // Log RUM requests (requests going to the collector)
  page.on('response', response => {
    const url = response.url();
    if (url.includes('rum') || url.includes('beacon')) {
      console.log(`[User ${userId}] ✅ RUM Response: ${response.status()} ${url}`);
    }
  });

  console.log(`[User ${userId}] Started (${browserInfo.name})`);

  try {
    // Initial page load - user opens the app for the first time
    const initialRoute = ROUTES[random(0, ROUTES.length - 1)];
    console.log(`[User ${userId}] 🚀 Initial load: ${initialRoute}`);
    await page.goto(`${CONFIG.url}${initialRoute}`, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Expose Vue Router for easier navigation
    await page.evaluate(() => {
      // Try to find and expose Vue Router
      setTimeout(() => {
        const app = document.querySelector('#app')?.__vueParentComponent;
        if (app) {
          const findRouter = (component) => {
            if (component?.appContext?.config?.globalProperties?.$router) {
              window.$router = component.appContext.config.globalProperties.$router;
              console.log('✅ Vue Router exposed to window.$router');
              return true;
            }
            return false;
          };
          findRouter(app);
        }
      }, 1000);
    });

    pageViewCount++;

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
    // Shorter initial dwell time
    await sleep(random(1000, 2000));

    while (true) {

      const actions = random(1, 3);
      for (let i = 0; i < actions; i++) {
        await performAction(page, userId, await page.url());
        await sleep(random(300, 1000));
      }

      // For Vue Router SPAs, we need to use evaluate to navigate
      const currentPath = await page.evaluate(() => window.location.pathname);

      // Get a different route
      const availableRoutes = ROUTES.filter(r => r !== currentPath);
      if (availableRoutes.length === 0) continue;

      const newRoute = availableRoutes[random(0, availableRoutes.length - 1)];

      try {
        console.log(`[User ${userId}] 🔄 Navigating: ${currentPath} → ${newRoute}`);

        // Method 1: Try clicking a link if available (more realistic)
        const linkClicked = await page.evaluate((route) => {
          const links = Array.from(document.querySelectorAll('a'));
          const link = links.find(a => {
            const href = a.getAttribute('href');
            return href && (href === route || href.endsWith(route));
          });

          if (link) {
            link.click();
            return true;
          }
          return false;
        }, newRoute);

        if (linkClicked) {
          // Wait for Vue Router to update
          await page.waitForFunction(
            (expectedPath) => window.location.pathname === expectedPath,
            { timeout: 5000 },
            newRoute
          ).catch(() => {});

          await sleep(1000); // Wait for page to settle

          pageViewCount++;
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
        } else {
          // Method 2: Direct navigation via Vue Router
          await page.evaluate((route) => {
            if (window.$router) {
              window.$router.push(route);
            } else if (window.__VUE_ROUTER__) {
              window.__VUE_ROUTER__.push(route);
            } else {
              // Fallback: manual navigation
              window.history.pushState({}, '', route);
              window.dispatchEvent(new PopStateEvent('popstate'));
            }
          }, newRoute);

          // Wait for route change
          await page.waitForFunction(
            (expectedPath) => window.location.pathname === expectedPath,
            { timeout: 5000 },
            newRoute
          ).catch(() => {});

          await sleep(800);

          pageViewCount++;
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
        }
      } catch (error) {
        console.log(`[User ${userId}] ⚠️ Navigation failed, trying goto: ${error.message}`);
        // Last resort: full page navigation
        await page.goto(`${CONFIG.url}${newRoute}`, {
          waitUntil: 'networkidle2',
          timeout: 30000
        }).catch(err => console.log(`[User ${userId}] ❌ Goto failed: ${err.message}`));

        pageViewCount++;
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
      }

      // Shorter sleep between navigations
      await sleep(random(CONFIG.minPageViewInterval, CONFIG.maxPageViewInterval));
    }
  } catch (error) {
    console.error(`[User ${userId}] Error: ${error.message}`);
    await context.close();  // Close the entire context (clears session)
    setTimeout(() => simulateUser(browser, userId), 2000);  // Restart with new session
  }
}

async function performAction(page, userId, route) {
  const actionType = random(1, 4);
  try {
    if (actionType === 1) {
      const els = await page.$$('button, a, .nav-link, .card, .btn');
      if (els.length) {
        await els[random(0, els.length - 1)].click().catch(() => {});
        console.log(`[User ${userId}] Clicked on ${route}`);
      }
    } else if (actionType === 2) {
      await page.evaluate(() => window.scrollBy(0, Math.random() * 500));
      console.log(`[User ${userId}] Scrolled on ${route}`);
    } else if (actionType === 3) {
      const els = await page.$$('.card, .nav-item, button');
      if (els.length) await els[random(0, els.length - 1)].hover().catch(() => {});
    } else {
      const inputs = await page.$$('input[type="text"], input[type="email"]');
      if (inputs.length) {
        await inputs[random(0, inputs.length - 1)].type('test@example.com', { delay: 30 }).catch(() => {});
        console.log(`[User ${userId}] Typed on ${route}`);
      }
    }
  } catch (e) {}
}

async function main() {
  console.log(`
╔════════════════════════════════════════╗
║     RUM Simulator - Standalone         ║
╠════════════════════════════════════════╣
║  URL:   ${CONFIG.url.padEnd(29)}║
║  Users: ${String(CONFIG.users).padEnd(29)}║
╚════════════════════════════════════════╝
`);
  // Check if URL is accessible before starting
  console.log(`🔍 Checking if ${CONFIG.url} is accessible...`);
  const urlCheck = await checkUrlAccessible(CONFIG.url);

  if (!urlCheck.accessible) {
    console.error(`\n❌ ERROR: Cannot connect to ${CONFIG.url}`);
    console.error(`   Reason: ${urlCheck.error}`);
    console.error(`\n   Please make sure: The application is running at ${CONFIG.url}`);
    process.exit(1);
  }

  console.log(`✅ URL is accessible (HTTP ${urlCheck.status}). Starting simulation...\n`);

  const browser = await puppeteer.launch({
    headless: true,  // Set to false to see the browser window
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
    protocolTimeout: 60000,  // Increase protocol timeout

  });

  for (let i = 1; i <= CONFIG.users; i++) {
    setTimeout(() => simulateUser(browser, i), random(0, 3000));
  }

  if (CONFIG.duration) {
    setTimeout(async () => {
      console.log('\n⏱️ Duration reached. Stopping...');
      await browser.close();
      process.exit(0);
    }, CONFIG.duration);
  }

  process.on('SIGINT', async () => {
    console.log('\n🛑 Stopping...');
    await browser.close();
    process.exit(0);
  });
}

main().catch(console.error);