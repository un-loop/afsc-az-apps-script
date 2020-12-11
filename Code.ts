const onFormSubmit = (event: GoogleAppsScript.Events.SheetsOnFormSubmit) => {
  Logger.log(event);
  Logger.log(JSON.stringify(event));
  Logger.log(event.namedValues)
  var sheet = SpreadsheetApp.getActiveSheet();
  // let values = [['TRUE', new Date()]];
  // sheet.getRange(event.range.getLastRow(), 4, 1, 2).setValues(values);
  var name = sheet.getRange(event.range.getLastRow(), 2).getValue();
  var email = sheet.getRange(event.range.getLastRow(), 3).getValue();
  var city = sheet.getRange(event.range.getLastRow(), 5).getValue();
  var reason = sheet.getRange(event.range.getLastRow(), 6).getValue();
  const userInfo = {name: name, email: email, city: city, reason: reason};
  Logger.log('userInfo: ', userInfo);
  postToLob(userInfo);
  sendConfirmationEmail();
};

const createOnFormSubmitTrigger = () => {
  let ss = SpreadsheetApp.getActive();
  ScriptApp.newTrigger('onFormSubmit')
    .forSpreadsheet(ss)
    .create();
};

var EMAIL_SENT = 'EMAIL_SENT';
const sendConfirmationEmail = () => {
  var sheet = SpreadsheetApp.getActiveSheet();
  var startRow = 2;
  var numRows = 2;
  var dataRange = sheet.getRange(startRow, 1, numRows, 10);
  var data = dataRange.getValues();
  for (var i = 0; i < data.length; ++i) { 
    var row = data[i];
    var email = row[2];
    var name = row[1];
    var message = "Thank you for participating " + name + ". A postcard will be created in your name and delivered to the legislators.";
    var email_sent = row[9];
    if (email_sent !== EMAIL_SENT) {
      var subject = "Reframing Justice Project";
      MailApp.sendEmail(email, subject, message);
      sheet.getRange(startRow + i, 10).setValue(EMAIL_SENT);
      SpreadsheetApp.flush();
    };
  }
};

const postToLob = (userInfo) => {
  let url = "https://api.lob.com/v1/postcards";
  let API_KEY = "test_7116a24dd8a038acadc7bbed8eff2c55168";
  let data = {
    description: "Test template for postcard", 
      to: "adr_bb8c6abf6bf2c612",
    from: null,
    front: '<html style="padding: 1in; font-size: 50;"></html>',
    back: "tmpl_3cdf2f9422f2968",
    // '<html style="padding: 1in; font-size: 20;">{{city}} {{reason}} {{name}} {{email}}</html>',
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
    payload: JSON.stringify(data)
  };
  Logger.log(data);
  // @ts-ignore
  let response = UrlFetchApp.fetch(url, options);
  Logger.log(response.getContentText());
};

