// place files you want to import through the `$lib` alias in this folder.
const regionNamesInEnglish = new Intl.DisplayNames(['en'], { type: 'language' });
export const langEq = (lang1: string, lang2: string) => {
  let langStr1 = regionNamesInEnglish.of(lang1) || '';
  let langStr2 = regionNamesInEnglish.of(lang2) || '';
  if (langStr1.indexOf(langStr2) !== -1) return true;
  if (langStr2.indexOf(langStr1) !== -1) return true;
  return langStr1 === langStr2;
};

let displayNames: Intl.DisplayNames;

export function initDisplayNames(locales: string) {
  displayNames = new Intl.DisplayNames([locales], { type: 'language' });
}

export function displayLangName(locales: string, lang: string) {
  if (!displayNames) {
    displayNames = new Intl.DisplayNames([locales], { type: 'language' });
  }

  return displayNames.of(lang) || lang;
}

export const LANGUAGES: [string, string][] = [
  // ["auto", "auto"],
  ["zh-CN", "zh-CN"],
  ["zh-TW", "zh-TW"],
  ["zh-HK", "zh-HK"],
  ["en", "en"],
  ["af", "af"],
  ["am", "am"],
  ["ar", "ar"],
  ["az", "az"],
  ["be", "be"],
  ["bg", "bg"],
  ["bn", "bn"],
  ["bs", "bs"],
  ["ca", "ca"],
  ["ceb", "ceb"],
  ["co", "co"],
  ["cs", "cs"],
  ["cy", "cy"],
  ["da", "da"],
  ["de", "de"],
  ["el", "el"],
  ["eo", "eo"],
  ["es", "es"],
  ["et", "et"],
  ["eu", "eu"],
  ["fa", "fa"],
  ["fi", "fi"],
  ["fr", "fr"],
  ["fy", "fy"],
  ["ga", "ga"],
  ["gd", "gd"],
  ["gl", "gl"],
  ["gu", "gu"],
  ["ha", "ha"],
  ["haw", "haw"],
  ["he", "he"],
  ["hi", "hi"],
  ["hmn", "hmn"],
  ["hr", "hr"],
  ["ht", "ht"],
  ["hu", "hu"],
  ["hy", "hy"],
  ["id", "id"],
  ["ig", "ig"],
  ["is", "is"],
  ["it", "it"],
  ["ja", "ja"],
  ["jw", "jw"],
  ["ka", "ka"],
  ["kk", "kk"],
  ["km", "km"],
  ["kn", "kn"],
  ["ko", "ko"],
  ["ku", "ku"],
  ["ky", "ky"],
  ["la", "la"],
  ["lb", "lb"],
  ["lo", "lo"],
  ["lt", "lt"],
  ["lv", "lv"],
  ["mg", "mg"],
  ["mi", "mi"],
  ["mk", "mk"],
  ["ml", "ml"],
  ["mn", "mn"],
  ["mr", "mr"],
  ["ms", "ms"],
  ["mt", "mt"],
  ["my", "my"],
  ["ne", "ne"],
  ["nl", "nl"],
  ["no", "no"],
  ["ny", "ny"],
  ["pl", "pl"],
  ["ps", "ps"],
  ["pt", "pt"],
  ["ro", "ro"],
  ["ru", "ru"],
  ["sd", "sd"],
  ["si", "si"],
  ["sk", "sk"],
  ["sl", "sl"],
  ["sm", "sm"],
  ["sn", "sn"],
  ["so", "so"],
  ["sq", "sq"],
  ["sr", "sr"],
  ["st", "st"],
  ["su", "su"],
  ["sv", "sv"],
  ["sw", "sw"],
  ["ta", "ta"],
  ["te", "te"],
  ["tg", "tg"],
  ["th", "th"],
  ["fil", "tl"],
  ["tr", "tr"],
  ["ug", "ug"],
  ["uk", "uk"],
  ["ur", "ur"],
  ["uz", "uz"],
  ["vi", "vi"],
  ["xh", "xh"],
  ["yi", "yi"],
  ["yo", "yo"],
  ["zu", "zu"],
];