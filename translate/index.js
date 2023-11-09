const {GoogleSpreadsheet} = require('google-spreadsheet');
const secret = require("./secret.json");
const { JWT } = require("google-auth-library");

const serviceAccountAuth = new JWT({
  email: secret.client_email,
  key: secret.private_key,
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets',
  ],
});

const i18nextConfig = require('../i18next-scanner.config');

const ns = 'translation';
const lngs = i18nextConfig.options.lngs;
const loadPath = i18nextConfig.options.resource.loadPath;
const localesPath = loadPath.replace('/{{lng}}/{{ns}}.json', '');
const rePluralPostfix = new RegExp(/_plural|_[\d]/g);
const NOT_AVAILABLE_CELL = '_N/A';
const columnKeyToHeader = {
  key: '키',
  'ko': '한글',
  'en': '영어',
  'jp': '일본어',
};
// const sheetId = '1rkMgd_VG5x3ZDkdIs-cXgsBjXH3WPO1kgxCtzYdYE2k';
const sheetId = '0';
/**
 * getting started from https://theoephraim.github.io/node-google-spreadsheet
 */
async function loadSpreadsheet() {
  // eslint-disable-next-line no-console
  console.info(
    '\u001B[32m',
    '=====================================================================================================================\n',
    '# i18next auto-sync using Spreadsheet\n\n',
    '  * Download translation resources from Spreadsheet and make /src/i18n/locales/{{lng}}/{{ns}}.json\n',
    '  * Upload translation resources to Spreadsheet.\n\n',
    '=====================================================================================================================',
    '\u001B[0m'
  );

  // spreadsheet key is the long id in the sheets URL
  const doc = new GoogleSpreadsheet(
    "1rkMgd_VG5x3ZDkdIs-cXgsBjXH3WPO1kgxCtzYdYE2k"
    ,serviceAccountAuth); //# spreadsheet ID

  await doc.loadInfo(); // loads document properties and worksheets

  return doc;
}

function getPureKey(key = '') {
  return key.replace(rePluralPostfix, '');
}

module.exports = {
  localesPath,
  loadSpreadsheet,
  getPureKey,
  ns,
  lngs,
  sheetId,
  columnKeyToHeader,
  NOT_AVAILABLE_CELL,
};