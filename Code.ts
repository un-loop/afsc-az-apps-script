import { Header } from './Header';
import {UserSubmission} from "./UserSubmission";

const idempotencyKey: string = Utilities.getUuid();


const onFormSubmit = (event: GoogleAppsScript.Events.SheetsOnFormSubmit) => {
  let sheet = SpreadsheetApp.getActiveSheet();
  let header = Header.fieldToIndex(sheet, requiredFields);
  let rowIndex = event.range.getLastRow();
  sheet.getRange(rowIndex, header.IDEMPOTENCY_KEY).setValue(idempotencyKey);

  let eventRow = sheet.getRange(rowIndex, 1, 1, sheet.getDataRange().getLastColumn()).getValues()[0]; // can grab zeroeth element only because onformsubmit is only ever one row
  Logger.log("eventRow", eventRow);

  const submission = new UserSubmission(header, rowIndex, sheet);

  submission.sendConfirmationEmail();
  submission.postToLob();
};


const retryFailedPost = () => {
  const sheet = SpreadsheetApp.getActiveSheet();
  const header = Header.fieldToIndex(sheet, requiredFields);
  const rangeData = sheet.getDataRange().offset(2, 0).getValues();

  for (let i = 0; i < rangeData.length; i++) {
    let dataRow = rangeData[i];
    // header map is 1 indexed, not 0 indexed. grabbing all the values we need to determine
    // if we should even waste the compute time on instantiating a submission object
    let statusCode = dataRow[header.STATUS_CODE-1];
    let retryCount = dataRow[header.RETRY_COUNT-1];
    let failedEmailSent = dataRow[header.FAILED_EMAIL_SENT-1];
    // sheetRowIndex is +3 because the rows are 1 based, and we offset by 2 when grabbing all of the data rows, so
    // we didn't have to iterate over both header rows
    const sheetRowIndex = i + 3;
    if ((statusCode !== 200) && (dataRow[header.CITY-1] !== '') && (!failedEmailSent)) {
      const submission = new UserSubmission(header, sheetRowIndex, sheet, dataRow);
      if (retryCount < 3) {
        submission.postToLob();
        submission.incrementRetryCount();
      } else {
        let subject = "Post to Lob Failed for ReFraming Justice Project Postcard";
        let emailAddr = "becky@studio.un-loop.org";
        let msg = `Hi Current AFSC Staff,
        The post to Lob function failed for: ${dataRow} because the 3 allotted attempts failed. Please look into the problem
        manually if postcard is to be generated for them.`
        MailApp.sendEmail(emailAddr, subject, msg);
        submission.markFailedEmailSent();
      }
    }
  }
}
