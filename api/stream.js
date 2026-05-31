import fetch from 'node-fetch';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { type, id, season, ep, lang } = req.query;

  if (!type || !id) {
    return res.status(400).json({ sources: [], error: 'missing params' });
  }

  const isDub = lang === 'dub';
  const sources = [];

  const aniwaveBase = 'https://aniwave.to';
  const consumetBase = 'https://api.consumet.org';

  try {
    if (type === 'tv' || type === 'movie') {
      const consumetEpId = await getConsumetEpId(consumetBase, id, season, ep, isDub);
      if (consumetEpId) {
        const links = await getConsumetSources(consumetBase, consumetEpId);
        links.forEach(l => sources.push(l));
      }
    }
  } catch (_) {}

  try {
    const vidsrcLinks = getVidsrcLinks(type, id, season, ep);
    vidsrcLinks.forEach(l => sources.push(l));
  } catch (_) {}

  try {
    const embedLinks = getEmbedLinks(type, id, season, ep);
    embedLinks.forEach(l => sources.push(l));
  } catch (_) {}

  return res.status(200).json({ sources });
}

async function getConsumetEpId(base, tmdbId, season, ep, isDub) {
  const lang = isDub ? 'dub' : 'sub';
  const url = `${base}/meta/anilist/info/${tmdbId}?fetchFiller=true`;
  const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!r.ok) return null;
  const data = await r.json();
  const episodes = data?.episodes || [];
  const target = episodes.find(e => String(e.number) === String(ep));
  return target?.id || null;
}

async function getConsumetSources(base, epId) {
  const out = [];
  const providers = ['gogoanime', 'zoro'];
  for (const p of providers) {
    try {
      const url = `${base}/anime/${p}/watch/${epId}`;
      const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!r.ok) continue;
      const data = await r.json();
      const srcs = data?.sources || [];
      srcs.forEach(s => {
        if (s.url) {
          out.push({
            label: `${p.toUpperCase()} ${s.quality || 'auto'}`,
            url: s.url,
            type: s.url.includes('.m3u8') ? 'hls' : 'mp4',
            lang: 'sub',
            provider: p
          });
        }
      });
    } catch (_) {}
  }
  return out;
}

function getVidsrcLinks(type, id, season, ep) {
  const out = [];
  const base = type === 'movie'
    ? `https://vidsrc.to/embed/movie/${id}`
    : `https://vidsrc.to/embed/tv/${id}/${season}/${ep}`;
  out.push({ label: 'VidSrc', url: base, type: 'embed', lang: 'multi', provider: 'vidsrc' });

  const base2 = type === 'movie'
    ? `https://vidsrc.me/embed/movie?tmdb=${id}`
    : `https://vidsrc.me/embed/tv?tmdb=${id}&season=${season}&episode=${ep}`;
  out.push({ label: 'VidSrc ME', url: base2, type: 'embed', lang: 'multi', provider: 'vidsrcme' });

  return out;
}

function getEmbedLinks(type, id, season, ep) {
  const out = [];

  const autoembed = type === 'movie'
    ? `https://autoembed.co/movie/tmdb/${id}`
    : `https://autoembed.co/tv/tmdb/${id}-${season}-${ep}`;
  out.push({ label: 'AutoEmbed', url: autoembed, type: 'embed', lang: 'multi', provider: 'autoembed' });

  const vidlink = type === 'movie'
    ? `https://vidlink.pro/movie/${id}`
    : `https://vidlink.pro/tv/${id}/${season}/${ep}`;
  out.push({ label: 'VidLink', url: vidlink, type: 'embed', lang: 'multi', provider: 'vidlink' });

  const rive = type === 'movie'
    ? `https://www.rivestream.app/embed?type=movie&id=${id}`
    : `https://www.rivestream.app/embed?type=tv&id=${id}&season=${season}&episode=${ep}`;
  out.push({ label: 'RiveStream', url: rive, type: 'embed', lang: 'multi', provider: 'rive' });

  const videasy = type === 'movie'
    ? `https://player.videasy.net/movie/${id}`
    : `https://player.videasy.net/tv/${id}/${season}/${ep}`;
  out.push({ label: 'Videasy', url: videasy, type: 'embed', lang: 'multi', provider: 'videasy' });

  return out;
    }
