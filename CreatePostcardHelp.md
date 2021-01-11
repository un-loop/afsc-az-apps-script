## Automated Postcard Creation  

This application is created to take form information from people concerned with the Justice System Reform in Arizona. The information provided is used to create a postcard for Participants that live in Arizona and will be hand delivered to the new legislators when they resume in January 2021.  

Creating a postcard is all automated and posts the data taken from the form submitted by the Participants and posts it to a third party company which creates and sends postcards. The postcard are being sent directly to AFSC-AZ office to accumulate before being delivered.  

Upon form submission, all the responses are logged onto a Spreadsheet. A confirmation email is sent to Participant confirming their form submission. The Spreadsheet contains extra information showing when the submission to the third party company was made as well as the status code to verify success. If post fails, retry attempts are made every 4 hours up to 3 times. If post still fails, an email is sent to the administator, a staff member at AFSC-AZ, stating which row of data didn't post to Lob correctly. There is also a column in the Spreadsheet that says Yes in Failed Email Sent when that happens. At this point, a manual submission is recommended.  

## Manually Creating Postcard  

To [manually submit](./singleSubmit.gif) a data row to Lob to create a postcard, highlight a single row and select the Create Postcard menu item then selecting Manually Create Postcard to retry posting to Lob. This will only work if there is not already a status code of 200 in the status code column. When a post is successful, there is a date in the Post to Lob column, a 200 in the Status Code column and the Idempotency Key is also filled in.   



When a Post to Lob fails, the retry attempts are documented in the Retry Count column in the Spreadsheet. The Idempotency Key will automatically keep Lob from accidentally creating more than one Postcard should the information be posted successfully more than once. 


## Manually Creating Postcards in Batches

Suggested batch size is 100 due to limitations, (see below). To perform a [batch posting](./multiSubmit.gif), select contiguous rows up to 100 and select the Create Postcard menu item then select Manually Create Postcard. You can watch the Spreadsheet while the submissions are updating the information needed to the Spreadsheet.
<img src="https://afsc-az-project.s3.us-east-2.amazonaws.com/multiSubmit.gif" alt="multi submit rows gif">

## Limitations

This app does not test City to be a valid Arizona city. It is strictly based on the Participants answer to the Form asking, "Do you live in Arizona?". All Yes responses are sent to Create Postcard.  

Posts are limited to 150 posts for every five minutes to the third party company creating postcards.

Email confirmations sent are limited to 100 per day. We have added a feature that states QUOTA EXCEEDED when only seventy has been reached so other important emails can still go through if needed.
