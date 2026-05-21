export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { title, ep, scrape } = req.query;

  if (scrape) return scrapeVideoUrl(scrape, res);
  if (!title)  return res.status(400).json({ error: 'title required' });

  const epNum = String(ep || 1);
  console.log(`[stream] ${title} — ح${epNum}`);

  // جمع السيرفرات من كل المصادر بالتوازي
  const [aaServers, aniwatchServers, arabicServers, vidsrcServers] = await Promise.allSettled([
    fetchAllAnime(title, epNum),
    fetchAniwatch(title, epNum),
    fetchArabicScrape(title, epNum),
    fetchVidSrcTMDB(title, epNum),
  ]);

  const servers = [
    ...(aaServers.value       || []),
    ...(aniwatchServers.value || []),
    ...(arabicServers.value   || []),
    ...(vidsrcServers.value   || []),
  ].filter(s => s?.url);

  console.log(`[stream] ✅ إجمالي: ${servers.length} سيرفر`);

  if (!servers.length)
    return res.status(404).json({ error: 'no sources found', title });

  return res.status(200).json({ sources: servers, servers });
}

/* ════════════════════════════════
   1. AllAnime API
════════════════════════════════ */
async function fetchAllAnime(title, epNum) {
  const servers = [];
  const H = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0',
    'Referer':    'https://allmanga.to/',
    'Content-Type': 'application/json',
  };

  const sr = await fetch('https://api.allanime.day/api', {
    method: 'POST', headers: H,
    body: JSON.stringify({
      query: `query($s:SearchInput,$l:Int,$p:Int,$t:VaildTranslationTypeEnumType){
        shows(search:$s,limit:$l,page:$p,translationType:$t){
          edges{ _id name englishName }
        }
      }`,
      variables: { s:{ allowAdult:false, query:title }, l:5, p:1, t:'sub' },
    }),
    signal: AbortSignal.timeout(9000),
  });
  const sd     = await sr.json();
  const showId = (sd?.data?.shows?.edges||[])[0]?._id;
  if (!showId) return servers;

  for (const lang of ['sub','dub']) {
    try {
      const er = await fetch('https://api.allanime.day/api', {
        method: 'POST', headers: H,
        body: JSON.stringify({
          query: `query($id:String!,$t:VaildTranslationTypeEnumType!,$e:String!){
            episode(showId:$id,translationType:$t,episodeString:$e){
              sourceUrls{ sourceUrl sourceName priority }
            }
          }`,
          variables: { id:showId, t:lang, e:epNum },
        }),
        signal: AbortSignal.timeout(9000),
      });
      const ed = await er.json();
      (ed?.data?.episode?.sourceUrls||[]).forEach(s => {
        const url = decodeAaUrl(s.sourceUrl);
        if (!url?.startsWith('http')) return;
        servers.push({
          name:    `AllAnime ${lang.toUpperCase()} · ${s.sourceName||''}`,
          url,
          type:    url.includes('.m3u8') ? 'hls' : 'iframe',
          quality: s.priority >= 10 ? '1080p' : s.priority >= 5 ? '720p' : 'auto',
          lang,
        });
      });
    } catch(e) { console.log(`[AA] ${lang} فشل:`, e.message); }
  }

  console.log(`[AA] ${servers.length} سيرفر`);
  return servers;
}

/* ════════════════════════════════
   2. Aniwatch (Zoro mirror)
════════════════════════════════ */
async function fetchAniwatch(title, epNum) {
  const servers = [];
  const slug    = title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/-$/,'');
  const epId    = `${slug}-episode-${epNum}`;

  const APIS = [
    'https://aniwatch-api-one-tau.vercel.app',
    'https://aniwatch-api-dusky.vercel.app',
  ];

  for (const api of APIS) {
    for (const srv of ['vidstreaming','megacloud','streamsb','vidcloud']) {
      try {
        const r = await fetch(
          `${api}/anime/episode-srcs?id=${encodeURIComponent(epId)}&server=${srv}&category=sub`,
          { signal: AbortSignal.timeout(7000) }
        );
        if (!r.ok) continue;
        const d = await r.json();
        (d.sources||[]).forEach(s => {
          servers.push({
            name:    `Aniwatch · ${srv}`,
            url:     s.url,
            type:    s.isM3U8 ? 'hls' : 'mp4',
            quality: s.quality || 'auto',
            lang:    'sub',
          });
        });
        if (d.sources?.length) break;
      } catch {}
    }
    if (servers.length >= 3) break;
  }

  console.log(`[Aniwatch] ${servers.length} سيرفر`);
  return servers;
}

