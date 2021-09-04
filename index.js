const puppeteer = require('puppeteer');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const cerd = require('./config/artyom-david-project-67666103291e.json');
const fs = require('fs');
const axios = require('axios');

(async () => {
  const zip = '77584';

  // // Function that gets a random proxy from the proxy array
  // const GetRandomProxy = (proxyArr) => {
  //   return proxyArr[Math.floor(Math.random() * proxyArr.length)];
  // };

  // // Function that gets the proxy details from the list of proxies: host, port, username and password
  // const GetProxyDetails = (fileName, cb) => {
  //   fs.readFile(fileName, (err, data) => {
  //     if (err) throw err;
  //     const proxyArr = data.toString().split('\n');

  //     let randomProxy = GetRandomProxy(proxyArr);
  //     proxyArr.filter((proxy) => proxy !== randomProxy);
  //     randomProxy = randomProxy.split(':');

  //     const proxyDetails = {
  //       host: randomProxy[0],
  //       port: randomProxy[1],
  //       username: randomProxy[2],
  //       password: randomProxy[3],
  //     };
  //     return cb(proxyDetails);
  //   });
  // };

  // // Function that maekes a http request to the url that we want to
  // const makeHttpRequestProxied = async (
  //   url,
  //   { host, port, username, password }
  // ) => {
  //   const proxyOptions = {
  //     proxy: {
  //       protocol: 'http',
  //       host,
  //       port,
  //       auth: {
  //         username,
  //         password,
  //       },
  //     },
  //   };

  //   await axios.get(url, proxyOptions);
  // };

  // // Sending back the result of the proxy change and the site content
  // const proxyDetails = GetProxyDetails(
  //   'vips-residential.txt',
  //   (proxyDetails) => {
  //     console.log(proxyDetails);
  //     makeHttpRequestProxied('http://checkip.dyndns.org/', proxyDetails)
  //       .then((res) => console.log(res))
  //       .catch((err) => console.error(err));
  //   }
  // );

  // console.log(proxyDetails);

  // Checking the proxy at the f.vision site and changing the peoxy of the request
  const browser = await puppeteer.launch({
    executablePath:
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    headless: false,
    args: ['--proxy-server=http://zproxy.lum-superproxy.io:2255'],
  });

  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(0);
  await page.emulateTimezone('America/Louisville');
  await page.setViewport({ width: 1536, height: 864 });

  await page.goto('http://f.vision/', { waitUntil: 'networkidle2' });

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
