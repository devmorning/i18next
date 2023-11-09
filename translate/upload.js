const fs = require('fs');
const {
  loadSpreadsheet,
  localesPath,
  getPureKey,
  ns,
  lngs,
  sheetId,
  columnKeyToHeader,
  NOT_AVAILABLE_CELL,
} = require('./index');
const axios = require("axios");

const headerValues = ['키', '한글', '영어', '일본어'];

async function addNewSheet(doc, title, sheetId) {
  const sheet = await doc.addSheet({
    sheetId,
    title,
    headerValues,
  });

  return sheet;
}

async function updateTranslationsFromKeyMapToSheet(doc, keyMap) {
  console.log('updateTranslationsFromKeyMapToSheet::::::', keyMap)
  const title = 'common';
  // let sheet = doc.sheetsById[sheetId];
  let sheet = doc.sheetsByTitle['common'];
  if (!sheet) {
    sheet = await addNewSheet(doc, title, sheetId);
  }

  const rows = await sheet.getRows();

  console.log('rows:::', rows)
  // find exsit keys
  const exsitKeys = {};
  const addedRows = [];
  rows.forEach((row) => {
    const key = row[columnKeyToHeader.key];
    console.log(row, 'key ::::', key, columnKeyToHeader.key)
    if (keyMap[key]) {
      exsitKeys[key] = true;
    }
  });

  for (const [key, translations] of Object.entries(keyMap)) {
    if (!exsitKeys[key]) {
      const row = {
        [columnKeyToHeader.key]: key,
        ...Object.keys(translations).reduce((result, lng) => {
          const header = columnKeyToHeader[lng];
          result[header] = translations[lng];

          return result;
        }, {}),
      };

      addedRows.push(row);
    }
  }

  console.log('ad.....' , addedRows)
  // upload new keys
  await sheet.addRows(addedRows).then(() => {
    console.log('...ok !!')

    let tbl = ['<table>'];

    addedRows.forEach((item) => {
      tbl.push('<tr>');

      Object.keys(item).forEach((key) => {
        tbl.push('<td>' + key + ' : ' + item[key] + '</td>');
      })

      tbl.push('</tr>');
    })

    tbl.push('</table>');

    axios.post('https://sys4u.webhook.office.com/webhookb2/d92f2534-bbf2-4562-8d96-04f5e5321d1a@1ce5bdf7-6e72-4a50-9542-9f6619d80515/IncomingWebhook/dff624b5f2c144c2822b3dd0eaf64918/b93f1b83-4c09-4c30-adb0-b3ec8d99a369', {
      "@context":"https://schema.org/extensions",
      "@type":"MessageCard",
      "themeColor":"0072C6",
      "title":"번역해주세요 !!",
      "text":["<a href='https://docs.google.com/spreadsheets/d/1rkMgd_VG5x3ZDkdIs-cXgsBjXH3WPO1kgxCtzYdYE2k/edit#gid=0'>번역하러 가기</a>", tbl].join('\n')
    })
        .then(function (response) {
          //console.log(response);
        })
        .catch(function (error) {
          console.log(error);
        });


  });
}

function toJson(keyMap) {
  const json = {};

  Object.entries(keyMap).forEach(([__, keysByPlural]) => {
    for (const [keyWithPostfix, translations] of Object.entries(keysByPlural)) {
      json[keyWithPostfix] = {
        ...translations,
      };
    }
  });

  return json;
}

function gatherKeyMap(keyMap, lng, json) {
  for (const [keyWithPostfix, translated] of Object.entries(json)) {
    const key = getPureKey(keyWithPostfix);

    if (!keyMap[key]) {
      keyMap[key] = {};
    }

    const keyMapWithLng = keyMap[key];
    if (!keyMapWithLng[keyWithPostfix]) {
      keyMapWithLng[keyWithPostfix] = lngs.reduce((initObj, lng) => {
        initObj[lng] = NOT_AVAILABLE_CELL;

        return initObj;
      }, {});
    }

    keyMapWithLng[keyWithPostfix][lng] = translated;
  }
}

async function updateSheetFromJson() {
  const doc = await loadSpreadsheet();

  fs.readdir(localesPath, async (error, lngs) => {
    console.log("localesPath: ", localesPath);
    console.log("lngs: ", lngs);
    if (error) {
      throw error;
    }

    const keyMap = {};

    lngs.forEach((lng) => {
      const localeJsonFilePath = `${localesPath}/${lng}/${ns}.json`;

      // eslint-disable-next-line no-sync
      const json = fs.readFileSync(localeJsonFilePath, 'utf8');

      gatherKeyMap(keyMap, lng, JSON.parse(json));
    });
    updateTranslationsFromKeyMapToSheet(doc, toJson(keyMap));

  });
}

updateSheetFromJson();