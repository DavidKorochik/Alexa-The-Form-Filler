const proxyDetails = require('./utils/proxy');
const puppeteer = require('puppeteer');
const { google } = require('googleapis');
const db = require('./db/mongoose');
const Views = require('./models/views');
require('dotenv').config();

(async () => {
  const zip = '77584'; // Zip code for the site
  let handler = false; // Page view handler
  let count = null; // Views counter
  const proxyFile = 'vips-residential-updated.txt'; // Proxy details file

  // Database connection function @ ./db/mongoose.js
  db();

  // Getting the proxy details @ ./utils/proxy.js
  const { host, port, username, password } = await proxyDetails(proxyFile);

  // Checking the proxy at the f.vision site and changing the peoxy of the request
  const browser = await puppeteer.launch({
    executablePath:
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    headless: false,
    // args: [`--proxy-server=http://${host}:${port}`], // Sending the bot request and changing the proxy
  });

  // Creating a new page
  const page = await browser.newPage();

  page.setDefaultNavigationTimeout(0);

  // Proxy authentication
  // page.authenticate({ username, password });

  // Creating 8 more bots so that the site will have 8 more viewers while the bot doing his work
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

  // Getting the current time in the next format: hours:minutes:seconds
  const date = new Date();
  const hours = date.getHours();
  const minutes =
    date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
  const seconds = date.getSeconds();

  const current = `${hours}:${minutes}:${seconds}`;

  // Condition that handles the deletion of the views document and inserts at 12AM the summary of the views
  if (current === '00:00:00' || current === '24:00:00') {
    const allViews = await Views.find({});
    const onlyViews = allViews.map((view) => view.view);
    const allViewsSumarry = onlyViews.reduce((acc, el) => acc + el, 8);
    await Views.deleteMany({});
    return await new Views({ totalViews: allViewsSumarry, deletedAt: current });
  }

  // Navigating to the form
  await page.goto('http://ausettler.com/test/form.php');

  // Executing the page view function
  await pageView();

  // Counting the views each execution
  count += 8;

  // Saving the view counter and the save time to the database
  const newView = await new Views({ view: count, viewdAt: current });
  await newView.save();

  // Typing the zip code in the form
  await page.type('#zipcode', zip);

  await page.keyboard.press('Enter');

  // Google sheets authentication
  const auth = new google.auth.GoogleAuth({
    keyFile: 'credentials.json',
    scopes: 'https://www.googleapis.com/auth/spreadsheets',
  });

  const client = await auth.getClient();

  const googleSheets = google.sheets({ version: 'v4', auth: client });

  // Sheet ID
  const id = '1i0b0HFk_FJ6OWjapYGANEc5NS25LGGrrdo_49hdqQMs';

  // Getting all the rows from the sheet
  const getRows = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId: id,
    range: 'Sheet1',
  });

  // Getting the values from the sheet
  const sheetsData = getRows.data.values;

  let newSheetsData = [];

  for (let i = 1; i < sheetsData.length; i++) {
    newSheetsData.push(sheetsData[i]);
  }

  const rowNumber = newSheetsData.length;

  // Picking a random field
  let random = Math.floor(Math.random() * rowNumber);

  let dataArr = newSheetsData[random];

  // Waiting for the selectors untill they pop up in the page
  const waitingForSelectors = async (arr) => {
    for (let i = 0; i < arr.length; i++) {
      await page.waitForSelector(arr[i]);
    }
  };

  try {
    await waitingForSelectors(['#fname', '#lname', '#email', '#phone']);

    // Filling the data in the form
    await page.type('#fname', dataArr[0]);
    await page.type('#lname', dataArr[1]);
    await page.type('#email', dataArr[2]);
    await page.type('#phone', dataArr[3]);

    await page.click('[type="submit"]');

    // Condition that checks if the field is filled with SUCCESS or FAIL
    if (!dataArr[4] || dataArr[4] === 'FAIL') {
      if (await page.$('#success')) {
        await googleSheets.spreadsheets.values.append({
          auth,
          spreadsheetId: id,
          range: `E${random + 2}`,
          valueInputOption: 'USER_ENTERED',
          resource: {
            values: [['SUCCESS']],
          },
        });
      } else {
        await googleSheets.spreadsheets.values.append({
          auth,
          spreadsheetId: id,
          range: `E${random + 2}`,
          valueInputOption: 'USER_ENTERED',
          resource: {
            values: [['FAIL']],
          },
        });
      }
    } else {
      process.exit(1);
    }
  } catch (err) {
    return console.error(err);
  }
})().catch((err) => console.log(err));
