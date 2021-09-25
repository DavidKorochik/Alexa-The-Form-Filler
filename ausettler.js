const puppeteer = require('puppeteer');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const cerd = require('./config/artyom-david-project-67666103291e.json');

// const proxyDetails = require('./utils/proxy');

(async () => {
  const zip = '77584';
  let handler = false;

  // Checking the proxy at the f.vision site and changing the peoxy of the request
  const browser = await puppeteer.launch({
    executablePath:
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    headless: false,
  });

  const page = await browser.newPage();

  page.setDefaultNavigationTimeout(0);

  // let count = 0; // Count the number of entries to the site in a day

  const pageView = async () => {
    for (let i = 1; i < 9; i++) {
      let pageToView = await browser.newPage();
      await pageToView.goto('http://ausettler.com/test/form.php');
      setTimeout(async () => {
        await browser.close();
      }, 30000);
    }
    handler = true;
  };

  await pageView();

  await page.goto('http://ausettler.com/test/form.php');

  await page.type('#zipcode', zip);

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

  //   console.log(rows[1].status); // undefined if it is empty

  //   console.log(rowNumber);

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
        case '#fname':
          await page.type(arr[i], first_name);
          break;
        case '#lname':
          await page.type(arr[i], last_name);
          break;
        case '#email':
          await page.type(arr[i], email);
          break;
        case '#phone':
          await page.type(arr[i], phone);
          break;
      }
    }
  };

  // Inserting the data from google sheets to the form
  const dataArr = rows[random]._rawData;

  const tabs = await browser.pages().length;
  console.log(tabs);

  let usedArray = [];
  usedArray.push(rows[random]);

  if (dataArr[4] === undefined) {
    await waitingForSelectors(['#fname', '#lname', '#email', '#phone']);

    await fillingTheForm(
      ['#fname', '#lname', '#email', '#phone'],
      rows[random]
    );

    await page.click('[type="submit"]');

    if (await page.$('#success')) {
      dataArr[4] = 'SUCCESS';
      rows[random].save();
    } else {
      dataArr[4] = 'FAIL';
      rows[random].save();
    }
  } else if (dataArr[4] === 'SUCCESS' || dataArr[4] === 'FAIL') {
    console.error('User has been registered already');
  } else if (dataArr[4] !== undefined) {
    console.error('User has been registered');
  } else if (dataArr === undefined) {
    console.error('User already with status');
  }

  if (handler) {
    setTimeout(async () => {
      await browser.close();
    }, 10000);
  }
})().catch((e) => console.error(e));
