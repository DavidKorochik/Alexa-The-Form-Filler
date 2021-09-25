const puppeteer = require('puppeteer');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const cerd = require('./config/artyom-david-project-67666103291e.json');
const proxyDetails = require('./utils/proxy');

(async () => {
  const zip = '77584';

  const { host, port, username, password } = await proxyDetails(
    'vips-residential-updated.txt'
  );

  // Checking the proxy at the f.vision site and changing the peoxy of the request
  const browser = await puppeteer.launch({
    executablePath:
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    headless: false,
    args: [`--proxy-server=http://${host}:${port}`],
  });

  const page = await browser.newPage();

  await page.authenticate({ username, password });

  page.setDefaultNavigationTimeout(0);

  await page.setViewport({ width: 1536, height: 864 });

  await page.goto('http://f.vision/');

  // await page.emulateTimezone('America/Louisville');

  await page.$eval('#start-button', (submit) => submit.click());

  await page.waitForSelector('.danger');

  const el = await page.$('[data-func="anonymizer_type"]');
  const className = await (await el.getProperty('className')).jsonValue();

  // Navigating to the liberty site
  className == 'col-sm-6 col-xs-6 nav-link nav-parts danger'
    ? process.exit(1)
    : await page.goto('https://www.libertyhomeguard.com/', {
        waitUntil: 'networkidle2',
      });

  // Filling in the zip code
  await page.type('#zipcode_start', zip);
  await page.keyboard.press('Enter');

  // Google sheets initialization
  const doc = new GoogleSpreadsheet(
    '1i0b0HFk_FJ6OWjapYGANEc5NS25LGGrrdo_49hdqQMs'
  );

  await doc.useServiceAccountAuth({
    client_email: cerd.client_email,
    private_key: cerd.private_key,
  });

  // Getting the data from the google sheets
  await doc.loadInfo();

  const sheet = doc.sheetsByIndex[0];
  const rows = await sheet.getRows();
  const rowNumber = sheet.rowCount;

  console.log(rowNumber);

  const random = Math.floor(Math.random() * rowNumber);

  const waitingForSelectors = async (arr) => {
    for (let i = 0; i < arr.length; i++) {
      await page.waitForSelector(arr[i]);
    }
  };

  const fillingTheForm = async (
    arr,
    { first_name, last_name, email, phone }
  ) => {
    for (let i = 0; i < arr.length; i++) {
      switch (arr[i]) {
        case '#f_name':
          await page.type(arr[i], first_name);
          break;
        case '#l_name':
          await page.type(arr[i], last_name);
          break;
        case '#email_id':
          await page.type(arr[i], email);
          break;
        case '#phone_number':
          await page.type(arr[i], phone);
          break;
      }
    }
  };

  // Inserting the data from google sheets to the form
  try {
    await waitingForSelectors([
      '#f_name',
      '#l_name',
      '#email_id',
      '#phone_number',
    ]);

    await fillingTheForm(
      ['#f_name', '#l_name', '#email_id', '#phone_number'],
      rows[random]
    );
  } catch (err) {
    throw new Error(err);
  }

  // Clicking continue
  await page.click('#steponebtn');

  if (
    page.url !== 'https://www.libertyhomeguard.com/checkout/' &&
    page.url !== 'https://www.libertyhomeguard.com/'
  ) {
    rows[random].status = 'SUCCEED';
    rows[random].save();
  } else {
    rows[random].status = 'FAILED';
    rows[random].save();
  }

  // browser.close();
})().catch((e) => console.error(e));
