import { error, json } from '@sveltejs/kit';

export async function GET({ url, request }) {
  const q = url.searchParams.get('q');
  const sl = url.searchParams.get('sl') ?? 'auto';
  const tl = url.searchParams.get('tl') ?? '1';

  if (!q || !tl) error(400, 'must have q and tl');

  let ggtranslateapi = 'https://translate.googleapis.com/translate_a/single';
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    ggtranslateapi = 'https://2cats.blendiv.com/api/gg/translate';
  }

  let ggtranslateurl = `${ggtranslateapi}?client=gtx&sl=${sl}&tl=${tl}&dt=t&dt=at&dt=bd&dt=ex&dt=md&dt=rw&dt=ss&dt=rm&dj=1&source=icon&q=${q}`;

  // console.log(ggtranslateurl)

  let resp = await fetch(ggtranslateurl, { method: 'GET', headers: request.headers })
  let jsonobj = await resp.json();

  return json(jsonobj);
}