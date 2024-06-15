// place files you want to import through the `$lib` alias in this folder.
const regionNamesInEnglish = new Intl.DisplayNames(['en'], { type: 'language' });
export const langEq = (lang1: string, lang2: string) => {
  let langStr1 = regionNamesInEnglish.of(lang1) || '';
  let langStr2 = regionNamesInEnglish.of(lang2) || '';
  if (langStr1.indexOf(langStr2) !== -1) return true;
  if (langStr2.indexOf(langStr1) !== -1) return true;
  return langStr1 === langStr2;
};
