const { chromium } = require('playwright');
const TurndownService = require('turndown');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://www.hellointerview.com';
const START_URL = 'https://www.hellointerview.com/learn/system-design/in-a-hurry/introduction';
const OUTPUT_DIR = path.join(__dirname, '..', 'hellointerview-system-design');

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced'
});

async function scrape() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log(`Navigating to ${START_URL}...`);
  await page.goto(START_URL, { waitUntil: 'domcontentloaded' });

  // Extract all links that fall under system-design
  console.log('Extracting links...');
  const links = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll('a'));
    const uniqueLinks = new Set();
    
    anchors.forEach(a => {
      const href = a.getAttribute('href');
      if (href && href.startsWith('/learn/system-design/')) {
        uniqueLinks.add(href);
      }
    });
    return Array.from(uniqueLinks);
  });

  console.log(`Found ${links.length} system design links.`);

  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    const fullUrl = BASE_URL + link;
    console.log(`[${i + 1}/${links.length}] Scrapping: ${fullUrl}`);
    
    try {
      await page.goto(fullUrl, { waitUntil: 'domcontentloaded' });
      // Wait for main content to load if necessary
      await page.waitForTimeout(2000); // Simple wait to ensure JS renders content
      
      const pageData = await page.evaluate(() => {
        // Try to get the main content area to avoid nav bars, etc.
        const main = document.querySelector('main') || document.querySelector('article') || document.body;
        
        // Remove script and style tags
        const elementsToRemove = main.querySelectorAll('script, style, nav, footer, header, iframe');
        elementsToRemove.forEach(el => el.remove());

        return {
          title: document.title,
          html: main.innerHTML
        };
      });

      const markdown = turndownService.turndown(pageData.html);
      
      // Determine filename from URL path
      const urlPath = new URL(fullUrl).pathname;
      const parts = urlPath.split('/').filter(Boolean);
      let filename = parts[parts.length - 1] || 'index';
      // Append parent category to name to avoid collisions
      if (parts.length > 2) {
          filename = `${parts[parts.length - 2]}-${filename}`;
      }
      filename += '.md';
      
      const content = `# ${pageData.title}\n\nURL: ${fullUrl}\n\n${markdown}`;
      
      const filePath = path.join(OUTPUT_DIR, filename);
      fs.writeFileSync(filePath, content);
      console.log(`Saved to ${filename}`);
      
    } catch (err) {
      console.error(`Error scraping ${fullUrl}:`, err.message);
    }
  }

  await browser.close();
  console.log('Done!');
}

scrape().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
