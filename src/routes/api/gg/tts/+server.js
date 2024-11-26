import { error, json } from '@sveltejs/kit';

export async function GET({ url }) {
  const q = url.searchParams.get('q');
  const speed = url.searchParams.get('speed') ?? '1.0';
  const tl = url.searchParams.get('tl') ?? '1';
  const t = url.searchParams.get('t') ?? '0';

  if (!q || !tl) error(400, 'must have q and tl');

  let ggttsurl = `https://translate.googleapis.com/translate_tts?ie=UTF-8&tl=${tl}&client=tw-ob&q=${q}&ttsspeed=${speed}`

  let resp = await fetch(ggttsurl)

  let obj = t === '0' ? (await resp.blob()) : (await resp.arrayBuffer());

  return new Response(obj);
}