import express from 'express';
const app = express();
app.get('/api/stream', handler);
app.listen(process.env.PORT || 3000);
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { tmdbId, type, season = '1', ep = '1', repos } = req.query;

  if (!tmdbId) return res.status(400).json({ error: 'tmdbId required' });
  if (!repos)  return res.status(400).json({ error: 'repos required' });

  // repos تيجي كـ JSON string — مصفوفة روابط manifest
  let manifestUrls = [];
  try {
    manifestUrls = JSON.parse(repos);
  } catch {
    return res.status(400).json({ error: 'repos must be JSON array' });
  }

  // ═══════════════════════════════════════
  //  1. اقرأ كل manifest وحدد الـ providers
  // ═══════════════════════════════════════
  const providerJobs = [];

  for (const manifestUrl of manifestUrls) {
    try {
      const mRes = await fetch(manifestUrl, { signal: AbortSignal.timeout(8000) });
      if (!mRes.ok) continue;

      const manifest = await mRes.json();
      const baseUrl  = manifestUrl.replace('/manifest.json', '');

      for (const scraper of (manifest.scrapers || [])) {
        if (!scraper.enabled) continue;
        if (!scraper.supportedTypes?.includes(type)) continue;

        providerJobs.push({
          name:     scraper.name,
          id:       scraper.id,
          baseUrl,
          filename: scraper.filename,
        });
      }
    } catch (e) {
      console.log(`[manifest] فشل: ${manifestUrl} —`, e.message);
    }
  }

  if (!providerJobs.length)
    return res.status(404).json({ error: 'no compatible providers found' });

  // ═══════════════════════════════════════
  //  2. شغّل كل provider وجمع النتائج
  // ═══════════════════════════════════════
  const results = await Promise.allSettled(
    providerJobs.map(job => runProvider(job, tmdbId, type, season, ep))
  );

  const sources = [];
  results.forEach((r, i) => {
    if (r.status === 'fulfilled' && Array.isArray(r.value)) {
      r.value.forEach(s => sources.push(s));
    } else {
      console.log(`[${providerJobs[i].name}] فشل:`, r.reason?.message);
    }
  });

  if (!sources.length)
    return res.status(404).json({ error: 'no sources found', tmdbId });

  return res.status(200).json({ sources });
}

// ═══════════════════════════════════════
//  تحميل وتشغيل الـ provider في sandbox
// ═══════════════════════════════════════
async function runProvider(job, tmdbId, type, season, ep) {
  const codeUrl = `${job.baseUrl}/${job.filename}`;

  const codeRes = await fetch(codeUrl, { signal: AbortSignal.timeout(10000) });
  if (!codeRes.ok) throw new Error(`failed to fetch provider: ${codeUrl}`);
  const code = await codeRes.text();

const mod = { exports: {} };
  const fn = new Function(
    'module','exports','fetch','console','setTimeout','clearTimeout',
    'setInterval','clearInterval','URL','URLSearchParams','Buffer',
    'process','atob','btoa','AbortSignal',
    code
  );
  try {
    fn(
      mod, mod.exports, fetch, console, setTimeout, clearTimeout,
      setInterval, clearInterval, URL, URLSearchParams, Buffer,
      { env: {} }, atob, btoa, AbortSignal
    );
  } catch (e) {
    throw new Error(`exec error in ${job.name}: ${e.message}`);
  }

  const getStreams = mod.exports?.getStreams || mod.exports?.default?.getStreams;

  if (typeof getStreams !== 'function')
    throw new Error(`${job.name} لا يصدّر getStreams`);

  // تشغيل مع timeout
  const raw = await Promise.race([
    getStreams(String(tmdbId), type, Number(season), Number(ep)),
    new Promise((_, rej) =>
      setTimeout(() => rej(new Error(`${job.name} timeout`)), 20000)
    ),
  ]);

  const streams = Array.isArray(raw) ? raw : [];

  return streams
    .filter(s => s?.url)
    .map(s => ({
      name:    `${job.name} · ${s.quality || s.label || 'auto'}`,
      url:     s.url,
      type:    s.type || (s.url.includes('.m3u8') ? 'hls' : 'mp4'),
      quality: s.quality || 'auto',
      lang:    s.language || s.lang || 'multi',
      source:  job.name,
    }));
}
