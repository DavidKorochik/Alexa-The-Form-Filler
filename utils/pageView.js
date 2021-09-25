// Creating another bot that will send 8 more requests to the form that we are filling so that "8 more people" will watch the form filler bot
const pageView = async (browser, site) => {
  for (let i = 1; i < 9; i++) {
    let pageToView = await browser.newPage();
    await pageToView.goto(site);
    setTimeout(async () => {
      await browser.close();
    }, 30000);
  }
};

module.exports = pageView;
