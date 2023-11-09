// fetch-google-spreadsheet.js

const { GoogleSpreadsheet } = require("google-spreadsheet");
const secret = require("./secret.json");
const { JWT } = require("google-auth-library");
const fs = require('fs');

const serviceAccountAuth = new JWT({
    email: secret.client_email,
    key: secret.private_key,
    scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
    ],
});

//# Initialize the sheet
const doc = new GoogleSpreadsheet(
// 1rkMgd_VG5x3ZDkdIs-cXgsBjXH3WPO1kgxCtzYdYE2k/edit#gid=0
    "1rkMgd_VG5x3ZDkdIs-cXgsBjXH3WPO1kgxCtzYdYE2k"
    // "0"
    ,serviceAccountAuth); //# spreadsheet ID

//# Initialize Auth
const init = async () => {
    // /d/1rkMgd_VG5x3ZDkdIs-cXgsBjXH3WPO1kgxCtzYdYE2k/edit#gid=0
    await doc.loadInfo();
};

const read = async (page) => {
    const sheet = doc.sheetsByTitle[`${page}`];
    await sheet.loadHeaderRow(); //# loads the header row (first row) of the sheet
    const columns = sheet.headerValues; //# array of strings from cell values in the first row

    let result = {};
    // const rows = await sheet.getRows({ limit: sheet.rowCount }); //# fetch rows from the sheet (limited to row count)
    const rows1 = await sheet.getRows({ limit: sheet.rowCount }).then((row) => {
        console.log('colTitles....', columns, row['_rawData'])

        const langs = columns.splice(1)
        row.map((record) => {
            langs.forEach((lang, i) => {
                result = {
                    ...result,
                    [lang]: {
                        ...result[lang],
                        [record['_rawData'][0]]: record['_rawData'][i+1]
                    }
                }
            });
            // key, lang1, lang2, lang3
        })
        // colTitles.slice(1).forEach((title) => {
        //     let rows = {};
        //     row.map((d) => {
        //         const row = {};
        //         colTitles.forEach((header, i) => row[header] = d._rawData[i]);
        //         rows = {...rows, ...row};
        //     });
        //     console.log(rows);
        //     result = rows;
        // });

        console.log('set rseult', result)
        // result = {
        //     "en": {
        //         "test": "vtest1",
        //         "test2": "vtest2",
        //         "test3": "vtest3",
        //     },
        //     "ko": {
        //         "test": "vtest1",
        //         "test2": "vtest2",
        //         "test3": "vtest3",
        //     },
        //     "jp": {
        //         "test": "vtest1",
        //         "test2": "vtest2",
        //         "test3": "vtest3",
        //     }
        // };
    }); //# fetch rows from the sheet (limited to row count)
    //# map rows values and create an object with keys as columns titles starting from the second column (languages names) and values as an object with key value pairs, where the key is a key of translation, and value is a translation in a respective language
    // rows.map((row) => {
    //     console.log(row, sheet._headerValues)
    // })
    // eslint-disable-next-line array-callback-return
    // rows.map((row) => {
    //     console.log('colTitles....', colTitles)
    //     colTitles.slice(1).forEach((title) => {
    //         result[title] = result[title] || [];
    //         const key = colTitles[0];
    //         console.log('title >>', title)
    //         console.log('key >>', key)
    //         console.log('rowtitle >>', row[title])
    //         console.log(sheet['_headerValues'], colTitles)
    //         // const key = sheet['_headerValues'][sheet['_headerValues'].find((v) => v === title)[0]];
    //         console.log(row, sheet['_headerValues'], colTitles, title, key)
    //         result = {
    //             ...result,
    //             [title]: {
    //                 ...result[title],
    //                 [key]: row[title] !== "" ? (row[title] + '..>') : 'une.....',
    //             },
    //         };
    //     });
    // });
    console.log("result >>", result)
    return result;
};

function parseDotNotation(str, val, obj) {
    let currentObj = obj;
    const keys = str.split(".");
    let i;
    const l =Math.max(1, keys.length - 1);
    let key;

    for (i = 0; i < l; ++i) {
        key = keys[i];
        currentObj[key] = currentObj[key] || {};
        currentObj = currentObj[key];
    }

    currentObj[keys[i]] = val;
    delete obj[str];
}

Object.expand = function (obj) {
    for (const key in obj) {
        if (key.indexOf(".") !== -1) {
            parseDotNotation(key, obj[key], obj);
        }
    }
    return obj;
};

const write = (data, page) => {
    Object.keys(data).forEach((key) => {
        // console.log("WRITE : ", data, page, key)
        const tempObject =Object.expand(data[key]);
        // console.log("WRITE VVV : ", tempObject)
        fs.writeFile(
            `./src/i18n/locales/${key}/${page}.json`,
            JSON.stringify(tempObject, null, 2),
            (err) => {
                if (err) {
                    console.error(err);
                }
            }
        );
    });
};

// const list = ['common', 'contents', 'detail', 'error', 'footer', 'header', 'modal', 'pdf', 'tutorial']
const list = ['common']

for (const i in list) {
    init()
        .then(() => read(list[i]))
        .then((data) => write(data, list[i]))
        .catch((err) =>console.log("ERROR!!!!", err));
}