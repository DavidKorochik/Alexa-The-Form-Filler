const pageSettings = async (page, username, password) => {
  page.setDefaultNavigationTimeout(0);

  await page.setViewport({ width: 1536, height: 864 }); // Changing the resolution of the chrome tab

  await page.authenticate({ username, password }); // Page authentication
};

module.exports = pageSettings;
