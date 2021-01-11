# afsc-az-apps-script
Holds Google Apps Script code for connecting a google form submission (new sheet entry) to Lob's API. 

This is (a/potentially a collection of) clasp project(s) that will facilitate a new google form submission resulting in a new Postcard being created in [Lob](https://www.lob.com/)

# Production 

Production code is hosted in [script.google.com](script.google.com), under the AFSC-AZ gmail account. To view the code, navigate to script.google.com and log in with the afsc account. 

Click on the `My Projects` tab, then click on `AFSC-AZ Lobbying`. This will display all of the code used to hook up the Lob integration. 

To view logs, go back to the script.google.com homepage and select `My Executions`. There will be an entry for every time the script is run - both the retry batch scripts and the form submission scripts. Expanding one of those rows will display all logs for that execution. 

# Deploying 

You will need the google apps script ID for the production sheet. 

Install [clasp](https://developers.google.com/apps-script/guides/clasp).

Run, in the terminal, `clasp login`. This will open up google in a browser window - log in to the AFSC google account.

Create a `.clasp.json` file, and put the script id for the production sheet inside of it.

After testing all your code changes, run `clasp push`. This will deploy the code to the Google Apps Script Project for the production sheet.   
 
