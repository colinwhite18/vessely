import { chromium } from 'playwright';

export async function trackZIM(containerNumber) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://www.zim.com/tools/track-a-shipment');

  // Enter container number
  await page.fill('input[name="containerNumber"]', containerNumber);

  // Submit the form
  await page.click('button[type="submit"]');

  // Wait for results to load (adjust selector as needed)
  await page.waitForSelector('.tracking-result');

  // Extract tracking data (adjust selectors as needed)
  const data = await page.evaluate(() => {
    const status = document.querySelector('.tracking-result .status')?.innerText || '';
    const lastLocation = document.querySelector('.tracking-result .location')?.innerText || '';
    const eta = document.querySelector('.tracking-result .eta')?.innerText || '';
    return { status, lastLocation, eta };
  });

  await browser.close();
  return data;
}

// Modular stub for other SSLs
export async function trackContainer(ssl, containerNumber) {
  switch (ssl.toLowerCase()) {
    case 'zim':
      return await trackZIM(containerNumber);
    // case 'anl':
    //   // All inputs on same page
    //   break;
    // case 'cosco':
    //   // Must select container # from dropdown
    //   break;
    // case 'evergreen':
    //   // Must select circle for input option
    //   break;
    // ... add more SSLs as needed
    default:
      throw new Error('SSL not supported yet');
  }
}

// Example usage:
if (process.argv[2]) {
  trackContainer('zim', process.argv[2]).then(console.log).catch(console.error);
} else {
  console.log('Usage: node index.js <containerNumber>');
}