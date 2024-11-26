import { translate } from "$lib/translate";
import { error } from '@sveltejs/kit';

export async function GET({ url }) {
  const q = url.searchParams.get('q');
  const sl = url.searchParams.get('sl') ?? 'auto';
  const tl = url.searchParams.get('tl') ?? '1';
  const channel = Number(url.searchParams.get('channel') ?? '0');

  if (!q || !tl) error(400, 'must have q and tl');

  const { text } = await translate(q, sl, tl, channel);

  return new Response(text);
}