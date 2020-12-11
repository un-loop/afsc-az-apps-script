const onFormSubmit = (event: GoogleAppsScript.Events.SheetsOnFormSubmit) => {
  Logger.log(event);
  Logger.log(JSON.stringify(event));
  Logger.log(event.namedValues)
  var sheet = SpreadsheetApp.getActiveSheet();
  var rowIndex = event.range.getLastRow();
  var name = sheet.getRange(rowIndex, 2).getValue();
  var email = sheet.getRange(rowIndex, 3).getValue();
  var city = sheet.getRange(rowIndex, 5).getValue();
  var reason = sheet.getRange(rowIndex, 6).getValue();
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

var EMAIL_SENT = 'EMAIL_SENT';
const sendConfirmationEmail = (userInfo, rowIndex) => {
  var sheet = SpreadsheetApp.getActiveSheet();
    var message = "Thank you for participating " + userInfo.name + ". A postcard will be created in your name and delivered to the legislators.";
    var email_sent = sheet.getRange(rowIndex, 10).getValue();
    if (email_sent !== EMAIL_SENT) {
      var subject = "Reframing Justice Project";
      MailApp.sendEmail(userInfo.email, subject, message);
      sheet.getRange(rowIndex, 10).setValue(EMAIL_SENT);
      SpreadsheetApp.flush();
    };
  }
};

const postToLob = (userInfo, rowIndex) => {
  let url = "https://api.lob.com/v1/postcards";
  let API_KEY = "test_7116a24dd8a038acadc7bbed8eff2c55168";
  let data = {
    description: "Test template for postcard", 
      to: "adr_bb8c6abf6bf2c612",
    from: null,
    front: '<html style="padding: 1in; font-size: 50;"></html>',
    back: "tmpl_3cdf2f9422f2968",
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
    var responseCode = response.getResponseCode();
    var sheet = SpreadsheetApp.getActiveSheet();
    var values = [[new Date(), responseCode]];
    sheet.getRange(rowIndex, 11, 1, 2).setValues(values);
    Logger.log('response: ', response);
  } catch (error) {
    Logger.log('error: ', error);
  }
 
};

