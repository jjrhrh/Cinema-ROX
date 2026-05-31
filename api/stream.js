import fetch from 'node-fetch';

// ===== CONFIG =====
const TMDB_KEY = '943bac496146cd6404017535d3c0e8ec';
const TIMEOUT_FAST = 5000;   // سيرفرات سريعة
const TIMEOUT_SLOW = 8000;   // سيرفرات أبطأ
const MAX_SOURCES  = 20;     // حد أقصى للمصادر

const UAS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64; rv:125.0) Gecko/20100101 Firefox/125.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0'
];

const CONSUMET_BASES = [
  'https://api.consumet.org',
  'https://consumet-api.onrender.com',
  'https://consumet.pages.dev'
];

// مصادر Embed مباشرة وموثوقة
const EMBED_SOURCES = {
  movie: (id) => [
    `https://vidsrc.to/embed/movie/${id}`,
    `https://vidsrc.xyz/embed/movie/${id}`,
    `https://vidsrc.in/embed/movie/${id}`,
    `https://vidsrc.me/embed/movie?tmdb=${id}`,
    `https://embed.su/embed/movie/${id}`,
    `https://multiembed.mov/?video_id=${id}&tmdb=1`,
    `https://autoembed.co/movie/tmdb/${id}`,
    `https://www.2embed.cc/embed/${id}`,
    `https://embedsu.com/embed/movie/${id}`,
    `https://player.smashy.stream/movie/${id}`,
  ],
  tv: (id, s, e) => [
    `https://vidsrc.to/embed/tv/${id}/${s}/${e}`,
    `https://vidsrc.xyz/embed/tv/${id}/${s}/${e}`,
    `https://vidsrc.in/embed/tv/${id}/${s}/${e}`,
    `https://vidsrc.me/embed/tv?tmdb=${id}&season=${s}&episode=${e}`,
    `https://embed.su/embed/tv/${id}/${s}/${e}`,
    `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}`,
    `https://autoembed.co/tv/tmdb/${id}-${s}-${e}`,
    `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`,
    `https://embedsu.com/embed/tv/${id}/${s}/${e}`,
    `https://player.smashy.stream/tv/${id}?s=${s}&e=${e}`,
  ]
};

// أسماء جميلة للسيرفرات
const SERVER_NAMES = {
  'vidsrc.to'      : { name: 'VidSrc TO',    icon: '🔴' },
  'vidsrc.xyz'     : { name: 'VidSrc XYZ',   icon: '🟠' },
  'vidsrc.in'      : { name: 'VidSrc IN',    icon: '🟡' },
  'vidsrc.me'      : { name: 'VidSrc ME',    icon: '🟢' },
  'embed.su'       : { name: 'EmbedSU',      icon: '🔵' },
  'multiembed.mov' : { name: 'MultiEmbed',   icon: '⚡' },
  'autoembed.co'   : { name: 'AutoEmbed',    icon: '🎯' },
  '2embed.cc'      : { name: '2Embed',       icon: '🎬' },
  'embedsu.com'    : { name: 'EmbedSU Pro',  icon: '💎' },
  'smashy.stream'  : { name: 'Smashy',       icon: '🚀' },
};

const HOST_RX = [
  /streamtape\.com/i, /mixdrop\.c/i,   /vidoza\.net/i,
  /upstream\.to/i,    /vooe\.net/i,    /filemoon\.sx/i,
  /streamwish\.com/i, /doodstream\.com/i, /vidmoly\.to/i,
  /ok\.ru\/video/i,   /vk\.com\/video/i, /drive\.google\.com/i,
  /onedrive\.live\.com/i, /archive\.org/i, /streamhide\.to/i,
  /vidhide\.com/i,    /vidhidevip\.com/i
];

const DUB_KW = ['مدبلج','دبلجة','دبلج','صوت عربي','arabic dub','dubbed','-dub'];
const SUB_KW = ['مترجم','ترجمة','subbed'];

