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

const buildUserInfo = (sheet: GoogleAppsScript.Spreadsheet.Sheet, rowIndex: number, header: any): UserInfo => (
  {
    fname: sheet.getRange(rowIndex, header.FIRST_NAME).getValue(),
    lname: sheet.getRange(rowIndex, header.LAST_NAME).getValue(),
    email: sheet.getRange(rowIndex, header.EMAIL_ADDRESS).getValue(),
    city: sheet.getRange(rowIndex, header.CITY).getValue(),
    reason: sheet.getRange(rowIndex, header.REASON).getValue(),
    include_email: sheet.getRange(rowIndex, header.EMAIL_INCLUDE).getValue(),
    idempotency_key: sheet.getRange(rowIndex, header.IDEMPOTENCY_KEY).getValue()
  }
)

const onFormSubmit = (event: GoogleAppsScript.Events.SheetsOnFormSubmit) => {
  let sheet = SpreadsheetApp.getActiveSheet();
  let header = Header.fieldToIndex(sheet, requiredFields);
  let rowIndex = event.range.getLastRow();
  sheet.getRange(rowIndex, header.IDEMPOTENCY_KEY).setValue(idempotencyKey);
  const userInfo = buildUserInfo(sheet, rowIndex, header)
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
    Logger.log('options for response: ', options);
    let responseCode = response.getResponseCode();
    let values = [[new Date(), responseCode]];
    sheet.getRange(rowIndex, header.SENT_TO_LOB, 1, 2).setValues(values);
    if (responseCode !== 200) {
      retryFailedPost(userInfo, rowIndex, header, sheet);
    }
  } catch (error) {
    Logger.log('error: ', error);
  };
};

const retryFailedPost = (userInfo: UserInfo, rowIndex: number, header: any, sheet: GoogleAppsScript.Spreadsheet.Sheet) => {
  let retry_count = sheet.getRange(rowIndex, header.RETRY_COUNT).getValue();
  if (retry_count < 4) {
    postToLob(userInfo, rowIndex, header, sheet);
    sheet.getRange(rowIndex, header.RETRY_COUNT).setValue(retry_count + 1);
  }
};

const onOpen = () => {
  let ui = SpreadsheetApp.getUi();
  let sheet = SpreadsheetApp.getActiveSheet();
  let header = Header.fieldToIndex(sheet, requiredFields);
  let rangeData = sheet.getDataRange().offset(2, 0).getValues();
  
  for (let i = 0; i < rangeData.length; i++) {
    let dataRow = rangeData[i];
    // header map is 1 indexed, not 0 indexed
    let statusCode = dataRow[header.STATUS_CODE-1];
    if ((statusCode !== 200) && (dataRow[header.CITY-1] !== '')) {
      Logger.log('not 200 ', statusCode);
      Logger.log('email:', dataRow[header.EMAIL_ADDRESS-1]);
    }

  }
}