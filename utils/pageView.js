const pageView = async (browser) => {
  for (let i = 1; i < 9; i++) {
    let pageToView = await browser.newPage();
    await pageToView.goto('http://ausettler.com/test/form.php');
    setTimeout(async () => {
      await browser.close();
    }, 30000);
  }
};

module.exports = pageView;