/* ════════════════════════════════
   3. المواقع العربية عبر Scrape
════════════════════════════════ */
async function fetchArabicScrape(title, epNum) {
  const servers  = [];
  const slug     = title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/-$/,'');

  const ARABIC_SITES = [
    { name:'Anime4up',    url:`https://anime4up.cam/episode/${slug}-${epNum}/` },
    { name:'WitAnime',    url:`https://witanime.cyou/episode/${slug}-${epNum}/` },
    { name:'Anime3rb',    url:`https://anime3rb.com/episodes/${slug}-${epNum}` },
    { name:'Shahiid',     url:`https://shahiid-anime.net/episode/${slug}-episode-${epNum}/` },
    { name:'Ristoanime',  url:`https://ristoanime.co/episode/${slug}-episode-${epNum}/` },
    { name:'AnimeSlayer', url:`https://www.animeslayer.com/episode/${slug}-episode-${epNum}/` },
  ];

  const results = await Promise.allSettled(
    ARABIC_SITES.map(site => scrapeForVideo(site.url, site.name))
  );

  results.forEach((r, i) => {
    if (r.status === 'fulfilled' && r.value) {
      servers.push({
        name:    ARABIC_SITES[i].name + ' AR',
        url:     r.value.url,
        type:    r.value.type,
        quality: 'auto',
        lang:    'ar',
      });
    }
  });

  console.log(`[Arabic] ${servers.length} سيرفر`);
  return servers;
}

/* ════════════════════════════════
   4. VidSrc عبر TMDB ID
════════════════════════════════ */
async function fetchVidSrcTMDB(title, epNum) {
  const servers = [];
  const ep = String(epNum || 1);
  const TMDB_KEY = '943bac496146cd6404017535d3c0e8ec';

  // خطوة 1: ابحث عن TMDB ID
  let tmdbId = null;
  let mediaType = 'movie';
  try {
    const mRes = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(title)}&page=1`,
      { signal: AbortSignal.timeout(6000) }
    ).then(r => r.json());
    if (mRes.results?.[0]) {
      tmdbId = mRes.results[0].id;
      mediaType = 'movie';
    } else {
      const tRes = await fetch(
        `https://api.themoviedb.org/3/search/tv?api_key=${TMDB_KEY}&query=${encodeURIComponent(title)}&page=1`,
        { signal: AbortSignal.timeout(6000) }
      ).then(r => r.json());
      if (tRes.results?.[0]) {
        tmdbId = tRes.results[0].id;
        mediaType = 'tv';
      }
    }
  } catch(e) { console.log('[TMDB search] فشل:', e.message); }

  if (!tmdbId) {
    console.log('[VidSrc] ما وجدنا TMDB ID');
    return servers;
  }

  console.log(`[VidSrc] TMDB ID: ${tmdbId} | type: ${mediaType}`);

  // خطوة 2: APIs مفتوحة تعطي m3u8 مباشرة
  const OPEN_APIS = mediaType === 'movie' ? [
    `https://vidsrc.rip/api/movie?tmdb=${tmdbId}`,
    `https://vidbinge.dev/api/source/movie/${tmdbId}`,
    `https://embed.su/api/movie/${tmdbId}`,
  ] : [
    `https://vidsrc.rip/api/tv?tmdb=${tmdbId}&season=1&episode=${ep}`,
    `https://vidbinge.dev/api/source/tv/${tmdbId}/1/${ep}`,
    `https://embed.su/api/tv/${tmdbId}/1/${ep}`,
  ];

  for (const apiUrl of OPEN_APIS) {
    try {
      const r = await fetch(apiUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 Chrome/124.0' },
        signal: AbortSignal.timeout(7000),
      });
      if (!r.ok) continue;
      const data = await r.json();
      const srcs = data.sources || data.stream || data.streams || data.links || [];
      for (const s of srcs) {
        const url = s.url || s.file || s.link || s.src || '';
        if (!url.startsWith('http')) continue;
        servers.push({
          name:    `ROX · ${mediaType === 'movie' ? 'فيلم' : 'مسلسل'}`,
          url,
          type:    url.includes('.m3u8') ? 'hls' : 'mp4',
          quality: s.quality || s.label || 'auto',
          lang:    'multi',
        });
      }
      if (servers.length) {
        console.log(`[VidSrc API] ✅ ${servers.length} مصدر`);
        break;
      }
    } catch(e) { console.log(`[VidSrc API] فشل:`, e.message); }
  }

  // خطوة 3: Fallback — embed نظيف كـ iframe
  if (!servers.length) {
    console.log('[VidSrc] fallback إلى embed');
    const embeds = mediaType === 'movie' ? [
      { name:'VidSrc',  url:`https://vidsrc.to/embed/movie/${tmdbId}` },
      { name:'EmbedSu', url:`https://embed.su/embed/movie/${tmdbId}` },
      { name:'VidLink', url:`https://vidlink.pro/movie/${tmdbId}` },
    ] : [
      { name:'VidSrc',  url:`https://vidsrc.to/embed/tv/${tmdbId}/1/${ep}` },
      { name:'EmbedSu', url:`https://embed.su/embed/tv/${tmdbId}/1/${ep}` },
      { name:'VidLink', url:`https://vidlink.pro/tv/${tmdbId}/1/${ep}` },
    ];
    embeds.forEach(e => servers.push({ ...e, type:'iframe', quality:'auto', lang:'multi' }));
  }

  console.log(`[VidSrc+TMDB] ${servers.length} سيرفر`);
  return servers;
}

