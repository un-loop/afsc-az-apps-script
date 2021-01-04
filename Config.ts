const toAddress = "adr_6827671dfe59420f";

const front_tmpl = "tmpl_8cfbad0504a30fb";

const back_tmpl = "tmpl_3cdf2f9422f2968";

const API_KEY = PropertiesService.getScriptProperties().getProperty('API_KEY');

const requiredFields = [
  'FIRST_NAME',
  'LAST_NAME',
  'EMAIL_ADDRESS',
  'CITY',
  'REASON',
  'EMAIL_INCLUDE',
  'EMAIL_SENT',
  'SENT_TO_LOB',
  'STATUS_CODE',
  'RETRY_COUNT',
  'IDEMPOTENCY_KEY',
  'FAILED_EMAIL_SENT',
]