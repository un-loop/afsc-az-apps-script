import { Header } from './Header';


const onFormSubmit = (event: GoogleAppsScript.Events.SheetsOnFormSubmit) => {
  Logger.log(event);
  Logger.log(JSON.stringify(event));
  Logger.log(event.namedValues)
  let sheet = SpreadsheetApp.getActiveSheet();
  let header = Header.fieldToIndex(sheet, requiredFields);
  let rowIndex = event.range.getLastRow();
  let fname = sheet.getRange(rowIndex, header.FIRST_NAME).getValue();
  // let fname = sheet.getRange(rowIndex, columnIndices.FNAME).getValue();
  let lname = sheet.getRange(rowIndex, header.LAST_NAME).getValue();
  let email = sheet.getRange(rowIndex, header.EMAIL_ADDRESS).getValue();
  let city = sheet.getRange(rowIndex, header.CITY).getValue();
  let reason = sheet.getRange(rowIndex, header.REASON).getValue();
  let include = sheet.getRange(rowIndex, header.EMAIL_INCLUDE).getValue();
  const userInfo = {fname, lname, email, city, reason, include};
  Logger.log('userInfo: ', userInfo);
  postToLob(userInfo, rowIndex);
  sendConfirmationEmail(userInfo, rowIndex);
};

const createOnFormSubmitTrigger = () => {
  let ss = SpreadsheetApp.getActive();
  ScriptApp.newTrigger('onFormSubmit')
    .forSpreadsheet(ss)
    .onFormSubmit()
    .create();
};

const buildHTMLBody = (fname) => `<!DOCTYPE html>
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
const sendConfirmationEmail = (userInfo, rowIndex) => {
  let sheet = SpreadsheetApp.getActiveSheet();
  let header = Header.fieldToIndex(sheet, requiredFields);
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
    Logger.log('htmlBody to see if coming through at all: ', buildHTMLBody(userInfo.fname));
    sheet.getRange(rowIndex, header.EMAIL_SENT).setValue(EMAIL_SENT);
    SpreadsheetApp.flush();
  }
};

const postToLob = (userInfo, rowIndex) => {
  let sheet = SpreadsheetApp.getActiveSheet();
  let header = Header.fieldToIndex(sheet, requiredFields);
  let url = "https://api.lob.com/v1/postcards";
  let data = {
    description: "Postcard",
      to: toAddress,
    from: null,
    front: front_tmpl,
    back: back_tmpl,
    merge_variables: {
      fname: userInfo.fname,
      lname: userInfo.lname,
      email: userInfo.email,
      city: userInfo.city,
      reason: userInfo.reason,
    },

  };
  let options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: "Basic " + Utilities.base64Encode(API_KEY + ":"),

    },
    payload: JSON.stringify(data),
    muteHttpExceptions: true

  };
  Logger.log(data);
  try{
     // @ts-ignore
    let response = UrlFetchApp.fetch(url, options);
    let responseCode = response.getResponseCode();
    let sheet = SpreadsheetApp.getActiveSheet();
    let values = [[new Date(), responseCode]];
    sheet.getRange(rowIndex, header.SENT_TO_LOB, 1, 2).setValues(values);
    Logger.log('testing options: ', options);
    Logger.log('response: ', response);
  } catch (error) {
    Logger.log('error: ', error);
  }

};

