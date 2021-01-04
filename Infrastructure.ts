const createOnFormSubmitTrigger = () => {
    let ss = SpreadsheetApp.getActive();
    ScriptApp.newTrigger('onFormSubmit')
        .forSpreadsheet(ss)
        .onFormSubmit()
        .create();
};

const createRetryTrigger = () => {
    ScriptApp.newTrigger('retryFailedPost')
        .timeBased()
        .everyHours(4)
        .create();
};