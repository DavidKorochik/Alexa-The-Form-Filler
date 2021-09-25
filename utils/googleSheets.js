const { google } = require('googleapis');

const googleSheetsFiller = async (page) => {
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

  //   Waiting for the selectors untill they pop up in the page
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
};

module.exports = googleSheetsFiller;
