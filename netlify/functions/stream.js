const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

const TMDB_KEY = '943bac496146cd6404017535d3c0e8ec';

const UAS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/604.1',
  'Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/115.0'
];

const CONSUMET = ['https://api.consumet.org', 'https://consumet-api.onrender.com'];

const AR_ANIME = [
  { id: 'anime4up',     base: 'https://anime4up.cam'      },
  { id: 'witanime',     base: 'https://witanime.cyou'     },
  { id: 'animeblkom',   base: 'https://animeblkom.net'    },
  { id: 'animetitan',   base: 'https://animetitan.net'    },
  { id: 'gateani',      base: 'https://gateani.me'        },
  { id: 'cartoonarabi', base: 'https://cartoonarabi.tv'   },
  { id: 'stardima',     base: 'https://stardima.com'      },
  { id: 'spacetoon',    base: 'https://go.spacetoon.com'  }
];

const ARAB_SITES = [
  { id: 'arabseed', base: 'https://arabseed.sbs'  },
  { id: 'shahed4u', base: 'https://shahed4u.cam'  },
  { id: 'akwam',    base: 'https://akwam.me'      },
  { id: 'faselhd',  base: 'https://faselhd.cam'   },
  { id: 'mycima',   base: 'https://mycima.net'    },
  { id: 'cimanow',  base: 'https://cimanow.cc'    },
  { id: 'egybest',  base: 'https://egybest.com'   }
];

const HOST_RX = [
  /streamtape\.com/i,      /mixdrop\.c/i,
  /vidoza\.net/i,          /upstream\.to/i,
  /vooe\.net/i,            /filemoon\.sx/i,
  /streamwish\.com/i,      /doodstream\.com/i,
  /vidmoly\.to/i,          /ok\.ru\/video/i,
  /vk\.com\/video/i,       /drive\.google\.com/i,
  /onedrive\.live\.com/i,  /archive\.org/i
];

const DUB_KW = ['مدبلج', 'دبلجة', 'دبلج', 'صوت عربي', 'arabic dub', 'dubbed', '-dub'];
const SUB_KW = ['مترجم', 'ترجمة', 'subbed'];

const rUA = () => UAS[Math.floor(Math.random() * UAS.length)];

function hdrs(ref = '') {
  const origin = ref
    ? (() => { try { return new URL(ref).origin; } catch { return 'https://www.google.com'; } })()
    : 'https://www.google.com';
  return {
    'User-Agent'         : rUA(),
    'Accept'             : 'text/html,application/xhtml+xml,*/*;q=0.9',
    'Accept-Language'    : 'en-US,en;q=0.9',
    'Referer'            : ref || 'https://www.google.com/',
    'Origin'             : origin,
    'Sec-Ch-Ua'          : '"Not_A Brand";v="8", "Chromium";v="120"',
    'Sec-Ch-Ua-Mobile'   : '?0',
    'Sec-Ch-Ua-Platform' : '"Windows"',
    'Sec-Fetch-Dest'     : 'document',
    'Sec-Fetch-Mode'     : 'navigate',
    'Sec-Fetch-Site'     : 'cross-site'
  };
}

async function sf(url, opts = {}, ms = 10000) {
  try {
    const r = await fetch(url, { ...opts, signal: AbortSignal.timeout(ms) });
    return r.ok ? r : null;
  } catch { return null; }
}