/* ════════════════════════════════
   Scrape Helper
════════════════════════════════ */
const PROXIES = [
  u => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  u => `https://corsproxy.io/?${encodeURIComponent(u)}`,
  u => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
];

async function scrapeForVideo(pageUrl, name) {
  for (const proxy of PROXIES) {
    try {
      const r = await fetch(proxy(pageUrl), {
        headers: { 'User-Agent': 'Mozilla/5.0 Chrome/124.0' },
        signal:  AbortSignal.timeout(10000),
      });
      if (!r.ok) continue;
      const html = await r.text();
      const result = extractVideoUrl(html);
      if (result) {
        console.log(`[scrape] ✅ ${name}: ${result.url.slice(0,60)}`);
        return result;
      }
    } catch(e) {
      console.log(`[scrape] ${name} proxy فشل:`, e.message);
    }
  }
  return null;
}

function extractVideoUrl(html) {
  const patterns = [
    { re: /https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*/,           type: 'hls' },
    { re: /file\s*:\s*["']([^"']+\.m3u8[^"']*)/,             type: 'hls', g: 1 },
    { re: /https?:\/\/[^\s"'<>]+\.mp4[^\s"'<>]*/,            type: 'mp4' },
    { re: /<video[^>]+src=["']([^"']+)["']/i,                 type: 'mp4', g: 1 },
    { re: /source\s*:\s*["']([^"']+\.mp4[^"']*)/,            type: 'mp4', g: 1 },
    { re: /iframe[^>]+src=["'](https?:\/\/[^"']+)["']/i,     type: 'iframe', g: 1 },
  ];
  for (const p of patterns) {
    const m = html.match(p.re);
    if (m) return { url: p.g ? m[p.g] : m[0], type: p.type };
  }
  return null;
}

/* ════════════════════════════════
   Scrape مخصص
════════════════════════════════ */
async function scrapeVideoUrl(pageUrl, res) {
  const result = await scrapeForVideo(pageUrl, 'custom');
  if (result) return res.status(200).json(result);
  return res.status(404).json({ error: 'no video found' });
}

/* ════════════════════════════════
   Helpers
════════════════════════════════ */
function rot13(str) {
  return str.replace(/[a-zA-Z]/g, c => {
    const b = c <= 'Z' ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - b + 13) % 26) + b);
  });
}
function decodeAaUrl(url = '') {
  if (url.startsWith('--')) return rot13(url.slice(2));
  return url;
}
