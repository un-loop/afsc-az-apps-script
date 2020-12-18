
const toAddress = "adr_6827671dfe59420f";
// const toAddress = "adr_bb8c6abf6bf2c612";
const front_tmpl = "tmpl_8cfbad0504a30fb";
const back_tmpl = "tmpl_3cdf2f9422f2968";

// PropertiesService.getScriptProperties().setProperty("API_KEY", "test_7116a24dd8a038acadc7bbed8eff2c55168");

const API_KEY = PropertiesService.getScriptProperties().getProperty('API_KEY');

const requiredFields = [
  'FIRST_NAME',
  'LAST_NAME',
  'EMAIL_ADDRESS',
  'CITY',
  'REASON',
  'EMAIL_INCLUDE',
]


// const columnIndices = {
//     FNAME: 2,
//     LNAME: 10,
//     EMAIL: 3,
//     CITY: 4,
//     REASON: 5,
//     EMAIL_SENT: 11,
//     SENT_TO_LOB: 12,
//     STATUS_CODE: 13
// };
