const onFormSubmit = (event: GoogleAppsScript.Events.SheetsOnFormSubmit) => {
  Logger.log(event);
  Logger.log(JSON.stringify(event));
  Logger.log(event.namedValues)
  let sheet = SpreadsheetApp.getActiveSheet();
  sheet.getRange(event.range.getLastRow(), 4).setValue("TRUE");
}
