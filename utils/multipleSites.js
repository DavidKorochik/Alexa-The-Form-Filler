// Array of the sites we want to send the request to
const sites = [
  'https://www.facebook.com/',
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
  });
};

module.exports = openSites;
