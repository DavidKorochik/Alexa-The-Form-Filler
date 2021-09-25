const pageView = require('../utils/pageView');

// Array of the sites we want to send the request to
const sites = [
  'http://ausettler.com/test/form.php',
  'https://www.instagram.com/?hl=en',
  'https://sequelize.org/',
  'https://github.com/',
  'https://medium.com/',
];

// Navigating to the sites
const openSites = async (browser) => {
  sites.forEach(async (site) => {
    const newPage = await browser.newPage();
    await newPage.goto(site);

    // Executing the page view function @ ./utils/pageViews.js
    await pageView(browser, site);
  });
};

module.exports = openSites;