function parseUrls(html, label, isDub) {
  const out = [], seen = new Set();
  const all = [
    ...(html.match(/https?:\/\/[^"'\s<>\\]+\.m3u8[^"'\s<>\\]*/g) || []),
    ...(html.match(/https?:\/\/[^"'\s<>\\]+\.mp4[^"'\s<>\\]*/g)  || [])
  ];
  all.forEach(u => {
    const c = u.replace(/\\u0026/g, '&').replace(/\\\//g, '/');
    if (seen.has(c)) return;
    if (/gstatic|googleapis|placeholder|fonts|w3\.org/.test(c)) return;
    seen.add(c);
    const hls = c.includes('.m3u8');
    out.push({
      name   : `${label} ${hls ? 'HLS' : 'MP4'}`,
      url    : c,
      type   : hls ? 'hls' : 'mp4',
      lang   : isDub ? 'مدبلج' : 'مترجم',
      quality: 'auto',
      direct : true
    });
  });
  return out;
}

function extractEmbeds(html) {
  const seen = new Set(), out = [];
  (html.match(/(?:src|data-src)=["']([^"']+)["']/g) || []).forEach(m => {
    const url = m.replace(/.*=["']/, '').replace(/["']$/, '');
    if (!url.startsWith('http') || seen.has(url)) return;
    if (!HOST_RX.some(p => p.test(url))) return;
    seen.add(url);
    out.push(url);
  });
  return out;
}

function langLabel(text, isDub) {
  const t = text.toLowerCase();
  if (DUB_KW.some(k => t.includes(k))) return 'مدبلج';
  if (SUB_KW.some(k => t.includes(k))) return 'مترجم';
  return isDub ? 'مدبلج' : 'مترجم';
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=120');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { type, id, season, ep, lang } = req.query;
  if (!type || !id) return res.status(400).json({ sources: [] });

  const s     = String(season || '1');
  const e     = String(ep || '1');
  const isDub = lang === 'dub';

  const [info, extIds] = await Promise.all([
    sf(`https://api.themoviedb.org/3/${type}/${id}?api_key=${TMDB_KEY}&language=en-US`)
      .then(r => r?.json()).catch(() => null),
    sf(`https://api.themoviedb.org/3/${type}/${id}/external_ids?api_key=${TMDB_KEY}`)
      .then(r => r?.json()).catch(() => null)
  ]);

  const title  = info?.title || info?.name || '';
  const imdbId = extIds?.imdb_id || '';

  const tasks = await Promise.allSettled([
    fetchFlixHQ(title, type, s, e),
    fetchConsumetAnime(title || String(id), e, isDub),
    fetchAniwatch(title, e, isDub),
    fetchVidSrc(type, imdbId || id, s, e),
    fetchDirect(type, id, s, e),
    fetchArabSites(title, type, id, s, e, isDub),
    fetchArAnime(title, e, isDub),
    fetchHostLinks(type, id, s, e, isDub)
  ]);

  const all = [], seen = new Set();
  tasks.forEach(t => {
    if (t.status !== 'fulfilled') return;
    (t.value || []).forEach(src => {
      if (!src?.url || seen.has(src.url)) return;
      seen.add(src.url);
      all.push(src);
    });
  });

  all.sort((a, b) => (b.direct ? 1 : 0) - (a.direct ? 1 : 0));
  return res.status(200).json({ sources: all });
    }

async function fetchFlixHQ(title, type, s, e) {
  if (!title) return [];
  for (const base of CONSUMET) {
    try {
      const sr = await sf(`${base}/movies/flixhq/${encodeURIComponent(title)}`);
      if (!sr) continue;
      const sd = await sr.json();
      const target = (sd?.results || []).find(r =>
        type === 'movie' ? r.type === 'Movie' : r.type === 'TV Series'
      ) || sd?.results?.[0];
      if (!target) continue;

      const ir = await sf(`${base}/movies/flixhq/info?id=${encodeURIComponent(target.id)}`);
      if (!ir) continue;
      const info = await ir.json();

      let epId = null;
      if (type === 'movie') {
        epId = info.episodes?.[0]?.id;
      } else {
        epId = (info.episodes || []).find(ep =>
          ep.season === parseInt(s) && ep.number === parseInt(e)
        )?.id;
      }
      if (!epId) continue;

      const wr = await sf(`${base}/movies/flixhq/watch?episodeId=${encodeURIComponent(epId)}&mediaId=${encodeURIComponent(target.id)}`);
      if (!wr) continue;
      const wd  = await wr.json();
      const out = [];

      (wd?.sources || []).forEach(src => {
        if (!src.url) return;
        const hls = src.url.includes('.m3u8');
        if (!hls && !src.url.includes('.mp4')) return;
        out.push({
          name   : `FlixHQ ${src.quality || 'auto'}`,
          url    : src.url,
          type   : hls ? 'hls' : 'mp4',
          lang   : 'مترجم',
          quality: src.quality || 'auto',
          direct : true
        });
      });
      if (out.length) return out;
    } catch (_) {}
  }
  return [];
}

async function fetchConsumetAnime(query, e, isDub) {
  const out = [];
  for (const base of CONSUMET) {
    for (const p of ['gogoanime', 'zoro']) {
      try {
        const q  = p === 'gogoanime' && isDub ? `${query}-dub` : query;
        const sr = await sf(`${base}/anime/${p}/${encodeURIComponent(q)}`);
        if (!sr) continue;
        const sd    = await sr.json();
        const first = sd?.results?.find(r =>
          isDub ? (r.title?.toLowerCase().includes('dub') || r.id?.includes('dub')) : true
        ) || sd?.results?.[0];
        if (!first) continue;

        const ir       = await sf(`${base}/anime/${p}/info?id=${first.id}`);
        if (!ir) continue;
        const info     = await ir.json();
        const targetEp = (info?.episodes || []).find(ep => ep.number === parseInt(e));
        if (!targetEp) continue;

        const wr = await sf(`${base}/anime/${p}/watch/${targetEp.id}`);
        if (!wr) continue;
        const wd = await wr.json();

        (wd?.sources || []).forEach(src => {
          if (!src.url) return;
          const hls = src.url.includes('.m3u8');
          if (!hls && !src.url.includes('.mp4')) return;
          out.push({
            name   : `${p.toUpperCase()} ${src.quality || 'auto'}`,
            url    : src.url,
            type   : hls ? 'hls' : 'mp4',
            lang   : isDub ? 'مدبلج' : 'مترجم',
            quality: src.quality || 'auto',
            direct : true
          });
        });
        if (out.length >= 2) return out;
      } catch (_) {}
    }
    if (out.length) break;
  }
  return out;
}

async function fetchAniwatch(title, e, isDub) {
  if (!title) return [];
  try {
    const cat = isDub ? 'dub' : 'sub';
    const sr  = await sf(
      `https://api.aniwatch.to/anime/search?q=${encodeURIComponent(title)}&page=1`,
      { headers: hdrs('https://aniwatch.to') }
    );
    if (!sr) return [];
    const sd    = await sr.json();
    const first = sd?.data?.animes?.[0];
    if (!first) return [];

    const er = await sf(
      `https://api.aniwatch.to/anime/episodes/${first.id}`,
      { headers: hdrs('https://aniwatch.to') }
    );
    if (!er) return [];
    const ed       = await er.json();
    const targetEp = (ed?.data?.episodes || []).find(ep => ep.number === parseInt(e));
    if (!targetEp) return [];

    const wr = await sf(
      `https://api.aniwatch.to/anime/episode-srcs?id=${targetEp.episodeId}&server=vidstreaming&category=${cat}`,
      { headers: hdrs('https://aniwatch.to') }
    );
    if (!wr) return [];
    const wd  = await wr.json();
    const out = [];

    (wd?.data?.sources || []).forEach(src => {
      if (!src.url) return;
      const hls = src.url.includes('.m3u8');
      if (!hls && !src.url.includes('.mp4')) return;
      out.push({
        name   : `Aniwatch ${src.quality || 'auto'}`,
        url    : src.url,
        type   : hls ? 'hls' : 'mp4',
        lang   : isDub ? 'مدبلج' : 'مترجم',
        quality: src.quality || 'auto',
        direct : true
      });
    });
    return out;
  } catch { return []; }
}

async function fetchVidSrc(type, id, s, e) {
  const endpoints = [
    type === 'movie' ? `https://vidsrc.xyz/embed/movie/${id}` : `https://vidsrc.xyz/embed/tv/${id}/${s}/${e}`,
    type === 'movie' ? `https://vidsrc.in/embed/movie/${id}`  : `https://vidsrc.in/embed/tv/${id}/${s}/${e}`,
    type === 'movie' ? `https://vidsrc.pm/embed/movie/${id}`  : `https://vidsrc.pm/embed/tv/${id}/${s}/${e}`
  ];
  for (const url of endpoints) {
    try {
      const r     = await sf(url, { headers: hdrs() });
      if (!r) continue;
      const html  = await r.text();
      const found = parseUrls(html, 'VidSrc', false);
      if (found.length) return found;

      const scripts = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || [];
      for (const script of scripts) {
        const b64s = script.match(/atob\(['"]([A-Za-z0-9+/=]+)['"]\)/g) || [];
        for (const enc of b64s) {
          try {
            const b64     = enc.match(/atob\(['"]([A-Za-z0-9+/=]+)['"]\)/)?.[1];
            if (!b64) continue;
            const decoded = Buffer.from(b64, 'base64').toString('utf-8');
            const found2  = parseUrls(decoded, 'VidSrc', false);
            if (found2.length) return found2;
          } catch (_) {}
        }
      }
    } catch (_) {}
  }
  return [];
}

async function fetchDirect(type, id, s, e) {
  const endpoints = [
    type === 'movie'
      ? `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1`
      : `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1&s=${s}&e=${e}`,
    type === 'movie'
      ? `https://vidsrc.cc/v2/embed/movie/${id}`
      : `https://vidsrc.cc/v2/embed/tv/${id}/${s}/${e}`,
    type === 'movie'
      ? `https://player.videasy.net/movie/${id}`
      : `https://player.videasy.net/tv/${id}/${s}/${e}`
  ];
  const out = [];
  for (const url of endpoints) {
    try {
      const r     = await sf(url, { headers: hdrs(url) });
      if (!r) continue;
      const html  = await r.text();
      const found = parseUrls(html, 'Direct', false);
      found.forEach(f => out.push(f));
    } catch (_) {}
  }
  return out;
}

async function fetchArabSites(title, type, tmdbId, s, e, isDub) {
  if (!title) return [];
  const out  = [];
  const slug = title.toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, '-')
    .replace(/^-|-$/g, '');

  for (const site of ARAB_SITES) {
    try {
      const paths = type === 'movie'
        ? [`/movies/${slug}`, `/movie/${slug}`, `/watch/${slug}`, `/${slug}`]
        : [
            `/series/${slug}/season-${s}/episode-${e}`,
            `/series/${slug}/s${s}e${e}`,
            `/${slug}/s${s}e${e}`,
            `/${slug}-s${s}e${e}`
          ];

      for (const path of paths) {
        const r = await sf(`${site.base}${path}`, { headers: hdrs(site.base) });
        if (!r) continue;
        const html   = await r.text();
        const direct = parseUrls(html, site.id, isDub);
        if (direct.length) { direct.forEach(d => out.push(d)); break; }

        const embeds = extractEmbeds(html);
        for (const embed of embeds.slice(0, 3)) {
          const er   = await sf(embed, { headers: hdrs(site.base) });
          if (!er) continue;
          const eh   = await er.text();
          const efnd = parseUrls(eh, site.id, isDub);
          efnd.forEach(f => out.push(f));
        }
        if (out.length) break;
      }
    } catch (_) {}
    if (out.length >= 3) break;
  }
  return out;
}

async function fetchArAnime(title, e, isDub) {
  if (!title) return [];
  const out  = [];
  const slug = title.toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, '-')
    .replace(/^-|-$/g, '');

  for (const site of AR_ANIME) {
    try {
      const paths = [
        `/anime/${slug}/episode-${e}`,
        `/${slug}/episode-${e}`,
        `/episode/${slug}-${e}`,
        `/${slug}-ep${e}`
      ];

      for (const path of paths) {
        const r = await sf(`${site.base}${path}`, { headers: hdrs(site.base) });
        if (!r) continue;
        const html   = await r.text();
        const direct = parseUrls(html, site.id, isDub);
        if (direct.length) { direct.forEach(d => out.push(d)); break; }

        const embeds = extractEmbeds(html);
        for (const embed of embeds.slice(0, 3)) {
          const er   = await sf(embed, { headers: hdrs(site.base) });
          if (!er) continue;
          const eh   = await er.text();
          const efnd = parseUrls(eh, site.id, isDub);
          efnd.forEach(f => out.push(f));
        }
        if (out.length) break;
      }
    } catch (_) {}
    if (out.length >= 3) break;
  }
  return out;
}

async function fetchHostLinks(type, id, s, e, isDub) {
  const endpoints = [
    type === 'movie'
      ? `https://2embed.skin/embed/movie/${id}`
      : `https://2embed.skin/embed/tv/${id}/${s}/${e}`,
    type === 'movie'
      ? `https://www.2embed.cc/embed/${id}`
      : `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`,
    type === 'movie'
      ? `https://vkspeed.com/embed/movie/${id}`
      : `https://vkspeed.com/embed/tv/${id}/${s}/${e}`
  ];
  const out = [];
  for (const url of endpoints) {
    try {
      const r      = await sf(url, { headers: hdrs(url) });
      if (!r) continue;
      const html   = await r.text();
      const direct = parseUrls(html, 'Host', isDub);
      if (direct.length) { direct.forEach(d => out.push(d)); continue; }

      const embeds = extractEmbeds(html);
      for (const embed of embeds.slice(0, 3)) {
        const er   = await sf(embed, { headers: hdrs(url) });
        if (!er) continue;
        const eh   = await er.text();
        const efnd = parseUrls(eh, 'Host', isDub);
        efnd.forEach(f => out.push(f));
      }
    } catch (_) {}
  }
  return out;
            }
