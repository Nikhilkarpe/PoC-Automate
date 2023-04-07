const puppeteer = require('puppeteer');
const fs = require('fs');

// Path to the file containing URLs
const urlsFilePath = './urls.txt';

// Output directory for screenshots
const outputDir = './screenshots';

// Create the output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Read the URLs from the file
const urls = fs.readFileSync(urlsFilePath, 'utf8').split('\n').filter(url => url.trim() !== '');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Set viewport to a size that excludes the address bar
  await page.setViewport({
    width: 1920,
    height: 1000, // adjust this height to exclude the address bar
    deviceScaleFactor: 1,
  });

  // Loop through each URL and take a screenshot
  for (const url of urls) {
    await page.goto(url, { waitUntil: 'networkidle2' });
    const filename = url.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.png';

    // Add the URL to the top of the screenshot
    await page.evaluate(() => {
      const url = window.location.href;
      const div = document.createElement('div');
      div.style.cssText = 'position: fixed; top: 0; left: 0; background: white; padding: 10px; z-index: 9999;';
      div.textContent = url;
      document.body.insertBefore(div, document.body.firstChild);
    });

    // Take a screenshot of the full page
    await page.screenshot({
      path: `${outputDir}/${filename}`,
      fullPage: true,
    });
  }

  await browser.close();
})();
