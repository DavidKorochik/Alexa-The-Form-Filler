const proxyDetails = require('./utils/proxy');
const puppeteer = require('puppeteer');
const Views = require('./models/views');
const db = require('./db/mongoose');
const viewsReset = require('./utils/viewsReset');
const googleSheetsFiller = require('./utils/googleSheets');
// const fvisionCheck = require('./utils/fvisionCheck');
const openSites = require('./utils/multipleSites');
// const pageSettings = require('./utils/pageSettings');
const current = require('./utils/currentTime');
const pageView = require('./utils/pageView');
require('dotenv').config();

(async () => {
  const zip = process.env.ZIP; // Zip code for the site
  let count = null; // Views counter
  // const proxyFile = process.env.PROXY_FILE; // Proxy details file

  // Database connection function @ ./db/mongoose.js
  db();

  // Getting the proxy details @ ./utils/proxy.js
  // const { host, port, username, password } = await proxyDetails(proxyFile);

  // Checking the proxy at the f.vision site and changing the peoxy of the request
  const browser = await puppeteer.launch({
    executablePath:
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    headless: false,
    // args: [`--proxy-server=http://${host}:${port}`], // Sending the bot request and changing the proxy
  });

  // Creating a new page
  const page = await browser.newPage();

  // Applying the bot settings when we are sending a request with the bot @ ./utils/pageSettings.js
  // await pageSettings(page, username, password);

  // Navigating to the f.vision site to check if there is any proxy error, and if there is we exit the bot and if there is no proxy error we proceed with the form filler bot @ ./utils/fvisionCheck.js
  // await fvisionCheck(page);

  // Condition that handles the deletion of the views document and inserts at 12AM the summary of the views
  if (current === '00:00:00' || current === '24:00:00') {
    //Executing the views reset function @ ./utils/viewsRest.js
    await viewsReset();
  }

  // Visit all sites synchronously @ ./utils/multipleSites.js
  await openSites(browser);

  // Navigating to the form
  await page.goto('http://ausettler.com/test/form.php');

  // Counting the views each execution
  count += 8;

  // Saving the view counter and the save time to the database
  const newView = await new Views({ view: count, viewdAt: current });
  await newView.save();

  // Typing the zip code in the form
  await page.type('#zipcode', zip);

  // Pressing the Enter button to continue to the form filler
  await page.keyboard.press('Enter');

  // Filling the form with the data from the google sheet and inserting the SUCCESS or FAIL word due to the registration @ ./utils/googleSheets.js
  await googleSheetsFiller(page);
})().catch((err) => console.log(err));
