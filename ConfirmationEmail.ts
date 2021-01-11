import { SubmissionInfo } from './UserSubmission';

const buildHTMLBody = (fname: string, reason: string): string => `<!DOCTYPE html>
<html>
  <head>
    <base target="_top">
  </head>
  <body>
    <p>Hi ${fname}, </p>
    <br />
    <p>Thank you for using the <a href="http://afscarizona.org/send-postcard/">ReFraming Justice Postcard Generator</a> to tell Arizona lawmakers why you support sentencing reform! Be sure to follow AFSC-Arizona on <a href="https://www.facebook.com/AFSCArizona">Facebook</a>, <a href="https://www.instagram.com/afscaz/">Instagram</a> & <a href="https://twitter.com/afscaz">Twitter</a> so you can help amplify our message and stay up-to-date on legislative developments.</p>
    <br />
    <p>Here is what you said... ${reason}</p>
    <br />
    <p>Stay safe & stay strong!</p>
    <p>AFSC-Arizona | ReFraming Justice</p>
  </body>
</html>`;

const buildTextBody = (fname: string, reason: string): string => `Hi ${fname},

  Thank you for using the ReFraming Justice Postcard Generator to tell Arizona lawmakers why you support sentencing reform! Here is what you said... ${reason} 
  
  Be sure to follow AFSC-Arizona on Facebook, Instagram & Twitter so you can help amplify our message and stay up-to-date on legislative developments.
  
  Stay safe & stay strong!
  AFSC-Arizona | ReFraming Justice`;

export function sendConfirmationEmail(userInfo: SubmissionInfo) {
  const emailQuotaRemaining = MailApp.getRemainingDailyQuota();

  // if we max out the quota (100 emails/24 hour period rolling)
  // emails will be locked up for 24 hours, so don't send an email
  if (emailQuotaRemaining < 30) {
    throw new Error("Email quota exceeded")
  }

  Logger.log("Remaining email quota: " + emailQuotaRemaining);

  if (userInfo.email_sent !== 'EMAIL_SENT') {
    const subject = "ReFraming Justice Project";
    MailApp.sendEmail(userInfo.email, subject, buildTextBody(userInfo.fname, userInfo.reason), { htmlBody: buildHTMLBody(userInfo.fname, userInfo.reason) });
    SpreadsheetApp.flush();
  }
}
