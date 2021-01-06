import { sendConfirmationEmail } from './ConfirmationEmail';

const EMAIL_SENT = 'EMAIL_SENT';
const QUOTA_EXCEEDED = 'QUOTA_EXCEEDED';

export interface SubmissionInfo {
  fname: string
    lname: string
    email: string
    city: string
    reason: string
    include_email: string
    idempotency_key: string
    email_sent: string
    retry_count: number
}

export class UserSubmission {
  header: any;
  rowIndex: number;
  sheet: GoogleAppsScript.Spreadsheet.Sheet;
  row: SubmissionInfo;

  constructor(header: any, rowIndex: number, sheet: GoogleAppsScript.Spreadsheet.Sheet, rowData?: any[]) {
    this.header = header;
    this.rowIndex = rowIndex;
    this.sheet = sheet;
    // rowData is optional field, just if the row has already been pulled out into an array so you don't have to
    //   do additional call to google sheets server
    if (!rowData) {
      rowData = sheet.getRange(rowIndex, 1, 1, sheet.getDataRange().getLastColumn()).getValues()[0];
    }
    this.row = this.buildSubmissionInfo(rowData)
  };

  buildSubmissionInfo = (row: any[]): SubmissionInfo => (
    {
      fname: row[this.header.FIRST_NAME - 1],
      lname: row[this.header.LAST_NAME - 1],
      email: row[this.header.EMAIL_ADDRESS - 1],
      city: row[this.header.CITY - 1],
      reason: row[this.header.REASON - 1],
      include_email: row[this.header.INCLUDE_EMAIL - 1],
      idempotency_key: row[this.header.IDEMPOTENCY_KEY - 1],
      email_sent: row[this.header.EMAIL_SENT - 1],
      retry_count: row[this.header.RETRY_COUNT - 1]
    }
  );

  postToLob = () => {
    if (this.row.include_email === '') {
      this.row.email = '';
    };
    let url = "https://api.lob.com/v1/postcards";
    let data = {
      description: "Postcard",
        to: toAddress,
      from: null,
      front: front_tmpl,
      back: back_tmpl,
      merge_variables: this.row,
    };
    let options = {
      method: 'post',
      contentType: 'application/json',
      headers: {
        Authorization: "Basic " + Utilities.base64Encode(API_KEY + ":"),
        'Idempotency-key': this.row.idempotency_key,
      },
      payload: JSON.stringify(data),
      muteHttpExceptions: true
  
    };
    try{
       // @ts-ignore
      let response = UrlFetchApp.fetch(url, options);
      let responseCode = response.getResponseCode();
      let values = [[new Date(), responseCode]];
      this.sheet.getRange(this.rowIndex, this.header.SENT_TO_LOB, 1, 2).setValues(values);
    } catch (error) {
      Logger.log('error: ', error);
    };
  };

  incrementRetryCount = () => {
    this.row.retry_count += 1;
    this.sheet.getRange(this.rowIndex, this.header.RETRY_COUNT, 1, 1).setValue(this.row.retry_count);
  };

  sendConfirmationEmail = () => {
    let emailSentStatus = EMAIL_SENT;
    try {
      sendConfirmationEmail(this.row)
    } catch (err) {
      emailSentStatus = err.toString() === 'Email quota exceeded' ? QUOTA_EXCEEDED : emailSentStatus;
    }
    this.sheet.getRange(this.rowIndex, this.header.EMAIL_SENT, 1, 1).setValue(emailSentStatus);
  };

  markFailedEmailSent = () => {
    this.sheet.getRange(this.rowIndex, this.header.FAILED_EMAIL_SENT, 1, 1).setValue('Yes');
  };

};