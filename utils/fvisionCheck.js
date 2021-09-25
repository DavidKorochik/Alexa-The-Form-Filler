const fvisionCheck = async (page) => {
  await page.goto('http://f.vision/'); // Navigating to the f.vision site to check if there is any proxy error

  await page.$eval('#start-button', (submit) => submit.click()); // Clicking on the start button in the bottom to start the checking

  await page.waitForSelector('.danger');

  // Getting the className that popped up in the proxy field
  const el = await page.$('[data-func="anonymizer_type"]');
  const className = await (await el.getProperty('className')).jsonValue();

  // Navigating to the liberty site
  className == 'col-sm-6 col-xs-6 nav-link nav-parts danger'
    ? process.exit(1)
    : await page.goto('http://ausettler.com/test/form.php', {
        waitUntil: 'networkidle2',
      });
};

module.exports = fvisionCheck;
