const onFormSubmit = (event: GoogleAppsScript.Events.SheetsOnFormSubmit) => {
  Logger.log(event);
  Logger.log(JSON.stringify(event));
  Logger.log(event.namedValues)
  let sheet = SpreadsheetApp.getActiveSheet();
  let rowIndex = event.range.getLastRow();
  let name = sheet.getRange(rowIndex, 2).getValue();
  let email = sheet.getRange(rowIndex, 3).getValue();
  let city = sheet.getRange(rowIndex, 5).getValue();
  let reason = sheet.getRange(rowIndex, 6).getValue();
  const userInfo = {name, email, city, reason};
  Logger.log('userInfo: ', userInfo);
  postToLob(userInfo, rowIndex);
  sendConfirmationEmail(userInfo, rowIndex);
};

const createOnFormSubmitTrigger = () => {
  let ss = SpreadsheetApp.getActive();
  ScriptApp.newTrigger('onFormSubmit')
    .forSpreadsheet(ss)
    .create();
};

const buildHTMLBody = (name) => `<!DOCTYPE html>
<html>
  <head>
    <base target="_top">
  </head>
  <body>
    <p>Hi ${name}, </p>
    <br />
    <p>Thank you for using the <a href="http://afscarizona.org/send-postcard/">ReFraming Justice Postcard Generator</a> to tell Arizona lawmakers why you support sentencing reform! Be sure to follow AFSC-Arizona on <a href="https://www.facebook.com/AFSCArizona">Facebook</a>, <a href="https://www.instagram.com/afscaz/">Instagram</a> & <a href="https://twitter.com/afscaz">Twitter</a> so you can help amplify our message and stay up-to-date on legislative developments.</p>
    <br />
    <p>Stay safe & stay strong!</p>
    <p>AFSC-Arizona | ReFraming Justice</p>
  </body>
</html>`

const EMAIL_SENT = 'EMAIL_SENT';
const sendConfirmationEmail = (userInfo, rowIndex) => {
  let sheet = SpreadsheetApp.getActiveSheet();
  let emailQuotaRemaining = MailApp.getRemainingDailyQuota();
  Logger.log("Remaining email quota: " + emailQuotaRemaining);
  let message = "Thank you for participating " + userInfo.name + ". A postcard will be created in your name and delivered to the legislators.";
  let email_sent = sheet.getRange(rowIndex, 10).getValue();
  if (email_sent !== EMAIL_SENT) {
    let subject = "Reframing Justice Project";
    MailApp.sendEmail(userInfo.email, subject, message, { htmlBody: buildHTMLBody(userInfo.name) });
    Logger.log('htmlBody to see if coming through at all: ', buildHTMLBody(userInfo.name));
    sheet.getRange(rowIndex, 10).setValue(EMAIL_SENT);
    SpreadsheetApp.flush();
  }
};

const postToLob = (userInfo, rowIndex) => {
  let url = "https://api.lob.com/v1/postcards";
  let data = {
    description: "Test template for postcard",
      to: toAddress,
    from: null,
    front: '<html style="padding: 1in; font-size: 50;"></html>',
    back: back_tmpl,
    merge_variables: {
      name: userInfo.name,
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
    sheet.getRange(rowIndex, 11, 1, 2).setValues(values);
    Logger.log('testing options: ', options);
    Logger.log('response: ', response);
  } catch (error) {
    Logger.log('error: ', error);
  }

};

