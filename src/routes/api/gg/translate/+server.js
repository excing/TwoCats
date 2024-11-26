import { translate } from "$lib/translate";
import { error } from '@sveltejs/kit';

export async function GET({ url }) {
  const q = url.searchParams.get('q');
  const sl = url.searchParams.get('sl') ?? 'auto';
  const tl = url.searchParams.get('tl') ?? '1';

  if (!q || !tl) error(400, 'must have q and tl');

  let ggtranslateurl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&dt=at&dt=bd&dt=ex&dt=md&dt=rw&dt=ss&dt=rm&dj=1&source=icon&q=${q}`;

  // let resp = await fetch(ggtranslateurl)

  return await fetch(ggtranslateurl);
}