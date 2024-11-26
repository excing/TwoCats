import { error, json } from '@sveltejs/kit';

// http://localhost:5173/api/ms/tts?q=你好呀D&tl=zh-CN
export async function GET({ url }) {
  const q = url.searchParams.get('q');
  const vsn = url.searchParams.get('vsn') ?? 'zh-CN-XiaoxiaoNeural'; // voice short name
  const speed = Number(url.searchParams.get('speed') ?? '1.0');
  const tl = url.searchParams.get('tl') ?? '1';
  const t = url.searchParams.get('t') ?? '0';

  if (!q || !tl) error(400, 'must have q and tl');

  let msttsurl = `https://cn.bing.com/translator`

  let resp = await fetch(msttsurl)

  let obj = await resp.blob();

  return new Response(obj);
}