const toAddress = "adr_763686ed73dd97fc";

const front_tmpl = "tmpl_86d56082cce5ae7";

const back_tmpl = "tmpl_1d8366980e4d87c";

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
