import { Header } from './Header';

const idempotencyKey: string = Utilities.getUuid();

interface UserInfo {
  fname: string
  lname: string
  email: string
  city: string
  reason: string
  include_email: string
  idempotency_key: string
}

const buildUserInfo = (userRow: string[], header: any): UserInfo => (
  {
    fname: userRow[header.FIRST_NAME - 1],
    lname: userRow[header.LAST_NAME - 1],
    email: userRow[header.EMAIL_ADDRESS - 1],
    city: userRow[header.CITY - 1],
    reason: userRow[header.REASON - 1],
    include_email: userRow[header.INCLUDE_EMAIL - 1],
    idempotency_key: userRow[header.IDEMPOTENCY_KEY - 1]
  }
)

const onFormSubmit = (event: GoogleAppsScript.Events.SheetsOnFormSubmit) => {
  let sheet = SpreadsheetApp.getActiveSheet();
  let header = Header.fieldToIndex(sheet, requiredFields);
  let rowIndex = event.range.getLastRow();
  sheet.getRange(rowIndex, header.IDEMPOTENCY_KEY).setValue(idempotencyKey);
          // can grab zeroeth element only because onformsubmit is only ever one row
  let eventRow = sheet.getRange(rowIndex, 1, 1, sheet.getDataRange().getLastColumn()).getValues()[0];
  const userInfo = buildUserInfo(eventRow, header);
  sendConfirmationEmail(userInfo, rowIndex, header, sheet);
};

const buildHTMLBody = (fname: string): string => `<!DOCTYPE html>
<html>
  <head>
    <base target="_top">
  </head>
  <body>
    <p>Hi ${fname}, </p>
    <br />
    <p>Thank you for using the <a href="http://afscarizona.org/send-postcard/">ReFraming Justice Postcard Generator</a> to tell Arizona lawmakers why you support sentencing reform! Be sure to follow AFSC-Arizona on <a href="https://www.facebook.com/AFSCArizona">Facebook</a>, <a href="https://www.instagram.com/afscaz/">Instagram</a> & <a href="https://twitter.com/afscaz">Twitter</a> so you can help amplify our message and stay up-to-date on legislative developments.</p>
    <br />
    <p>Stay safe & stay strong!</p>
    <p>AFSC-Arizona | ReFraming Justice</p>
  </body>
</html>`;

const EMAIL_SENT = 'EMAIL_SENT';
const QUOTA_EXCEEDED = 'QUOTA_EXCEEDED';

const sendConfirmationEmail = (userInfo: UserInfo, rowIndex: number, header: any, sheet: GoogleAppsScript.Spreadsheet.Sheet) => {
  let emailQuotaRemaining = MailApp.getRemainingDailyQuota();

  // if we max out the quota (100 emails/24 hour period rolling)
  // emails will be locked up for 24 hours, so don't send an email
  if (emailQuotaRemaining < 30) {
    sheet.getRange(rowIndex, header.EMAIL_SENT).setValue(QUOTA_EXCEEDED);
    return;
  }

  let message = `Hi ${userInfo.fname},

  Thank you for using the ReFraming Justice Postcard Generator to tell Arizona lawmakers why you support sentencing reform! Be sure to follow AFSC-Arizona on Facebook, Instagram & Twitter so you can help amplify our message and stay up-to-date on legislative developments.
  
  Stay safe & stay strong!
  AFSC-Arizona | ReFraming Justice`;
  Logger.log("Remaining email quota: " + emailQuotaRemaining);
  let email_sent = sheet.getRange(rowIndex, header.EMAIL_SENT).getValue();
  if (email_sent !== EMAIL_SENT) {
    let subject = "ReFraming Justice Project";
    MailApp.sendEmail(userInfo.email, subject, message, { htmlBody: buildHTMLBody(userInfo.fname) });
    sheet.getRange(rowIndex, header.EMAIL_SENT).setValue(EMAIL_SENT);
    SpreadsheetApp.flush();
    postToLob(userInfo, rowIndex, header, sheet);
  }
};

const postToLob = (userInfo: UserInfo, rowIndex: number, header: any, sheet: GoogleAppsScript.Spreadsheet.Sheet) => {
  if (userInfo.include_email === '') {
    userInfo.email = '';
  };
  let url = "https://api.lob.com/v1/postcards";
  let data = {
    description: "Postcard",
      to: toAddress,
    from: null,
    front: front_tmpl,
    back: back_tmpl,
    merge_variables: userInfo,
  };
  let options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: "Basic " + Utilities.base64Encode(API_KEY + ":"),
      'Idempotency-key': userInfo.idempotency_key,
    },
    payload: JSON.stringify(data),
    muteHttpExceptions: true

  };
  try{
     // @ts-ignore
    let response = UrlFetchApp.fetch(url, options);
    let responseCode = response.getResponseCode();
    let values = [[new Date(), responseCode]];
    sheet.getRange(rowIndex, header.SENT_TO_LOB, 1, 2).setValues(values);
    // if (responseCode !== 200) {
    //   retryFailedPost(userInfo, rowIndex, header, sheet);
    // }
  } catch (error) {
    Logger.log('error: ', error);
  };
};

const retryFailedPost = () => {
  const sheet = SpreadsheetApp.getActiveSheet();
  const header = Header.fieldToIndex(sheet, requiredFields);
  const rangeData = sheet.getDataRange().offset(2, 0).getValues();
  for (let i = 0; i < rangeData.length; i++) {
    let dataRow = rangeData[i];
    let userInfo = buildUserInfo(dataRow, header);
    // header map is 1 indexed, not 0 indexed
    let statusCode = dataRow[header.STATUS_CODE-1];
    let retryCount = dataRow[header.RETRY_COUNT-1];
    let failedEmailSent = dataRow[header.FAILED_EMAIL_SENT-1];
    const sheetRowIndex = i + 3;
    if ((statusCode !== 200) && (userInfo.city !== '') && (retryCount < 3)) {
      // sheetRowIndex is +3 because the rows are 1 based, and we offset by 2 when grabbing all of the data rows, so
      // we didn't have to iterate over both header rows
      postToLob(userInfo, sheetRowIndex, header, sheet);
      sheet.getRange(sheetRowIndex, header.RETRY_COUNT, 1, 1).setValue(retryCount + 1);
    } else {
      if ((!failedEmailSent) && (statusCode !== 200) && (retryCount >= 3)) {
        let subject = "Post to Lob Failed for ReFraming Justice Project Postcard";
        let emailAddr = "becky@studio.un-loop.org";
        let msg = `Hi Current AFSC Staff,
        The post to Lob function failed for: ${dataRow} because the 3 allotted attempts failed. Please look into the problem
        manually if postcard is to be generated for them.` 
        MailApp.sendEmail(emailAddr, subject, msg);
        sheet.getRange(sheetRowIndex, header.FAILED_EMAIL_SENT, 1, 1).setValue('Yes');
      }
    }
  }
}

const onOpen = () => {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Special Features')
    .addItem('Batch PostToLob', 'postToLob')
    .addItem('Manual Retry', 'retryFailedPost')
    .addToUi();
}
