import Range = GoogleAppsScript.Spreadsheet.Range

const HEADER_DELIMITER = '('
const NO_CHANGE = {
    changed: false
}

export class Header {

    //takes in an on edit event and checks to see if
    //the edit event is happening to a header row
                // static checkHeader(editEvent): HeaderCheck {
                //     var range:Range = editEvent.range
                //     var rowIndex:number = range.getRow()
                //     if (rowIndex > 1) {
                //         return NO_CHANGE
                //     }
                //     //do not allow users to change a header that already exists
                //     //TODO: what if they add a new column? Wonder if we should limit this to be max column check too
                //     if (editEvent.oldValue && editEvent.oldValue.length > 0) {
                //         var oldIdentifier = this.rawHeaderToFieldId(editEvent.oldValue)
                //         var newIdentifier = this.rawHeaderToFieldId(editEvent.value)

                //         if (oldIdentifier !== newIdentifier) {
                //             return {
                //                 changed: true,
                //                 column: range.getColumn(),
                //                 oldFieldID: oldIdentifier,
                //                 newFieldID: newIdentifier,
                //             }
                //         }
                //     }

                //     return NO_CHANGE
                // }
    // BECKY: prob don't need this - we have good names already
    // given a header value, strip away comments, convert to uppercase, and convert all spaces to underscore
            // static rawHeaderToFieldId(rawField:string): string {
            //     let commaIndex = rawField.indexOf(HEADER_DELIMITER)
            //     if (commaIndex !== -1) {
            //         rawField = rawField.slice(0, commaIndex)
            //     }

            //     let removeSpecialChars = rawField.replace(/[^\w\s\d]/g, '')
            //     return removeSpecialChars
            //         .trim()
            //         .toUpperCase()
            //         .split(' ').join('_')
            // }
    // BECKY: this
    //takes in an array representing a header row and returns
    //an object mapping field ID to its index (starting at 0)
    static fieldToIndex(sheet: GoogleAppsScript.Spreadsheet.Sheet, requiredFields:string[]): any {
        // let headerRow = sheet.getRange(2, 1, 1, 15).getValues();
        
        let headerRow = this.getHeaderRow(sheet)
        Logger.log('headerRow', headerRow);
        let missingFields = requiredFields.slice();
        let header = {}
        for (let i = 0; i < headerRow.length; i++) {
            let fieldName = headerRow[i]
            header[fieldName] = i
            Logger.log('fieldName', fieldName);
            Logger.log('header', header);
            // if the parsed field name is in the required fields list, remove it from the
            // missing fields list so it won't trigger a validation error
            let requiredFieldIndex = missingFields.indexOf(fieldName)
            if (requiredFieldIndex >= 0)
                missingFields.splice(requiredFieldIndex, 1)
        }
        if (missingFields.length != 0) {
            throw new MissingHeaderFieldsError(missingFields, sheet.getParent().getUrl(), sheet.getParent().getName(), sheet.getName())
        }
        return header
    }

    // returns just the header row for a given tab and sheet id
    static getHeaderRow(sheet: GoogleAppsScript.Spreadsheet.Sheet): any[] {
        //cred https://mashe.hawksey.info/2018/02/google-apps-script-patterns-getting-a-google-sheet-header-row/
        // todo: some kinda checking to see if there is any data in this row?
        return sheet.getDataRange().offset(0, 0, 1).getValues()[0]
    }

}

class MissingHeaderFieldsError extends Error {
    missingHeaderFields: string[]
    url: string
    fileName: string
    tabName: string

    constructor(missingHeaderFields: string[], url: string, fileName: string, tabName: string) {
        super(`missing required header fields -- a column name has been erroneously modified! \nMissing Fields: ${missingHeaderFields.join('|')}\nFilename: ${fileName}\nURL: ${url}`)
        this.missingHeaderFields = missingHeaderFields
        this.url = url
        this.fileName = fileName
        this.tabName = tabName
    }
}

interface HeaderCheck {
    changed: boolean
    column?: number
    oldFieldID?: string
    newFieldID?: string
}
