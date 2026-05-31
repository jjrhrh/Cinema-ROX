import fetch from 'node-fetch';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=300');

  const { type, id, season, ep, lang } = req.query;
  if (!type || !id) return res.status(400).json({ sources: [] });

  const sources = [];
  const s = season || '1';
  const e = ep || '1';
  const isDub = lang === 'dub';

  const embedSources = buildEmbedSources(type, id, s, e, isDub);
  embedSources.forEach(x => sources.push(x));

  try {
    const consumet = await fetchConsumetSources(type, id, s, e, isDub);
    consumet.forEach(x => sources.push(x));
  } catch (_) {}

  return res.status(200).json({ sources });
}

function buildEmbedSources(type, id, s, e, isDub) {
  const out = [];
  const isMovie = type === 'movie';

  const vidsrcTo = isMovie
    ? `https://vidsrc.to/embed/movie/${id}`
    : `https://vidsrc.to/embed/tv/${id}/${s}/${e}`;
  out.push({ name: 'VidSrc', url: vidsrcTo, type: 'embed', lang: 'مترجم', quality: 'HD' });

  const vidlink = isMovie
    ? `https://vidlink.pro/movie/${id}`
    : `https://vidlink.pro/tv/${id}/${s}/${e}`;
  out.push({ name: 'VidLink', url: vidlink, type: 'embed', lang: 'مترجم', quality: 'HD' });

  const rive = isMovie
    ? `https://www.rivestream.app/embed?type=movie&id=${id}`
    : `https://www.rivestream.app/embed?type=tv&id=${id}&season=${s}&episode=${e}`;
  out.push({ name: 'RiveStream', url: rive, type: 'embed', lang: 'مترجم', quality: 'FHD' });

  const videasy = isMovie
    ? `https://player.videasy.net/movie/${id}`
    : `https://player.videasy.net/tv/${id}/${s}/${e}`;
  out.push({ name: 'Videasy', url: videasy, type: 'embed', lang: 'مترجم', quality: 'HD' });

  const autoembed = isMovie
    ? `https://autoembed.co/movie/tmdb/${id}`
    : `https://autoembed.co/tv/tmdb/${id}-${s}-${e}`;
  out.push({ name: 'AutoEmbed', url: autoembed, type: 'embed', lang: 'مترجم', quality: 'HD' });

  const vidsrcMe = isMovie
    ? `https://vidsrc.me/embed/movie?tmdb=${id}`
    : `https://vidsrc.me/embed/tv?tmdb=${id}&season=${s}&episode=${e}`;
  out.push({ name: 'VidSrc ME', url: vidsrcMe, type: 'embed', lang: 'مترجم', quality: 'HD' });

  const multiembed = isMovie
    ? `https://multiembed.mov/?video_id=${id}&tmdb=1`
    : `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}`;
  out.push({ name: 'MultiEmbed', url: multiembed, type: 'embed', lang: 'مترجم', quality: 'HD' });

  const vidsrcCc = isMovie
    ? `https://vidsrc.cc/v2/embed/movie/${id}`
    : `https://vidsrc.cc/v2/embed/tv/${id}/${s}/${e}`;
  out.push({ name: 'VidSrc CC', url: vidsrcCc, type: 'embed', lang: 'مترجم', quality: 'HD' });

  if (isDub) {
    const dubEmbed = isMovie
      ? `https://player.videasy.net/movie/${id}?lang=en`
      : `https://player.videasy.net/tv/${id}/${s}/${e}?lang=en`;
    out.push({ name: 'Videasy DUB', url: dubEmbed, type: 'embed', lang: 'مدبلج', quality: 'HD' });

    const riveAgg = isMovie
      ? `https://www.rivestream.app/embed/agg?type=movie&id=${id}`
      : `https://www.rivestream.app/embed/agg?type=tv&id=${id}&season=${s}&episode=${e}`;
    out.push({ name: 'RiveDUB', url: riveAgg, type: 'embed', lang: 'مدبلج', quality: 'FHD' });
  }

  return out;
}

async function fetchConsumetSources(type, id, s, e, isDub) {
  const out = [];
  const base = 'https://api.consumet.org';
  const providers = isDub ? ['gogoanime-dub', 'zoro'] : ['gogoanime', 'zoro'];

  for (const p of providers) {
    try {
      const searchUrl = `${base}/anime/${p}/${encodeURIComponent(String(id))}`;
      const sr = await fetch(searchUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(5000) });
      if (!sr.ok) continue;
      const sd = await sr.json();
      const firstResult = sd?.results?.[0];
      if (!firstResult) continue;

      const infoUrl = `${base}/anime/${p}/info?id=${firstResult.id}`;
      const ir = await fetch(infoUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(5000) });
      if (!ir.ok) continue;
      const id2 = await ir.json();
      const episodes = id2?.episodes || [];
      const epNum = type === 'movie' ? 1 : parseInt(e);
      const targetEp = episodes.find(ep => ep.number === epNum);
      if (!targetEp) continue;

      const watchUrl = `${base}/anime/${p}/watch/${targetEp.id}`;
      const wr = await fetch(watchUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(5000) });
      if (!wr.ok) continue;
      const wd = await wr.json();
      const srcs = wd?.sources || [];

      srcs.forEach(src => {
        if (!src.url) return;
        const isHls = src.url.includes('.m3u8');
        const isMp4 = src.url.includes('.mp4');
        if (!isHls && !isMp4) return;
        out.push({
          name: `${p.toUpperCase()} ${src.quality || 'auto'}`,
          url: src.url,
          type: isHls ? 'hls' : 'mp4',
          lang: isDub ? 'مدبلج' : 'مترجم',
          quality: src.quality || 'auto',
          direct: true
        });
      });
    } catch (_) {}
  }

  return out;
}
