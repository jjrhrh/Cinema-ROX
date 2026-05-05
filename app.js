// ===== NAVIGATION =====
function bnavGo(tab) {
  const hero = document.getElementById('heroSection');
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.bnav-btn').forEach(b => b.classList.remove('active'));

  if (tab === 'browse') { toggleRoxMenu(); return; }

  const pageMap = { home:'homePage', search:'searchPage', library:'libraryPage', profile:'profilePage' };
  const btnMap  = { home:'bnavHome', search:'bnavSearch', library:'bnavLibrary', profile:'bnavProfile' };

  document.getElementById(pageMap[tab])?.classList.add('active');
  document.getElementById(btnMap[tab])?.classList.add('active');
  if (hero) hero.style.display = tab === 'home' ? '' : 'none';
  if (tab === 'library') loadLibraryPage();
  window.scrollTo(0, 0);
}

function goBack() { bnavGo('home'); }

// ===== ROX MENU =====
let roxOpen = false;
function toggleRoxMenu() {
  roxOpen = !roxOpen;
  document.getElementById('roxMenu')?.classList.toggle('hidden', !roxOpen);
  document.getElementById('roxOverlay')?.classList.toggle('hidden', !roxOpen);
  const btn = document.getElementById('bnavCenter');
  if (btn) btn.style.transform = roxOpen ? 'rotate(45deg) scale(1.1)' : '';
}
// ===== FETCH =====
async function fetchMovies(endpoint = '/movie/popular', options = {}) {
  const {
    page            = 1,
    type            = endpoint.includes('/tv') ? 'tv' : 'movie',
    limit           = CONFIG.DISPLAY.TRENDING_LIMIT || 20,
    requirePoster   = true,
    requireBackdrop = false,
    params          = {},
  } = options;

  const url = buildTMDBUrl(endpoint, {
    page,
    include_adult: String(CONFIG.SEARCH.INCLUDE_ADULT),
    ...params,
  });

  try {
    const ctrl    = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), CONFIG.PERFORMANCE.REQUEST_TIMEOUT_MS || 8000);
    const res     = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`TMDB ${res.status}`);
    const data = await res.json();
    return (data.results || [])
      .filter(i => {
        if (requirePoster   && !i.poster_path)   return false;
        if (requireBackdrop && !i.backdrop_path) return false;
        return true;
      })
      .slice(0, limit)
      .map(i => ({ ...i, media_type: i.media_type || type }));
  } catch (e) {
    console.warn('fetchMovies:', endpoint, e.message);
    return [];
  }
}
// ===== HERO SLIDER =====
let heroMovies = [], heroIndex = 0, heroTimer = null;

async function getFanartBackdrop(tmdbId) {
  try {
    const res = await fetch(`${CONFIG.API.FANART_BASE}/movies/${tmdbId}?api_key=${CONFIG.KEYS.FANART}`);
    if (!res.ok) return '';
    const d = await res.json();
    return d.hdmoviebackground?.[0]?.url || d.moviebackground?.[0]?.url || '';
  } catch { return ''; }
}

function resolveHeroBackdrop(movie, fanartUrl = '') {
  if (fanartUrl)           return fanartUrl;
  if (movie.backdrop_path) return `${CONFIG.IMAGES.BACKDROP}${movie.backdrop_path}`;
  if (movie.poster_path)   return `${CONFIG.IMAGES.ORIGINAL}${movie.poster_path}`;
  return '';
}

function setHeroSlide(next) {
  const slides = document.querySelectorAll('#heroSlider .hero-slide');
  if (!slides.length) return;
  slides[heroIndex]?.classList.remove('active');
  heroIndex = next;
  slides[heroIndex]?.classList.add('active');
}

function startHeroTimer() {
  clearInterval(heroTimer);
  if (heroMovies.length < 2) return;
  heroTimer = setInterval(() => setHeroSlide((heroIndex + 1) % heroMovies.length), 5000);
}

async function loadHeroSlider() {
  const slider = document.getElementById('heroSlider');
  if (!slider) return;

  let movies = await fetchMovies('/trending/movie/week', { limit: 7, requireBackdrop: true });
  if (!movies.length) movies = await fetchMovies('/movie/popular', { limit: 7, requireBackdrop: true });
  if (!movies.length) { slider.innerHTML = ''; return; }

  const enriched = await Promise.all(
    movies.map(async m => ({
      ...m,
      hero_backdrop: resolveHeroBackdrop(m, await getFanartBackdrop(m.id))
    }))
  );

  heroMovies = enriched.filter(m => m.hero_backdrop);
  if (!heroMovies.length) { slider.innerHTML = ''; return; }

  heroIndex = 0;
  slider.innerHTML = heroMovies.map((m, i) => `
    <div class="hero-slide ${i === 0 ? 'active' : ''}"
         style="background-image:url('${m.hero_backdrop}')"
         onclick="openDetail(${m.id},'movie')"></div>
  `).join('');

  startHeroTimer();
}
// ===== HOME PAGE =====
function buildMovieCard(movie, type = 'movie') {
  const title  = type === 'movie'
    ? (movie.title || movie.original_title)
    : (movie.name  || movie.original_name);
  const poster = movie.poster_path
    ? `${CONFIG.IMAGES.POSTER_MD}${movie.poster_path}`
    : CONFIG.IMAGES.PLACEHOLDER;
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '';
  return `
    <div class="movie-card" onclick="openDetail(${movie.id},'${type}')">
      <div class="movie-poster-wrap">
        <img class="movie-poster" src="${poster}" alt="${title}" loading="lazy"
             onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'">
        ${rating ? `<span class="movie-rating">⭐ ${rating}</span>` : ''}
        <div class="movie-overlay"><span class="play-icon">▶</span></div>
      </div>
    </div>`;
}

function buildSection(title, movies, type = 'movie') {
  if (!movies.length) return '';
  return `
    <div class="home-section">
      <div class="section-header">
        <span class="section-bar"></span>
        <h2 class="section-title">${title}</h2>
      </div>
      <div class="movies-row">
        ${movies.map(m => buildMovieCard(m, type)).join('')}
      </div>
    </div>`;
}

async function loadHomePage() {
  const page = document.getElementById('homePage');
  if (!page) return;
  page.innerHTML = '<div class="loading">⏳ جاري التحميل...</div>';

  const [trending, topRated, series] = await Promise.all([
    fetchMovies('/movie/popular'),
    fetchMovies('/movie/top_rated'),
    fetchMovies('/tv/popular'),
  ]);

  page.innerHTML =
    buildSection('🔥 الأفلام الرائجة', trending,  'movie') +
    buildSection('⭐ الأعلى تقييماً',  topRated,  'movie') +
    buildSection('📺 المسلسلات',        series,    'tv');
}
