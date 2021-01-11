import { Header } from './Header';
import { UserSubmission } from './UserSubmission';

const onFormSubmit = (event: GoogleAppsScript.Events.SheetsOnFormSubmit) => {
  const sheet = SpreadsheetApp.getActiveSheet();
  const header = Header.fieldToIndex(sheet, requiredFields);
  Logger.log('header in onFormSubmit: ', header);
  const rowIndex = event.range.getLastRow();

  // can grab zeroeth element only because onformsubmit is only ever one row
  const eventRow = sheet.getRange(rowIndex, 1, 1, sheet.getDataRange().getLastColumn()).getValues()[0];

  const submission = new UserSubmission(header, rowIndex, sheet);

  submission.sendConfirmationEmail();
  submission.postToLob();
};

const retryFailedPost = () => {
  const sheet = SpreadsheetApp.getActiveSheet();
  const header = Header.fieldToIndex(sheet, requiredFields);
  const rangeData = sheet.getDataRange().offset(2, 0).getValues();
  for (let i = 0; i < rangeData.length; i++) {
    const dataRow = rangeData[i];

    // header map is 1 indexed, not 0 indexed
    const statusCode = dataRow[header.STATUS_CODE-1];
    const retryCount = dataRow[header.RETRY_COUNT-1];
    const failedEmailSent = dataRow[header.FAILED_EMAIL_SENT-1];
    // sheetRowIndex is +3 because the rows are 1 based, and we offset by 2 when grabbing all of the data rows, so
    // we didn't have to iterate over both header rows
    const sheetRowIndex = i + 3;
    const submission = new UserSubmission(header, sheetRowIndex, sheet);
    if ((statusCode !== 200) && (dataRow[header.CITY-1] !== '')) {
      if (retryCount < 3) {
        submission.postToLob();
        submission.incrementRetryCount();
      } else if (!failedEmailSent) {
        const subject = "Post to Lob Failed for ReFraming Justice Project Postcard";
        const emailAddr = "becky@studio.un-loop.org";
        const msg = `Hi Current AFSC Staff,
        The post to Lob function failed for: ${dataRow} because the 3 allotted attempts failed. Please look into the problem
        manually if postcard is to be generated for them.`
        MailApp.sendEmail(emailAddr, subject, msg);
        submission.markFailedEmailSent();
      }
    }
  }
}

const manualPostToLob = () => {
  const sheet = SpreadsheetApp.getActiveSheet();
  const header = Header.fieldToIndex(sheet, requiredFields);
  const activeRowNum = sheet.getActiveRange().getRow();
  const activeRows = sheet.getActiveRange().getValues();

  let updatedRows:string[][] = [[]]

  for (let i = 0; i < activeRows.length; i++) {
    let updatedRow = activeRows[i]
    const submission = new UserSubmission(header, i + activeRowNum, sheet);
    submission.postToLob();
    submission.incrementRetryCount();
  }
}

const showHelp = () => {
  const html = HtmlService.createHtmlOutputFromFile('CreatePostcardHelp').setWidth(1000)
      .setHeight(700)
      .setSandboxMode(HtmlService.SandboxMode.NATIVE);
  SpreadsheetApp.getUi()
    .showModalDialog(html, 'Create Postcard - Help')
}

const onOpen = () => {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Create Postcard')
    .addItem('Manually Create Postcard', 'manualPostToLob')
    .addItem('Create Postcard Help', 'showHelp')
    .addToUi();
}
