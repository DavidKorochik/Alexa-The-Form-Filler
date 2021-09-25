const puppeteer = require('puppeteer');

(async () => {
  const sites = [
    'https://www.facebook.com/',
    'https://www.instagram.com/?hl=en',
    'https://sequelize.org/',
    'https://github.com/',
    'https://medium.com/',
  ];

  const browser = await puppeteer.launch({ headless: false });

  sites.forEach(async (site) => {
    const newPage = await browser.newPage();
    await newPage.goto(site);
  });
})().catch((err) => console.error(err));
