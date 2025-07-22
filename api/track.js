import { chromium } from 'playwright';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { container, booking, bol } = req.body;

  // For now, only use container number for ZIM
  if (!container) {
    res.status(400).json({ error: 'Container number is required' });
    return;
  }

  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto('https://www.zim.com/tools/track-a-shipment');

    // Fill the container number
    await page.fill('input[name="containerNumber"]', container);

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for results (adjust selector as needed)
    await page.waitForSelector('.tracking-result, .tracking-details, .track-result-table', { timeout: 15000 });

    // Extract tracking data (adjust selectors as needed)
    const data = await page.evaluate(() => {
      // You may need to adjust these selectors based on the actual ZIM result page structure
      const status = document.querySelector('.tracking-result .status, .tracking-details .status, .track-result-table .status')?.innerText || '';
      const lastLocation = document.querySelector('.tracking-result .location, .tracking-details .location, .track-result-table .location')?.innerText || '';
      const eta = document.querySelector('.tracking-result .eta, .tracking-details .eta, .track-result-table .eta')?.innerText || '';
      return { status, lastLocation, eta };
    });

    await browser.close();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}