// ===== HELPERS =====
const rUA = () => UAS[Math.floor(Math.random() * UAS.length)];

function hdrs(ref = '') {
  const origin = ref
    ? (() => { try { return new URL(ref).origin; } catch { return 'https://www.google.com'; } })()
    : 'https://www.google.com';
  return {
    'User-Agent'        : rUA(),
    'Accept'            : 'text/html,application/xhtml+xml,*/*;q=0.9',
    'Accept-Language'   : 'en-US,en;q=0.9',
    'Referer'           : ref || 'https://www.google.com/',
    'Origin'            : origin,
    'Sec-Ch-Ua'         : '"Not_A Brand";v="8","Chromium";v="124"',
    'Sec-Ch-Ua-Mobile'  : '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Fetch-Dest'    : 'document',
    'Sec-Fetch-Mode'    : 'navigate',
    'Sec-Fetch-Site'    : 'cross-site'
  };
}

async function sf(url, opts = {}, ms = TIMEOUT_FAST) {
  try {
    const r = await fetch(url, { ...opts, signal: AbortSignal.timeout(ms) });
    return r.ok ? r : null;
  } catch { return null; }
}

function getServerName(url) {
  try {
    const host = new URL(url).hostname.replace('www.', '');
    for (const [key, val] of Object.entries(SERVER_NAMES)) {
      if (host.includes(key)) return val;
    }
    return { name: host, icon: '▶️' };
  } catch { return { name: 'Server', icon: '▶️' }; }
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
    if (/gstatic|googleapis|placeholder|fonts|w3\.org|jquery|bootstrap/.test(c)) return;
    seen.add(c);
    const hls = c.includes('.m3u8');
    out.push({
      name   : `${label} ${hls ? 'HLS' : 'MP4'}`,
      url    : c,
      type   : hls ? 'hls' : 'mp4',
      lang   : isDub ? 'مدبلج' : 'مترجم',
      quality: hls ? '1080p' : 'auto',
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

// ===== MAIN HANDLER =====
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=180, stale-while-revalidate=60');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { type, id, season, ep, lang, repos: reposParam } = req.query;
  if (!type || !id) return res.status(400).json({ sources: [], error: 'missing params' });

  const s     = String(season || '1');
  const e     = String(ep || '1');
  const isDub = lang === 'dub';

  let repos = [];
  try { repos = reposParam ? JSON.parse(decodeURIComponent(reposParam)) : []; } catch {}

  // جلب معلومات الفيلم/المسلسل
  const [info, extIds] = await Promise.all([
    sf(`https://api.themoviedb.org/3/${type}/${id}?api_key=${TMDB_KEY}&language=en-US`, {}, TIMEOUT_FAST)
      .then(r => r?.json()).catch(() => null),
    sf(`https://api.themoviedb.org/3/${type}/${id}/external_ids?api_key=${TMDB_KEY}`, {}, TIMEOUT_FAST)
      .then(r => r?.json()).catch(() => null)
  ]);

  const title  = info?.title || info?.name || '';
  const imdbId = extIds?.imdb_id || '';
  const year   = (info?.release_date || info?.first_air_date || '').slice(0, 4);

  // تشغيل كل المصادر بالتوازي
  const tasks = await Promise.allSettled([
    fetchEmbedSources(type, id, s, e),           // مصادر Embed مباشرة
    fetchVidSrcFull(type, imdbId || id, s, e),   // VidSrc عدة نسخ
    fetchFlixHQ(title, type, s, e),              // FlixHQ
    fetchConsumetAnime(title || id, e, isDub),   // Consumet Anime
    fetchAniwatch(title, e, isDub),              // Aniwatch
    fetchDirectStreams(type, id, s, e),          // Direct streams
    fetchHostLinks(type, id, s, e, isDub),       // Host links
    fetchRepoSources(type, id, s, e, repos),     // مستودعات المستخدم
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

  // ترتيب: direct أولاً ثم embed، وبعدين حسب الجودة
  all.sort((a, b) => {
    if (b.direct !== a.direct) return (b.direct ? 1 : 0) - (a.direct ? 1 : 0);
    if (a.quality === '1080p') return -1;
    if (b.quality === '1080p') return 1;
    return 0;
  });

  return res.status(200).json({
    sources: all.slice(0, MAX_SOURCES),
    meta: { title, year, imdbId, total: all.length }
  });
}

// ===== مصادر Embed مباشرة (الأسرع والأموثق) =====
async function fetchEmbedSources(type, id, s, e) {
  const urls = type === 'movie'
    ? EMBED_SOURCES.movie(id)
    : EMBED_SOURCES.tv(id, s, e);

  const out = [];
  for (const url of urls) {
    try {
      const info = getServerName(url);
      out.push({
        name   : info.name,
        url,
        type   : 'embed',
        lang   : 'مترجم',
        quality: 'auto',
        icon   : info.icon,
        direct : false
      });
    } catch (_) {}
  }
  return out;
}

// ===== VidSrc كامل مع IMDB =====
async function fetchVidSrcFull(type, id, s, e) {
  const endpoints = type === 'movie' ? [
    `https://vidsrc.to/embed/movie/${id}`,
    `https://vidsrc.xyz/embed/movie/${id}`,
    `https://vidsrc.pm/embed/movie/${id}`,
    `https://vidsrc.cc/v2/embed/movie/${id}`,
  ] : [
    `https://vidsrc.to/embed/tv/${id}/${s}/${e}`,
    `https://vidsrc.xyz/embed/tv/${id}/${s}/${e}`,
    `https://vidsrc.pm/embed/tv/${id}/${s}/${e}`,
    `https://vidsrc.cc/v2/embed/tv/${id}/${s}/${e}`,
  ];

  for (const url of endpoints) {
    try {
      const r    = await sf(url, { headers: hdrs() }, TIMEOUT_FAST);
      if (!r) continue;
      const html = await r.text();
      const found = parseUrls(html, 'VidSrc', false);
      if (found.length) return found;

      // محاولة فك base64
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

// ===== FlixHQ عبر Consumet =====
async function fetchFlixHQ(title, type, s, e) {
  if (!title) return [];
  for (const base of CONSUMET_BASES) {
    try {
      const sr = await sf(`${base}/movies/flixhq/${encodeURIComponent(title)}`, {}, TIMEOUT_SLOW);
      if (!sr) continue;
      const sd = await sr.json();
      const target = (sd?.results || []).find(r =>
        type === 'movie' ? r.type === 'Movie' : r.type === 'TV Series'
      ) || sd?.results?.[0];
      if (!target) continue;

      const ir = await sf(`${base}/movies/flixhq/info?id=${encodeURIComponent(target.id)}`, {}, TIMEOUT_SLOW);
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

      const wr = await sf(`${base}/movies/flixhq/watch?episodeId=${encodeURIComponent(epId)}&mediaId=${encodeURIComponent(target.id)}`, {}, TIMEOUT_SLOW);
      if (!wr) continue;
      const wd  = await wr.json();
      const out = [];
      (wd?.sources || []).forEach(src => {
        if (!src.url) return;
        const hls = src.url.includes('.m3u8');
        if (!hls && !src.url.includes('.mp4')) return;
        out.push({ name: `FlixHQ ${src.quality || 'auto'}`, url: src.url, type: hls ? 'hls' : 'mp4', lang: 'مترجم', quality: src.quality || 'auto', direct: true });
      });
      if (out.length) return out;
    } catch (_) {}
  }
  return [];
}

// ===== Consumet Anime =====
async function fetchConsumetAnime(query, e, isDub) {
  const out = [];
  for (const base of CONSUMET_BASES) {
    for (const p of ['gogoanime', 'zoro']) {
      try {
        const q  = p === 'gogoanime' && isDub ? `${query}-dub` : query;
        const sr = await sf(`${base}/anime/${p}/${encodeURIComponent(q)}`, {}, TIMEOUT_SLOW);
        if (!sr) continue;
        const sd    = await sr.json();
        const first = sd?.results?.find(r =>
          isDub ? (r.title?.toLowerCase().includes('dub') || r.id?.includes('dub')) : true
        ) || sd?.results?.[0];
        if (!first) continue;

        const ir = await sf(`${base}/anime/${p}/info?id=${first.id}`, {}, TIMEOUT_SLOW);
        if (!ir) continue;
        const info = await ir.json();
        const targetEp = (info?.episodes || []).find(ep => ep.number === parseInt(e));
        if (!targetEp) continue;

        const wr = await sf(`${base}/anime/${p}/watch/${targetEp.id}`, {}, TIMEOUT_SLOW);
        if (!wr) continue;
        const wd = await wr.json();
        (wd?.sources || []).forEach(src => {
          if (!src.url) return;
          const hls = src.url.includes('.m3u8');
          if (!hls && !src.url.includes('.mp4')) return;
          out.push({ name: `${p.toUpperCase()} ${src.quality || 'auto'}`, url: src.url, type: hls ? 'hls' : 'mp4', lang: isDub ? 'مدبلج' : 'مترجم', quality: src.quality || 'auto', direct: true });
        });
        if (out.length >= 2) return out;
      } catch (_) {}
    }
    if (out.length) break;
  }
  return out;
}

// ===== Aniwatch =====
async function fetchAniwatch(title, e, isDub) {
  if (!title) return [];
  try {
    const cat = isDub ? 'dub' : 'sub';
    const sr  = await sf(
      `https://api.aniwatch.to/anime/search?q=${encodeURIComponent(title)}&page=1`,
      { headers: hdrs('https://aniwatch.to') },
      TIMEOUT_SLOW
    );
    if (!sr) return [];
    const sd    = await sr.json();
    const first = sd?.data?.animes?.[0];
    if (!first) return [];

    const er = await sf(
      `https://api.aniwatch.to/anime/episodes/${first.id}`,
      { headers: hdrs('https://aniwatch.to') },
      TIMEOUT_SLOW
    );
    if (!er) return [];
    const ed       = await er.json();
    const targetEp = (ed?.data?.episodes || []).find(ep => ep.number === parseInt(e));
    if (!targetEp) return [];

    const wr = await sf(
      `https://api.aniwatch.to/anime/episode-srcs?id=${targetEp.episodeId}&server=vidstreaming&category=${cat}`,
      { headers: hdrs('https://aniwatch.to') },
      TIMEOUT_SLOW
    );
    if (!wr) return [];
    const wd  = await wr.json();
    const out = [];
    (wd?.data?.sources || []).forEach(src => {
      if (!src.url) return;
      const hls = src.url.includes('.m3u8');
      if (!hls && !src.url.includes('.mp4')) return;
      out.push({ name: `Aniwatch ${src.quality || 'HD'}`, url: src.url, type: hls ? 'hls' : 'mp4', lang: isDub ? 'مدبلج' : 'مترجم', quality: src.quality || 'auto', direct: true });
    });
    return out;
  } catch { return []; }
}

// ===== Direct Streams =====
async function fetchDirectStreams(type, id, s, e) {
  const endpoints = type === 'movie' ? [
    `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1`,
    `https://vidsrc.cc/v2/embed/movie/${id}`,
    `https://player.videasy.net/movie/${id}`,
    `https://nontons.org/embed/movie/${id}`,
  ] : [
    `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1&s=${s}&e=${e}`,
    `https://vidsrc.cc/v2/embed/tv/${id}/${s}/${e}`,
    `https://player.videasy.net/tv/${id}/${s}/${e}`,
    `https://nontons.org/embed/tv/${id}/${s}/${e}`,
  ];

  const out = [];
  for (const url of endpoints) {
    try {
      const r    = await sf(url, { headers: hdrs(url) }, TIMEOUT_FAST);
      if (!r) continue;
      const html = await r.text();
      parseUrls(html, 'Direct', false).forEach(f => out.push(f));
      if (out.length >= 3) break;
    } catch (_) {}
  }
  return out;
}

// ===== Host Links =====
async function fetchHostLinks(type, id, s, e, isDub) {
  const endpoints = type === 'movie' ? [
    `https://2embed.skin/embed/movie/${id}`,
    `https://www.2embed.cc/embed/${id}`,
    `https://vkspeed.com/embed/movie/${id}`,
    `https://frembed.pro/api/film.php?id=${id}`,
  ] : [
    `https://2embed.skin/embed/tv/${id}/${s}/${e}`,
    `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`,
    `https://vkspeed.com/embed/tv/${id}/${s}/${e}`,
    `https://frembed.pro/api/serie.php?id=${id}&sa=${s}&epi=${e}`,
  ];

  const out = [];
  for (const url of endpoints) {
    try {
      const r    = await sf(url, { headers: hdrs(url) }, TIMEOUT_FAST);
      if (!r) continue;
      const html = await r.text();
      const direct = parseUrls(html, 'Host', isDub);
      if (direct.length) { direct.forEach(d => out.push(d)); continue; }
      const embeds = extractEmbeds(html);
      for (const embed of embeds.slice(0, 2)) {
        const er = await sf(embed, { headers: hdrs(url) }, TIMEOUT_FAST);
        if (!er) continue;
        parseUrls(await er.text(), 'Host', isDub).forEach(f => out.push(f));
      }
      if (out.length >= 3) break;
    } catch (_) {}
  }
  return out;
}

// ===== مستودعات المستخدم =====
async function fetchRepoSources(type, id, season, ep, repos) {
  if (!repos?.length) return [];
  const out = [];

  for (const repo of repos) {
    try {
      const r = await sf(repo.url, {}, TIMEOUT_SLOW);
      if (!r) continue;
      const manifest = await r.json();

      // دعم streamUrl مباشر
      if (manifest.streamUrl) {
        const url = manifest.streamUrl
          .replace('{type}', type)
          .replace('{id}', id)
          .replace('{season}', season || 1)
          .replace('{episode}', ep || 1);
        out.push({
          name   : `⭐ ${repo.name || manifest.name || 'Repo'}`,
          url,
          type   : 'embed',
          lang   : 'متعدد',
          quality: 'auto',
          logo   : repo.logo || manifest.logo || '',
          direct : false,
          isRepo : true
        });
        continue;
      }

      // دعم Stremio format
      const resources = manifest.resources || [];
      const hasStream = resources.includes('stream') || resources.find(r => r === 'stream' || r?.name === 'stream');
      if (!hasStream) continue;

      const baseUrl     = repo.url.replace('/manifest.json', '');
      const stremioType = type === 'movie' ? 'movie' : 'series';
      const stremioId   = `tmdb:${id}`;
      const streamPath  = type === 'movie'
        ? `/stream/${stremioType}/${stremioId}.json`
        : `/stream/${stremioType}/${stremioId}:${season}:${ep}.json`;

      const sr = await sf(`${baseUrl}${streamPath}`, {}, TIMEOUT_SLOW);
      if (!sr) continue;
      const sd = await sr.json();

      (sd.streams || []).slice(0, 5).forEach(s => {
        if (!s.url) return;
        const srcType = s.url.includes('.m3u8') ? 'hls' : s.url.includes('.mp4') ? 'mp4' : 'embed';
        out.push({
          name   : `⭐ ${s.name || s.title || repo.name || 'Repo'}`,
          url    : s.url,
          type   : srcType,
          lang   : 'متعدد',
          quality: s.behaviorHints?.videoSize
            ? `${Math.round(s.behaviorHints.videoSize / 1e9 * 10) / 10}GB`
            : 'auto',
          logo   : repo.logo || manifest.logo || '',
          direct : srcType !== 'embed',
          isRepo : true
        });
      });
    } catch (_) {}
  }
  return out;
}
