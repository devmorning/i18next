const fs = require("fs");
const path = require("path");
const typescript = require("typescript");

const COMMON_EXTENSIONS = '/**/*.{js,jsx,ts,tsx,vue,html}';

module.exports = {
  input: [`./src/${COMMON_EXTENSIONS}`],
  options: {
    debug: false,
    // removeUnusedKeys: true,
    defaultLng: 'ko',
    lngs: ['ko', 'en', 'jp'],
    func: {
      list: ['i18next.t', 'i18n.t', '$i18n.t', '$i18next.t', 'i18nextScanKey'],
      extensions: ['.js', '.jsx'],
    },
    trans: {
      component: 'Trans',
      i18nKey: 'i18nKey',
      defaultsKey: 'defaults',
      extensions: ['.js', '.jsx'],
      fallbackKey: function(ns, value) {
        return value;
      },
      acorn: {
        ecmaVersion: 10,
        sourceType: 'module',
      }
    },
    resource: {
      loadPath: path.join(__dirname, '/src/i18n/locales/{{lng}}/{{ns}}.json'),
      savePath: path.join(__dirname, '/src/i18n/locales/{{lng}}/{{ns}}.json'),
    },
    defaultValue(lng, ns, key) {
      const keyAsDefaultValue = ['ko'];
      if (keyAsDefaultValue.includes(lng)) {
        const separator = 'html';
        const value = key.includes(separator) ? '' : key;
        return value;
      }
      return '[작성 필요]';
    },
    keySeparator: false,
    nsSeparator: false,
    prefix: '{{',
    suffix: '}}',
  },
  transform: function typescriptTransform(
      options = {
        tsOptions: {
          target: "es2018",
        },
        extensions: [".ts", ".tsx"],
      }
  ) {
    return function transform(file, enc, done) {
      const { base, ext } = path.parse(file.path);

      if (options.extensions.includes(ext) && !base.endsWith(".d.ts") && base.indexOf("reportWebVitals.ts") === -1) {
        const content = fs.readFileSync(file.path, enc);

        const { outputText } = typescript.transpileModule(content, {
          compilerOptions: options.tsOptions,
          fileName: path.basename(file.path),
        });

        this.parser.parseTransFromString(outputText);
        this.parser.parseFuncFromString(outputText);
      }

      done();
    };
  }({ extensions: [".tsx", '.ts'], tsOptions: {
      target: 'es5',
      module: 'esnext',
    }, })
};