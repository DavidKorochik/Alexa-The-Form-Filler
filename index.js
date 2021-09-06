const puppeteer = require('puppeteer');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const cerd = require('./config/artyom-david-project-67666103291e.json');
const util = require('util');
const fs = require('fs');

(async () => {
  const zip = '77584';

  // Get random proxy from the proxy array
  const getRandomProxy = (proxyArr) => {
    return proxyArr[Math.floor(Math.random() * proxyArr.length)];
  };

  // Get the proxy details from the random proxy that got selected
  const readProxyFilePromise = util.promisify(fs.readFile);

  const proxyDetails = async (fileName) => {
    const proxyFileData = await readProxyFilePromise(fileName);
    const proxyArr = proxyFileData.toString().split('\n');

    let randomProxy = getRandomProxy(proxyArr);
    proxyArr.filter((proxy) => proxy !== randomProxy);
    randomProxy = randomProxy.split(':');

    const proxyDetails = {
      host: randomProxy[0],
      port: randomProxy[1],
      username: randomProxy[2],
      password: randomProxy[3],
    };

    return proxyDetails;
  };

  const { host, port, username, password } = await proxyDetails(
    'vips-residential2.txt'
  );

  // Checking the proxy at the f.vision site and changing the peoxy of the request
  const browser = await puppeteer.launch({
    executablePath:
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    headless: false,
    args: [`--proxy-server=http://${host}:${port}`],
  });

  const page = await browser.newPage();

  // await page.authenticate({ username, password }); - The problem with the app is here

  page.setDefaultNavigationTimeout(0);

  await page.setViewport({ width: 1536, height: 864 });

  await page.goto('http://f.vision/', { waitUntil: 'networkidle2' });

  // await page.emulateTimezone('America/Louisville');

  await page.$eval('#start-button', (submit) => submit.click());

  await page.waitForSelector('.danger');

  const el = await page.$('[data-func="anonymizer_type"]');
  const className = await (await el.getProperty('className')).jsonValue();

  // Navigating to the liberty site
  className == 'col-sm-6 col-xs-6 nav-link nav-parts danger'
    ? await page.goto('https://www.libertyhomeguard.com/', {
        waitUntil: 'networkidle2',
      })
    : process.exit(1);

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

  const random = Math.floor(Math.random() * 3);

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
  // await page.click('#steponebtn');
})().catch((e) => console.error(e));
