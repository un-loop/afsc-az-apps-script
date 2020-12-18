
export class Header {
    //takes in an array representing a header row and returns
    //an object mapping field ID to its index (starting at 0)
    static fieldToIndex(sheet: GoogleAppsScript.Spreadsheet.Sheet, requiredFields:string[]): any {
        let headerRow = Header.getHeaderRow(sheet);
        let missingFields = requiredFields.slice();
        let header = {}
        for (let i = 0; i < headerRow.length; i++) {
            let fieldName = headerRow[i]
            header[fieldName] = i + 1;
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
