const createOnFormSubmitTrigger = () => {
    let ss = SpreadsheetApp.getActive();
    ScriptApp.newTrigger('onFormSubmit')
        .forSpreadsheet(ss)
        .onFormSubmit()
        .create();
};

const createRetryTrigger = () => {
    let ss = SpreadsheetApp.getActive();
    ScriptApp.newTrigger('retryFailedPost')
        .forSpreadsheet(ss)
        .retryFailedPost()
        .create();
};