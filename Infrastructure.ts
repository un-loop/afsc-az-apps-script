const createOnFormSubmitTrigger = () => {
    let ss = SpreadsheetApp.getActive();
    ScriptApp.newTrigger('onFormSubmit')
        .forSpreadsheet(ss)
        .onFormSubmit()
        .create();
};
