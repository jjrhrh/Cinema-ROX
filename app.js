const S = CONFIG.SERVERS;
window._detailHistory = [];
// ===== SIDEBAR =====
function toggleSidebar() {
  const menu = document.getElementById('sidebarMenu');
  const overlay = document.getElementById('sidebarOverlay');
  menu.classList.toggle('open');
  overlay.classList.toggle('open');
}

function openSidebarNews(type) {
  const panel = document.getElementById('newsPanel');
  const title = document.getElementById('newsPanelTitle');
  const feed  = document.getElementById('newsPanelFeed');
  title.textContent = type === 'anime' ? '🎌 أخبار الأنمي' : '🎬 أخبار الأفلام والمسلسلات';
  feed.innerHTML = '<div class="loading">⏳ جاري التحميل...</div>';
  panel.classList.add('open');
  const url = type === 'anime' ? CONFIG.NEWS.ANIME : CONFIG.NEWS.CINEMA;
  loadNewsSection('newsPanelFeed', url, type === 'anime' ? 'purple' : 'red');
}

function closeSidebarNews() {
  document.getElementById('newsPanel').classList.remove('open');
}
// ===== NAVIGATION =====
function bnavGo(tab) {
  const hero = document.getElementById('heroSection');
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
document.querySelectorAll('.dock-btn').forEach(b => {
  b.classList.remove('active');
  b.style.width = '';
});
  document.getElementById('newsSection').style.display = 'none';
  document.getElementById('studioBar').style.display = 'none';
  if (tab === 'browse') { toggleRoxMenu(); return; }

  if (tab === 'home' && _otakuOn) {
    _otakuOn = false;
    document.getElementById('htmlRoot').classList.remove('otaku-mode');
    document.getElementById('bnavOtaku').classList.remove('active');
    document.getElementById('homePage').classList.add('active');
    document.getElementById('bnavHome').classList.add('active');
    if (hero) { hero.style.display = ''; hero.style.visibility = ''; }
    loadHeroSwiper();
    loadHomePage();
    window.scrollTo(0, 0);
    return;
  }

  const pageMap = { home:'homePage', search:'searchPage', library:'libraryPage', profile:'profilePage', otaku:'homePage', football:'footballPage' };
  const btnMap = { home:'bnavHome', search:'bnavSearch', library:'bnavLibrary', profile:'bnavProfile', otaku:'bnavOtaku', football:'bnavFootball' };
  
  document.getElementById(pageMap[tab])?.classList.add('active');
  const _ab = document.getElementById(btnMap[tab]);
  if(_ab) { _ab.style.width='auto'; _ab.classList.add('active'); }
  if (hero) {
    hero.style.display = (tab === 'home' || tab === 'otaku') ? '' : 'none';
    hero.style.visibility = (tab === 'home' || tab === 'otaku') ? '' : 'hidden';
  }
  if (tab === 'home') { loadHeroSwiper(); loadHomePage(); loadNewsSection('newsFeed', CONFIG.NEWS.CINEMA, 'red'); const _t=document.getElementById('newsSectionTitle'); if(_t) _t.textContent='📰 أخبار السينما الحية'; }
  if (tab === 'library') loadLibraryPage();
  if (tab === 'search') { initSearchDiscovery(); const inp = document.getElementById('searchInput2'); if(inp) { inp.value=''; setTimeout(()=>inp.focus(),200); } }
  if (tab === 'profile') loadProfilePage();
  if (tab === 'football') loadSportsUI();
  document.getElementById('platformsSection').style.display = (tab === 'home') ? '' : 'none';
  if (tab === 'otaku') { if(hero){hero.style.display='';hero.style.visibility='';} _otakuOn=true; document.getElementById('htmlRoot').classList.add('otaku-mode'); document.getElementById('bnavOtaku').classList.add('active'); loadOtakuPage(); loadNewsSection('newsFeed',CONFIG.NEWS.ANIME,'purple'); document.getElementById('newsSectionTitle').textContent='📰 أخبار الأنمي'; document.getElementById('newsSection').style.display='block'; document.getElementById('studioBar').style.display='block'; }
  window.scrollTo(0,0);
}
function testNotifAlert() {
  const btn = document.querySelector('.notif-test-btn');
  const alerts = getLib('rox_alerts');
  if (!alerts.length) { showToast('لا يوجد مسلسلات مشترك فيها بعد'); return; }
  const item = alerts[0];
  if (btn) {
    btn.disabled = true;
    btn.textContent = '⏳ 5...';
    let count = 5;
    const timer = setInterval(() => {
      count--;
      if (btn) btn.textContent = `⏳ ${count}...`;
      if (count <= 0) {
        clearInterval(timer);
        addNotif(
          item.title,
          'اختبار — الموسم 1 · الحلقة 1',
          ''
        );
        if (btn) {
          btn.disabled = false;
          btn.textContent = '✅ وصل!';
          setTimeout(() => {
            if (btn) btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/><circle cx="12" cy="8" r="1" fill="currentColor"/></svg>تجربة`;
          }, 2000);
        }
      }
    }, 1000);
  }
}
function unmuteTrailer(id) {
  const frame = document.getElementById(`dpTrailerFrame_${id}`);
  const overlay = document.getElementById(`unmuteOverlay_${id}`);
  if (frame) { frame.src = frame.src.replace('mute=1', 'mute=0'); }
  if (overlay) { overlay.style.opacity='0'; setTimeout(()=>overlay.style.display='none',400); }
}

function goBack() {
  if (window._trailerTimer) { clearTimeout(window._trailerTimer); window._trailerTimer = null; }
  if (window._detailHistory && window._detailHistory.length > 0) {
  const prev = window._detailHistory.pop();
  window._lastDetailId = null;
  openDetail(prev.id, prev.type);
  return;
  }
  if (window._activeTrailerFrame) { window._activeTrailerFrame.src = ''; window._activeTrailerFrame = null; }
  const hero = document.getElementById('heroSection');
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.bnav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('homePage').classList.add('active');
  if (_otakuOn) {
    document.getElementById('bnavOtaku').classList.add('active');
    if (hero) { hero.style.display = ''; hero.style.visibility = ''; }
    document.getElementById('studioBar').style.display = 'block';
    document.getElementById('newsSection').style.display = 'block';
    document.getElementById('newsSectionTitle').textContent = '📰 أخبار الأنمي';
  } else {
    document.getElementById('bnavHome').classList.add('active');
    if (hero) { hero.style.display = ''; hero.style.visibility = ''; }
  }
  window.scrollTo(0, 0);
}

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
// ===== GOOGLE AUTH =====
function roxSignIn() {
  ROX_AUTH.signInWithPopup(ROX_PROVIDER).catch(e => console.error(e));
}
function roxSignOut() {
  ROX_AUTH.signOut();
  showToast('👋 تم تسجيل الخروج');
  setTimeout(() => loadProfilePage(), 500);
}
if (window.ROX_AUTH) {
  ROX_AUTH.onAuthStateChanged(user => {
  window.ROX_USER = user || null;
  if (document.getElementById('profilePage')?.classList.contains('active')) loadProfilePage();
  if (document.getElementById('libraryPage')?.classList.contains('active')) loadLibraryPage();
});
}
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
    const timeout = setTimeout(() => ctrl.abort(), 8000);
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
async function openAnimeJikan(malId, encodedTitle) {
  const title = decodeURIComponent(encodedTitle);
  const page  = document.getElementById('detailPage');
  if (!page) return;
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('heroSection').style.display = 'none';
  document.getElementById('newsSection').style.display = 'none';
  document.getElementById('studioBar').style.display   = 'none';
  page.classList.add('active');
  page.innerHTML = '<div class="loading">⏳ جاري تحميل التفاصيل...</div>';
  window.scrollTo(0,0);
  try {
    const [detRes, tmdbRes, epsRes] = await Promise.all([
      fetch(`${CONFIG.API.JIKAN_BASE}/anime/${malId}/full`).then(r=>r.json()),
      fetch(buildTMDBUrl('/search/tv', { query: title, page:1 })).then(r=>r.json()),
      fetch(`${CONFIG.API.JIKAN_BASE}/anime/${malId}/episodes?page=1`).then(r=>r.json()),
    ]);
    const a       = detRes.data;
    const tmdbHit = (tmdbRes.results||[])[0];
    const tmdbId  = tmdbHit?.id || null;
    const poster  = a.images?.jpg?.large_image_url || CONFIG.IMAGES.PLACEHOLDER;
    const backdrop= a.images?.jpg?.large_image_url || '';
    const trailer = (a.trailer?.url||'').replace('watch?v=','embed/');
    const genres  = (a.genres||[]).map(g=>`<span class="detail-genre">${g.name}</span>`).join('');
    const studios = (a.studios||[]).map(s=>s.name).join(', ');
    const score   = a.score||'N/A';
    const eps     = a.episodes||'?';
    const status  = a.status||'';
    const synopsis= a.synopsis||'لا يوجد وصف.';
    const episodes = epsRes.data || [];
    const _ap = getProgress(malId);
    const watchBtn = `<button class="detail-btn detail-btn-now" onclick="openWatchPage(${tmdbId||0},'tv',1,${_ap?_ap.episode+1:1})">▶ ${_ap?`أكمل المشاهدة: الحلقة ${_ap.episode+1}`:'شاهد الآن — الحلقة 1'}</button>`;
    const trailerBtn = trailer
      ? `<button class="detail-btn detail-btn-trailer" onclick="playTrailer('${a.trailer?.youtube_id}')">▶ المقطع الدعائي</button>`
      : '';
    page.innerHTML = `
      <div class="detail-backdrop" style="background-image:url('${backdrop}')">
        <div class="detail-backdrop-gradient"></div>
        <button class="detail-back-btn" onclick="goBack()">← رجوع</button>
      </div>
      <div class="detail-body">
        <div class="detail-top">
          <img class="detail-poster" src="${poster}" onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'">
          <div class="detail-info">
            <h1 class="detail-title">${a.title}</h1>
            <div class="detail-stats-bar">
              <div class="stat-cap stat-gold"><svg class="stat-ico" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg><span>${score}</span></div>
              <div class="stat-cap stat-views"><svg class="stat-ico" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg><span>${(a.members||0).toLocaleString()}</span></div>
            </div>
            <div class="detail-meta">
              ${eps?`<span class="detail-badge"><svg class="stat-ico" viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>${eps} حلقة</span>`:''}
              ${status?`<span class="detail-badge detail-rating"><svg class="stat-ico" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>${status}</span>`:''}
              ${studios?`<span class="detail-badge"><svg class="stat-ico" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>${studios}</span>`:''}
            </div>
            </div>
            <div class="detail-genres">${genres}</div>
            <div class="detail-actions">
              ${watchBtn}${trailerBtn}
              <button class="detail-btn detail-btn-watch" onclick="addToWatchlist(${malId},'anime')">❤️ قائمتي</button>
              <button class="detail-btn detail-btn-alert dp-btn-share" id="shareBtn_${malId}" onclick="shareContent(${malId},'${a.title}','anime')">
  <svg style="width:14px;height:14px;vertical-align:middle;margin-left:4px" viewBox="0 0 24 24">
    <defs><linearGradient id="sga_${malId}" x1="10%" y1="0%" x2="90%" y2="100%"><stop offset="0%" stop-color="#e0aaff"/><stop offset="100%" stop-color="#6b21a8"/></linearGradient></defs>
    <circle cx="18" cy="5"  r="3" fill="url(#sga_${malId})"/><circle cx="16.8" cy="4"  r="0.9" fill="rgba(255,255,255,0.5)"/>
    <circle cx="6"  cy="12" r="3" fill="url(#sga_${malId})"/><circle cx="4.8"  cy="11" r="0.9" fill="rgba(255,255,255,0.5)"/>
    <circle cx="18" cy="19" r="3" fill="url(#sga_${malId})"/><circle cx="16.8" cy="18" r="0.9" fill="rgba(255,255,255,0.5)"/>
    <line x1="8.6" y1="10.5" x2="15.4" y2="6.5"  stroke="#c084fc" stroke-width="1.6" stroke-linecap="round"/>
    <line x1="8.6" y1="13.5" x2="15.4" y2="17.5" stroke="#c084fc" stroke-width="1.6" stroke-linecap="round"/>
  </svg> مشاركة
</button>
          <button class=\"detail-btn detail-btn-alert ${getLib('rox_alerts').find(i=>i.id===(tmdbId||malId))?'active':''}\" style=\"${getLib('rox_alerts').find(i=>i.id===(tmdbId||malId))?'color:#1ce783;border-color:rgba(28,231,131,0.7);box-shadow:0 0 14px rgba(28,231,131,0.3)':''}\" id=\"alertBtn_${tmdbId||malId}\" onclick=\"toggleAlertSubscription(${tmdbId||malId},'${a.title}','tv')\"><span class=\"btn-bell-ico\"></span> ${getLib('rox_alerts').find(i=>i.id===(tmdbId||malId))?'مشترك التنبيهات':'تنبيه بالحلقات'}</button>            </div>
          </div>
        </div>
        ${episodes.length ? `
        <div class="seasons-glass">
          <div class="seasons-header">
            <h3 class="detail-section-title" style="margin:0">🎬 الحلقات</h3>
            <span style="color:rgba(255,255,255,0.4);font-size:0.75rem">${a.episodes||'?'} حلقة</span>
          </div>
          <div class="eps-header-bar">
            <button class="eps-view-all-btn" onclick="openAllEps(${tmdbId||0},1)">عرض الكل ›</button>
          </div>
          <div class="swiper eps-swiper" id="epsSwiper_${malId}">
            <div class="swiper-wrapper">
              ${episodes.map((e,i)=>`
                <div class="swiper-slide ep-card ${(() => { const p=getProgress(malId); return p && p.episode+1===(e.episode_id||i+1) ? 'ep-next-glow' : ''; })()}" onclick="saveProgress(${tmdbId||0},1,${e.episode_id||i+1});openWatchPage(${tmdbId||0},'tv',1,${e.episode_id||i+1})">
                  <div class="ep-thumb-wrap">
                    <img data-src="${e.images?.jpg?.image_url||poster}"
                         src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
                         class="lazy-img ep-thumb" onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'">
                    <div class="ep-num-badge">ح ${e.episode_id||i+1}</div>
                  </div>
                  <div class="ep-info">
                    <div class="ep-title">${(e.title||'حلقة '+(e.episode_id||i+1)).slice(0,28)}</div>
                  </div>
                </div>`).join('')}
            </div>
          </div>
        </div>` : ''}
        <div class="detail-tabs-bar">
          ${episodes.length?`<button class="dtab active" onclick="switchTab(this,'tab-eps-a')">الحلقات</button>`:''}
          <button class="dtab ${!episodes.length?'active':''}" onclick="switchTab(this,'tab-about-a')">عن العمل</button>
          <button class="dtab" onclick="switchTab(this,'tab-trailers-a')">العروض الترويجية</button>
        </div>
        <div id="tab-eps-a" class="dtab-content ${episodes.length?'active':''}">
        </div>
        <div id="tab-about-a" class="dtab-content ${!episodes.length?'active':''}">
          <div class="detail-section">
            <p class="detail-overview">${synopsis}</p>
          </div>
        </div>
        <div id="tab-trailers-a" class="dtab-content"></div>
        </div>`;
    if(window.Swiper && episodes.length) new Swiper(`#epsSwiper_${malId}`,{slidesPerView:2.3,spaceBetween:10,freeMode:true,grabCursor:true});
  } catch(e) {
    page.innerHTML = `<div class="loading">❌ خطأ<br><button class="detail-btn" onclick="goBack()">← رجوع</button></div>`;
  }
}
// ===== HERO SWIPER =====
let heroSwiper = null;

async function loadHeroSwiper() {
  if (heroSwiper) { heroSwiper.destroy(true, true); heroSwiper = null; }
  const wrapper = document.getElementById('heroSwiperWrapper');
  if (!wrapper) return;

let movies = await fetchMovies('/trending/movie/week', { limit: 5, requirePoster: true });
  if (!movies.length) movies = await fetchMovies('/movie/popular', { limit: 5, requirePoster: true });
  if (!movies.length) return;

  wrapper.innerHTML = movies.map(m => {
    const bg = m.backdrop_path
      ? `${CONFIG.IMAGES.BACKDROP}${m.backdrop_path}`
      : `${CONFIG.IMAGES.POSTER_XL}${m.poster_path}`;
    return `<div class="swiper-slide hero-swiper-slide" style="background-image:url('${bg}');background-size:cover;background-position:center;width:100%;height:100%;"></div>`;
  }).join('');

  heroSwiper = new Swiper('#heroSwiper', {
  grabCursor: true,
  allowTouchMove: true,
  centeredSlides: true,
  slidesPerView: 1,
  loop: true,
  loopedSlides: movies.length,
  autoplay: {
    delay: CONFIG.HERO?.AUTOPLAY_MS || 6500,
    disableOnInteraction: false,
  },
  speed: 600,
  on: {
    init: function() {
      updateHeroInfo(movies, 0);
      const dotsEl = document.getElementById('heroDots');
      if (dotsEl) dotsEl.innerHTML = movies.map((_,i) => `<div class="hero-dot ${i===0?'active':''}"></div>`).join('');
    },
    slideChange: function() {
      updateHeroInfo(movies, this.realIndex);
      document.querySelectorAll('.hero-dot').forEach((d,i) => d.classList.toggle('active', i===this.realIndex));
    }
  }
});
}
async function getFanartBackdrop(tmdbId, mediaType) {
  try {
    const type = mediaType === 'tv' ? 'tv' : 'movies';
    const res = await fetch(`${CONFIG.API.FANART_BASE}/${type}/${tmdbId}?api_key=${CONFIG.KEYS.FANART}`);
    const data = await res.json();
    const imgs = data.moviebackground || data.showbackground || [];
    if (imgs.length > 0) return imgs[0].url;
  } catch(e) {}
  return null;
}
async function updateHeroInfo(movies, index) {
  const m = movies[index % movies.length];
  if (!m) return;
  const snapId = m.id;

  const yearEl     = document.getElementById('heroInfoYear');
  const titleEl    = document.getElementById('heroInfoTitle');
  const overviewEl = document.getElementById('heroInfoOverview');
  const genresEl   = document.getElementById('heroInfoGenres');
  const ratingEl   = document.getElementById('heroInfoRating');
  const durEl      = document.getElementById('heroInfoDuration');

  const GENRES = {
    28:'أكشن',12:'مغامرة',16:'رسوم متحركة',35:'كوميديا',80:'جريمة',
    99:'وثائقي',18:'دراما',10751:'عائلي',14:'خيال',36:'تاريخي',
    27:'رعب',10402:'موسيقى',9648:'غموض',10749:'رومانسي',
    878:'خيال علمي',53:'إثارة',10752:'حرب'
  };

  const date = m.release_date || m.first_air_date || '';
  if (yearEl) yearEl.textContent = date.slice(0,4);
  if (overviewEl) overviewEl.textContent = m.overview || '';
  if (titleEl) {
    titleEl.innerHTML = '';
    titleEl.textContent = m.title || m.name || m.original_title || '';
  }
  if (genresEl) {
    const names = (m.genre_ids||[]).slice(0,3).map(id=>GENRES[id]).filter(Boolean);
    genresEl.innerHTML = names.map(n=>`<span class="hero-cap">${n}</span>`).join('');
  }
  if (ratingEl) {
    const rating = m.vote_average ? m.vote_average.toFixed(1) : '';
    ratingEl.innerHTML = rating ? `<span class="hero-cap hero-cap-rating"><svg width="11" height="11" viewBox="0 0 24 24" fill="var(--gold)" style="vertical-align:middle;margin-left:3px"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>${rating}</span>` : '';
  }
  if (durEl) durEl.innerHTML = m.media_type === 'movie'
    ? '<i class="ri-film-line" style="margin-left:5px;vertical-align:middle"></i> فيلم'
    : '<i class="ri-tv-2-line" style="margin-left:5px;vertical-align:middle"></i> مسلسل';

  const backdrop = document.getElementById('heroBackdrop');
  if (backdrop) {
    backdrop.style.backgroundImage = `url('${CONFIG.IMAGES[CONFIG.HERO.BACKDROP_SIZE]}${m.backdrop_path||m.poster_path}')`;
    backdrop.classList.remove('loaded');
    setTimeout(()=>backdrop.classList.add('loaded'),80);
  }

  const type = m.media_type === 'tv' ? 'tv' : 'movie';
  try {
    const [logoRes, arRes] = await Promise.all([
      fetch(`${CONFIG.API.TMDB_BASE}/${type}/${m.id}/images?api_key=${CONFIG.KEYS.TMDB}&include_image_language=en,null`),
      fetch(`${CONFIG.API.TMDB_BASE}/${type}/${m.id}?api_key=${CONFIG.KEYS.TMDB}&language=ar`)
    ]);
    if (m.id !== snapId) return;
    const [logoData, arData] = await Promise.all([logoRes.json(), arRes.json()]);
    if (m.id !== snapId) return;

    if (titleEl) {
      const logo = logoData.logos?.[0]?.file_path;
      if (logo) {
        titleEl.innerHTML = `<img src="${CONFIG.IMAGES.ORIGINAL}${logo}" style="max-height:90px;max-width:80%;width:auto;object-fit:contain;object-position:left bottom;filter:drop-shadow(0 2px 12px rgba(0,0,0,0.9));display:block;margin:0;">`;
      }
    }
    if (overviewEl) {
      const arOverview = arData.overview || '';
      overviewEl.textContent = arOverview || m.overview || '';
    }
  } catch {
    if (m.id !== snapId) return;
  }

  const playBtn = document.getElementById('heroPlayBtn');
  if (playBtn) playBtn.onclick = () => openDetail(m.id, m.media_type || 'movie');
  const addBtn = document.getElementById('heroAddBtn');
  if (addBtn) addBtn.onclick = () => toggleLib(m, 'watchlist');
}
    function buildMovieCard(movie, type = 'movie', extraClass = '', rank = 0) {
  const title  = type === 'movie'
    ? (movie.title || movie.original_title)
    : (movie.name  || movie.original_name);
  const img = movie.poster_path
    ? `${CONFIG.IMAGES.POSTER_XL}${movie.poster_path}`
    : (movie.backdrop_path ? `${CONFIG.IMAGES.BACKDROP}${movie.backdrop_path}` : CONFIG.IMAGES.PLACEHOLDER);
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '';
  const year   = (movie.release_date || movie.first_air_date || '').slice(0,4);
  const typeLabel = type === 'tv' ? 'SERIES' : 'MOVIE';
  const isNew = (() => {
    const d = movie.release_date || movie.first_air_date;
    if (!d) return false;
    return (Date.now() - new Date(d).getTime()) < 60*24*60*60*1000;
  })();
  return `
  <div class="movie-card ${extraClass}${isNew?' movie-card--new':''}" data-id="${movie.id}" data-type="${type}"
    onclick="openDetail(this.dataset.id,this.dataset.type)"
    data-poster="${img}">
    <div class="movie-poster-wrap">
      ${isNew ? `<span class="mc-new-badge">✦ جديد</span>` : ''}
      ${rank > 0 ? `<span class="rank-number rank-number--red">${rank}</span>` : ''}
      <img class="movie-poster fade-img" src="${img}" alt="${title}" loading="lazy"
           onload="this.classList.add('loaded')"
           onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}';this.classList.add('loaded')">
      <div class="movie-overlay"><span class="play-icon">▶</span></div>
    </div>
  </div>`;
}
function buildSearchCard(movie, type) {
  const title = type === 'movie'
    ? (movie.title || movie.original_title)
    : (movie.name  || movie.original_name);
  const poster = movie.poster_path
    ? `${CONFIG.IMAGES.POSTER_XL}${movie.poster_path}`
    : CONFIG.IMAGES.PLACEHOLDER;
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '';
  const overview = (movie.overview || '').slice(0, 100);
  return `
    <div class="search-result-card" onclick="openDetail(${movie.id},'${type}')">
      <div class="src-poster-wrap">
        <img class="src-poster" src="${poster}" alt="${title}" loading="lazy"
             onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'">
        <div class="src-overlay"><span class="play-icon">▶</span></div>
      </div>
      <div class="src-title">${title}</div>
      ${rating ? `<div class="src-rating">⭐ ${rating}</div>` : ''}
      ${overview ? `<div class="src-overview">${overview}${movie.overview?.length > 100 ? '...' : ''}</div>` : ''}
    </div>`;
}
function buildAnimeCard(movie, rank = 0, type = 'tv') {
  const title = movie.name || movie.original_name || movie.title || '';
  const img = movie.poster_path
    ? `${CONFIG.IMAGES.POSTER_XL}${movie.poster_path}`
    : (movie.backdrop_path ? `${CONFIG.IMAGES.BACKDROP}${movie.backdrop_path}` : CONFIG.IMAGES.PLACEHOLDER);
  const year = (movie.first_air_date || movie.release_date || '').slice(0,4);
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '';
  return `
    <div class="anime-card" onclick="openDetail(${movie.id},'${type}')">
      <div class="anime-poster-wrap">
        <img class="anime-poster fade-img" src="${img}" loading="lazy"
             onload="this.classList.add('loaded')"
             onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}';this.classList.add('loaded')">
        <div class="anime-overlay"><span class="play-icon">▶</span></div>
        ${rank > 0 ? `<span class="rank-number">${rank}</span>` : ''}
      </div>
      <div class="anime-title-bar">${title.length > 32 ? title.slice(0,32)+'...' : title}</div>
      <div class="anime-meta-bar">
        <span class="anime-badge-type">أنمي</span>
        <span class="anime-badge-year">${toArabicNums(year)}</span>
        ${rating ? `<span class="anime-badge-rating"><svg width="11" height="11" viewBox="0 0 24 24" fill="#f5c518"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> ${rating}</span>` : ''}
      </div>
    </div>`;
}
function toArabicNums(str) {
  return String(str).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
}
function applyCardGlow() {
  document.querySelectorAll('.movie-card[data-poster], .anime-card[data-poster]').forEach(card => {
    if (card.dataset.glowApplied) return;
    card.dataset.glowApplied = '1';
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const c = document.createElement('canvas');
        c.width = 20; c.height = 20;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0, 20, 20);
        const d = ctx.getImageData(0,0,20,20).data;
        let r=0,g=0,b=0,n=0;
        for (let i=0;i<d.length;i+=16){
          const br=(d[i]+d[i+1]+d[i+2])/3;
          if(br>30&&br<220){r+=d[i];g+=d[i+1];b+=d[i+2];n++;}
        }
        if(!n) return;
        r=Math.round(r/n); g=Math.round(g/n); b=Math.round(b/n);
        const max=Math.max(r,g,b), min=Math.min(r,g,b);
        if(max===0||(max-min)/max<0.2) return;
        const boost=1.3;
        r=Math.min(255,Math.round(r+(max-r)*boost));
        g=Math.min(255,Math.round(g+(max-g)*boost));
        b=Math.min(255,Math.round(b+(max-b)*boost));
        card.style.setProperty('--card-glow', `${r},${g},${b}`);
        card.classList.add('has-glow');
      } catch(e){}
    };
    img.src = card.dataset.poster;
  });
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
// ===== OTAKU MODE =====
let _otakuOn = false;
function toggleOtakuMode() {
  _otakuOn = true;
  document.getElementById('htmlRoot').classList.add('otaku-mode');
  bnavGo('otaku');
}
async function loadOtakuPage() {
  const page = document.getElementById('homePage');
  if (!page) return;
  loadOtakuHero();
  const SECTIONS = [
    { id: 'sec_otaku1', title: '🔥 الأكثر شعبية',   params: { with_genres:'16', with_origin_country:'JP', sort_by:'popularity.desc' } },
    { id: 'sec_otaku2', title: '⭐ الأعلى تقييماً', params: { with_genres:'16', with_origin_country:'JP', sort_by:'vote_average.desc', 'vote_count.gte':'200' } },
    { id: 'sec_otaku3', title: '🆕 موسم هذا العام', params: { with_genres:'16', with_origin_country:'JP', sort_by:'first_air_date.desc', 'first_air_date.gte': new Date().getFullYear()+'-01-01' } },
  ];
  page.innerHTML = SECTIONS.map(s => `
    <div class="home-section otaku-section" id="${s.id}">
      <div class="section-header">
        <span class="section-bar"></span>
        <h2 class="section-title otaku-sec-title">${s.title}</h2>
        <button class="browse-all-btn" onclick="openOtakuAll('${s.id}','${s.title}','tv')">عرض الكل ›</button>
      </div>
      <div class="otaku-slider-wrap">
        <button class="otaku-arrow otaku-arrow-left" onclick="otakuSlide('${s.id}_row',-1)">‹</button>
        <div class="otaku-row" id="${s.id}_row"></div>
        <button class="otaku-arrow otaku-arrow-right" onclick="otakuSlide('${s.id}_row',1)">›</button>
      </div>
    </div>`).join('');
  for (const s of SECTIONS) {
    try {
      const animes = await fetchMovies('/discover/tv', { type:'tv', limit:10, params: s.params });
      const row = document.getElementById(`${s.id}_row`);
      if (!row) return;
      row.innerHTML = animes.map((m, idx) => buildAnimeCard(m, idx+1, 'tv')).join('');
    } catch { document.getElementById(s.id)?.remove(); }
  }
}
function otakuSlide(rowId, dir) {
  const row = document.getElementById(rowId);
  if (!row) return;
  row.scrollBy({ left: dir * 340, behavior: 'smooth' });
}
async function openOtakuAll(secId, title, type) {
  const page = document.getElementById('detailPage');
  if (!page) return;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('heroSection').style.display = 'none';
  document.getElementById('newsSection').style.display = 'none';
  document.getElementById('studioBar').style.display = 'none';
  page.classList.add('active');
  page.innerHTML = '<div class="loading">⏳ جاري التحميل...</div>';
  window.scrollTo(0, 0);

  const SECTION_PARAMS = {
    sec_otaku1: { with_genres:'16', with_origin_country:'JP', sort_by:'popularity.desc' },
    sec_otaku2: { with_genres:'16', with_origin_country:'JP', sort_by:'vote_average.desc', 'vote_count.gte':'200' },
    sec_otaku3: { with_genres:'16', with_origin_country:'JP', sort_by:'first_air_date.desc', 'first_air_date.gte': new Date().getFullYear()+'-01-01' },
  };

  const params = SECTION_PARAMS[secId] || { with_genres:'16', with_origin_country:'JP', sort_by:'popularity.desc' };
  const endpoint = type === 'movie' ? '/discover/movie' : '/discover/tv';
  const movies = await fetchMovies(endpoint, { type, limit: 30, params });

  page.innerHTML = `
    <div style="padding:16px">
      <button class="detail-btn" onclick="studioGoBack()" style="margin-bottom:16px">← رجوع</button>
      <h2 style="color:#fff;margin-bottom:16px;font-size:1rem">${title}</h2>
      <div class="otaku-all-grid">
        ${movies.map((m, idx) => buildAnimeCard(m, idx + 1, type)).join('')}
      </div>
    </div>`;
}
async function openStudio(name, id) {
  const page = document.getElementById('detailPage');
  if (!page) return;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('heroSection').style.display = 'none';
  document.getElementById('newsSection').style.display = 'none';
  document.getElementById('studioBar').style.display = 'none';
  page.classList.add('active');
  page.innerHTML = '<div class="loading">⏳ جاري التحميل...</div>';
  window.scrollTo(0, 0);
  const [movRes, tvRes] = await Promise.all([
    fetchMovies('/discover/movie', { type:'movie', limit:10, params:{ with_companies: String(id), sort_by:'popularity.desc', include_adult: 'false' }}),
    fetchMovies('/discover/tv',    { type:'tv',    limit:10, params:{ with_companies: String(id), sort_by:'popularity.desc', include_adult: 'false' }}),
  ]);
  const hasContent = movRes.length || tvRes.length;
  page.innerHTML = `
    <div style="padding:16px">
      <button class="detail-btn" onclick="studioGoBack()" style="margin-bottom:16px">← رجوع</button>
      <h2 style="color:#fff;margin-bottom:16px;font-size:1.1rem">🎌 ${name}</h2>
      ${!hasContent ? '<p style="color:rgba(255,255,255,0.5);text-align:center;margin-top:40px">لا توجد نتائج متاحة</p>' : ''}
      ${movRes.length ? `
        <h3 style="color:rgba(255,255,255,0.6);font-size:0.75rem;margin-bottom:10px">🎬 أفلام</h3>
        <div class="otaku-all-grid" style="margin-bottom:20px">
          ${movRes.map((m,i) => buildAnimeCard(m, i+1, 'movie')).join('')}
        </div>` : ''}
      ${tvRes.length ? `
        <h3 style="color:rgba(255,255,255,0.6);font-size:0.75rem;margin-bottom:10px">📺 مسلسلات</h3>
        <div class="otaku-all-grid">
          ${tvRes.map((m,i) => buildAnimeCard(m, i+1, 'tv')).join('')}
        </div>` : ''}
    </div>`;
}
function studioGoBack() {
  const hero = document.getElementById('heroSection');
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.bnav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('homePage').classList.add('active');
  document.getElementById('bnavOtaku').classList.add('active');
  if (hero) { hero.style.display = ''; hero.style.visibility = ''; }
  document.getElementById('studioBar').style.display = 'block';
  document.getElementById('newsSection').style.display = 'block';
  document.getElementById('newsSectionTitle').textContent = '📰 أخبار الأنمي';
  window.scrollTo(0, 0);
}
async function loadOtakuHero() {
  if (heroSwiper) { heroSwiper.destroy(true, true); heroSwiper = null; }
  const wrapper = document.getElementById('heroSwiperWrapper');
  if (!wrapper) return;

  const movies = await fetchMovies('/discover/tv', {
    type: 'tv', limit: 5, requirePoster: true,
    params: { with_genres:'16', with_origin_country:'JP', sort_by:'popularity.desc' }
  });
  if (!movies.length) return;

  wrapper.innerHTML = movies.map(m => {
    const bg = m.backdrop_path
      ? `${CONFIG.IMAGES.BACKDROP}${m.backdrop_path}`
      : `${CONFIG.IMAGES.POSTER_XL}${m.poster_path}`;
    return `<div class="swiper-slide hero-swiper-slide" style="background-image:url('${bg}');background-size:cover;background-position:center;width:100%;height:100%;"></div>`;
  }).join('');

  heroSwiper = new Swiper('#heroSwiper', {
  grabCursor: true,
  allowTouchMove: true,
  centeredSlides: true,
  slidesPerView: 1,
  loop: true,
  loopedSlides: movies.length,
  autoplay: { delay: CONFIG.HERO?.AUTOPLAY_MS || 6500, disableOnInteraction: false },
  speed: 600,
  on: {
    init: function() {
      updateHeroInfo(movies, 0);
      const dotsEl = document.getElementById('heroDots');
      if (dotsEl) dotsEl.innerHTML = movies.map((_,i) => `<div class="hero-dot ${i===0?'active':''}"></div>`).join('');
    },
    slideChange: function() {
      updateHeroInfo(movies, this.realIndex);
      document.querySelectorAll('.hero-dot').forEach((d,i) => d.classList.toggle('active', i===this.realIndex));
    }
  }
});
}
async function loadHomePage() {
  const page = document.getElementById('homePage');
  if (!page) return;

  const SECTIONS = [
{ id: 'sec_popular',  title: 'الأفلام الرائجة',   endpoint: '/movie/popular',   type: 'movie' },
{ id: 'sec_toprated', title: 'الأعلى تقييماً',    endpoint: '/movie/top_rated', type: 'movie' },
{ id: 'sec_tvseries', title: 'أحدث المسلسلات',    endpoint: '/tv/popular',      type: 'tv'    },
  ];

  // عرض الـ Skeleton فوراً بدون انتظار
  const cwItems = cwGetAll();
  const cwHTML = cwItems.length ? `
    <div id="continueSection" class="continue-section">
      <div class="section-header">
        <span class="section-bar"></span>
        <h2 class="section-title">▶️ أكمل المشاهدة</h2>
      </div>
      <div id="continueList" class="continue-list">
        ${cwItems.map(i => `
          <div class="cw-card" onclick="cwResume(${i.id},'${i.type}',${i.seconds},'${i.server}','${i.serverUrl||''}')">
            <img class="cw-thumb" src="${i.poster}" onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'">
            <div class="cw-info">
              <div class="cw-title">${i.title}</div>
              <div class="cw-bar-wrap"><div class="cw-bar" style="width:${Math.min(i.seconds/7200*100,100).toFixed(1)}%"></div></div>
              <div class="cw-time">${Math.floor(i.seconds/60)} دقيقة ${i.server ? '· '+i.server : ''}</div>
            </div>
            <button class="cw-del" onclick="event.stopPropagation();cwDelete(${i.id})">✕</button>
          </div>`).join('')}
      </div>
    </div>` : '';

  page.innerHTML = cwHTML + SECTIONS.map(s => `
    <div class="home-section" id="${s.id}">
      <div class="section-header">
        <span class="section-bar"></span>
        <h2 class="section-title">${s.title}</h2>
        <button class="browse-all-btn" onclick="openBrowseAll('${s.type}','${s.endpoint}','${s.title}')">عرض الكل ›</button>
      </div>
      <div class="otaku-slider-wrap">
        <button class="otaku-arrow otaku-arrow-left" onclick="otakuSlide('${s.id}_row',-1)">‹</button>
        <div class="movies-row" id="${s.id}_row">
          ${Array(4).fill('<div class="movie-card skeleton-card"></div>').join('')}
        </div>
        <button class="otaku-arrow otaku-arrow-right" onclick="otakuSlide('${s.id}_row',1)">›</button>
      </div>
    </div>`).join('');

  // كل قسم يتحمل بشكل مستقل
  SECTIONS.forEach(async s => {
    try {
      const movies = await fetchMovies(s.endpoint, { type: s.type, params: s.params || {} });
      const row = document.getElementById(`${s.id}_row`);
      const container = document.getElementById(s.id);
      if (!row || !container) return;

      if (!movies.length) {
        container.remove();
        return;
      }
      row.innerHTML = movies.map((m, i) => buildMovieCard(m, s.type, s.cardClass || '', i + 1)).join('');
      setTimeout(applyCardGlow, 800);
    } catch (e) {
      const container = document.getElementById(s.id);
      if (container) container.remove();
    }
  });
}
async function openBrowseAll(type, endpoint, title) {
  const page = document.getElementById('detailPage');
  if (!page) return;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('heroSection').style.display = 'none';
  document.getElementById('newsSection').style.display = 'none';
  document.getElementById('studioBar').style.display = 'none';
  page.classList.add('active');
  page.innerHTML = '<div class="loading">⏳ جاري التحميل...</div>';
  window.scrollTo(0, 0);
  const movies = await fetchMovies(endpoint, { type, limit: 30, requireBackdrop: true });
  page.innerHTML = `
    <div style="padding:16px">
      <button class="detail-btn" onclick="goBack()" style="margin-bottom:16px">← رجوع</button>
      <h2 style="color:#fff;margin-bottom:16px;font-size:1rem">${title}</h2>
      <div class="otaku-all-grid">
        ${movies.map((m, i) => buildMovieCard(m, type, '', i + 1)).join('')}
      </div>
    </div>`;
}
function extractDominantColor(imgUrl, callback) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 50; canvas.height = 50;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, 50, 50);
    const data = ctx.getImageData(0, 0, 50, 50).data;
    let r=0, g=0, b=0, count=0;
    for (let i=0; i<data.length; i+=16) {
      const pr=data[i], pg=data[i+1], pb=data[i+2];
      const brightness = (pr+pg+pb)/3;
      if (brightness > 30 && brightness < 220) {
        r+=pr; g+=pg; b+=pb; count++;
      }
    }
    if (count===0) { callback(null); return; }
    r=Math.round(r/count); g=Math.round(g/count); b=Math.round(b/count);
    const max=Math.max(r,g,b), min=Math.min(r,g,b);
    const saturation = max === 0 ? 0 : (max - min) / max;
    if (saturation < 0.25) { callback(null); return; }
    const boost = 1.4;
    r=Math.min(255,Math.round(r+(max-r)*boost));
    g=Math.min(255,Math.round(g+(max-g)*boost));
    b=Math.min(255,Math.round(b+(max-b)*boost));
    callback(`${r},${g},${b}`);
  };
  img.onerror = () => callback(null);
  img.src = imgUrl;
}

function applyDynamicColor(rgb) {
  if (!rgb) return;
  document.documentElement.style.setProperty('--dynamic-color', `rgb(${rgb})`);
  document.documentElement.style.setProperty('--dynamic-glow', `rgba(${rgb},0.45)`);
  const btn = document.querySelector('.dp-action-watch');
  const row2Btns = document.querySelectorAll('.dp-action-fav');
  const sections = document.querySelectorAll('.detail-section-title');
  if (btn) {
    btn.style.setProperty('background', '#e50914', 'important');
    btn.style.setProperty('box-shadow', `0 4px 28px rgba(${rgb},0.55)`, 'important');
    btn.style.color = '#fff';
  }
  row2Btns.forEach(b => {
    b.style.borderColor = `rgba(${rgb},0.4)`;
    b.style.boxShadow = `0 0 12px rgba(${rgb},0.2)`;
  });
  sections.forEach(s => s.style.color = `rgb(${rgb})`);
  document.documentElement.style.setProperty('--dynamic-color', `rgb(${rgb})`);
  document.documentElement.style.setProperty('--dynamic-glow', `rgba(${rgb},0.45)`);
}
function calcSeasonEnd(detail) {
  const total = detail.number_of_episodes || 0;
  const aired = detail.last_episode_to_air?.episode_number || 0;
  const next  = detail.next_episode_to_air?.air_date || null;
  const remaining = total - aired;
  if (!total || !aired) return null;
  let endDate = null;
  if (next) {
    const d = new Date(next);
    d.setDate(d.getDate() + (remaining - 1) * 7);
    endDate = d.toLocaleDateString('ar-SA', { day:'numeric', month:'long', year:'numeric' });
  }
  return { total, aired, remaining, endDate, pct: Math.round((aired/total)*100) };
}
// ===== DETAIL PAGE =====
async function openDetail(id, type = 'movie') {
  if (window._lastDetailId && String(window._lastDetailId) !== String(id)) {
  window._detailHistory.push({ id: window._lastDetailId, type: window._lastDetailType });
  if (window._detailHistory.length > 10) window._detailHistory.shift();
  }
  window._lastDetailId = id;
  window._lastDetailType = type;
  document.getElementById('newsSection').style.display = 'none';
  document.getElementById('studioBar').style.display = 'none';
  const page = document.getElementById('detailPage');
  if (!page) return;

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.bnav-btn').forEach(b => b.classList.remove('active'));
  page.classList.add('active');
  const hero = document.getElementById('heroSection');
  if (hero) hero.style.display = 'none';
  window.scrollTo(0, 0);
  page.style.backgroundImage = '';
  page.innerHTML = '<div class="loading">⏳ جاري تحميل التفاصيل...</div>';

  try {
    const ep = type === 'tv' ? `/tv/${id}` : `/movie/${id}`;
    const safeJson = async (url) => {
      try { const r = await fetch(url); return r.ok ? r.json() : {}; } catch { return {}; }
    };
    const [detail, arDetail, videos, credits, revData, simData, recData, imgData, kwData, wpData] = await Promise.all([
      safeJson(buildTMDBUrl(ep)),
      safeJson(buildTMDBUrl(ep, { language: 'ar' })),
      safeJson(buildTMDBUrl(`${ep}/videos`)),
      safeJson(buildTMDBUrl(`${ep}/credits`)),
      safeJson(buildTMDBUrl(`${ep}/reviews`)),
      safeJson(buildTMDBUrl(`${ep}/similar`)),
      safeJson(buildTMDBUrl(`${ep}/recommendations`)),
      safeJson(buildTMDBUrl(`${ep}/images`)),
      safeJson(buildTMDBUrl(`${ep}/keywords`)),
      safeJson(buildTMDBUrl(`${ep}/watch/providers`)),
    ]);
    let keywords = (kwData.keywords || kwData.results || []).slice(0, 8);
if (keywords.length) {
  try {
    const q = encodeURIComponent(keywords.map(k=>k.name).join('\n'));
    const r = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ar&dt=t&q=${q}`);
    const d = await r.json();
    const parts = d[0].map(s=>s[0]).join('').split('\n');
    keywords = keywords.map((k,i)=>({...k, name:(parts[i]||k.name)}));
  } catch {}
}
    const providers = (wpData.results?.SA?.flatrate || wpData.results?.US?.flatrate || []).slice(0, 5);
    const galleryImgs = (imgData.backdrops || []).slice(0, 8).map(b => ({
      full: `${CONFIG.IMAGES.ORIGINAL}${b.file_path}`,
      md:   `https://image.tmdb.org/t/p/w1280${b.file_path}`,
      sm:   `https://image.tmdb.org/t/p/w500${b.file_path}`,
      path: b.file_path
    }));
    const fanartBds = await (async () => {
      try {
        const type = detail.media_type === 'tv' || detail.first_air_date ? 'tv' : 'movies';
        const res = await fetch(`${CONFIG.API.FANART_BASE}/${type}/${detail.id}?api_key=${CONFIG.KEYS.FANART}`);
        const data = await res.json();
        const imgs = data.moviebackground || data.showbackground || [];
        return imgs.slice(0, 6).map(i => i.url);
      } catch(e) { return []; }
    })();
    const rawBackdrops = fanartBds.length
      ? fanartBds
      : (imgData.backdrops || []).slice(0, 6).map(b => `${CONFIG.IMAGES.ORIGINAL}${b.file_path}`);
    const backdrops = rawBackdrops.length ? rawBackdrops : (detail.backdrop_path ? [`${CONFIG.IMAGES.ORIGINAL}${detail.backdrop_path}`] : [`${CONFIG.IMAGES.POSTER_XL}${detail.poster_path}`]);
    const trailer = (videos.results || []).find(v => v.type === CONFIG.VIDEO.TRAILER_TYPE && v.site === 'YouTube')
                 || (videos.results || [])[0];

    const backdrop = detail.backdrop_path
      ? `${CONFIG.IMAGES.ORIGINAL}${detail.backdrop_path}`
      : (detail.poster_path ? `${CONFIG.IMAGES.ORIGINAL}${detail.poster_path}` : '');

    const poster  = detail.poster_path
      ? `${CONFIG.IMAGES.POSTER_XL}${detail.poster_path}`
      : CONFIG.IMAGES.PLACEHOLDER;
    const tagline   = detail.tagline || '';
    const voteCount = detail.vote_count
      ? detail.vote_count.toLocaleString('ar-SA') : '';
    let title = type === 'movie'
      ? (arDetail.title || detail.title || detail.original_title)
      : (arDetail.name  || detail.name  || detail.original_name);;
    let overview = arDetail.overview || detail.overview || '';
    const genres   = (arDetail.genres || detail.genres || []).map(g => `<span class="genre-tag">${g.name}</span>`).join('');
    if (!arDetail.overview && detail.overview) {
      try {
        const q   = encodeURIComponent(detail.overview);
        const tRes = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ar&dt=t&q=${q}`);
        const tData = await tRes.json();
        overview = tData[0].map(s => s[0]).join('') || detail.overview;
      } catch { overview = detail.overview; }
    }
    const year    = (detail.release_date || detail.first_air_date || '').slice(0, 4);

    if (!arDetail.title && !arDetail.name && title) {
  try {
    const q = encodeURIComponent(title);
    const r = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ar&dt=t&q=${q}`);
    const d = await r.json();
    title = d[0].map(s=>s[0]).join('') || title;
  } catch {}
    }
    const rating  = detail.vote_average ? detail.vote_average.toFixed(1) : 'N/A';
    const director = (credits.crew||[]).find(c=>c.job==='Director');
    const awards = (detail.production_companies||[]).length ? [
      ...(detail.vote_average>=8?[{title:'أفضل تقييم جمهوري',org:'TMDB',year:year}]:[]),
      ...(detail.popularity>=100?[{title:'الأكثر شعبية',org:'Cinema ROX Charts',year:year}]:[]),
    ] : [];
    const whyWatch = [
      detail.overview?.length > 100 ? 'قصة عميقة ومحكمة البناء' : null,
      detail.vote_average >= 7.5 ? `تقييم عالٍ ${rating}/10 من الجمهور` : null,
      director ? `إخراج ${director.name}` : null,
      (detail.genres||[]).find(g=>['Action','Adventure','Science Fiction'].includes(g.name)) ? 'أكشن وإثارة لا تتوقف' : null,
      (detail.genres||[]).find(g=>['Drama','Romance'].includes(g.name)) ? 'أداء تمثيلي قوي ومؤثر' : null,
      (detail.genres||[]).find(g=>['Animation','Family'].includes(g.name)) ? 'مناسب للعائلة بالكامل' : null,
    ].filter(Boolean).slice(0,5);
    const voteHist = [10,9,8,7,6,5].map(s=>({
      star: s,
      pct: Math.max(1, Math.round((10-s+1)*8 + (detail.vote_average||5)*2 - s*3))
    }));
    const maxPct = Math.max(...voteHist.map(v=>v.pct));
    const runtime = type === 'movie'
  ? (detail.runtime ? `${detail.runtime} د` : '')
  : (detail.number_of_seasons
      ? `${detail.number_of_seasons} موسم · ${detail.number_of_episodes || ''} حلقة`
      : (detail.episode_run_time?.[0] ? `${detail.episode_run_time[0]} د/حلقة` : ''));
    const cast    = (credits.cast || []).slice(0, 12);

    const castHTML = cast.length ? `
      <div class="detail-section">
        <h3 class="detail-section-title">🎭 طاقم التمثيل</h3>
        <div class="cast-slider">
          ${cast.map(a => `
            <div class="cast-card-wide">
              <div class="cast-img-wrap">
                <img data-src="${a.profile_path ? CONFIG.IMAGES.PROFILE+a.profile_path : CONFIG.IMAGES.PLACEHOLDER}"
                     src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
                     alt="${a.name}" class="lazy-img cast-img-wide"
                     onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'">
                <div class="cast-neon-border"></div>
              </div>
              <span class="cast-name-wide">${a.name}</span>
              <span class="cast-char-wide">${(a.character||'').slice(0,20)}</span>
            </div>`).join('')}
        </div>
      </div>` : '';

    const simItems = (simData.results||[]).filter(i=>i.poster_path).slice(0,12);
    const recItems = (recData.results||[]).filter(i=>i.poster_path).slice(0,12);
    const _mediaType = type;

    const buildPosterCard = (m, mediaT) => {
      const img = m.poster_path ? `${CONFIG.IMAGES.POSTER_LG}${m.poster_path}` : CONFIG.IMAGES.PLACEHOLDER;
      const y = (m.release_date||m.first_air_date||'').slice(0,4);
      const r = m.vote_average?m.vote_average.toFixed(1):'';
      return `<div class="pc-card" onclick="openDetail(${m.id},'${mediaT}')">
        <div class="pc-wrap">
          <img class="pc-img lazy-img" data-src="${img}" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'">
          <div class="pc-badges-top">
            ${y?`<span class="pc-badge-year">📅 ${y}</span>`:''}
            ${r?`<span class="pc-badge-rating">⭐ ${r}</span>`:''}
          </div>
          <div class="pc-hover-play">▶</div>
        </div>
      </div>`;
    };

    const similarHTML = simItems.length ? `
      <div class="detail-section">
        <h3 class="detail-section-title">أعمال مشابهة</h3>
        <div class="poster-slider">
          ${simItems.map(m => buildPosterCard(m, _mediaType)).join('')}
        </div>
      </div>` : '';

    const recommendedHTML = recItems.length ? `
      <div class="detail-section">
        <h3 class="detail-section-title">موصى به لك</h3>
        <div class="poster-slider">
          ${recItems.map(m => buildPosterCard(m, _mediaType)).join('')}
        </div>
      </div>` : '';
    const allRevs   = revData.results || [];
    const arRevs    = allRevs.filter(r => /[\u0600-\u06FF]/.test(r.content));
    const reviews   = (arRevs.length ? arRevs : allRevs).slice(0, 3);
    const tvSeasons = type === 'tv' ? (detail.seasons||[]).filter(s=>s.season_number>0 && s.name!=='Specials') : [];
    const totalEps = tvSeasons.reduce((sum,s)=>sum+(s.episode_count||0),0);
    const network = detail.networks?.[0]?.name || '';
    const status = detail.status === 'Returning Series' ? 'مستمر' : detail.status === 'Ended' ? 'منتهي' : detail.status || '';
const reviewsHTML = `
      <div class="detail-section">
        <h3 class="detail-section-title">التعليقات</h3>
        <div class="reviews-list">
          ${reviews.length ? reviews.map(r=>`
            <div class="review-card">
              <div class="review-author">${r.author}</div>
              <p class="review-content">${r.content.slice(0,300)}${r.content.length>300?'…':''}</p>
            </div>`).join('') :
            `<div class="review-empty">
              <p>لا توجد تعليقات متاحة لهذا المحتوى حتى الآن</p>
              <button class="review-cta-btn" onclick="showToast('ميزة المراجعات قادمة قريباً!')">كن أول من يترك مراجعة سينمائية وتوجيه نقدي</button>
            </div>`}
        </div>
      </div>`;

    const seasonsHTML = tvSeasons.length ? `
      <div class="seasons-glass">
        <div class="seasons-header">
          <h3 class="detail-section-title" style="margin:0">المواسم والحلقات</h3>
          <select class="season-select" onchange="loadSeasonEps(${id},+this.value)">
            ${tvSeasons.map(s=>`<option value="${s.season_number}">الموسم ${s.season_number} · ${s.episode_count} ح</option>`).join('')}
          </select>
        </div>
        <div class="eps-header-bar">
          <button class="eps-view-all-btn" onclick="openAllEpsTMDB(${id},${tvSeasons[0]?.season_number||1})">عرض الكل ›</button>
        </div>
        <div class="swiper eps-swiper" id="epsSwiper_${id}">
          <div class="swiper-wrapper" id="epsWrap_${id}">
            <div class="loading" style="padding:16px">...</div>
          </div>
        </div>
        ${(network||totalEps||status) ? `
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;">
          ${status?`<span class="detail-badge">${status}</span>`:''}
          ${network?`<span class="detail-badge">${network}</span>`:''}
          ${totalEps?`<span class="detail-badge">${totalEps} حلقة</span>`:''}
        </div>` : ''}
      </div>` : '';
    const trailerKey = trailer?.key || '';
    const trailerBtn = trailerKey
      ? `<button class="detail-btn detail-btn-trailer" onclick="playTrailer('${trailerKey}')">▶ المقطع الدعائي</button>`
      : '';

    page.innerHTML = `
  <div class="dp-wrap">
    <div class="dp-bg-blur" style="background-image:url('${poster}')"></div>
    <div class="dp-bg-dim"></div>

    <button class="dp-back-btn" onclick="goBack()">← رجوع</button>

    <div class="dp-media-zone" id="dpMediaZone_${id}">
      <div class="dp-backdrops-slider" id="dpSlider_${id}">
        ${backdrops.map((b,i) => `<img class="dp-backdrop-slide ${i===0?'active':''}" src="${b}" alt="" style="object-position:center top">`).join('')}
      </div>
      ${trailer ? `<div class="dp-trailer-container" id="dpTrailerBox_${id}" style="display:none">
        <iframe id="dpTrailerFrame_${id}"
          src=""
          data-src="https://www.youtube-nocookie.com/embed/${trailer.key}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailer.key}&playsinline=1&rel=0&modestbranding=1"
          allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>
        <div class="trailer-unmute-overlay" id="unmuteOverlay_${id}" onclick="unmuteTrailer(${id})">
          <div class="trailer-unmute-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <line x1="23" y1="9" x2="17" y2="15"/>
              <line x1="17" y1="9" x2="23" y2="15"/>
            </svg>
            <span>اضغط لتشغيل الصوت</span>
          </div>
        </div>
      </div>` : ''}
      <div class="dp-trailer-fade"></div>
    </div>
    <div class="dp-poster-zone">
      <img class="dp-poster-img" src="${poster}"
           onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'">
    </div>

    <div class="dp-actions-wrap">
      ${trailer ? `<button class="dp-action-trailer" onclick="playTrailer('${trailerKey}')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="dp-act-svg"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        شاهد الإعلان
      </button>` : ''}
      <button class="dp-action-watch" id="mainWatchBtn_${id}"
        onclick="openWatchPage(${id},'${type}',${(() => {
          const p = getProgress(id);
          return p ? `${p.season},${p.episode + 1}` : `1,1`;
        })()})">
        <svg viewBox="0 0 24 24" fill="currentColor" class="dp-act-svg"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        ${(() => { const p = getProgress(id); return p ? `أكمل المشاهدة — ح${p.episode + 1}` : 'شاهد الآن'; })()}
      </button>
      <div class="dp-action-row2">
        <button class="dp-action-fav dp-btn-fav" data-id="${id}" onclick="addToWatchlist(${id},'${type}')">
          <svg class="dp-act-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          <span>المفضلة</span>
        </button>
        <button class="dp-action-fav dp-btn-later" data-id="${id}" onclick="addToWatchLater(${id},'${type}')">
          <svg class="dp-act-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          <span>قائمتي</span>
        </button>
        ${type === 'movie' ? `
        <button class="dp-action-fav dp-btn-share" id="shareBtn_${id}" onclick="shareContent(${id},'${title}','${type}')">
          <svg class="dp-act-ico dp-share-ico" viewBox="0 0 24 24">
            <defs><linearGradient id="sg_${id}" x1="10%" y1="0%" x2="90%" y2="100%"><stop offset="0%" stop-color="#e0aaff"/><stop offset="50%" stop-color="#a855f7"/><stop offset="100%" stop-color="#6b21a8"/></linearGradient></defs>
            <circle cx="18" cy="5"  r="3"   fill="url(#sg_${id})"/><circle cx="16.8" cy="4"  r="1" fill="rgba(255,255,255,0.5)"/>
            <circle cx="6"  cy="12" r="3"   fill="url(#sg_${id})"/><circle cx="4.8"  cy="11" r="1" fill="rgba(255,255,255,0.5)"/>
            <circle cx="18" cy="19" r="3"   fill="url(#sg_${id})"/><circle cx="16.8" cy="18" r="1" fill="rgba(255,255,255,0.5)"/>
            <line x1="8.6" y1="10.5" x2="15.4" y2="6.5"  stroke="#c084fc" stroke-width="1.6" stroke-linecap="round"/>
            <line x1="8.6" y1="13.5" x2="15.4" y2="17.5" stroke="#c084fc" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
          <span>مشاركة</span>
        </button>` : `
        <button class="dp-action-fav dp-btn-share" id="shareBtn_${id}" onclick="shareContent(${id},'${title}','${type}')">
          <svg class="dp-act-ico dp-share-ico" viewBox="0 0 24 24">
            <defs><linearGradient id="sg_${id}" x1="10%" y1="0%" x2="90%" y2="100%"><stop offset="0%" stop-color="#e0aaff"/><stop offset="50%" stop-color="#a855f7"/><stop offset="100%" stop-color="#6b21a8"/></linearGradient></defs>
            <circle cx="18" cy="5"  r="3"   fill="url(#sg_${id})"/><circle cx="16.8" cy="4"  r="1" fill="rgba(255,255,255,0.5)"/>
            <circle cx="6"  cy="12" r="3"   fill="url(#sg_${id})"/><circle cx="4.8"  cy="11" r="1" fill="rgba(255,255,255,0.5)"/>
            <circle cx="18" cy="19" r="3"   fill="url(#sg_${id})"/><circle cx="16.8" cy="18" r="1" fill="rgba(255,255,255,0.5)"/>
            <line x1="8.6" y1="10.5" x2="15.4" y2="6.5"  stroke="#c084fc" stroke-width="1.6" stroke-linecap="round"/>
            <line x1="8.6" y1="13.5" x2="15.4" y2="17.5" stroke="#c084fc" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
        <span>مشاركة</span>
        </button>`}
        ${type === 'tv' ? `<button class="dp-action-fav dp-btn-alert ${getLib('rox_alerts').find(i=>String(i.id)===String(id))?'active':''}" id="alertBtn_${id}" data-title="${(title||'').replace(/'/g,'&#39;')}" onclick="toggleAlertSubscription(${id},this.dataset.title,'tv')">
          <svg class="dp-act-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <span>${getLib('rox_alerts').find(i=>String(i.id)===String(id))?'مفعّل':'تنبيه'}</span>
        </button>` : ''}
      </div>
    </div>

    <div class="dp-info-block">
      <h1 class="dp-title">${title}</h1>
      ${tagline ? `<p class="dp-tagline">"${tagline}"</p>` : ''}
      <div class="dp-meta-row">
        ${year ? `<span class="dp-meta-chip">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="chip-ico"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          ${year}</span>` : ''}
        ${runtime ? `<span class="dp-meta-chip">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="chip-ico"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          ${runtime}</span>` : ''}
        <span class="dp-meta-chip dp-meta-chip-gold">
          <svg viewBox="0 0 24 24" fill="currentColor" class="chip-ico" style="color:#f5c518"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          ${rating}${voteCount ? ` · ${voteCount}` : ''}</span>
      </div>
      <div class="dp-genres-row">${genres}</div>
    </div>

    <div class="detail-body">
      <div class="detail-tabs-bar">
        ${type === 'tv' || seasonsHTML
          ? `<button class="dtab active" onclick="switchTab(this,'tab-eps')">المواسم والحلقات</button>`
          : ''}
        <button class="dtab ${!(type === 'tv' || seasonsHTML) ? 'active' : ''}"
          onclick="switchTab(this,'tab-about')">عن العمل</button>
        <button class="dtab" onclick="switchTab(this,'tab-trailers')">العروض الترويجية</button>
      </div>

      <div id="tab-eps" class="dtab-content ${type === 'tv' || seasonsHTML ? 'active' : ''}">
        ${seasonsHTML}
      </div>
      <div id="tab-about" class="dtab-content ${!(type === 'tv' || seasonsHTML) ? 'active' : ''}">

        <!-- القصة -->
        <div class="neon-story-box">
          <div class="neon-story-header">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="neon-story-ico"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            <span>القصة</span>
            <button class="rox-read-btn" onclick="openReadingMode('${overview.replace(/'/g,"\\'").replace(/\n/g,' ')}','${title.replace(/'/g,"\\'")}')">وضع القراءة</button>
          </div>
          <p class="neon-story-text">${overview}</p>
        </div>

        <!-- شريط التقييمات -->
        <div class="neon-ratings-grid">
          <div class="neon-rating-card neon-gold">
            <svg viewBox="0 0 24 24" fill="currentColor" class="nr-ico"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <span class="nr-val">${rating}<small>/10</small></span>
            <span class="nr-lbl">IMDb</span>
          </div>
          <div class="neon-rating-card neon-red">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="nr-ico"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
            <span class="nr-val">${Math.min(99,Math.round((detail.vote_average||0)*10))}<small>%</small></span>
            <span class="nr-lbl">Rotten Tomatoes</span>
          </div>
          <div class="neon-rating-card neon-blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="nr-ico"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span class="nr-val">${Math.min(99,Math.round((detail.popularity||0)/10))}<small>%</small></span>
            <span class="nr-lbl">الجمهور</span>
          </div>
          <div class="neon-rating-card neon-purple">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="nr-ico"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            <span class="nr-val">${(detail.vote_average||0).toFixed(1)}<small>/10</small></span>
            <span class="nr-lbl">تقييم النقاد</span>
          </div>
        </div>

        <!-- معلومات الإنتاج -->
        <div class="detail-section">
          <h3 class="detail-section-title">معلومات الإنتاج</h3>
          <div class="prod-grid-new">
            ${detail.credits?.crew?.find(c=>c.job==='Director') ? `<div class="prod-item-new"><span class="prod-lbl-new">المخرج</span><span class="prod-val-new">${detail.credits?.crew?.find(c=>c.job==='Director')?.name||''}</span></div>` : ''}
            ${(credits.crew||[]).find(c=>c.job==='Director') ? `<div class="prod-item-new"><span class="prod-lbl-new">المخرج</span><span class="prod-val-new">${(credits.crew||[]).find(c=>c.job==='Director')?.name||''}</span></div>` : ''}
            ${(credits.crew||[]).find(c=>c.job==='Screenplay'||c.job==='Writer') ? `<div class="prod-item-new"><span class="prod-lbl-new">الكاتب</span><span class="prod-val-new">${(credits.crew||[]).find(c=>c.job==='Screenplay'||c.job==='Writer')?.name||''}</span></div>` : ''}
            ${(credits.crew||[]).find(c=>c.job==='Producer') ? `<div class="prod-item-new"><span class="prod-lbl-new">المنتج</span><span class="prod-val-new">${(credits.crew||[]).find(c=>c.job==='Producer')?.name||''}</span></div>` : ''}
            ${(credits.crew||[]).find(c=>c.job==='Director of Photography') ? `<div class="prod-item-new"><span class="prod-lbl-new">التصوير</span><span class="prod-val-new">${(credits.crew||[]).find(c=>c.job==='Director of Photography')?.name||''}</span></div>` : ''}
            ${(credits.crew||[]).find(c=>c.job==='Original Music Composer') ? `<div class="prod-item-new"><span class="prod-lbl-new">الموسيقى</span><span class="prod-val-new">${(credits.crew||[]).find(c=>c.job==='Original Music Composer')?.name||''}</span></div>` : ''}
            ${detail.production_companies?.[0] ? `<div class="prod-item-new"><span class="prod-lbl-new">الشركة</span><span class="prod-val-new">${detail.production_companies[0].name}</span></div>` : ''}
            ${detail.release_date||detail.first_air_date ? `<div class="prod-item-new"><span class="prod-lbl-new">تاريخ الإصدار</span><span class="prod-val-new">${detail.release_date||detail.first_air_date}</span></div>` : ''}
            ${detail.budget ? `<div class="prod-item-new"><span class="prod-lbl-new">الميزانية</span><span class="prod-val-new">$${(detail.budget/1e6).toFixed(1)}M</span></div>` : ''}
            ${detail.revenue ? `<div class="prod-item-new"><span class="prod-lbl-new">الإيرادات</span><span class="prod-val-new">$${(detail.revenue/1e6).toFixed(1)}M</span></div>` : ''}
            ${detail.original_language ? `<div class="prod-item-new"><span class="prod-lbl-new">اللغة</span><span class="prod-val-new">${detail.original_language==='en'?'الإنجليزية':detail.original_language}</span></div>` : ''}
            ${detail.production_countries?.[0] ? `<div class="prod-item-new"><span class="prod-lbl-new">بلد الإنتاج</span><span class="prod-val-new">${detail.production_countries[0].name}</span></div>` : ''}
          </div>
        </div>

        <!-- الكلمات المفتاحية -->
        ${keywords.length ? `<div class="detail-section">
          <h3 class="detail-section-title">الكلمات المفتاحية</h3>
          <div class="keywords-row">
            ${keywords.map(k=>`<span class="keyword-chip">${k.name}</span>`).join('')}
          </div>
        </div>` : ''}
${type === 'tv' && (() => { const s = calcSeasonEnd(detail); if (!s) return ''; return `
<div class="detail-section season-forecast-box">
  <div class="sf-header">
    <svg class="sf-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    <span>توقع نهاية الموسم</span>
  </div>
  <div class="sf-track">
    <div class="sf-fill" style="width:${s.pct}%"></div>
  </div>
  <div class="sf-row">
    <span class="sf-chip">${s.aired} / ${s.total} حلقة</span>
    <span class="sf-chip sf-chip-red">باقي ${s.remaining} حلقة</span>
  </div>
  ${s.endDate ? `<div class="sf-date">تنتهي تقريباً — ${s.endDate}</div>` : '<div class="sf-date">موعد النهاية غير محدد بعد</div>'}
</div>`;})()}
        <!-- متوفر على -->
        ${providers.length ? `<div class="detail-section">
          <h3 class="detail-section-title">متوفر على</h3>
          <div class="providers-row">
            ${providers.map(p=>`<div class="provider-chip">
              <img src="https://image.tmdb.org/t/p/w92${p.logo_path}" alt="${p.provider_name}" title="${p.provider_name}">
              <span>${p.provider_name}</span>
            </div>`).join('')}
          </div>
        </div>` : ''}

        <!-- معرض الصور -->
        ${galleryImgs.length ? `<div class="detail-section">
          <h3 class="detail-section-title">معرض الصور</h3>
          <div class="gallery-row">
            ${galleryImgs.map(g=>`<img class="gallery-img lazy-img"
              data-src="${g.md}"
              src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
              onclick="openImgLightbox('${g.full}','${g.md}','${g.sm}')">`).join('')}
          </div>
        </div>` : ''}
<!-- تقييم الجمهور -->
        <div class="detail-section">
          <h3 class="detail-section-title">تقييم الجمهور</h3>
          <div class="audience-rating-wrap">
            <div class="audience-score-big">
              <span class="audience-num">${rating}</span>
              <span class="audience-outof">/10</span>
              <div class="audience-stars">${'★'.repeat(Math.round(detail.vote_average/2))}${'☆'.repeat(5-Math.round(detail.vote_average/2))}</div>
              <span class="audience-count">(${voteCount} تقييم)</span>
            </div>
            <div class="vote-bars">
              ${voteHist.map(v=>`
              <div class="vote-bar-row">
                <span class="vote-star-lbl">${v.star} ★</span>
                <div class="vote-bar-track">
                  <div class="vote-bar-fill" style="width:${Math.round(v.pct*100/maxPct)}%"></div>
                </div>
                <span class="vote-pct-lbl">${Math.round(v.pct*100/maxPct)}%</span>
              </div>`).join('')}
            </div>
          </div>
        </div>

        <!-- لماذا ستحبه -->
        ${whyWatch.length ? `<div class="detail-section">
          <h3 class="detail-section-title">لماذا ستحبه؟</h3>
          <div class="why-list">
            ${whyWatch.map(w=>`<div class="why-item"><span class="why-ico">✦</span><span>${w}</span></div>`).join('')}
          </div>
        </div>` : ''}

        <!-- آراء النقاد -->
        ${reviews.length ? `<div class="detail-section">
          <h3 class="detail-section-title">آراء النقاد</h3>
          <div class="critics-list">
            ${reviews.slice(0,3).map(r=>`
            <div class="critic-card">
              <div class="critic-source">${r.author_details?.username||r.author}</div>
              <p class="critic-quote">"${r.content.slice(0,140)}${r.content.length>140?'…':''}"</p>
              <div class="critic-stars">${'★'.repeat(Math.min(5,Math.round((r.author_details?.rating||7)/2)))}${'☆'.repeat(5-Math.min(5,Math.round((r.author_details?.rating||7)/2)))}</div>
            </div>`).join('')}
          </div>
        </div>` : ''}

        <!-- الجوائز -->
        ${awards.length ? `<div class="detail-section">
          <h3 class="detail-section-title">الجوائز والترشيحات</h3>
          <div class="awards-list">
            ${awards.map(a=>`
            <div class="award-item">
              <span class="award-laurel"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 4H17V13C17 15.7614 14.7614 18 12 18C9.23858 18 7 15.7614 7 13V4Z" fill="url(#tg)" stroke="rgba(245,197,24,0.5)" stroke-width="0.5"/><path d="M4 4H7V10C7 10 5 10 4 8V4Z" fill="rgba(245,197,24,0.3)" stroke="rgba(245,197,24,0.3)" stroke-width="0.5"/><path d="M17 4H20V8C20 10 18 10 17 10V4Z" fill="rgba(245,197,24,0.3)" stroke="rgba(245,197,24,0.3)" stroke-width="0.5"/><rect x="9" y="18" width="6" height="2" rx="1" fill="url(#tg)"/><rect x="7" y="20" width="10" height="1.5" rx="0.75" fill="url(#tg)"/><defs><linearGradient id="tg" x1="12" y1="4" x2="12" y2="21" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#fde68a"/><stop offset="100%" stop-color="#d97706"/></linearGradient></defs></svg></span>
              <div class="award-info">
                <span class="award-title">${a.title}</span>
                <span class="award-org">${a.org} · ${a.year}</span>
              </div>
            </div>`).join('')}
          </div>
        </div>` : ''}

        ${reviewsHTML}
        
        <!-- خط الزمن -->
        ${(detail.release_date || detail.first_air_date) ? `
        <div class="detail-section">
          <h3 class="detail-section-title">خط الزمن</h3>
          <div class="timeline-wrap">
            ${detail.production_companies?.[0] ? `<div class="timeline-item"><div class="timeline-date">الإنتاج</div><div class="timeline-event">${detail.production_companies[0].name}</div><div class="timeline-note">شركة الإنتاج الرئيسية</div></div>` : ''}
            ${detail.release_date||detail.first_air_date ? `<div class="timeline-item"><div class="timeline-date">${detail.release_date||detail.first_air_date}</div><div class="timeline-event">العرض العالمي الأول</div><div class="timeline-note">تاريخ الإصدار الرسمي</div></div>` : ''}
            ${detail.status === 'Released' || detail.status === 'Ended' ? `<div class="timeline-item"><div class="timeline-date">متاح الآن</div><div class="timeline-event">متوفر بالدقة الفائقة</div><div class="timeline-note">متاح على المنصات الرقمية</div></div>` : `<div class="timeline-item"><div class="timeline-date">قريباً</div><div class="timeline-event">${detail.status === 'Returning Series' ? 'موسم جديد قادم' : 'قادم قريباً'}</div><div class="timeline-note">ترقب الإعلان الرسمي</div></div>`}
          </div>
        </div>` : ''}
        ${castHTML}
        ${similarHTML}
        ${recommendedHTML}
      </div>
      <div id="tab-trailers" class="dtab-content">
        ${videos.results?.length ? `
        <div class="detail-section">
          <h3 class="detail-section-title">العروض الترويجية</h3>
          <div class="trailers-list">
            ${videos.results.slice(0,6).map(v=>`
            <div class="trailer-item" onclick="playTrailer('${v.key}')">
              <div class="trailer-thumb">
                <img src="https://img.youtube.com/vi/${v.key}/mqdefault.jpg" alt="${v.name}">
                <div class="trailer-play-ico">▶</div>
              </div>
              <span class="trailer-name">${v.name}</span>
            </div>`).join('')}
          </div>
        </div>` : '<div class="detail-section"><p style="color:var(--text3);text-align:center;padding:20px">لا توجد عروض ترويجية</p></div>'}
      </div>
    </div>
  </div>`;

    // IntersectionObserver للصور الكسولة
    const lazyObs = new IntersectionObserver(entries => {
      entries.forEach(e => { if(e.isIntersecting){ e.target.src=e.target.dataset.src; lazyObs.unobserve(e.target); }});
    });
    page.querySelectorAll('.lazy-img').forEach(img => lazyObs.observe(img));
    extractDominantColor(poster, applyDynamicColor);
    setTimeout(() => {
      // استعادة ألوان الأزرار
      if (localStorage.getItem(`rox_fav_${id}`)) {
        const fb = document.querySelector(`.dp-btn-fav[data-id="${id}"]`);
        if (fb) { fb.style.color='#e50914'; fb.style.borderColor='rgba(229,9,20,0.7)'; fb.style.boxShadow='0 0 14px rgba(229,9,20,0.4)'; const s=fb.querySelector('svg'); if(s){s.style.fill='#e50914';s.style.stroke='none';} }
      }
      if (localStorage.getItem(`rox_later_${id}`)) {
        const lb = document.querySelector(`.dp-btn-later[data-id="${id}"]`);
        if (lb) { lb.style.color='#f5c518'; lb.style.borderColor='rgba(245,197,24,0.7)'; lb.style.boxShadow='0 0 14px rgba(245,197,24,0.4)'; const s=lb.querySelector('svg'); if(s){s.style.fill='#f5c518';s.style.stroke='none';} }
      }
    }, 300);
// سلايدر الصور
    if (backdrops.length > 1) {
      let si = 0;
      const slides = document.querySelectorAll(`#dpSlider_${id} .dp-backdrop-slide`);
      setInterval(() => {
        slides[si].classList.remove('active');
        si = (si + 1) % slides.length;
        slides[si].classList.add('active');
      }, 3500);
    }
    // تريلر بعد 3 ثواني
    window._trailerTimer = null;
    window._activeTrailerFrame = null;
    if (trailer) {
      window._trailerTimer = setTimeout(() => {
        const box = document.getElementById(`dpTrailerBox_${id}`);
        const frame = document.getElementById(`dpTrailerFrame_${id}`);
        const slider = document.getElementById(`dpSlider_${id}`);
        if (box && frame && frame.dataset.src) {
          frame.src = frame.dataset.src;
          window._activeTrailerFrame = frame;
          box.style.display = 'block';
          if (slider) { slider.style.opacity='0'; setTimeout(()=>slider.style.display='none',400); }
        }
      }, 3000);
    }
    if (type === 'tv' && tvSeasons.length) loadSeasonEps(id, tvSeasons[0].season_number);

  } catch (err) {
    page.innerHTML = `
      <div class="loading">❌ تعذّر تحميل التفاصيل<br><small>${err.message}</small></div>
      <div class="loading">
        <button class="detail-btn detail-btn-watch" onclick="goBack()">← رجوع</button>
      </div>`;
  }
}
async function openAllEps(tvId, seasonNum) {
  const page = document.getElementById('detailPage');
  if (!page) return;
  page.innerHTML = '<div class="loading">⏳ جاري تحميل الحلقات...</div>';
  try {
    const data = await fetch(buildTMDBUrl(`/tv/${tvId}/season/${seasonNum}`)).then(r=>r.json());
    page.innerHTML = `
      <div class="all-eps-page">
        <div class="all-eps-header">
          <button class="detail-back-btn" onclick="openDetail(${tvId},'tv')">← رجوع</button>
          <h2 class="all-eps-title">📺 الموسم ${seasonNum} — ${data.episodes?.length||0} حلقة</h2>
        </div>
        <div class="all-eps-grid">
          ${(data.episodes||[]).map(e=>`
            <div class="all-ep-card" onclick="openWatchPage(${tvId},'tv',${seasonNum},${e.episode_number})">
              <div class="all-ep-thumb-wrap">
                <img src="${e.images?.jpg?.image_url||tmdbStills[e.episode_id||i+1]||CONFIG.IMAGES.PLACEHOLDER}"
                     onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'" class="all-ep-thumb">
                <div class="ep-num-badge">ح ${e.episode_number}</div>
                <div class="all-ep-play">▶</div>
              </div>
              <div class="all-ep-info">
                <div class="all-ep-title">${(e.name||'').slice(0,32)}</div>
                <div class="all-ep-overview">${(e.overview||'').slice(0,90)}</div>
              </div>
            </div>`).join('')}
        </div>
      </div>`;
  } catch { page.innerHTML = '<div class="loading">⚠️ خطأ في تحميل الحلقات</div>'; }
}
async function loadSeasonEps(tvId, seasonNum) {
  const wrap = document.getElementById(`epsWrap_${tvId}`);
  if (!wrap) return;
  wrap.style.opacity = '0';
  wrap.style.transform = 'translateX(30px)';
  wrap.innerHTML = '<div class="loading" style="padding:16px">⏳</div>';
  try {
    const data = await fetch(buildTMDBUrl(`/tv/${tvId}/season/${seasonNum}`)).then(r=>r.json());
    const poster = data.poster_path ? `${CONFIG.IMAGES.POSTER_MD}${data.poster_path}` : '';
    if (poster) {
      const dp = document.getElementById('detailPage');
      if (dp) { dp.style.backgroundImage = `linear-gradient(to bottom, rgba(0,0,0,0.7), #080000), url('${poster}')`; dp.style.backgroundSize = 'cover'; }
    }
    window._epsCache = data.episodes||[];
    wrap.innerHTML = (data.episodes||[]).map(e=>`
          <div class="swiper-slide ep-card ${(() => { const p=getProgress(tvId); return p && p.season===seasonNum && p.episode+1===e.episode_number ? 'ep-next-glow' : ''; })()}" onclick="openEpisodeDetail(${tvId},${seasonNum},${e.episode_number},window._epsCache||[])">        <div class="ep-thumb-wrap">
          <img data-src="${e.still_path?CONFIG.IMAGES.STILL_MD+e.still_path:CONFIG.IMAGES.PLACEHOLDER}"
               src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
               class="lazy-img ep-thumb" onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'">
          <div class="ep-num-badge">ح ${e.episode_number}</div>
        </div>
        <div class="ep-info">
          <div class="ep-title">${(e.name||'').slice(0,28)}</div>
          <div class="ep-overview">${(e.overview||'').slice(0,80)}</div>
        </div>
      </div>`).join('');
    setTimeout(() => {
      wrap.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      wrap.style.opacity = '1';
      wrap.style.transform = 'translateX(0)';
    }, 50);
    const o2 = new IntersectionObserver(en=>{en.forEach(e=>{if(e.isIntersecting){e.target.src=e.target.dataset.src;o2.unobserve(e.target);}});});
    wrap.querySelectorAll('.lazy-img').forEach(i=>o2.observe(i));
    if(window.Swiper) new Swiper(`#epsSwiper_${tvId}`,{slidesPerView:2.3,spaceBetween:10,freeMode:true,grabCursor:true});
  } catch{ wrap.innerHTML='<div class="loading">⚠️ خطأ</div>'; }
}
async function openEpisodeDetail(tvId, seasonNum, epNum, allEps) {
  const page = document.getElementById('detailPage');
  if (!page) return;
  page.innerHTML = '<div class="loading">⏳ جاري تحميل الحلقة...</div>';
  try {
    const data = await fetch(buildTMDBUrl(`/tv/${tvId}/season/${seasonNum}/episode/${epNum}`)).then(r=>r.json());
    const img = data.still_path ? `${CONFIG.IMAGES.BACKDROP}${data.still_path}` : CONFIG.IMAGES.PLACEHOLDER;
    const date = data.air_date ? new Date(data.air_date).toLocaleDateString('ar-SA',{day:'numeric',month:'long',year:'numeric'}) : 'غير محدد';
    const rating = data.vote_average ? data.vote_average.toFixed(1) : '—';
    const runtime = data.runtime ? `${data.runtime} د` : '—';
    const guests = (data.guest_stars||[]).slice(0,6);
    const idx = allEps.findIndex(e=>e.episode_number===epNum);
    const prev = allEps[idx-1];
    const next = allEps[idx+1];
    page.innerHTML = `
    <div class="epd-wrap">
      <div class="epd-hero" style="background-image:url('${img}')">
        <div class="epd-hero-overlay"></div>
        <button class="epd-back-btn" onclick="openDetail(${tvId},'tv')">← رجوع</button>        <div class="epd-nav">
          ${prev ? `<button class="epd-nav-btn" onclick="openEpisodeDetail(${tvId},${seasonNum},${prev.episode_number},window._curEps)">‹ ح${prev.episode_number}</button>` : '<span></span>'}
          <span class="epd-ep-badge">م${seasonNum} · ح${epNum}</span>
          ${next ? `<button class="epd-nav-btn" onclick="openEpisodeDetail(${tvId},${seasonNum},${next.episode_number},window._curEps)">ح${next.episode_number} ›</button>` : '<span></span>'}
        </div>
      </div>
      <div class="epd-body">
        <h2 class="epd-title">${data.name||''}</h2>
        <div class="epd-meta-row">
          <span class="epd-chip">⭐ ${rating}</span>
          <span class="epd-chip">⏱ ${runtime}</span>
          <span class="epd-chip">📅 ${date}</span>
        </div>
        <p class="epd-overview">${data.overview||'لا يوجد ملخص لهذه الحلقة.'}</p>
        <button class="epd-watch-btn" onclick="saveProgress(${tvId},${seasonNum},${epNum});openWatchPage(${tvId},'tv',${seasonNum},${epNum})">▶ شاهد الحلقة</button>
        ${guests.length ? `<div class="epd-guests-title">ضيوف الحلقة</div>
        <div class="epd-guests-row">${guests.map(g=>`
          <div class="epd-guest">
            <img class="epd-guest-img" src="${g.profile_path?CONFIG.IMAGES.POSTER_SM+g.profile_path:CONFIG.IMAGES.PLACEHOLDER}" onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'">
            <span class="epd-guest-name">${(g.name||'').slice(0,14)}</span>
          </div>`).join('')}</div>` : ''}
      </div>
    </div>`;
  } catch(e) { page.innerHTML = '<div class="loading">⚠️ خطأ في تحميل الحلقة</div>'; }
}
function playTrailer(key) {
  const overlay = document.getElementById('trailerOverlay');
  const frame   = document.getElementById('trailerFrame');
  if (!overlay || !frame) return;
  frame.src = `${CONFIG.VIDEO.YOUTUBE_NOCOOKIE}${key}?autoplay=1&rel=0&modestbranding=1`;
  overlay.classList.remove('hidden');
  document.getElementById('closeTrailer')?.addEventListener('click', () => {
    overlay.classList.add('hidden');
    frame.src = '';
  }, { once: true });
}
function wsSelectServer(el, url, name, isRox) {
  document.querySelectorAll('.mini-server-node').forEach(n => n.classList.remove('mini-active'));
  el.classList.add('mini-active');
  document.querySelectorAll('.cinema-vault').forEach(v => v.classList.remove('open'));
  const sw = document.getElementById('wsSwitchOverlay');
  if (sw) {
    sw.style.display = 'flex';
    setTimeout(() => {
      if (isRox) { loadRox(null); } else { document.getElementById('wsFrame').src = url; }
      setTimeout(() => { sw.style.display = 'none'; }, 1800);
    }, 400);
  } else {
    if (isRox) { loadRox(null); } else { document.getElementById('wsFrame').src = url; }
  }
}
  async function loadRox(url) {
  // أخفِ الـ iframe وأظهر مشغل ROX
  const frame  = document.getElementById('wsFrame');
  const player = document.getElementById('roxPlayer');
  const wrap   = document.getElementById('roxPlayerWrap');
  if (!url) { frame.style.display='block'; if(wrap) wrap.style.display='none'; return; }
  if (!url.includes('.m3u8') && !url.includes('.mp4')) {
  frame.style.display = 'block';
  if (wrap) wrap.style.display = 'none';
  frame.src = url;
  return;
    }
  frame.style.display = 'none';
  if (wrap)  wrap.style.display  = 'flex';
  if (player) {
    // دمر HLS السابق إن وجد
    if (window._roxHls) { window._roxHls.destroy(); window._roxHls = null; }
    player.pause();
    if (typeof Hls !== 'undefined' && Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      window._roxHls = hls;
      hls.loadSource(url);
      hls.attachMedia(player);
      hls.on(Hls.Events.MANIFEST_PARSED, () => player.play().catch(()=>{}));
      hls.on(Hls.Events.ERROR, (e, d) => { if (d.fatal) frame.src = url; });
    } else if (player.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari — يدعم HLS أصلاً
      player.src = url;
      player.play().catch(()=>{});
    } else {
      // fallback للـ iframe
      frame.style.display = 'block';
      if (wrap) wrap.style.display = 'none';
      frame.src = url;
    }
  }
}
function wsGoBack() {
  document.body.classList.remove('cinema-mode');
  const wsFrame = document.getElementById('wsFrame');
if (wsFrame) { wsFrame.src = ''; }
const roxPlayer = document.getElementById('roxPlayer');
if (roxPlayer) { roxPlayer.pause(); roxPlayer.src = ''; }
if (window._roxHls) { window._roxHls.destroy(); window._roxHls = null; }
if (window._cwTimer) { clearInterval(window._cwTimer); window._cwTimer = null; }
  const dp = document.getElementById('detailPage');
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  if (dp && dp.innerHTML.trim().length > 50) {
    dp.classList.add('active');
    const hero = document.getElementById('heroSection');
    if (hero) hero.style.display = 'none';
  } else { goBack(); }
  window.scrollTo(0, 0);
}
// ===== ROX PLAYER CONTROLS =====
function roxTogglePlay() {
  const v = document.getElementById('roxPlayer');
  const btn = document.getElementById('roxPlayBtn');
  if (!v) return;
  if (v.paused) {
    v.play();
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
  } else {
    v.pause();
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>';
  }
}
function roxSkip(sec) {
  const v = document.getElementById('roxPlayer');
  if (v) v.currentTime = Math.max(0, v.currentTime + sec);
}
function roxToggleMute() {
  const v = document.getElementById('roxPlayer');
  if (v) { v.muted = !v.muted; document.getElementById('roxVol').value = v.muted ? 0 : 100; }
}
function roxFullscreen() {
  const wrap = document.getElementById('roxPlayerWrap');
  if (!wrap) return;
  if (document.fullscreenElement) document.exitFullscreen();
  else wrap.requestFullscreen?.() || wrap.webkitRequestFullscreen?.();
}
// ربط الأحداث بالمشغل
document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('click', () => {
    const v = document.getElementById('roxPlayer');
    const prog = document.getElementById('roxProgress');
    const cur  = document.getElementById('roxTimeCur');
    const dur  = document.getElementById('roxTimeDur');
    const vol  = document.getElementById('roxVol');
    if (!v) return;
    v.addEventListener('timeupdate', () => {
      if (!v.duration) return;
      prog.value = (v.currentTime / v.duration) * 100;
      cur.textContent = roxFmtTime(v.currentTime);
    });
    v.addEventListener('loadedmetadata', () => {
      dur.textContent = roxFmtTime(v.duration);
    });
    prog?.addEventListener('input', () => {
      if (v.duration) v.currentTime = (prog.value / 100) * v.duration;
    });
    vol?.addEventListener('input', () => {
      v.volume = vol.value / 100;
      v.muted  = vol.value == 0;
    });
  }, { once: true });
});
function roxFmtTime(s) {
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60).toString().padStart(2, '0');
  return `${m}:${ss}`;
}
function srvUrl(srv, type, id, season, episode) {
  const base = (type === 'movie') ? srv.mov : srv.tv;
  if (!season) return `${base}${id}`;
  return `${base}${id}/${season}/${episode}`;
}
async function openWatchPage(id, type, season = 1, episode = 1, resumeSec = 0, resumeSrv = '') {
  const page = document.getElementById('watchPage');
  if (!page) return;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('heroSection').style.display = 'none';
  document.getElementById('newsSection').style.display = 'none';
  page.classList.add('active');
  page.innerHTML = '<div class="loading">⏳ جاري التحميل...</div>';
  window.scrollTo(0, 0);
  try {
    const ep = type === 'tv' ? `/tv/${id}` : `/movie/${id}`;
    const [det] = await Promise.all([fetch(buildTMDBUrl(ep, {append_to_response:'release_dates,content_ratings'})).then(r => r.json())]);
    const backdrop = det.backdrop_path ? CONFIG.IMAGES.BACKDROP + det.backdrop_path : '';
    let title = type === 'movie' ? (det.title || det.original_title) : (det.name || det.original_name);
    const year  = (det.release_date || det.first_air_date || '').slice(0, 4);
    const rating = det.vote_average ? det.vote_average.toFixed(1) : '';
    const runtime = det.runtime ? `${Math.floor(det.runtime/60)} ساعة ${det.runtime%60} دقيقة` : (det.episode_run_time?.[0] ? `${det.episode_run_time[0]} دقيقة` : '');
    const certification = (det.release_dates?.results?.find(r=>r.iso_3166_1==='US')?.release_dates?.[0]?.certification) || '';
    const hasArabic = (det.spoken_languages||[]).some(l=>l.iso_639_1==='ar');
    const quality = '4K • HDR';
    let genres = (det.genres || []).map(g => g.name).join(' · ');
    const arData = await fetch(buildTMDBUrl(`/${type}/${id}`, { language: 'ar' })).then(r => r.json());
let overview = arData.overview || '';
if (!overview && det.overview) {
  try {
    const q = encodeURIComponent(det.overview);
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ar&dt=t&q=${q}`);
    const d = await res.json();
    overview = d[0].map(s => s[0]).join('') || det.overview;
  } catch {
    overview = det.overview;
  }
}
title = arData.title || arData.name || title;
genres = (arData.genres || det.genres || []).map(g => `<span class="genre-tag">${g.name}</span>`).join('');
    // احفظ فوراً في Continue Watching
    const cwPoster = det.poster_path ? CONFIG.IMAGES.POSTER_MD + det.poster_path : CONFIG.IMAGES.PLACEHOLDER;
    const cwTitle  = type === 'movie' ? (det.title || det.original_title) : (det.name || det.original_name);
    if (resumeSec > 0) cwSave(id, type, cwPoster, cwTitle, resumeSec, '', resumeSrv || '');
// تحقق إذا الأنمي (genre_id 16 = Animation + JP)
const isAnime = (det.genres||[]).some(g => g.id === 16)
             && (det.origin_country||[]).includes('JP');

const superflixUrl = type === 'movie'
  ? `https://superflixapi.best/filme/${det.imdb_id || id}`
  : `https://superflixapi.best/serie/${id}/${season}/${episode}`;

const vipSrvs = [
  { icon:'<i class="ri-focus-3-line style-icon" style="color:#ff2a2a"></i>', name:'ROX', desc:'مشغلي 🔥', url:null, rox:true, active:true, stream:true },
  { icon:'<i class="ri-movie-2-line style-icon" style="color:#ff9f43"></i>', name:'ANIME', desc:'أنمي', url:`https://2anime.xyz/embed/${id}/${season}/${episode}` },
  { icon:'<i class="ri-planet-line style-icon" style="color:#a29bfe"></i>', name:'COSMOS', desc:'#05', url:srvUrl(S.SRV5,type,id,season,episode) },
  { icon:'<i class="ri-star-fill style-icon" style="color:#fdcb6e"></i>', name:'STELLAR', desc:'#07', url:srvUrl(S.SRV3,type,id,season,episode) },
  { icon:'<i class="ri-moon-clear-line style-icon" style="color:#74b9ff"></i>', name:'ECLIPSE', desc:'#09', url:srvUrl(S.SRV9,type,id,season,episode) },
  { icon:'<i class="ri-flashlight-fill style-icon" style="color:#ffeaa7"></i>', name:'NOVA', desc:'#10', url:srvUrl(S.SRV10,type,id,season,episode) },
  { icon:'<i class="ri-crosshair-2-line style-icon" style="color:#00cec9"></i>', name:'ORION', desc:'#14', url:srvUrl(S.SRV14,type,id,season,episode) },
  { icon:'<i class="ri-contrast-drop-fill style-icon" style="color:#636e72"></i>', name:'ONYX', desc:'#16', url:srvUrl(S.SRV16,type,id,season,episode) },
  { icon:'<i class="ri-trophy-fill style-icon" style="color:#f9ca24"></i>', name:'APEX', desc:'#17', url:srvUrl(S.SRV17,type,id,season,episode) },
  { icon:'<i class="ri-radio-button-line style-icon" style="color:#f0932b"></i>', name:'PULSAR', desc:'#19', url:srvUrl(S.SRV20,type,id,season,episode) },
  { icon:'<i class="ri-rock-fill style-icon" style="color:#b2bec3"></i>', name:'VIDROCK', desc:'جديد', url:srvUrl(S.SRV34,type,id,season,episode) },
  { icon:'<i class="ri-leaf-line style-icon" style="color:#55efc4"></i>', name:'EASY', desc:'جديد', url:srvUrl(S.SRV35,type,id,season,episode) },
];
const proSrvs = [
  { icon:'<i class="ri-flag-2-fill style-icon" style="color:#ff7675"></i>', name:'PRIME', desc:'#01', url:srvUrl(S.SRV1,type,id,season,episode) },
  { icon:'<i class="ri-flashlight-line style-icon" style="color:#fdcb6e"></i>', name:'NEXUS', desc:'#02', url:srvUrl(S.SRV2,type,id,season,episode) },
  { icon:'<i class="ri-gem-fill style-icon" style="color:#74b9ff"></i>', name:'TITAN', desc:'#03', url:srvUrl(S.SRV3,type,id,season,episode) },
  { icon:'<i class="ri-4k-fill style-icon" style="color:#a29bfe"></i>', name:'NEXUS-X', desc:'4K', url:type==='movie'?`https://multiembed.mov/?video_id=${id}&tmdb=1`:`https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1&s=${season}&e=${episode}` },
  { icon:'<i class="ri-medal-fill style-icon" style="color:#e17055"></i>', name:'VULCAN', desc:'#21', url:srvUrl(S.SRV22,type,id,season,episode) },
  { icon:'<i class="ri-sun-foggy-line style-icon" style="color:#fd79a8"></i>', name:'AURORA', desc:'#04', url:srvUrl(S.SRV4,type,id,season,episode) },
  { icon:'<i class="ri-vip-crown-fill style-icon" style="color:#f9ca24"></i>', name:'ZENITH', desc:'#06', url:srvUrl(S.SRV6,type,id,season,episode) },
  { icon:'<i class="ri-magic-fill style-icon" style="color:#a29bfe"></i>', name:'PHANTOM', desc:'#08', url:srvUrl(S.SRV18,type,id,season,episode) },
  { icon:'<i class="ri-star-shine-fill style-icon" style="color:#ffeaa7"></i>', name:'VEGA', desc:'#11', url:srvUrl(S.SRV11,type,id,season,episode)+'?autoplayNextEpisode=true&episodeSelector=true&overlay=true&color=e50914' },
];
const freeSrvs = [
  { icon:'<i class="ri-drop-fill style-icon" style="color:#74b9ff"></i>', name:'CRYSTAL', desc:'#12', url:srvUrl(S.SRV12,type,id,season,episode) },
  { icon:'<i class="ri-code-s-slash-line style-icon" style="color:#a29bfe"></i>', name:'CIPHER', desc:'#13', url:srvUrl(S.SRV13,type,id,season,episode) },
  { icon:'<i class="ri-cloud-windy-fill style-icon" style="color:#81ecec"></i>', name:'NEBULA', desc:'#15', url:srvUrl(S.SRV15,type,id,season,episode) },
  { icon:'<i class="ri-fire-fill style-icon" style="color:#ff7675"></i>', name:'QUASAR', desc:'#18', url:srvUrl(S.SRV19,type,id,season,episode) },
  { icon:'<i class="ri-music-2-fill style-icon" style="color:#55efc4"></i>', name:'LYRA', desc:'#20', url:srvUrl(S.SRV21,type,id,season,episode) },
  { icon:'<i class="ri-code-box-fill style-icon" style="color:#74b9ff"></i>', name:'EMBED', desc:'#23', url:srvUrl(S.SRV24,type,id,season,episode) },
  { icon:'<i class="ri-global-fill style-icon" style="color:#00cec9"></i>', name:'ATLAS', desc:'#24', url:srvUrl(S.SRV29,type,id,season,episode) },
  { icon:'<i class="ri-merge-cells-horizontal style-icon" style="color:#fd79a8"></i>', name:'FUSION', desc:'#25', url:srvUrl(S.SRV30,type,id,season,episode) },
  { icon:'<i class="ri-rocket-fill style-icon" style="color:#fdcb6e"></i>', name:'ROCKET', desc:'#26', url:srvUrl(S.SRV32,type,id,season,episode) },
  { icon:'<i class="ri-flower-fill style-icon" style="color:#fd79a8"></i>', name:'SAKURA', desc:'#27', url:srvUrl(S.SRV26,type,id,season,episode) },
  { icon:'<i class="ri-fire-fill style-icon" style="color:#e17055"></i>', name:'INFERNO', desc:'#28', url:srvUrl(S.SRV25,type,id,season,episode) },
  { icon:'<i class="ri-sword-fill style-icon" style="color:#b2bec3"></i>', name:'KATANA', desc:'#29', url:srvUrl(S.SRV27,type,id,season,episode) },
  { icon:'<i class="ri-shield-star-fill style-icon" style="color:#f9ca24"></i>', name:'SIGMA', desc:'#30', url:srvUrl(S.SRV23,type,id,season,episode) },
  { icon:'<i class="ri-ancient-gate-fill style-icon" style="color:#e17055"></i>', name:'CASTLE', desc:'#31', url:srvUrl(S.SRV28,type,id,season,episode) },
  { icon:'<i class="ri-bard-fill style-icon" style="color:#ff7675"></i>', name:'NOVA-X', desc:'#32', url:srvUrl(S.SRV33,type,id,season,episode) },
  { icon:'<i class="ri-hammer-fill style-icon" style="color:#b2bec3"></i>', name:'SMASH', desc:'#33', url:srvUrl(S.SRV34,type,id,season,episode) },
  { icon:'<i class="ri-plant-fill style-icon" style="color:#55efc4"></i>', name:'EASY', desc:'#34', url:srvUrl(S.SRV35,type,id,season,episode) },
  { icon:'<i class="ri-vidicon-fill style-icon" style="color:#fdcb6e"></i>', name:'VIDSRC-X', desc:'#35', url:srvUrl(S.SRV36,type,id,season,episode) },
  { icon:'<i class="ri-tv-fill style-icon" style="color:#a29bfe"></i>', name:'SUPERFLIX', desc:'#36', url:superflixUrl },
  { icon:'<i class="ri-clapperboard-fill style-icon" style="color:#ff9f43"></i>', name:'SMASHY', desc:'#37', url:srvUrl(S.SRV7,type,id,season,episode) },
];
const allSrvs = [...vipSrvs, ...proSrvs, ...freeSrvs];
window._vipSrvs = vipSrvs; window._proSrvs = proSrvs; window._freeSrvs = freeSrvs;
// جلب ROX من stream.js
const roxTitle = type === 'movie' ? (det.title || det.original_title) : (det.name || det.original_name);
let roxStreamUrl = null;
try {
  const streamEp = type === 'tv' ? episode : 1;
  const streamRes = await fetch(`https://cinema-rox.vercel.app/api/stream?title=${encodeURIComponent(roxTitle)}&ep=${streamEp}`);
  const streamData = await streamRes.json();
  const best = (streamData.sources || []).find(s => s.type === 'hls') || (streamData.sources || [])[0];
  if (best?.url) roxStreamUrl = best.url;
} catch(e) { console.warn('[ROX stream] فشل:', e.message); }
// تحديث رابط ROX في vipSrvs
const roxCard = vipSrvs.find(s => s.stream);
const multiUrl = type === 'movie'
  ? `https://multiembed.mov/?video_id=${id}&tmdb=1`
  : `https://multiembed.mov/?video_id=${id}&tmdb=1&s=1&e=${episode}`;
if (roxCard) roxCard.url = roxStreamUrl || multiUrl;
function srvHTML(list) {
  return list.map(s => `
    <div class="ws-card ${s.active?'ws-active':''}" data-url="${s.url||''}" data-name="${s.name}" ${s.rox?'data-rox="true"':''} onclick="wsSelectServer(this)">
      ${s.active?'<span class="ws-check">✔</span>':''}
      <div class="ws-icon">${s.icon}</div>
      <div class="ws-name">${s.name}</div>
      <div class="ws-desc">${s.desc}</div>
      <span class="ws-free">مجاني</span>
    </div>`).join('');
}

const epInfo = type === 'tv' ? `
  <div class="ws-ep-bar">
    <span class="ws-ep-title">${title}</span>
    <span class="ws-ep-info">الموسم ${season} · الحلقة ${episode}</span>
  </div>` : '';

const prodHTML = [
  det.budget  ? `<div class="ws-prod-item"><span class="ws-prod-val">$${det.budget.toLocaleString()}</span><span class="ws-prod-label">💰 الميزانية</span></div>` : '',
  det.revenue ? `<div class="ws-prod-item"><span class="ws-prod-val">$${det.revenue.toLocaleString()}</span><span class="ws-prod-label">✅ الإيرادات</span></div>` : '',
].join('');

page.innerHTML = `
  <div class="ws-player-wrap">
    <div class="ws-player-bg" style="background-image:url('${backdrop}')">
      <div class="video-ambient-glow"></div>
      <div class="ws-ambient" style="background-image:url('${backdrop}')"></div>
      <div class="ws-title-overlay" id="wsTitleOverlay">
        <div class="ws-title-brand">${det.original_title || det.original_name || title}</div>
        <div class="ws-title-meta">${runtime||''} ${year?'• '+year:''} ${certification?'• '+certification+'+':''}</div>
        <div class="ws-title-desc">${overview}</div>
      </div>
      <div class="ws-overlay" id="wsOverlay" onclick="wsStartStream()">
        <div class="ws-play-circle"><i class="ri-play-fill"></i></div>
        <span class="ws-play-lbl">اضغط للمشاهدة</span>
      </div>
    </div>
    <iframe id="wsFrame" class="ws-frame" src=""
  allowfullscreen
  sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-popups-to-escape-sandbox"
  allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
  referrerpolicy="no-referrer-when-downgrade"
  onload="if(this.src)cwTrackTime(${id},'${type}','${cwPoster}','${cwTitle}')">
</iframe>
    <div id="roxPlayerWrap" class="rox-player-wrap" style="display:none">
      <video id="roxPlayer" class="rox-player-video" playsinline></video>
      <div class="rox-player-controls" id="roxControls">
        <div class="rox-ctrl-top">
          <span class="rox-ctrl-title" id="roxCtrlTitle">ROX Player</span>
        </div>
        <div class="rox-progress-wrap">
          <span class="rox-time" id="roxTimeCur">0:00</span>
          <input type="range" class="rox-progress" id="roxProgress" value="0" min="0" max="100" step="0.1">
          <span class="rox-time" id="roxTimeDur">0:00</span>
        </div>
        <div class="rox-ctrl-row">
          <button class="rox-btn" id="roxPlayBtn" onclick="roxTogglePlay()">
            <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
          </button>
          <button class="rox-btn" onclick="roxSkip(-10)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.49"/><text x="8" y="15" font-size="7" fill="currentColor" stroke="none">10</text></svg>
          </button>
          <button class="rox-btn" onclick="roxSkip(10)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.49-3.49"/><text x="8" y="15" font-size="7" fill="currentColor" stroke="none">10</text></svg>
          </button>
          <div class="rox-vol-wrap">
            <button class="rox-btn" onclick="roxToggleMute()">
              <svg id="roxVolIco" viewBox="0 0 24 24" fill="currentColor"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            </button>
            <input type="range" class="rox-vol" id="roxVol" value="100" min="0" max="100">
          </div>
          <span class="rox-spacer"></span>
          <button class="rox-btn" onclick="roxFullscreen()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
          </button>
        </div>
      </div>
    </div>
    <div id="wsSwitchOverlay" class="ws-switch-overlay" style="display:none">
      <div class="ws-switch-spinner"></div>
      <span class="ws-switch-txt">يتم الاتصال بسيرفرات Cinema-ROX...</span>
    </div>
    <button class="ws-back" onclick="wsGoBack()">→ رجوع</button>
  </div>
  <div class="ws-action-row">
    <button class="rox-theater-btn" id="cinemaModeBtn" onclick="toggleCinemaMode()"><i class="ri-film-fill" style="color:#ff2a2a;margin-left:5px"></i> وضع السينما</button>
    <button class="rox-snapshot-btn" onclick="roxSnapshot()"><i class="ri-share-forward-box-fill" style="color:#00f2fe;margin-left:5px"></i> مشاركة</button>
  </div>
  ${epInfo}
  <div class="ws-info-block">
    <div class="ws-info-right">
      <img class="ws-poster-lg" src="${cwPoster}" alt="${title}">
      <div class="ws-rating-box">
        <div class="ws-big-score"><i class="ri-star-fill" style="color:#ffd700"></i> ${rating}<span>/10</span></div>
        <div class="ws-vote-label">تقييم الجمهور</div>
        <div class="ws-rbar-list">
          ${[5,4,3,2,1].map((s,i)=>{const w=['70%','20%','7%','2%','1%'][i];return `<div class="ws-rbar-row"><span>${s}★</span><div class="ws-rbar"><div class="ws-rbar-fill" style="width:${w}"></div></div><span>${w}</span></div>`;}).join('')}
        </div>
      </div>
    </div>
    <div class="ws-info-left">
      <div class="ws-brand-title">${title}</div>
      <p class="ws-overview-hero">${overview}</p>
      <div class="ws-quality-row">
        ${genres ? `<div class="ws-qual-chip"><i class="ri-film-line"></i><span>${(arData.genres||det.genres||[]).map(g=>g.name).join(' · ')}</span></div>` : ''}
        <div class="ws-qual-chip"><i class="ri-hd-fill"></i><span>${quality}</span></div>
        ${hasArabic?`<div class="ws-qual-chip"><i class="ri-translate-2"></i><span>دبلجة عربية</span></div>`:''}
        <div class="ws-qual-chip"><i class="ri-closed-captioning-fill"></i><span>ترجمة متوفرة</span></div>
        <div class="ws-qual-chip"><i class="ri-calendar-check-line"></i><span>تاريخ الإصدار ${year}</span></div>
      </div>
      <div class="ws-meta-chips">
        ${runtime?`<div class="ws-meta-chip-v2"><i class="ri-time-line"></i><span>${runtime}</span></div>`:''}
        <div class="ws-meta-chip-v2"><i class="ri-calendar-line"></i><span>${year}</span></div>
        ${certification?`<div class="ws-meta-chip-v2 ws-chip-red"><span>${certification}+</span></div>`:''}
      </div>
    </div>
  </div>
  <div class="ws-section">
    <h3 class="ws-stitle"><i class="ri-broadcast-line" style="color:#ff2a2a"></i> مصادر المشاهدة</h3>
    <div class="subscription-grid">
      <div class="sub-card free-card" onclick="toggleVault('free')">
        <h4><i class="ri-global-line" style="color:#eab308"></i> العامة FREE</h4>
        <p>مشاهدة مجانية</p>
        <div class="vault-content" id="content-free"></div>
        <button class="sub-btn free-btn">شاهد الآن</button>
      </div>
      <div class="sub-card pro-card" onclick="toggleVault('pro')">
        <h4><i class="ri-flashlight-fill" style="color:#a855f7"></i> السريعة PRO</h4>
        <p>جودة عالية وسرعة أكبر</p>
        <div class="vault-content" id="content-pro"></div>
        <button class="sub-btn pro-btn">اشترك الآن</button>
      </div>
      <div class="sub-card vip-card" onclick="toggleVault('vip')">
        <h4><i class="ri-vip-crown-fill" style="color:#ffd700"></i> الفاخرة VIP</h4>
        <p>أفضل جودة • بدون إعلانات</p>
        <div class="vault-content" id="content-vip"></div>
        <button class="sub-btn vip-btn">اشترك الآن</button>
      </div>
    </div>
    <p class="ws-note">إذا لم يعمل السيرفر جرب آخر</p>
  </div>
  <div class="suggestions-section">
    <h3 class="ws-stitle">⭐ قد يعجبك أيضاً</h3>
    <div class="suggestions-scroll-row" id="suggestions-row-${id}"></div>
  </div>
  ${prodHTML?`<div class="ws-section"><h3 class="ws-stitle">📊 بيانات الإنتاج</h3><div class="ws-prod-grid">${prodHTML}</div></div>`:''}`;
  } catch(e) {
    page.innerHTML = `<div class="loading">❌ خطأ<br><button onclick="wsGoBack()" class="detail-btn">← رجوع</button></div>`;
  }
}
setTimeout(() => {
    const row = document.getElementById(`suggestions-row-${id}`);
    if (!row) return;
    const ep2 = `/${type}/${id}/similar`;
    fetch(buildTMDBUrl(ep2, {language:'ar'}))
      .then(r => r.json())
      .then(d => {
        const items = (d.results||[]).filter(m => m.poster_path).slice(0,12);
        if (!items.length) { row.closest('.suggestions-section').style.display='none'; return; }
        row.innerHTML = items.map(m => `
          <div class="suggest-movie-card" onclick="openDetail(${m.id},'${type}')">
            <img src="https://image.tmdb.org/t/p/w200${m.poster_path}" loading="lazy" onerror="this.closest('.suggest-movie-card').remove()">
            <div class="suggest-rating"><i class="ri-star-fill"></i> ${m.vote_average?.toFixed(1)||'?'}</div>
          </div>`).join('');
      }).catch(()=>{ row.closest('.suggestions-section').style.display='none'; });
  }, 1000);
window._vipSrvs = null; window._proSrvs = null; window._freeSrvs = null;
window.toggleVault = function(vaultId) {
  const content = document.getElementById('content-' + vaultId);
  if (!content) return;
  const isOpen = content.classList.contains('open');
  if (isOpen) return;
  document.querySelectorAll('.vault-content').forEach(v => {
    v.classList.remove('open');
    v.style.maxHeight = '0';
    v.style.padding = '0';
  });
  document.querySelectorAll('.sub-card').forEach(c => c.classList.remove('vault-open'));
  content.classList.add('open');
  content.style.maxHeight = '500px';
  content.style.padding = '10px';
  content.closest('.sub-card')?.classList.add('vault-open');
  const map = {vip: window._vipSrvs, pro: window._proSrvs, free: window._freeSrvs};
  const list = map[vaultId] || [];
  content.innerHTML = list.map(s => `
    <div class="mini-server-node ${s.active?'mini-active':''}" onclick="wsSelectServerNew(this,'${s.url||''}','${s.name}',${!!s.rox})">
      ${s.icon}
      <div class="mini-name">${s.name}</div>
      <div class="mini-desc">${s.desc}</div>
      <div class="ping-dot"></div>
    </div>`).join('');
}
window.wsSelectServerNew = function(el, url, name, isRox) {
  document.querySelectorAll('.mini-server-node').forEach(n => n.classList.remove('mini-active'));
  el.classList.add('mini-active');
  const sw = document.getElementById('wsSwitchOverlay');
  if (sw) {
    sw.style.display = 'flex';
    setTimeout(() => {
      if (isRox) { loadRox(null); } else { document.getElementById('wsFrame').src = url; }
      setTimeout(() => { sw.style.display = 'none'; }, 1800);
    }, 400);
  } else {
    if (isRox) { loadRox(null); } else { document.getElementById('wsFrame').src = url; }
  }
}
window.wsStartStream = function() {
  const overlay = document.getElementById('wsOverlay');
  if (overlay) overlay.style.display = 'none';
  const titleOverlay = document.getElementById('wsTitleOverlay');
  if (titleOverlay) titleOverlay.style.display = 'none';
  const firstCard = [...document.querySelectorAll('.ws-card')].find(c => c.dataset.url && c.dataset.url !== 'null' && c.dataset.url !== '');
  if (firstCard) firstCard.click();
};
// ===== CONTINUE WATCHING =====
let _cwTimer = null;
function cwTrackTime(id, type, poster, title) {
  clearInterval(_cwTimer);
  let sec = 0;
  _cwTimer = setInterval(() => {
    sec += 10;
    const activeCard = document.querySelector('.ws-card.active');
    const srv = activeCard ? (activeCard.dataset.name || '') : '';
    const url = activeCard ? (activeCard.dataset.url || '') : '';
    cwSave(id, type, poster, title, sec, srv, url);
  }, 10000);
}
const CW_KEY = 'rox_continue';
const CW_TTL = 604800000; // 7 أيام

function cwSave(id, type, poster, title, seconds, server, serverUrl) {
  const list = cwGetAll();
  const idx  = list.findIndex(i => i.id === id);
  const item = { id, type, poster, title, seconds, server, serverUrl, savedAt: Date.now() };
  if (idx > -1) list[idx] = item; else list.unshift(item);
  localStorage.setItem(CW_KEY, JSON.stringify(list.slice(0, 20)));
}

function cwGetAll() {
  try {
    const all = JSON.parse(localStorage.getItem(CW_KEY) || '[]');
    const valid = all.filter(i => Date.now() - i.savedAt < CW_TTL);
    if (valid.length !== all.length) localStorage.setItem(CW_KEY, JSON.stringify(valid));
    return valid;
  } catch { return []; }
}

function cwDelete(id) {
  const list = cwGetAll().filter(i => i.id !== id);
  localStorage.setItem(CW_KEY, JSON.stringify(list));
  loadHomePage();
}

function cwRender() {
  loadHomePage();
}

function cwResume(id, type, seconds, server, serverUrl) {
  openWatchPage(id, type, 1, 1, seconds, serverUrl);
}
// ===== LIBRARY HELPERS =====
function libKey(base) {
  const uid = window.ROX_USER?.uid || 'guest';
  return `${base}_${uid}`;
}
function getLib(key) {
  try { return JSON.parse(localStorage.getItem(libKey(key)) || '[]'); } catch { return []; }
}
function saveLib(key, arr) {
  localStorage.setItem(libKey(key), JSON.stringify(arr));
}
function addToWatchlist(id, type) {
  if (!window.ROX_USER) { showToast('🔐 سجّل دخولك أولاً'); bnavGo('profile'); return; }
  const list = getLib('rox_watchlist');
  const exists = list.find(i => i.id === id);
  const favBtn = document.querySelector(`.dp-btn-fav[data-id="${id}"]`);
  const svg = favBtn?.querySelector('svg');
  if (exists) {
    saveLib('rox_watchlist', list.filter(i => i.id !== id));
    localStorage.removeItem(`rox_fav_${id}`);
    showToast('💔 تمت الإزالة من المفضلة');
    if (favBtn) { favBtn.style.color=''; favBtn.style.borderColor=''; favBtn.style.boxShadow=''; }
    if (svg) { svg.style.fill='none'; svg.style.stroke='currentColor'; }
  } else {
    list.unshift({ id, type, addedAt: Date.now() });
    saveLib('rox_watchlist', list);
    localStorage.setItem(`rox_fav_${id}`, '1');
    showToast('❤️ تمت الإضافة إلى المفضلة');
    if (favBtn) { favBtn.style.color='#e50914'; favBtn.style.borderColor='rgba(229,9,20,0.7)'; favBtn.style.boxShadow='0 0 14px rgba(229,9,20,0.4)'; }
    if (svg) { svg.style.fill='#e50914'; svg.style.stroke='none'; }
  }
}
function toggleAlertSubscription(id, title, type) {
  const list = getLib('rox_alerts');
  const exists = list.find(i => String(i.id) === String(id));
  const btn = document.getElementById(`alertBtn_${id}`);
  if (exists) {
    saveLib('rox_alerts', list.filter(i => i.id !== id));
    if (btn) { btn.classList.remove('active'); btn.style.color=''; btn.style.borderColor='rgba(229,9,20,0.25)'; btn.style.boxShadow=''; btn.style.background=''; const ico=btn.querySelector('.dp-act-ico,svg'); if(ico){ico.style.stroke='';ico.style.filter='';} btn.querySelector('span')&&(btn.querySelector('span').textContent='تنبيه'); }
    showToast('تم إلغاء الاشتراك');
  } else {
    list.unshift({ id, title, type, addedAt: Date.now() });
    saveLib('rox_alerts', list);
  if (btn) { btn.classList.add('active'); btn.style.color='#1ce783'; btn.style.borderColor='rgba(28,231,131,0.7)'; btn.style.boxShadow='0 0 14px rgba(28,231,131,0.3)'; btn.style.background='rgba(28,231,131,0.1)'; const ico=btn.querySelector('.dp-act-ico,svg'); if(ico){ico.style.stroke='#1ce783';ico.style.filter='drop-shadow(0 0 8px #1ce783)';} btn.querySelector('span')&&(btn.querySelector('span').textContent='مفعّل'); }    showToast('تم الاشتراك بالتنبيهات');
    checkAlertUpdates(id, title);
  }
}

async function checkAlertUpdates(id, title) {
  try {
    const key = `rox_alert_seen_${id}`;
    const data = await fetch(buildTMDBUrl(`/tv/${id}`)).then(r => r.json());
    const ep = data.last_episode_to_air;
    if (!ep) return;
    const epKey = `${ep.season_number}_${ep.episode_number}`;
    const seen = localStorage.getItem(key);
    if (seen === epKey) return;
    if (!seen) { localStorage.setItem(key, epKey); return; }
    localStorage.setItem(key, epKey);
    const epThumb = ep.still_path
      ? `${CONFIG.IMAGES.BACKDROP}${ep.still_path}`
      : (data.poster_path ? `${CONFIG.IMAGES.POSTER_SM}${data.poster_path}` : CONFIG.IMAGES.PLACEHOLDER);
    addNotif(title, `الموسم ${ep.season_number} · الحلقة ${ep.episode_number} — ${ep.name||''}`, epThumb);
  } catch {}
}
function saveProgress(id, season, episode) {
  localStorage.setItem(`rox_progress_${id}`, JSON.stringify({ season, episode }));
}
function getProgress(id) {
  try { return JSON.parse(localStorage.getItem(`rox_progress_${id}`)); } catch { return null; }
    }
function switchTab(btn, tabId) {
  const parent = btn.closest('.detail-body') || document.getElementById('detailPage');
  parent.querySelectorAll('.dtab').forEach(b => b.classList.remove('active'));
  parent.querySelectorAll('.dtab-content').forEach(c => {
    c.classList.remove('active');
    c.style.display = 'none';
    c.style.opacity = '0';
  });
  btn.classList.add('active');
  const tab = document.getElementById(tabId);
  if (tab) {
    tab.style.display = 'block';
    tab.classList.add('active');
    setTimeout(() => tab.style.opacity = '1', 10);
  }
}

function checkAllAlerts() {
  const list = getLib('rox_alerts');
  list.forEach(item => checkAlertUpdates(item.id, item.title));
}
function addToWatchLater(id, type) {
  if (!window.ROX_USER) { showToast('🔐 سجّل دخولك أولاً'); bnavGo('profile'); return; }
  const list = getLib('rox_watchlater');
  const exists = list.find(i => i.id === id);
  const laterBtn = document.querySelector(`.dp-btn-later[data-id="${id}"]`);
  const svg = laterBtn?.querySelector('svg');
  if (exists) {
    saveLib('rox_watchlater', list.filter(i => i.id !== id));
    localStorage.removeItem(`rox_later_${id}`);
    showToast('🗑️ تمت الإزالة من سأشاهده');
    if (laterBtn) { laterBtn.style.color=''; laterBtn.style.borderColor=''; laterBtn.style.boxShadow=''; }
    if (svg) { svg.style.fill='none'; svg.style.stroke='currentColor'; }
  } else {
    list.unshift({ id, type, addedAt: Date.now() });
    saveLib('rox_watchlater', list);
    localStorage.setItem(`rox_later_${id}`, '1');
    showToast('⏰ تمت الإضافة إلى سأشاهده لاحقاً');
    if (laterBtn) { laterBtn.style.color='#f5c518'; laterBtn.style.borderColor='rgba(245,197,24,0.7)'; laterBtn.style.boxShadow='0 0 14px rgba(245,197,24,0.4)'; }
    if (svg) { svg.style.fill='#f5c518'; svg.style.stroke='none'; }
  }
}
function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'rox-toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 2500);
}

// ===== LIBRARY PAGE =====
function loadProfilePage() {
  const page = document.getElementById('profilePage');
  const user = window.ROX_USER;
  if (!user) {
    page.innerHTML = `
      <div class="prof-wrap">
        <div class="prof-logo">Cinema<span style="color:var(--accent)">ROX</span></div>
        <p class="prof-sub">سجّل دخولك لحفظ مكتبتك عبر أجهزتك</p>
        <button class="prof-google-btn" onclick="roxSignIn()">
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.1l-6.2-5.2C29.3 35.5 26.7 36.5 24 36.5c-5.2 0-9.6-3.3-11.2-8H6.4C9.8 36.8 16.4 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.5l6.2 5.2C36.9 39.3 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"/>
          </svg>
          تسجيل الدخول بـ Google
        </button>
      </div>`;
  } else {
    const lang    = localStorage.getItem('rox_lang')    || 'ar';
    const subSize = localStorage.getItem('rox_sub_size')|| 'md';
    const subClr  = localStorage.getItem('rox_sub_color')|| '#ffffff';
    page.innerHTML = `
      <div class="prof-wrap">
        <div class="prof-avatar-wrap">
          <img class="prof-avatar" src="${user.photoURL}" onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'">
        </div>
        <div class="prof-name">${user.displayName}</div>
        <div class="prof-email">${user.email}</div>

        <div class="prof-settings">
          <div class="prof-hud">
            <div class="prof-hud-title"><svg class="hud-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> اللغة</div>
            <div class="prof-hud-row">
              <button class="prof-pill ${lang==='ar'?'active':''}" onclick="setLang('ar',this)">العربية</button>
              <button class="prof-pill ${lang==='en'?'active':''}" onclick="setLang('en',this)">English</button>
            </div>
          </div>
          <div class="prof-hud">
            <div class="prof-hud-title"><svg class="hud-icon" viewBox="0 0 24 24"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg> حجم الترجمة</div>
            <div class="prof-hud-row">
              <button class="prof-pill ${subSize==='sm'?'active':''}" onclick="setSubSize('sm',this)">صغير</button>
              <button class="prof-pill ${subSize==='md'?'active':''}" onclick="setSubSize('md',this)">متوسط</button>
              <button class="prof-pill ${subSize==='lg'?'active':''}" onclick="setSubSize('lg',this)">كبير</button>
            </div>
          </div>
          <div class="prof-hud">
            <div class="prof-hud-title"><svg class="hud-icon" viewBox="0 0 24 24"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg> لون الترجمة</div>
            <div class="prof-hud-row">
              <button class="prof-pill ${subClr==='#ffffff'?'active':''}" style="color:#fff"   onclick="setSubColor('#ffffff',this)">أبيض</button>
              <button class="prof-pill ${subClr==='#ffff00'?'active':''}" style="color:#ff0"   onclick="setSubColor('#ffff00',this)">أصفر</button>
              <button class="prof-pill ${subClr==='#00e5ff'?'active':''}" style="color:#00e5ff" onclick="setSubColor('#00e5ff',this)">سيان</button>
            </div>
          </div>
          <div class="prof-hud">
            <div class="prof-hud-title"><svg class="hud-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg> مزامنة الحسابات</div>
            <div class="prof-hud-row" id="traktHudRow">
              ${localStorage.getItem('trakt_token')
                ? `<span style="color:#00e5ff;font-size:0.78rem;font-weight:700">🟢 متصل بـ Trakt</span>
                   <button class="prof-pill" style="color:#ff6b6b" onclick="traktDisconnect()">قطع الاتصال</button>`
                : `<button class="prof-pill active" onclick="traktConnect()">🔗 ربط Trakt TV</button>`}
            </div>
          </div>
          <div class="prof-hud">
            <div class="prof-hud-title"><svg class="hud-icon" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> مكتبتي</div>
            <div class="prof-hud-row">
              <button class="prof-pill" onclick="bnavGo('library')">عرض المكتبة</button>
              <button class="prof-pill" onclick="toggleWatchHistory(this)">📅 تاريخ المشاهدات</button>
              <button class="prof-pill" style="color:#ff6b6b;border-color:rgba(229,9,20,0.4)" onclick="clearLibraryConfirm()">🗑 مسح الكل</button>
            </div>
          </div>
        </div>
        <button class="prof-signout" onclick="roxSignOut()">تسجيل الخروج</button>
      <button class="prof-signout" onclick="roxSignOut()">تسجيل الخروج</button>
        <div id="watchHistoryPanel" style="display:none;padding:0 4px 8px">
            ${(()=>{
              const items = cwGetAll();
              if (!items.length) return '<p style="color:var(--text3);font-size:0.8rem;text-align:center;padding:12px">لا توجد مشاهدات بعد</p>';
              return `<div class="wh-list">${items.map(i=>`
                <div class="wh-item" onclick="openDetail(${i.id},'${i.type}')">
                  <img class="wh-poster" src="${i.poster||CONFIG.IMAGES.PLACEHOLDER}" onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'">
                  <div class="wh-info">
                    <div class="wh-title">${i.title||''}</div>
                    <div class="wh-meta">${i.type==='movie'?'🎬 فيلم':'📺 مسلسل'}</div>
                    <div class="wh-time">${new Date(i.savedAt).toLocaleDateString('ar-SA')}</div>
                    <div class="wh-progress-wrap">
                      <div class="wh-progress-bar" style="width:${Math.min(100,Math.round(i.seconds/7200*100))}%"></div>
                    </div>
                  </div>
                </div>`).join('')}</div>`;
            })()}
       </div>
      </div>`;
  }
}
function clearLibraryConfirm() {
  if (confirm('⚠️ هل تريد مسح المكتبة كاملاً؟')) {
    saveLib('rox_watchlist', []);
    saveLib('rox_watchlater', []);
    Object.keys(localStorage).filter(k=>k.startsWith('rox_fav_')||k.startsWith('rox_later_')).forEach(k=>localStorage.removeItem(k));
    showToast('🗑 تم مسح المكتبة');
  }
}
function setLang(lang,btn){ btn.closest('.prof-hud-row').querySelectorAll('.prof-pill').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); localStorage.setItem('rox_lang',lang); }
function setSubSize(size,btn){ btn.closest('.prof-hud-row').querySelectorAll('.prof-pill').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); localStorage.setItem('rox_sub_size',size); }
function setSubColor(color,btn){ btn.closest('.prof-hud-row').querySelectorAll('.prof-pill').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); localStorage.setItem('rox_sub_color',color); }
async function loadLibraryPage() {
  const page = document.getElementById('libraryPage');
  if (!page) return;
  if (!window.ROX_USER) {
    page.innerHTML = `<div class="prof-wrap"><div class="prof-logo">Cinema<span style="color:var(--accent)">ROX</span></div><p class="prof-sub">🔐 سجّل دخولك لعرض مكتبتك</p><button class="prof-google-btn" onclick="bnavGo('profile')">تسجيل الدخول</button></div>`;
    return;
  }
  page.innerHTML = '<div class="loading">⏳ جاري تحميل المكتبة...</div>';

  const watchlist  = getLib('rox_watchlist');
  const watchlater = getLib('rox_watchlater');
  const cwItems    = cwGetAll();
  const traktCol   = getLib('trakt_collection');
  const traktWl    = getLib('trakt_watchlist');
  const EMPTY = `<p class="lib-radar-empty">الرادار فارغ حالياً.. أضف تحفتك القادمة من الواجهة الرئيسية</p>`;

  const buildCard = (item, listKey) => {
    const delBtn = listKey ? `<button class="lib-del-btn" onclick="libRemove('${listKey}',${item.id},'${item.type}')">✕</button>` : '';
    return `<div class="lib-card" onclick="openDetail(${item.id},'${item.type === 'anime' ? 'tv' : item.type}')">
      <img class="lib-card-img" src="${item.poster||CONFIG.IMAGES.PLACEHOLDER}" loading="lazy" onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'">
      <div class="lib-card-overlay"><span>▶</span></div>
      ${item.rating ? `<span class="lib-card-rating">${item.rating}</span>` : ''}
      ${delBtn}
    </div>`;
  };

  const fetchCards = async (items, listKey = '') => {
    if (!items.length) return EMPTY;
    const cards = await Promise.all(items.map(async item => {
      try {
        const ep = (item.type === 'tv' || item.type === 'anime') ? `/tv/${item.id}` : `/movie/${item.id}`;
        const d  = await fetch(buildTMDBUrl(ep)).then(r => r.json());
        item.poster = d.poster_path ? `${CONFIG.IMAGES.POSTER_SM}${d.poster_path}` : CONFIG.IMAGES.PLACEHOLDER;
        item.rating = d.vote_average ? d.vote_average.toFixed(1) : '';
        return buildCard(item, listKey);
      } catch { return ''; }
    }));
    return `<div class="lib-grid">${cards.join('')}</div>`;
  };

  const buildSection = (laserClass, iconClass, iconSVG, title, html, listKey, allItems) => {
    const showAllBtn = allItems.length > 12
      ? `<button class="browse-all-btn" onclick="libShowAll('${listKey}')">عرض الكل (${allItems.length}) ›</button>`
      : '';
    return `
    <div class="lib-section">
      <div class="lib-sec-head">
        <span class="lib-laser ${laserClass}"></span>
        <span class="lib-icon3d ${iconClass}">${iconSVG}</span>
        <h3 class="lib-sec-title">${title}</h3>
        ${showAllBtn}
      </div>
      ${html}
    </div>`;
  };

  const cwHTML = cwItems.length ? `<div class="lib-grid">${cwItems.map(i =>
    `<div class="lib-card" onclick="cwResume(${i.id},'${i.type}',${i.seconds},'${i.server}','${i.serverUrl||''}')">
      <img class="lib-card-img" src="${i.poster}" loading="lazy" onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'">
      <div class="lib-card-overlay"><span>▶</span></div>
      <div class="lib-card-bar"><div class="lib-card-progress" style="width:${Math.min(i.seconds/7200*100,100).toFixed(1)}%"></div></div>
      <button class="lib-del-btn" onclick="cwRemove(${i.id},'${i.type}')">✕</button>
    </div>`).join('')}</div>` : EMPTY;

  // جلب البيانات
  const wlSlice  = watchlist.slice(0, 12);
  const wlrSlice = watchlater.slice(0, 12);
  const tColSlice = traktCol.slice(0, 12);
  const tWlSlice  = traktWl.slice(0, 12);

  const [wlHTML, wlrHTML, tColHTML, tWlHTML] = await Promise.all([
    fetchCards(wlSlice,  'rox_watchlist'),
    fetchCards(wlrSlice, 'rox_watchlater'),
    fetchCards(tColSlice, 'trakt_collection'),
    fetchCards(tWlSlice,  'trakt_watchlist'),
  ]);

  const svgArchive = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>`;
  const svgClock   = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
  const svgPlay    = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>`;
  const svgTrakt   = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`;
const svgRadar = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="rg1" cx="50%" cy="40%" r="55%"><stop offset="0%" stop-color="#00ffcc" stop-opacity="0.95"/><stop offset="100%" stop-color="#007755" stop-opacity="0.7"/></radialGradient><filter id="rf1"><feGaussianBlur stdDeviation="0.4" result="blur"/><feComposite in="SourceGraphic" in2="blur" operator="over"/></filter></defs><circle cx="12" cy="12" r="10" fill="url(#rg1)" opacity="0.15" filter="url(#rf1)"/><circle cx="12" cy="12" r="10" stroke="url(#rg1)" stroke-width="1.5"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10" stroke="#00ffcc" stroke-width="1.2" opacity="0.8"/><path d="M2 12h20" stroke="#00ffcc" stroke-width="1.2" opacity="0.8"/><path d="M12 2a15.3 15.3 0 0 0-4 10 15.3 15.3 0 0 0 4 10" stroke="#00ffcc" stroke-width="1.2" opacity="0.8"/><circle cx="12" cy="12" r="2.5" fill="#00ffcc" opacity="0.9"/><circle cx="12" cy="12" r="1" fill="#ffffff"/></svg>`;
  const hasTrakt = localStorage.getItem('trakt_token');

  const radarHTML = await loadRadarSection();
  const animeRadarHTML = await loadAnimeRadarSection();
  page.innerHTML = `
    <div class="lib-header"><h2 class="lib-title">مكتبتي</h2></div>
    <div class="lib-stats">
      <div class="lib-stat-card">
        <div class="lib-stat-ico"><svg viewBox="0 0 24 24" fill="none" stroke="#e50914" stroke-width="1.8"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg></div>
        <div class="lib-stat-num">${watchlist.length}</div>
        <div class="lib-stat-label">أرشيفي</div>
      </div>
      <div class="lib-stat-card">
        <div class="lib-stat-ico"><svg viewBox="0 0 24 24" fill="none" stroke="#00e5ff" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
        <div class="lib-stat-num">${watchlater.length}</div>
        <div class="lib-stat-label">انتظار</div>
      </div>
      <div class="lib-stat-card">
        <div class="lib-stat-ico"><svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg></div>
        <div class="lib-stat-num">${cwItems.length}</div>
        <div class="lib-stat-label">جاري</div>
      </div>
      <div class="lib-stat-card">
        <div class="lib-stat-ico"><svg viewBox="0 0 24 24" fill="none" stroke="#1ce783" stroke-width="1.8"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></div>
        <div class="lib-stat-num">${getLib('rox_alerts').length}</div>
        <div class="lib-stat-label">تنبيهات</div>
      </div>
    </div>
    ${buildSection('lib-laser-magenta','lib-icon3d-magenta', svgArchive, 'أرشيفي الخاص',   wlHTML,  'rox_watchlist',  watchlist)}
    ${buildSection('lib-laser-cyan',   'lib-icon3d-cyan',    svgClock,   'قائمة الانتظار', wlrHTML, 'rox_watchlater', watchlater)}
    ${buildSection('lib-laser-orange', 'lib-icon3d-orange',  svgPlay,    'أكمل المشاهدة',  cwHTML,  '',               cwItems)}
    ${buildSection('lib-laser-green',  'lib-icon3d-green',   svgRadar,   'رادار حلقاتك', radarHTML, '', [])}
    ${hasTrakt && traktCol.length ? buildSection('lib-laser-magenta','lib-icon3d-magenta', svgTrakt, '📦 Trakt — مجموعتي', tColHTML, 'trakt_collection', traktCol) : ''}
    ${hasTrakt && traktWl.length  ? buildSection('lib-laser-cyan',   'lib-icon3d-cyan',    svgTrakt, '🕐 Trakt — قائمة المشاهدة', tWlHTML, 'trakt_watchlist', traktWl) : ''}
  `;
}
const TRAKT_CLIENT = CONFIG.KEYS.TRAKT;
const TRAKT_REDIRECT = location.origin + location.pathname;
async function libShowAll(listKey) {
  const page = document.getElementById('libraryPage');
  const items = getLib(listKey);
  page.innerHTML = '<div class="loading">⏳ جاري التحميل...</div>';
  const cards = await Promise.all(items.map(async item => {
    try {
      const ep = (item.type==='tv'||item.type==='anime') ? `/tv/${item.id}` : `/movie/${item.id}`;
      const d  = await fetch(buildTMDBUrl(ep)).then(r=>r.json());
      const poster = d.poster_path ? `${CONFIG.IMAGES.POSTER_SM}${d.poster_path}` : CONFIG.IMAGES.PLACEHOLDER;
      const rating = d.vote_average ? d.vote_average.toFixed(1) : '';
      return `<div class="lib-card" onclick="openDetail(${item.id},'${item.type==='anime'?'tv':item.type}')">
        <img class="lib-card-img" src="${poster}" loading="lazy" onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'">
        <div class="lib-card-overlay"><span>▶</span></div>
        ${rating?`<span class="lib-card-rating">${rating}</span>`:''}
        <button class="lib-del-btn" onclick="libRemove('${listKey}',${item.id},'${item.type}')">✕</button>
      </div>`;
    } catch { return ''; }
  }));
  page.innerHTML = `
    <div style="padding:16px">
      <button class="detail-btn" onclick="loadLibraryPage()" style="margin-bottom:16px">← رجوع</button>
      <h2 style="color:#fff;margin-bottom:16px">${items.length} عنصر</h2>
      <div class="lib-grid">${cards.join('')}</div>
    </div>`;
}
function traktConnect() {
  const url = `https://trakt.tv/oauth/authorize?response_type=code&client_id=${TRAKT_CLIENT}&redirect_uri=${encodeURIComponent(TRAKT_REDIRECT)}`;
  window.location.href = url;
}
function traktDisconnect() {
  localStorage.removeItem('trakt_token');
  showToast('🔌 تم قطع الاتصال بـ Trakt');
  loadProfilePage();
}
async function traktHandleCallback() {
  const code = new URLSearchParams(location.search).get('code');
  if (!code) return;
  try {
    const res = await fetch('https://api.trakt.tv/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code, client_id: TRAKT_CLIENT,
        client_secret: '', grant_type: 'authorization_code',
        redirect_uri: TRAKT_REDIRECT
      })
    });
    const data = await res.json();
    if (data.access_token) {
      localStorage.setItem('trakt_token', data.access_token);
      window.history.replaceState({}, '', location.pathname);
      showToast('✅ تم الربط بـ Trakt بنجاح!');
      traktLoadLibrary();
    }
  } catch { showToast('⚠️ فشل الاتصال بـ Trakt'); }
}
async function traktLoadLibrary() {
  const token = localStorage.getItem('trakt_token');
  if (!token) return;
  const H = {
    'trakt-api-key': TRAKT_CLIENT,
    'Authorization': `Bearer ${token}`,
    'trakt-api-version': '2',
    'Content-Type': 'application/json'
  };
  try {
    const [wlMovies, wlShows, colMovies, colShows] = await Promise.all([
      fetch('https://api.trakt.tv/users/me/watchlist/movies', { headers: H }).then(r=>r.json()),
      fetch('https://api.trakt.tv/users/me/watchlist/shows',  { headers: H }).then(r=>r.json()),
      fetch('https://api.trakt.tv/users/me/collection/movies',{ headers: H }).then(r=>r.json()),
      fetch('https://api.trakt.tv/users/me/collection/shows', { headers: H }).then(r=>r.json()),
    ]);

    const toMovie = i => ({ id: i.movie?.ids?.tmdb, type: 'movie' });
    const toShow  = i => ({ id: i.show?.ids?.tmdb,  type: 'tv'    });

    const wlItems  = [...(wlMovies||[]).map(toMovie), ...(wlShows||[]).map(toShow) ].filter(i=>i.id);
    const colItems = [...(colMovies||[]).map(toMovie), ...(colShows||[]).map(toShow)].filter(i=>i.id);

    // مسح القديم وحقن الجديد نظيف
    saveLib('trakt_watchlist',   wlItems);
    saveLib('trakt_collection',  colItems);

    showToast(`📥 ${wlItems.length + colItems.length} عنصر من Trakt`);
    if (document.getElementById('libraryPage')?.classList.contains('active')) loadLibraryPage();
  } catch(e) { showToast('⚠️ خطأ في جلب بيانات Trakt'); console.error(e); }
}
function addToLib(key, item) {
  const list = getLib(key);
  if (!list.find(i => i.id == item.id && i.type === item.type)) {
    list.push(item);
    saveLib(key, list);
  }
}
async function openAllEpsTMDB(id, season) {
  const page = document.getElementById('detailPage');
  if (!page) return;
  page.innerHTML = '<div class="loading">⏳ جاري تحميل الحلقات...</div>';
  try {
    const d = await fetch(buildTMDBUrl(`/tv/${id}/season/${season}`)).then(r=>r.json());
    const eps = d.episodes || [];
    page.innerHTML = `
      <div style="padding:16px">
        <button class="detail-btn" onclick="window._lastDetailId?openDetail(window._lastDetailId,window._lastDetailType||'movie'):goBack()" style="margin-bottom:16px">← رجوع</button>
        <h2 style="color:#fff;margin-bottom:16px">الموسم ${season} — ${eps.length} حلقة</h2>
        <div class="otaku-all-grid">
          ${eps.map(e => {
            const img = e.still_path ? `${CONFIG.IMAGES.BACKDROP}${e.still_path}` : CONFIG.IMAGES.PLACEHOLDER;
            return `<div class="anime-card" onclick="openWatchPage(${id},'tv',${season},${e.episode_number})">
              <div class="anime-poster-wrap">
                <img class="anime-poster" src="${img}" onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'">
                <div class="anime-overlay"><span>▶</span></div>
                <span class="rank-number">${e.episode_number}</span>
              </div>
              <div class="anime-title-bar">${(e.name||'حلقة '+e.episode_number).slice(0,22)}</div>
            </div>`;
          }).join('')}
        </div>
      </div>`;
  } catch { page.innerHTML = '<div class="loading">⚠️ خطأ في تحميل الحلقات</div>'; }
}
traktHandleCallback();
// ===== SEARCH DISCOVERY =====
async function initSearchDiscovery() {
  fillYearSelect();
  try {
    const res = await fetch(buildTMDBUrl('/trending/all/day', { page: 1 }));
    const data = await res.json();
    const items = (data.results || [])
      .filter(i => i.poster_path && (i.media_type==='movie'||i.media_type==='tv'))
      .slice(0, 3);
    const list = document.getElementById('sqTrendingList');
    if (!list || !items.length) return;
    list.innerHTML = items.map((m, i) => {
      const title = m.title || m.name || '';
      const rating = m.vote_average ? m.vote_average.toFixed(1) : '';
      const type = m.media_type === 'movie' ? 'فيلم' : 'مسلسل';
      const poster = m.poster_path
        ? `https://image.tmdb.org/t/p/w92${m.poster_path}`
        : 'https://via.placeholder.com/42x60/1a0000/fff?text=?';
      return `<div class="sq-trend-card" onclick="openDetail(${m.id},'${m.media_type}')">
        <div class="sq-trend-rank">${i+1}</div>
        <img class="sq-trend-poster" src="${poster}" alt="${title}" loading="lazy">
        <div class="sq-trend-info">
          <div class="sq-trend-title">${title}</div>
          <div class="sq-trend-meta">
            <span class="sq-trend-rating">★ ${rating}</span>
            <span class="sq-trend-type">${type}</span>
          </div>
        </div>
      </div>`;
    }).join('');
  } catch(e) { console.warn('initSearchDiscovery:', e); }
}

async function searchByGenre(genreId, label) {
  const input = document.getElementById('searchInput2');
  if (input) input.value = label;
  document.getElementById('searchDiscovery')?.classList.add('hidden');
  const container = document.getElementById('searchResults');
  if (!container) return;
  container.innerHTML = '<div class="loading">🔍 جاري البحث...</div>';
  try {
    const isAnime = genreId === '16';
    const params = isAnime
      ? { with_genres: '16', with_origin_country: 'JP', sort_by: 'popularity.desc', page: 1 }
      : { with_genres: genreId, sort_by: 'popularity.desc', page: 1 };

    const [movRes, tvRes] = await Promise.all([
      isAnime
        ? fetch(buildTMDBUrl('/discover/tv', params)).then(r=>r.json())
        : fetch(buildTMDBUrl('/discover/movie', params)).then(r=>r.json()),
      isAnime
        ? Promise.resolve({ results: [] })
        : fetch(buildTMDBUrl('/discover/tv', { with_genres: genreId, sort_by: 'popularity.desc', page: 1 })).then(r=>r.json()),
    ]);

    const movies = (movRes.results || []).filter(i => i.poster_path).slice(0, 10)
      .map(m => ({ ...m, media_type: isAnime ? 'tv' : 'movie' }));
    const shows  = (tvRes.results  || []).filter(i => i.poster_path).slice(0, 10)
      .map(m => ({ ...m, media_type: 'tv' }));
    const all = isAnime ? movies : [...movies, ...shows];

    if (!all.length) { container.innerHTML = '<p class="lib-empty">لا توجد نتائج 😕</p>'; return; }

    const movSection = !isAnime && movies.length ? `
      <div class="sq-genre-label">🎬 أفلام</div>
      <div class="movies-row">${movies.map(m => buildMovieCard(m, 'movie')).join('')}</div>` : '';
    const tvSection = !isAnime && shows.length ? `
      <div class="sq-genre-label">📺 مسلسلات</div>
      <div class="movies-row">${shows.map(m => buildMovieCard(m, 'tv')).join('')}</div>` : '';
    const animeSection = isAnime ? `
      <div class="sq-genre-label">🎌 أنمي</div>
      <div class="movies-row">${movies.map(m => buildMovieCard(m, 'tv')).join('')}</div>` : '';

    container.innerHTML = movSection + tvSection + animeSection;
  } catch { container.innerHTML = '<p class="lib-empty">حدث خطأ ❌</p>'; }
}
// ===== SEARCH =====
let searchDebounce = null;
function handleSearch(val) {
  clearTimeout(searchDebounce);
  const q = val.trim();
  const discovery = document.getElementById('searchDiscovery');
  if (q.length < CONFIG.SEARCH.MIN_CHARS) {
    const c = document.getElementById('searchResults');
    if (c) c.innerHTML = '';
    if (discovery) discovery.classList.remove('hidden');
    return;
  }
  if (discovery) discovery.classList.add('hidden');
  searchDebounce = setTimeout(() => runSearch(q), CONFIG.SEARCH.DEBOUNCE_MS);
}

async function runSearch(q) {
  const container = document.getElementById('searchResults');
  if (!container) return;
  container.innerHTML = '<div class="loading">🔍 جاري البحث...</div>';
  try {
    const res  = await fetch(buildTMDBUrl('/search/multi', { query: q, page: 1 }));
    const data = await res.json();
    const results = (data.results || [])
      .filter(i => (i.media_type === 'movie' || i.media_type === 'tv') && i.poster_path)
      .slice(0, CONFIG.SEARCH.MAX_RESULTS);
    if (!results.length) {
      container.innerHTML = '<p class="lib-empty">لا توجد نتائج 😕</p>';
      return;
    }
    container.innerHTML = `<div class="search-results-grid">
      ${results.map(m => buildSearchCard(m, m.media_type)).join('')}
    </div>`;
  } catch {
    container.innerHTML = '<p class="lib-empty">حدث خطأ في البحث ❌</p>';
  }
}
// ===== ADVANCED FILTER =====
function toggleAdvFilter() {
  const row = document.getElementById('searchFiltersRow');
  const btn = document.getElementById('filterToggleBtn');
  if (!row) return;
  const isOpen = row.classList.toggle('open');
  btn.classList.toggle('active', isOpen);
}

function onTypeChange() {
  applyAdvFilter();
}

function fillYearSelect() {
  const sel = document.getElementById('filterYear');
  if (!sel || sel.options.length > 1) return;
  const current = new Date().getFullYear();
  for (let y = current; y >= 1950; y--) {
    const opt = document.createElement('option');
    opt.value = y; opt.textContent = y;
    sel.appendChild(opt);
  }
}

async function applyAdvFilter() {
  const type    = document.getElementById('searchTypeSelect')?.value || 'all';
  const genre   = document.getElementById('filterGenre')?.value || '';
  const year    = document.getElementById('filterYear')?.value || '';
  const sort    = document.getElementById('filterSort')?.value || 'popularity.desc';
  const country = document.getElementById('filterCountry')?.value || '';
  const q       = document.getElementById('searchInput2')?.value.trim() || '';

  if (q.length >= (CONFIG.SEARCH.MIN_CHARS || 2)) { runSearch(q); return; }

  const container = document.getElementById('searchResults');
  if (!container) return;
  document.getElementById('searchDiscovery')?.classList.add('hidden');
  container.innerHTML = '<div class="loading">🔍 جاري البحث...</div>';

  try {
    const params = { sort_by: sort, page: 1 };
    if (genre) params.with_genres = genre;
    if (country) params.with_origin_country = country;
    const isAnime = type === 'anime';
    if (isAnime) { params.with_genres = '16'; params.with_origin_country = 'JP'; }

    let results = [];
    if (type === 'movie') {
      if (year) params.primary_release_year = year;
      const r = await fetch(buildTMDBUrl('/discover/movie', params)).then(r=>r.json());
      results = (r.results||[]).filter(i=>i.poster_path).slice(0,20).map(m=>({...m,media_type:'movie'}));
    } else if (type === 'tv' || type === 'anime') {
      if (year) params.first_air_date_year = year;
      const r = await fetch(buildTMDBUrl('/discover/tv', params)).then(r=>r.json());
      results = (r.results||[]).filter(i=>i.poster_path).slice(0,20).map(m=>({...m,media_type:'tv'}));
    } else {
      const pM = {...params}; const pT = {...params};
      if (year) { pM.primary_release_year = year; pT.first_air_date_year = year; }
      const [mv, tv] = await Promise.all([
        fetch(buildTMDBUrl('/discover/movie', pM)).then(r=>r.json()),
        fetch(buildTMDBUrl('/discover/tv',    pT)).then(r=>r.json()),
      ]);
      results = [
        ...(mv.results||[]).filter(i=>i.poster_path).slice(0,10).map(m=>({...m,media_type:'movie'})),
        ...(tv.results||[]).filter(i=>i.poster_path).slice(0,10).map(m=>({...m,media_type:'tv'})),
      ];
    }

    if (!results.length) { container.innerHTML = '<p class="lib-empty">لا توجد نتائج 😕</p>'; return; }
    container.innerHTML = `<div class="search-results-grid">${results.map(m=>buildSearchCard(m,m.media_type)).join('')}</div>`;
  } catch(e) {
    container.innerHTML = '<p class="lib-empty">حدث خطأ ❌</p>';
  }
}
// ===== STUBS =====
function openMovieOfDay() {}
function openStats()      {}
function openSurprise()   {}
function openAI()         {}
// ===== NOTIFICATION SIDEBAR =====
let notifOpen = false;
function loadNotifData() {
  try { return JSON.parse(localStorage.getItem('rox_notif_data') || '[]'); } catch { return []; }
}
function saveNotifData() {
  localStorage.setItem('rox_notif_data', JSON.stringify(NOTIF_DATA.slice(0, 50)));
}
const NOTIF_DATA = loadNotifData();

function updateBadge() {
  const badge = document.getElementById('notifBadge');
  if (!badge) return;
  const unread = NOTIF_DATA.filter(n => !n.read).length;
  if (unread > 0) {
    badge.textContent = unread;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

function markAsRead(id) {
  const notif = NOTIF_DATA.find(n => n.id === id);
  if (notif) { notif.read = true; saveNotifData(); }
  updateBadge();
  renderNotifList();
}

function addNotif(title, ep, thumb) {
  NOTIF_DATA.unshift({
    id: Date.now(),
    title, ep, thumb,
    time: new Date().toLocaleString('ar-SA', { hour:'2-digit', minute:'2-digit' }),
    read: false
  });
  saveNotifData();
  updateBadge();
}

function renderNotifList() {
  const list = document.getElementById('notifList');
  if (!list) return;
  if (NOTIF_DATA.length === 0) {
    list.innerHTML = '<div class="notif-empty">الرادار نظيف تماماً.. لا توجد حلقات جديدة حالياً</div>';
    return;
  }
  list.innerHTML = NOTIF_DATA.map(n => `
    <div class="notif-item ${!n.read ? 'notif-item--new' : ''}" onclick="markAsRead(${n.id})">
      <div class="notif-item-thumb">
        <img src="${n.thumb}" onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'"
          style="width:100%;height:100%;object-fit:cover;border-radius:8px;">
      </div>
      <div class="notif-item-body">
        <div class="notif-item-title">${n.title}</div>
        <div class="notif-item-ep">${n.ep}</div>
        <div class="notif-item-time">${n.time}</div>
      </div>
      ${!n.read ? '<span class="notif-item-dot"></span>' : ''}
    </div>
  `).join('');
}

function toggleNotifSidebar() {
  notifOpen = !notifOpen;
  const sidebar   = document.getElementById('notifSidebar');
  const overlay   = document.getElementById('notifOverlay');
  const hamburger = document.getElementById('hamburgerBtn');
  sidebar?.classList.toggle('open', notifOpen);
  overlay?.classList.toggle('open', notifOpen);
  hamburger?.classList.toggle('open', notifOpen);
  if (notifOpen) renderNotifList();
}
function shareContent(id, title, type) {
  const btn = document.getElementById(`shareBtn_${id}`);
  const url = `${location.origin}${location.pathname}?id=${id}&type=${type}`;
  const text = `🎬 ${title}\n\nشاهده الآن على Cinema ROX`;
  if (navigator.share) {
    navigator.share({ title, text, url }).catch(() => {});
  } else {
    navigator.clipboard.writeText(`${text}\n${url}`)
      .then(() => showToast('🔗 تم نسخ الرابط'))
      .catch(() => showToast('⚠️ تعذّر النسخ'));
  }
  if (btn) {
    btn.classList.add('shared');
    setTimeout(() => btn.classList.remove('shared'), 3000);
  }
}
function toggleCinemaMode() {
  const isOn = document.body.classList.toggle('cinema-mode');
  const btn = document.getElementById('cinemaModeBtn');
  if (btn) {
    btn.innerHTML = isOn
      ? '<i class="ri-close-circle-fill" style="color:#ff2a2a;margin-left:5px"></i> إيقاف السينما'
      : '<i class="ri-film-fill" style="color:#ff2a2a;margin-left:5px"></i> وضع السينما';
  }
  if (isOn) { window.scrollTo(0,0); showToast('🎬 وضع السينما — اضغط للخروج'); }
}
async function loadRadarSection() {
  const alerts = getLib('rox_alerts');
  if (!alerts.length) return `<div class="rx-empty">لا توجد اشتراكات — فعّل التنبيه من صفحة أي مسلسل</div>`;

  const todayMs = new Date().setHours(0,0,0,0);

  const cards = await Promise.all(alerts.map(async item => {
    try {
      const d     = await fetch(buildTMDBUrl(`/tv/${item.id}`)).then(r=>r.json());
      const title = d.name || d.original_name || item.title || '';
      const poster= d.poster_path ? `${CONFIG.IMAGES.POSTER_SM}${d.poster_path}` : CONFIG.IMAGES.PLACEHOLDER;
      const last  = d.last_episode_to_air;
      const next  = d.next_episode_to_air;
      const rating = d.vote_average ? d.vote_average.toFixed(1) : null;
      const ratingStars = rating ? Math.round(parseFloat(rating) / 2) : 0;
      const starsHtml = rating ? `
        <div class="rx-hcard-rating">
          <span class="rx-stars">${'★'.repeat(ratingStars)}${'☆'.repeat(5-ratingStars)}</span>
          <span class="rx-rating-num">${rating}</span>
        </div>` : '';

      const lastTxt = last
        ? `الموسم ${last.season_number} · الحلقة ${last.episode_number}`
        : '—';

      let status = '', statusClass = 'rx-nodate', sortKey = 2;
      let isToday = false, countdownHtml = '';

      if (next?.air_date) {
        const diff = Math.floor((new Date(next.air_date).setHours(0,0,0,0) - todayMs) / 86400000);
        const ns   = next.season_number, ne = next.episode_number;
        const fullDate = new Date(next.air_date).toLocaleDateString('ar-SA',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
        const timeStr  = new Date(next.air_date).toLocaleTimeString('ar-SA',{hour:'2-digit',minute:'2-digit'});
        const ampm     = new Date(next.air_date).getHours() < 12 ? 'صباحاً' : 'مساءً';

        if (diff < 0) {
          const ago = Math.abs(diff);
          const agoTxt = ago===1?'أمس':ago===2?'منذ يومين':`منذ ${ago} أيام`;
          const srcEp = last || next;
          const srcNs = srcEp?.season_number ?? ns;
          const srcNe = srcEp?.episode_number ?? ne;
          const srcDate = srcEp?.air_date ? new Date(srcEp.air_date).toLocaleDateString('ar-SA',{weekday:'long',day:'numeric',month:'long',year:'numeric'}) : fullDate;
          status = `الموسم ${srcNs} الحلقة ${srcNe} — نزلت ${agoTxt}\n${srcDate}`;
          statusClass = ago<=3 ? 'rx-soon' : ago<=7 ? 'rx-days' : 'rx-nodate'; sortKey = 1;
        } else if (diff===0) {
          isToday = true;
          status = `الموسم ${ns} الحلقة ${ne} — صدرت اليوم\n${timeStr} ${ampm}`;
          statusClass = 'rx-soon'; sortKey = 0;
        } else if (diff===1) {
          status = `الموسم ${ns} الحلقة ${ne} — غداً\n${fullDate} — ${timeStr} ${ampm}`;
          statusClass = 'rx-soon'; sortKey = 0;
          const target = new Date(next.air_date).getTime();
          countdownHtml = `<div class="rx-countdown" data-target="${target}">⏳ جاري الحساب...</div>`;
        } else if (diff<=7) {
          status = `الموسم ${ns} الحلقة ${ne} — بعد ${diff} أيام\n${fullDate} — ${timeStr} ${ampm}`;
          statusClass = 'rx-days'; sortKey = 0;
          const target = new Date(next.air_date).getTime();
          countdownHtml = `<div class="rx-countdown" data-target="${target}">⏳ جاري الحساب...</div>`;
        } else {
          status = `الموسم ${ns} الحلقة ${ne}\n${fullDate} — ${timeStr} ${ampm}`;
          statusClass = 'rx-days'; sortKey = 0;
        }
      } else if (last?.air_date) {
        const diffLast = Math.floor((todayMs - new Date(last.air_date).setHours(0,0,0,0)) / 86400000);
        const ns = last.season_number, ne = last.episode_number;
        const fullDate = new Date(last.air_date).toLocaleDateString('ar-SA',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
        if (diffLast===0) {
          isToday = true;
          status = `الموسم ${ns} الحلقة ${ne} — صدرت اليوم\n${fullDate}`;
          statusClass = 'rx-soon'; sortKey = 0;
        } else if (diffLast===1) {
          status = `الموسم ${ns} الحلقة ${ne} — نزلت أمس\n${fullDate}`;
          statusClass = 'rx-soon'; sortKey = 1;
        } else if (diffLast<=7) {
          status = `الموسم ${ns} الحلقة ${ne} — قبل ${diffLast} أيام\n${fullDate}`;
          statusClass = 'rx-days'; sortKey = 1;
        } else {
          status = `الموسم ${ns} الحلقة ${ne} — آخر حلقة متاحة\n${fullDate}`;
          statusClass = 'rx-nodate'; sortKey = 2;
        }
      } else {
        status = 'لا يوجد موعد بعد';
        statusClass = 'rx-nodate'; sortKey = 2;
      }

      const backdrop = d.backdrop_path
        ? `${CONFIG.IMAGES.BACKDROP_SM || 'https://image.tmdb.org/t/p/w300'}${d.backdrop_path}`
        : poster;

      const todayBadge = isToday
        ? `<span class="rx-today-badge"><span class="rx-today-dot"></span> جديد اليوم</span>`
        : '';

      const statusLines = status.split('\n');
      const statusHtml = statusLines.map((l,i) =>
        `<div class="rx-hcard-status ${i===0 ? statusClass : 'rx-hcard-status-sub'}">${l}</div>`
      ).join('');

      return { sortKey, html: `
        <div class="rx-hcard rx-hcard--${statusClass}" onclick="openDetail(${item.id},'tv')">
          <div class="rx-hcard-img" style="background-image:url('${backdrop}')">
            <div class="rx-hcard-grad"></div>
            ${todayBadge}
            <span class="rx-hcard-badge rx-hcard-badge--${statusClass}">
              <span class="rx-dot rx-dot--${statusClass}"></span>
            </span>
          </div>
          <div class="rx-hcard-body">
            <div class="rx-hcard-title">${title}</div>
            ${starsHtml}
            <div class="rx-hcard-last">${lastTxt}</div>
            ${statusHtml}
            ${countdownHtml}
          </div>
          <button class="rx-btn" onclick="event.stopPropagation();openWatchPage(${item.id},'tv',${last?.season_number||1},${last?.episode_number||1})">
            <svg class="rx-play-icon" viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="12" r="11" fill="rgba(229,9,20,0.25)" stroke="rgba(229,9,20,0.6)" stroke-width="1.5"/><polygon points="10 8 16 12 10 16" fill="#ff4444"/></svg>
            شاهد
          </button>
        </div>`};
    } catch { return null; }
  }));

  const valid  = cards.filter(Boolean);
  const sorted = [...valid].sort((a,b)=>a.sortKey-b.sortKey);

  setTimeout(() => {
    document.querySelectorAll('.rx-countdown[data-target]').forEach(el => {
      const target = parseInt(el.dataset.target);
      function tick() {
        const diff = target - Date.now();
        if (diff <= 0) { el.innerHTML = '<span class="rx-cd-live">● بث مباشر الآن</span>'; return; }
        const d = Math.floor(diff/86400000);
        const h = Math.floor((diff%86400000)/3600000);
        const m = Math.floor((diff%3600000)/60000);
        const s = Math.floor((diff%60000)/1000);
        el.innerHTML = `<span class="rx-cd-seg">${d > 0 ? `<b>${d}</b><em>يوم</em>` : ''}</span><span class="rx-cd-sep">◆</span><span class="rx-cd-seg"><b>${String(h).padStart(2,'0')}</b><em>ساعة</em></span><span class="rx-cd-sep">◆</span><span class="rx-cd-seg"><b>${String(m).padStart(2,'0')}</b><em>دقيقة</em></span><span class="rx-cd-sep">◆</span><span class="rx-cd-seg"><b>${String(s).padStart(2,'0')}</b><em>ثانية</em></span>`;
        setTimeout(tick, 1000);
      }
      tick();
    });
  }, 300);

  return `<div class="rx-hscroll"><div class="rx-hrow">${sorted.map(c=>c.html).join('')}</div></div>`;
}
async function loadAnimeRadarSection() {
  const alerts = getLib('rox_alerts');
  const todayMs = new Date().setHours(0,0,0,0);

  const cards = await Promise.all(alerts.map(async item => {
    try {
      const d = await fetch(buildTMDBUrl(`/tv/${item.id}`)).then(r=>r.json());
      const genres = (d.genres||[]).map(g=>g.id);
      if (!genres.includes(16)) return null;

      const title = d.name || d.original_name || item.title || '';
      const poster = d.poster_path ? `${CONFIG.IMAGES.POSTER_SM}${d.poster_path}` : CONFIG.IMAGES.PLACEHOLDER;
      const last = d.last_episode_to_air;
      const next = d.next_episode_to_air;
      const rating = d.vote_average ? d.vote_average.toFixed(1) : null;
      const ratingStars = rating ? Math.round(parseFloat(rating)/2) : 0;
      const starsHtml = rating ? `
        <div class="rx-hcard-rating">
          <span class="rx-stars">${'★'.repeat(ratingStars)}${'☆'.repeat(5-ratingStars)}</span>
          <span class="rx-rating-num">${rating}</span>
        </div>` : '';

      const lastTxt = last ? `موسم ${last.season_number} · حلقة ${last.episode_number}` : '—';

      let status = '', statusClass = 'rx-nodate', sortKey = 2;
      let isToday = false, countdownHtml = '';

      if (next?.air_date) {
        const diff = Math.floor((new Date(next.air_date).setHours(0,0,0,0) - todayMs) / 86400000);
        const ns = next.season_number, ne = next.episode_number;
        const fullDate = new Date(next.air_date).toLocaleDateString('ar-SA',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
        const timeStr = new Date(next.air_date).toLocaleTimeString('ar-SA',{hour:'2-digit',minute:'2-digit'});
        const ampm = new Date(next.air_date).getHours() < 12 ? 'صباحاً' : 'مساءً';

        if (diff < 0) {
          const ago = Math.abs(diff);
          const agoTxt = ago===1?'أمس':ago===2?'منذ يومين':`قبل ${ago} أيام`;
          status = `موسم ${ns} حلقة ${ne} — نزلت ${agoTxt}\n${fullDate}`;
          statusClass = ago<=2 ? 'rx-soon' : 'rx-days'; sortKey = 1;
        } else if (diff===0) {
          isToday = true;
          status = `موسم ${ns} حلقة ${ne} — صدرت اليوم\n${timeStr} ${ampm}`;
          statusClass = 'rx-soon'; sortKey = 0;
        } else if (diff===1) {
          status = `موسم ${ns} حلقة ${ne} — غداً\n${fullDate} — ${timeStr} ${ampm}`;
          statusClass = 'rx-soon'; sortKey = 0;
          const target = new Date(next.air_date).getTime();
          countdownHtml = `<div class="rx-countdown" data-target="${target}">⏳ جاري الحساب...</div>`;
        } else if (diff<=7) {
          status = `موسم ${ns} حلقة ${ne} — بعد ${diff} أيام\n${fullDate}`;
          statusClass = 'rx-days'; sortKey = 0;
          const target = new Date(next.air_date).getTime();
          countdownHtml = `<div class="rx-countdown" data-target="${target}">⏳ جاري الحساب...</div>`;
        } else {
          status = `موسم ${ns} حلقة ${ne}\n${fullDate}`;
          statusClass = 'rx-days'; sortKey = 0;
        }
      } else {
        status = 'لا يوجد موعد بعد';
        statusClass = 'rx-nodate'; sortKey = 2;
      }

      const backdrop = d.backdrop_path
        ? `${CONFIG.IMAGES.BACKDROP_SM || 'https://image.tmdb.org/t/p/w300'}${d.backdrop_path}`
        : poster;

      const todayBadge = isToday
        ? `<span class="rx-today-badge"><span class="rx-today-dot"></span> جديد اليوم</span>`
        : '';

      const statusLines = status.split('\n');
      const statusHtml = statusLines.map((l,i) =>
        `<div class="rx-hcard-status ${i===0 ? statusClass : 'rx-hcard-status-sub'}">${l}</div>`
      ).join('');

      return { sortKey, html: `
        <div class="rx-hcard rx-hcard--${statusClass} rx-hcard--anime" onclick="openDetail(${item.id},'tv')">
          <div class="rx-hcard-img" style="background-image:url('${backdrop}')">
            <div class="rx-hcard-grad"></div>
            ${todayBadge}
            <span class="rx-hcard-badge rx-hcard-badge--${statusClass}">
              <span class="rx-dot rx-dot--${statusClass}"></span>
            </span>
          </div>
          <div class="rx-hcard-body">
            <div class="rx-hcard-title">${title}</div>
            ${starsHtml}
            <div class="rx-hcard-last">${lastTxt}</div>
            ${statusHtml}
            ${countdownHtml}
          </div>
          <button class="rx-btn rx-btn--anime" onclick="event.stopPropagation();openWatchPage(${item.id},'tv',${last?.season_number||1},${last?.episode_number||1})">
            <svg class="rx-play-icon" viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="12" r="11" fill="rgba(139,92,246,0.25)" stroke="rgba(139,92,246,0.6)" stroke-width="1.5"/><polygon points="10 8 16 12 10 16" fill="#c084fc"/></svg>
            شاهد
          </button>
        </div>`};
    } catch { return null; }
  }));

  const valid = cards.filter(Boolean);
  if (!valid.length) return null;
  const sorted = [...valid].sort((a,b)=>a.sortKey-b.sortKey);

  setTimeout(() => {
    document.querySelectorAll('.rx-countdown[data-target]').forEach(el => {
      if (el._ticking) return;
      el._ticking = true;
      const target = parseInt(el.dataset.target);
      function tick() {
        const diff = target - Date.now();
        if (diff <= 0) { el.innerHTML = '<span class="rx-cd-live">● بث مباشر الآن</span>'; return; }
        const d = Math.floor(diff/86400000);
        const h = Math.floor((diff%86400000)/3600000);
        const m = Math.floor((diff%3600000)/60000);
        const s = Math.floor((diff%60000)/1000);
        el.innerHTML = `<span class="rx-cd-seg">${d>0?`<b>${d}</b><em>يوم</em>`:''}</span>${d>0?'<span class="rx-cd-sep">◆</span>':''}<span class="rx-cd-seg"><b>${String(h).padStart(2,'0')}</b><em>ساعة</em></span><span class="rx-cd-sep">◆</span><span class="rx-cd-seg"><b>${String(m).padStart(2,'0')}</b><em>دقيقة</em></span><span class="rx-cd-sep">◆</span><span class="rx-cd-seg"><b>${String(s).padStart(2,'0')}</b><em>ثانية</em></span>`;
        setTimeout(tick, 1000);
      }
      tick();
    });
  }, 300);

  return `<div class="rx-hscroll"><div class="rx-hrow">${sorted.map(c=>c.html).join('')}</div></div>`;
}
// ===== AUTO IMAGE PATCHER =====
(function () {
  const fix = img => {
    if (!img.getAttribute('loading')) img.setAttribute('loading', 'lazy');
    if (!img.dataset.errPatched) {
      img.dataset.errPatched = '1';
      img.addEventListener('error', function () {
        if (this.src !== CONFIG.IMAGES.PLACEHOLDER) this.src = CONFIG.IMAGES.PLACEHOLDER;
      });
    }
  };
  const patchAll = root => root.querySelectorAll('img').forEach(fix);
  const obs = new MutationObserver(ms => ms.forEach(m =>
    m.addedNodes.forEach(n => {
      if (n.nodeType !== 1) return;
      n.tagName === 'IMG' ? fix(n) : patchAll(n);
    })
  ));
  document.addEventListener('DOMContentLoaded', () => {
    patchAll(document.body);
    obs.observe(document.body, { childList: true, subtree: true });
  });
})();
  // ===== OFFLINE DETECTION =====
window.addEventListener('offline', () => {
  showToast('📡 انقطع الاتصال بالإنترنت');
  if (document.getElementById('roxOfflineBanner')) return;
  const b = document.createElement('div');
  b.id = 'roxOfflineBanner';
  b.style.cssText = `
    position:fixed; top:0; left:0; right:0; z-index:99999;
    background:rgba(180,0,0,0.96); backdrop-filter:blur(12px);
    color:#fff; text-align:center; padding:11px 16px;
    font-family:'Cairo',sans-serif; font-size:0.83rem;
    font-weight:700; letter-spacing:0.02em;
    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
  `;
  b.textContent = '📡 لا يوجد اتصال بالإنترنت — تحقق من شبكتك';
  document.body.prepend(b);
});
window.addEventListener('online', () => {
  document.getElementById('roxOfflineBanner')?.remove();
  showToast('✅ عاد الاتصال بالإنترنت');
});
// ===== IMAGE LIGHTBOX =====
function openImgLightbox(full, md, sm) {
  document.getElementById('roxImgLightbox')?.remove();
  const lb = document.createElement('div');
  lb.id = 'roxImgLightbox';
  lb.innerHTML = `
    <div class="rox-lb-bg" onclick="if(event.target===this)this.parentElement.remove()">
      <div class="rox-lb-box">
        <button class="rox-lb-close" onclick="document.getElementById('roxImgLightbox').remove()">✕</button>
        <img class="rox-lb-img" src="${md}" alt="">
        <div class="rox-lb-btns">
          <button class="rox-lb-dl" onclick="roxDlImg('${sm}','صغير')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            صغير — 500px
          </button>
          <button class="rox-lb-dl" onclick="roxDlImg('${md}','متوسط')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            متوسط — 1280px
          </button>
          <button class="rox-lb-dl rox-lb-dl-full" onclick="roxDlImg('${full}','أصلي')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            أصلي — Full HD
          </button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(lb);
}

async function roxDlImg(url, label) {
  try {
    showToast(`⏳ جاري تحميل ${label}...`);
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl);
    if (!res.ok) throw new Error();
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `cinema-rox-${label}-${Date.now()}.jpg`;
    a.click();
    URL.revokeObjectURL(a.href);
    showToast(`✅ تم تحميل ${label}`);
  } catch { showToast('❌ فشل التحميل'); }
}
function toggleWatchHistory(btn) {
  const panel = document.getElementById('watchHistoryPanel');
  if (!panel) return;
  const isOpen = panel.style.display !== 'none';
  panel.style.display = isOpen ? 'none' : 'block';
  btn.textContent = isOpen ? '📅 تاريخ المشاهدات' : '✕ إغلاق التاريخ';
}
function openReadingMode(text, movieTitle) {
  document.getElementById('roxReadOverlay')?.remove();
  const el = document.createElement('div');
  el.id = 'roxReadOverlay';
  el.innerHTML = `
    <div class="rox-read-overlay" onclick="if(event.target===this)this.remove()">
      <div class="rox-read-box">
        <button class="rox-read-close" onclick="document.getElementById('roxReadOverlay').remove()">✕</button>
        <div class="rox-read-title">📖 ${movieTitle}</div>
        <p class="rox-read-text">${text}</p>
      </div>
    </div>`;
  document.body.appendChild(el);
}
// ===== INIT =====
document.addEventListener('DOMContentLoaded', async () => {
  // Scroll to top
  const _topBtn = document.createElement('button');
  _topBtn.className = 'rox-top-btn';
  _topBtn.setAttribute('aria-label', 'رجوع للأعلى');
  _topBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="18 15 12 9 6 15"/></svg>`;
  _topBtn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  document.body.appendChild(_topBtn);
  window.addEventListener('scroll', () => {
    _topBtn.classList.toggle('show', window.scrollY > 320);
  }, { passive: true });
  bnavGo('home');
  setTimeout(checkAllAlerts, 4000);
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(() => console.log('SW registered'))
      .catch(() => {});
  }
setInterval(checkAllAlerts, 30 * 60 * 1000);
  cwRender();
  renderNotifList();
});
async function loadNewsSection(containerId, feedUrl, color) {
  const sec = document.getElementById('newsSection');
  const el  = document.getElementById(containerId);
  if (!el || !sec) return;
  sec.style.display = 'block';
  sec.style.position = 'relative';
  sec.style.zIndex = '1';
  el.innerHTML = '<p class="lib-empty">⏳ جاري تحميل الأخبار...</p>';
  try {
    const res  = await fetch(CONFIG.NEWS.PROXY + encodeURIComponent(feedUrl));
    const data = await res.json();
    if (!data.items || !data.items.length) throw new Error();
    el.innerHTML = data.items.slice(0, 6).map(item => `
      <a class="news-card news-${color}" href="${item.link}" target="_blank" rel="noopener">
        ${item.thumbnail ? `<img class="news-thumb" src="${item.thumbnail}" onerror="this.style.display='none'">` : ''}
        <div class="news-body">
          <div class="news-title">${item.title}</div>
          <div class="news-meta">${(item.pubDate||'').slice(0,10)}</div>
        </div>
      </a>`).join('');
  } catch { el.innerHTML = '<p class="lib-empty">⚠️ تعذّر تحميل الأخبار</p>'; }
}
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
}
// ===== HARDWARE BACK BUTTON =====
history.replaceState({ rox: true }, '');
history.pushState({ rox: true }, '');

window.addEventListener('popstate', function () {
  history.pushState({ rox: true }, '');
  const wp = document.getElementById('watchPage');
  const dp = document.getElementById('detailPage');
  if (wp?.classList.contains('active')) {
    wsGoBack();
  } else if (dp?.classList.contains('active')) {
    goBack();
  }
});
// ===== FILTER PANEL TOGGLE =====
function toggleFilterPanel() {
  const p = document.getElementById('filterPanel');
  const b = document.getElementById('filterToggleBtn');
  if (!p) return;
  p.classList.toggle('open');
  b.classList.toggle('active');
}
document.querySelectorAll('.filter-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
  });
});
// ===== LIVE TRENDS ROW =====
async function loadLiveTrends() {
  const row = document.getElementById('liveTrendsRow');
  if (!row) return;
  try {
    const r = await fetch(`https://api.themoviedb.org/3/trending/all/day?api_key=${TMDB_KEY}&language=ar`);
    const d = await r.json();
    row.innerHTML = d.results.slice(0,10).map(m => `
      <div class="trend-card" onclick="openDetail(${m.id},'${m.media_type}')">
        <img src="https://image.tmdb.org/t/p/w300${m.backdrop_path||m.poster_path}" loading="lazy">
        <div class="trend-card-label">${m.title||m.name}</div>
        <span class="trend-live-badge">LIVE</span>
      </div>`).join('');
  } catch(e) {}
}
loadLiveTrends();
// ===== SMART SERVER PING UI =====
function injectServerPingBar(containerId) {
  const container = document.getElementById(containerId);
  if (!container || document.getElementById('serverPingBar')) return;
  const bar = document.createElement('div');
  bar.id = 'serverPingBar';
  bar.className = 'server-ping-bar';
  bar.innerHTML = `
    <div class="ping-indicator">
      <div class="ping-dot ping-green"></div>
      <span style="color:#00ff88">سريع جداً</span>
    </div>
    <button class="auto-select-btn" onclick="autoSelectFastestServer()">⚡ الأسرع تلقائياً</button>`;
  container.prepend(bar);
  colorServerCards();
}
function colorServerCards() {
  document.querySelectorAll('.server-card, .src-card').forEach((card, i) => {
    card.classList.add('server-node-card');
    const isFast = i < 4;
    card.classList.add(isFast ? 'fast' : 'medium');
    const badge = document.createElement('div');
    badge.className = `server-speed-badge ${isFast ? 'speed-fast' : 'speed-med'}`;
    badge.textContent = isFast ? '⚡' : '~';
    card.appendChild(badge);
  });
}
function autoSelectFastestServer() {
  const cards = document.querySelectorAll('.server-node-card.fast');
  if (cards[0]) cards[0].click();
}
// ===== AMBILIGHT AURA =====
(function() {
  const aura = document.createElement('div');
  aura.className = 'ambilight-aura';
  aura.id = 'ambilightAura';
  document.body.prepend(aura);
})();

function setAmbilightColor(hex) {
  const aura = document.getElementById('ambilightAura');
  if (!aura) return;
  aura.style.background =
    `radial-gradient(ellipse at center top, ${hex}55 0%, transparent 65%),
     radial-gradient(ellipse at center bottom, ${hex}33 0%, transparent 60%)`;
  aura.classList.add('active');
}

function activateCinemaMode(dominantHex) {
  document.body.classList.add('cinema-mode');
  setAmbilightColor(dominantHex || '#e50914');
}
function deactivateCinemaMode() {
  document.body.classList.remove('cinema-mode');
  const aura = document.getElementById('ambilightAura');
  if (aura) aura.classList.remove('active');
}

// ===== SNAPSHOT SHARE =====
function roxSnapshot() {
  const iframe = document.querySelector('.watch-iframe, iframe');
  if (!iframe) { alert('شغّل الفيديو أولاً'); return; }
  navigator.share ? navigator.share({
    title: document.title,
    text: 'شاهد هذا على Cinema ROX 🎬',
    url: window.location.href
  }) : navigator.clipboard.writeText(window.location.href)
    .then(() => alert('تم نسخ الرابط ✅'));
}
document.getElementById('filterBar')?.style.removeProperty('display');
  document.getElementById('platformsSection')?.style.removeProperty('display');
function filterBarGo(tab, el) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');

  if (tab === 'home') {
    bnavGo('home');
  } else if (tab === 'movies') {
    loadFilteredHome('movie');
  } else if (tab === 'series') {
    loadFilteredHome('tv');
  } else if (tab === 'library') {
    loadFilteredLibrary();
  } else if (tab === 'genres') {
    loadGenresPage();
  }
}

async function loadFilteredHome(type) {
  const page = document.getElementById('homePage');
  if (!page) return;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('heroSection').style.display = '';
  document.getElementById('heroSection').style.visibility = '';
  page.classList.add('active');

  const SECTIONS = type === 'movie' ? [
    { id: 'flt_popular',  title: 'الأفلام الرائجة',    endpoint: '/movie/popular',   type: 'movie' },
    { id: 'flt_toprated', title: 'الأعلى تقييماً',     endpoint: '/movie/top_rated', type: 'movie' },
    { id: 'flt_upcoming', title: 'قادم قريباً',         endpoint: '/movie/upcoming',  type: 'movie' },
  ] : [
    { id: 'flt_tvpop',    title: 'المسلسلات الرائجة',  endpoint: '/tv/popular',      type: 'tv' },
    { id: 'flt_tvtop',    title: 'الأعلى تقييماً',     endpoint: '/tv/top_rated',    type: 'tv' },
    { id: 'flt_tvair',    title: 'يُعرض الآن',          endpoint: '/tv/on_the_air',   type: 'tv' },
  ];

  page.innerHTML = SECTIONS.map(s => `
    <div class="home-section" id="${s.id}">
      <div class="section-header">
        <span class="section-bar"></span>
        <h2 class="section-title">${s.title}</h2>
        <button class="browse-all-btn" onclick="openBrowseAll('${s.type}','${s.endpoint}','${s.title}')">عرض الكل ›</button>
      </div>
      <div class="otaku-slider-wrap">
        <button class="otaku-arrow otaku-arrow-left" onclick="otakuSlide('${s.id}_row',-1)">‹</button>
        <div class="movies-row" id="${s.id}_row">
          ${Array(4).fill('<div class="movie-card skeleton-card"></div>').join('')}
        </div>
        <button class="otaku-arrow otaku-arrow-right" onclick="otakuSlide('${s.id}_row',1)">›</button>
      </div>
    </div>`).join('');

  SECTIONS.forEach(async s => {
    try {
      const movies = await fetchMovies(s.endpoint, { type: s.type });
      const row = document.getElementById(`${s.id}_row`);
      if (!row) return;
      row.innerHTML = movies.map((m,i) => buildMovieCard(m, s.type, '', i+1)).join('');
    } catch { document.getElementById(s.id)?.remove(); }
  });
}

async function loadFilteredLibrary() {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('heroSection').style.display = 'none';
  const page = document.getElementById('libraryPage');
  if (!page) return;
  page.classList.add('active');
  if (!window.ROX_USER) {
    page.innerHTML = `<div class="prof-wrap"><div class="prof-logo">Cinema<span style="color:var(--accent)">ROX</span></div><p class="prof-sub">🔐 سجّل دخولك لعرض مكتبتك</p><button class="prof-google-btn" onclick="bnavGo('profile')">تسجيل الدخول</button></div>`;
    return;
  }
  page.innerHTML = '<div class="loading">⏳ جاري التحميل...</div>';
  const watchlist  = getLib('rox_watchlist');
  const watchlater = getLib('rox_watchlater');
  const EMPTY = `<p class="lib-radar-empty">لا يوجد عناصر حالياً</p>`;
  const buildCard = (item) => `<div class="lib-card" onclick="openDetail(${item.id},'${item.type === 'anime' ? 'tv' : item.type}')">
    <img class="lib-card-img" src="${item.poster||CONFIG.IMAGES.PLACEHOLDER}" loading="lazy" onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'">
    <div class="lib-card-overlay"><span>▶</span></div>
    ${item.rating ? `<span class="lib-card-rating">${item.rating}</span>` : ''}
  </div>`;
  const fetchCards = async (items) => {
    if (!items.length) return EMPTY;
    const cards = await Promise.all(items.map(async item => {
      try {
        const ep = (item.type === 'tv'||item.type === 'anime') ? `/tv/${item.id}` : `/movie/${item.id}`;
        const d = await fetch(buildTMDBUrl(ep)).then(r => r.json());
        item.poster = d.poster_path ? `${CONFIG.IMAGES.POSTER_SM}${d.poster_path}` : CONFIG.IMAGES.PLACEHOLDER;
        item.rating = d.vote_average ? d.vote_average.toFixed(1) : '';
        return buildCard(item);
      } catch { return ''; }
    }));
    return `<div class="lib-grid">${cards.join('')}</div>`;
  };
  const [archiveHTML, waitlistHTML] = await Promise.all([
    fetchCards(watchlist),
    fetchCards(watchlater)
  ]);
  page.innerHTML = `
    <div class="lib-section">
      <div class="lib-sec-head"><span class="lib-laser lib-laser-red"></span><h3 class="lib-sec-title">أرشيفي الخاص</h3></div>
      ${archiveHTML}
    </div>
    <div class="lib-section">
      <div class="lib-sec-head"><span class="lib-laser lib-laser-blue"></span><h3 class="lib-sec-title">قائمة الانتظار</h3></div>
      ${waitlistHTML}
    </div>`;
}

async function loadGenresPage() {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('filterBar')?.style.setProperty('display','none');
  document.getElementById('platformsSection')?.style.setProperty('display','none');
  document.getElementById('heroSection').style.display = 'none';
  const page = document.getElementById('homePage');
  if (!page) return;
  page.classList.add('active');

  const GENRES = [
    { id:28,    name:'أكشن',      icon:'ri-sword-line',        img:'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',  count:'1250' },
    { id:12,    name:'مغامرة',    icon:'ri-map-2-line',         img:'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',   count:'980'  },
    { id:878,   name:'خيال علمي', icon:'ri-rocket-line',        img:'https://image.tmdb.org/t/p/w500/d5NXSklpcuveqHmyIkbmIaDWVFo.jpg',   count:'650'  },
    { id:18,    name:'دراما',     icon:'ri-film-line',          img:'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsLLeHjmIDKm.jpg',    count:'1750' },
    { id:27,    name:'رعب',       icon:'ri-ghost-2-line',       img:'https://image.tmdb.org/t/p/w500/xfNHRI2f5kHGvogxld27BoKqFhJ.jpg',   count:'560'  },
    { id:37,    name:'غربي',      icon:'ri-riding-line',        img:'https://image.tmdb.org/t/p/w500/oVDLBMOgEIWvJk45OYWq5nHMMtc.jpg',   count:'320'  },
    { id:16,    name:'أنيميشن',   icon:'ri-emotion-happy-line', img:'https://image.tmdb.org/t/p/w500/mY7SeH4HFFxW1hiI6cWuwCRKptN.jpg',   count:'910'  },
    { id:10749, name:'رومانسي',   icon:'ri-heart-3-line',       img:'https://image.tmdb.org/t/p/w500/fi67TkFvMvqkIqrpCHOJwuM6zPG.jpg',   count:'740'  },
  ];

  const MOODS = [
    { name:'خفيف',  icon:'ri-leaf-line',         params:'with_genres=35' },
    { name:'عائلي', icon:'ri-group-line',         params:'with_genres=10751' },
    { name:'مضحك',  icon:'ri-emotion-laugh-line', params:'with_genres=35' },
    { name:'مؤثر',  icon:'ri-drama-line',         params:'with_genres=18' },
    { name:'ر18+',  icon:'ri-user-forbid-line',   params:'certification_country=US&certification=R' },
    { name:'ملهم',  icon:'ri-sparkling-2-line',   params:'with_genres=18&sort_by=vote_average.desc' },
  ];

  const YEARS = [new Date().getFullYear(), new Date().getFullYear()-1, new Date().getFullYear()-2, new Date().getFullYear()-3, new Date().getFullYear()-4];

  const COUNTRIES = [
    { code:'US', name:'أمريكا', flag:'🇺🇸' },
    { code:'KR', name:'كوريا',  flag:'🇰🇷' },
    { code:'JP', name:'اليابان',flag:'🇯🇵' },
    { code:'IN', name:'الهند',  flag:'🇮🇳' },
    { code:'TR', name:'تركيا',  flag:'🇹🇷' },
    { code:'GB', name:'بريطانيا',flag:'🇬🇧' },
  ];

  page.innerHTML = `
    <div class="genres-page">
      <div class="section-header"><span class="section-bar"></span><h2 class="section-title">التصنيفات</h2></div>
      <div class="genres-grid">
        ${GENRES.map(g => `
          <div class="genre-card" onclick="openBrowseAll('movie','/discover/movie?with_genres=${g.id}','${g.name}')" style="background-image:url('${g.img}')">
            <div class="genre-overlay"></div>
            <div class="genre-icon-wrap"><i class="${g.icon} genre-icon"></i></div>
            <span class="genre-name">${g.name}</span>
            <span class="genre-count">${g.count} عنوان</span>
          </div>`).join('')}
      </div>

      <div class="section-header" style="margin-top:20px"><span class="section-bar"></span><h2 class="section-title">تصفح حسب المزاج</h2></div>
      <div class="moods-row">
        ${MOODS.map(m => `
          <button class="mood-btn" onclick="openBrowseAll('movie','/discover/movie?${m.params}','${m.name}')">
            <i class="${m.icon}"></i><span>${m.name}</span>
          </button>`).join('')}
      </div>

      <div class="section-header" style="margin-top:20px"><span class="section-bar"></span><h2 class="section-title">تصفح حسب السنوات</h2></div>
      <div class="years-row">
        ${YEARS.map((y,i) => `
          <button class="year-btn ${i===0?'active':''}" onclick="openBrowseAll('movie','/discover/movie?primary_release_year=${y}','${y}')">
            ${y}${i===0?'<br><small>جديد</small>':''}
          </button>`).join('')}
      </div>

      <div class="section-header" style="margin-top:20px"><span class="section-bar"></span><h2 class="section-title">تصفح حسب البلد</h2></div>
      <div class="countries-row">
        ${COUNTRIES.map(c => `
          <button class="country-btn" onclick="openBrowseAll('movie','/discover/movie?with_origin_country=${c.code}','${c.name}')">
            <span class="country-flag">${c.flag}</span>
            <span>${c.name}</span>
          </button>`).join('')}
      </div>
    </div>`;
}
async function toggleFootballVault() {
  bnavGo('football');
}

function spNav(tab, el) {
  document.querySelectorAll('.sp-snav-btn').forEach(b => b.classList.remove('sp-snav-active'));
  el.classList.add('sp-snav-active');
  const row = document.getElementById('spMatchesRow');
  const leaguesRow = document.getElementById('spLeaguesRow');
  const newsList = document.getElementById('spNewsList');
  const hero = document.querySelector('.sp-hero');
  if (row) row.parentElement.style.display = 'none';
  if (leaguesRow) leaguesRow.parentElement.style.display = 'none';
  if (newsList) newsList.parentElement.style.display = 'none';
  if (hero) hero.style.display = 'none';
  if (tab === 'home') {
    if (hero) hero.style.display = '';
    if (row) row.parentElement.style.display = '';
    if (leaguesRow) leaguesRow.parentElement.style.display = '';
    if (newsList) newsList.parentElement.style.display = '';
    loadSportsUI();
  }
  if (tab === 'matches') { if (row) row.parentElement.style.display = ''; loadSpMatchesLive(); }
  if (tab === 'leagues') { if (leaguesRow) leaguesRow.parentElement.style.display = ''; renderSpLeagues(); }
  if (tab === 'clubs') { if (row) row.parentElement.style.display = ''; row.innerHTML = '<div class="sp-loading">قريباً — قسم الأندية</div>'; }
  if (tab === 'fav') { if (newsList) newsList.parentElement.style.display = ''; newsList.innerHTML = '<div class="sp-loading">لا توجد مباريات في المفضلة بعد</div>'; }
}

async function loadSportsUI() {
  renderSpHero();
  renderSpLeagues();
  await loadSpMatchesLive();
  await loadSpNews();
  injectArchiveMatches('yesterday');
}

function renderSpHero() {
  const wrap = document.getElementById('spHeroPlayers');
  if (!wrap) return;
  const players = [
    'https://upload.wikimedia.org/wikipedia/commons/1/1e/Mohamed_Salah_2018.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/5/57/Kylian_Mbapp%C3%A9_in_2022_%28cropped%29.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/e/e0/Vinicius_Junior_2023.jpg'
  ];
  wrap.innerHTML = players.map((src, i) =>
    '<img src="'+src+'" style="margin-left:'+(i===0?'0':'-35px')+';z-index:'+(3-i)+';position:relative;opacity:'+(1-i*0.15)+'" onerror="this.style.display=\'none\'">'
  ).join('');
}

async function loadSpMatchesLive() {
  const row = document.getElementById('spMatchesRow');
  if (!row) return;
  row.innerHTML = '<div class="sp-neon-spinner-wrap"><div class="sp-neon-spinner"></div></div>';
  try {
    const today = new Date().toISOString().slice(0,10);
    const tomorrow = new Date(Date.now()+86400000).toISOString().slice(0,10);
    const res = await fetch(
      'https://cinema-rox.vercel.app/api/matches'
    );
    const data = await res.json();
    const matches = (data.matches || [])
      .filter(m => m.status !== 'FINISHED' && m.status !== 'AWARDED')
      .slice(0, 10);
    if (!matches.length) throw new Error('no matches');
    row.innerHTML = matches.map(m => {
      const isLive = m.status === 'IN_PLAY' || m.status === 'PAUSED';
      const matchDate = new Date(m.utcDate);
      const timeStr = matchDate.toLocaleTimeString('ar-SA',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Riyadh'});
      const dateStr = matchDate.toLocaleDateString('ar-SA',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Riyadh'});
      const score = isLive ? ((m.score.fullTime.home??0)+' - '+(m.score.fullTime.away??0)) : timeStr;
      const homeName = m.homeTeam.shortName || m.homeTeam.name;
      const awayName = m.awayTeam.shortName || m.awayTeam.name;
      const gender = (m.homeTeam.name||'').toLowerCase().includes('women') || (m.competition.name||'').toLowerCase().includes('women') ? ' 👩' : '';
      const centerHtml = isLive
        ? `<div class="sp-match-center"><div class="sp-match-live-badge"><span class="sp-match-live-dot"></span>مباشرة</div><div class="sp-match-score">${score}</div></div>`
        : `<div class="sp-match-center"><div class="sp-match-score" style="font-size:1rem">${score}</div></div>`;
      return `<div class="sp-match-card ${isLive?'is-live':''}">
        <div class="sp-match-league">${m.competition.name}${gender}</div>
        <div class="sp-match-teams-row">
          <div style="display:flex;flex-direction:column;align-items:center;gap:3px">
            ${m.homeTeam.crest?`<img class="sp-match-team-logo" src="${m.homeTeam.crest}" onerror="this.style.display='none'">`:'' }
            <div class="sp-match-team-name">${homeName}</div>
          </div>
          ${centerHtml}
          <div style="display:flex;flex-direction:column;align-items:center;gap:3px">
            ${m.awayTeam.crest?`<img class="sp-match-team-logo" src="${m.awayTeam.crest}" onerror="this.style.display='none'">`:'' }
            <div class="sp-match-team-name">${awayName}</div>
          </div>
        </div>
        <div class="sp-match-date"><i class="ri-calendar-line"></i>${dateStr}</div>
        ${isLive?`<button class="sp-match-watch-btn" onclick="openFootballStream('live','${homeName} vs ${awayName}')"><i class="ri-live-line"></i> شاهد البث الحي</button>`:`<button class="sp-match-watch-btn" style="background:rgba(255,255,255,0.05);border-color:rgba(255,255,255,0.1);color:rgba(255,255,255,0.5)" onclick="spBellAlert(this,'${homeName} vs ${awayName}')"><i class="ri-notification-3-line"></i> تنبيه</button>`}
      </div>`;
    }).join('');
  } catch(e) {
    row.innerHTML = '<div style="color:rgba(255,255,255,0.4);padding:20px;text-align:center;font-family:Tajawal">تعذر تحميل المباريات</div>';
  }
}

function renderSpLeagues() {
  const row = document.getElementById('spLeaguesRow');
  if (!row) return;
  const leagues = [
    { name: 'دوري أبطال أوروبا', logo: 'https://upload.wikimedia.org/wikipedia/en/b/bf/UEFA_Champions_League_logo_2.svg' },
    { name: 'الدوري الإنجليزي', logo: 'https://upload.wikimedia.org/wikipedia/en/f/f2/Premier_League_Logo.svg' },
    { name: 'الدوري الإسباني', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/54/LaLiga_logo_2023.svg' },
    { name: 'الدوري الإيطالي', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Serie_A_logo_2022.svg' },
    { name: 'الدوري الألماني', logo: 'https://upload.wikimedia.org/wikipedia/en/d/df/Bundesliga_logo_%282017%29.svg' },
    { name: 'الدوري الفرنسي', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f4/Ligue1_logo_2020.svg' },
    { name: 'كأس العالم FIFA', logo: 'https://upload.wikimedia.org/wikipedia/en/6/67/2022_FIFA_World_Cup.svg' },
  ];
  row.innerHTML = leagues.map(l =>
    `<div class="sp-league-card">
      <img class="sp-league-logo" src="${l.logo}" onerror="this.src='https://placehold.co/44x44/1a0505/e50914?text=🏆';this.style.opacity='1'">
      <div class="sp-league-name">${l.name}</div>
    </div>`
  ).join('');
}

async function loadSpNews() {
  const list = document.getElementById('spNewsList');
  if (!list) return;
  list.innerHTML = '<div class="sp-neon-spinner-wrap"><div class="sp-neon-spinner"></div></div>';
  const FALLBACK_IMG = 'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=200&q=80';
  try {
    const key = CONFIG.KEYS.GNEWS_KEY;
    const res = await fetch(`https://gnews.io/api/v4/search?q=football+soccer&lang=en&max=20&sortby=publishedAt&apikey=${key}`);
    const data = await res.json();
    if (!data.articles || !data.articles.length) throw new Error('empty');
    list.innerHTML = data.articles.map(a => {
      const ago = getTimeAgo(new Date(a.publishedAt));
      const img = a.image || FALLBACK_IMG;
      const link = a.url || '#';
      const title = (a.title || '').replace(/'/g, '&#39;');
      const sub = (a.description || '').slice(0, 90);
      return `<div class="sp-news-card" onclick="window.open('${link}','_blank')">
        <div class="sp-news-text-block">
          <div class="sp-news-time">${ago}</div>
          <div class="sp-news-title">${title}</div>
          <div class="sp-news-sub">${sub}</div>
        </div>
        <img class="sp-news-img" src="${img}" onerror="this.src='${FALLBACK_IMG}'" loading="lazy">
      </div>`;
    }).join('');
  } catch(e) {
    list.innerHTML = '<div style="color:rgba(255,255,255,0.4);padding:20px;text-align:center;font-family:Tajawal">تعذر تحميل الأخبار</div>';
  }
}

function getTimeAgo(date) {
  const diff = Math.floor((Date.now() - date) / 60000);
  if (diff < 1) return 'الآن';
  if (diff < 60) return `منذ ${diff} دقيقة`;
  if (diff < 120) return 'منذ ساعة';
  if (diff < 1440) return `منذ ${Math.floor(diff/60)} ساعات`;
  if (diff < 2880) return 'منذ يوم';
  return `منذ ${Math.floor(diff/1440)} أيام`;
}

function openFootballStream(type, matchTitle) {
  const vault = document.getElementById('liveStreamVault');
  const title = document.getElementById('lsvMatchTitle');
  const modeText = document.getElementById('lsvModeText');
  const modePill = document.getElementById('lsvModePill');
  if (title && matchTitle) title.textContent = matchTitle;
  // تحديد النوع: أرشيف أم مباشر
  if (type === 'archive') {
    if (modeText) modeText.textContent = 'انتهت';
    if (modePill) { modePill.style.background='rgba(100,100,100,0.3)'; modePill.style.borderColor='rgba(150,150,150,0.4)'; }
    const label = document.getElementById('lsvPlayerLabel');
    if (label) label.textContent = 'اختر سيرفراً لمشاهدة الملخص';
  } else {
    if (modeText) modeText.textContent = 'مباشر الآن';
    if (modePill) { modePill.style.background=''; modePill.style.borderColor=''; }
    const label = document.getElementById('lsvPlayerLabel');
    if (label) label.textContent = 'اختر سيرفراً للتشغيل';
  }
  vault.classList.remove('hidden');
  setTimeout(() => vault.classList.add('open'), 10);
  document.getElementById('footballPage').style.filter = 'brightness(0.4)';
}

function closeLiveStream() {
  const vault = document.getElementById('liveStreamVault');
  vault.classList.remove('open');
  document.getElementById('footballPage').style.filter = '';
  setTimeout(() => vault.classList.add('hidden'), 500);
}

function lsvSelect(el, srvName) {
  document.querySelectorAll('.lsv-srv').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  const label = document.getElementById('lsvPlayerLabel');
  if (label) label.textContent = 'جاري الاتصال بـ ' + (srvName||'السيرفر') + '...';
  setTimeout(() => { if(label) label.textContent = 'يتم التشغيل عبر ' + (srvName||'السيرفر') + ' ✓'; }, 1200);
}
function lsvQuality(el, q) {
  document.querySelectorAll('.lsv-quality-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  if (typeof showToast === 'function') showToast('جودة البث: ' + q);
}
function spBellAlert(btn, match) {
  btn.innerHTML = '<i class="ri-notification-fill" style="color:#ffd700"></i> <span style="color:#ffd700">تم التفعيل ✓</span>';
  btn.style.borderColor = 'rgba(255,215,0,0.4)';
  btn.style.background = 'rgba(255,215,0,0.08)';
  if (typeof showToast === 'function') showToast('🔔 سيتم تنبيهك قبل بداية ' + match);
}
async function loadSpNews() {
  const list = document.getElementById('spNewsList');
  if (!list) return;
  list.innerHTML = '<div class="sp-neon-spinner-wrap"><div class="sp-neon-spinner"></div></div>';
  const FALLBACK_IMG = 'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=200&q=80';
  try {
    const res = await fetch('https://cinema-rox.vercel.app/api/news');
    const data = await res.json();
    if (!data.articles || !data.articles.length) throw new Error('empty');
    list.innerHTML = data.articles.map(a => {
      const ago = getTimeAgo(new Date(a.publishedAt));
      const img = a.image || FALLBACK_IMG;
      const link = a.url || '#';
      const title = (a.title || '').replace(/'/g, '&#39;');
      const sub = (a.description || '').slice(0, 90);
      return `<div class="sp-news-card" onclick="window.open('${link}','_blank')">
        <div class="sp-news-text-block">
          <div class="sp-news-time">${ago}</div>
          <div class="sp-news-title">${title}</div>
          <div class="sp-news-sub">${sub}</div>
        </div>
        <img class="sp-news-img" src="${img}" onerror="this.src='${FALLBACK_IMG}'" loading="lazy">
      </div>`;
    }).join('');
  } catch(e) {
    list.innerHTML = '<div style="color:rgba(255,255,255,0.4);padding:20px;text-align:center;font-family:Tajawal">تعذر تحميل الأخبار</div>';
  }
}
// ===== ARCHIVE MATCHES =====
var _archiveFilter = 'yesterday';
function filterArchive(period, el) {
  document.querySelectorAll('.arch-filter-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  _archiveFilter = period;
  injectArchiveMatches(period);
}

async function injectArchiveMatches(period) {
  const grid = document.getElementById('archiveGrid');
  if (!grid) return;
  grid.innerHTML = '<div class="sp-neon-spinner-wrap"><div class="sp-neon-spinner"></div></div>';
  var now = new Date();
  var dateFrom, dateTo;
  if (period === 'yesterday') {
    var d = new Date(now); d.setDate(d.getDate()-1);
    dateFrom = dateTo = d.toISOString().slice(0,10);
  } else if (period === 'beforeyesterday') {
    var d = new Date(now); d.setDate(d.getDate()-2);
    dateFrom = dateTo = d.toISOString().slice(0,10);
  } else if (period === 'thismonth') {
    dateFrom = now.toISOString().slice(0,8)+'01';
    dateTo = new Date(now.getTime()-86400000).toISOString().slice(0,10);
  } else if (period === 'month3') {
    dateFrom = new Date(now.getTime()-90*86400000).toISOString().slice(0,10);
    dateTo = new Date(now.getTime()-86400000).toISOString().slice(0,10);
  } else {
    dateFrom = new Date(now.getTime()-150*86400000).toISOString().slice(0,10);
    dateTo = new Date(now.getTime()-30*86400000).toISOString().slice(0,10);
  }
  try {
    // نحاول football-data.org أولاً
    var fdRes = await fetch(
      'https://corsproxy.io/?' + encodeURIComponent(CONFIG.FOOTBALL.FD_BASE+'/matches?dateFrom='+dateFrom+'&dateTo='+dateTo+'&status=FINISHED'),
      { headers: { 'X-Auth-Token': CONFIG.FOOTBALL.FD_KEY } }
    );
    var fdData = await fdRes.json();
    var matches = (fdData.matches || []);
    // إذا قليلة، نضيف من TheSportsDB
    if (matches.length < 8) {
      var leagueIds = ['4328','4335','4331','4332','4334']; // EPL, La Liga, Serie A, Bundesliga, Ligue 1
      var sdbResults = await Promise.allSettled(leagueIds.map(id =>
        fetch(`https://www.thesportsdb.com/api/v1/json/3/eventspastleague.php?id=${id}`).then(r=>r.json())
      ));
      sdbResults.forEach(r => {
        if (r.status !== 'fulfilled') return;
        var events = (r.value.events || []).filter(e => {
          var d = e.dateEvent; return d >= dateFrom && d <= dateTo;
        });
        events.forEach(e => {
          matches.push({
            _sdb: true,
            competition: { name: e.strLeague },
            utcDate: e.dateEvent + 'T' + (e.strTime||'20:00:00') + 'Z',
            homeTeam: { name: e.strHomeTeam, shortName: e.strHomeTeam, crest: e.strHomeTeamBadge },
            awayTeam: { name: e.strAwayTeam, shortName: e.strAwayTeam, crest: e.strAwayTeamBadge },
            score: { fullTime: { home: e.intHomeScore, away: e.intAwayScore } }
          });
        });
      });
    }
    matches = matches.slice(0, 24);
    if (!matches.length) throw new Error('empty');
    if (!matches.length) throw new Error('empty');
    grid.innerHTML = matches.map(function(m) {
      var hs = (m.score.fullTime.home !== null ? m.score.fullTime.home : '?');
      var as = (m.score.fullTime.away !== null ? m.score.fullTime.away : '?');
      var dateLabel = new Date(m.utcDate).toLocaleDateString('ar-SA',{weekday:'long',day:'numeric',month:'long',year:'numeric'}) + ' — ' + new Date(m.utcDate).toLocaleTimeString('ar-SA',{hour:'2-digit',minute:'2-digit'});
      var home = m.homeTeam.shortName||m.homeTeam.name;
      var away = m.awayTeam.shortName||m.awayTeam.name;
      return '<div class="arch-card" onclick="openFootballStream(\'archive\',\''+home+' '+hs+' - '+as+' '+away+'\')">' +
        '<div class="arch-play-overlay"><i class="ri-play-circle-fill"></i></div>'+
        '<div class="arch-league">'+m.competition.name+'</div>'+
        '<div class="arch-teams-row">'+
          '<div class="arch-team">'+
            (m.homeTeam.crest?'<img class="arch-logo" src="'+m.homeTeam.crest+'" onerror="this.style.display=\'none\'">':'')+
            '<span class="arch-name">'+home+'</span>'+
          '</div>'+
          '<div class="arch-score">'+hs+' - '+as+'</div>'+
          '<div class="arch-team">'+
            (m.awayTeam.crest?'<img class="arch-logo" src="'+m.awayTeam.crest+'" onerror="this.style.display=\'none\'">':'')+
            '<span class="arch-name">'+away+'</span>'+
          '</div>'+
        '</div>'+
        '<div class="arch-date"><i class="ri-calendar-check-line"></i> '+dateLabel+' — انتهت</div>'+
      '</div>';
    }).join('');
  } catch(e) {
    var classics = [
      { league:'دوري أبطال أوروبا', home:'ريال مدريد', away:'ليفربول', hs:'3', as:'1', hLogo:'https://crests.football-data.org/86.svg', aLogo:'https://crests.football-data.org/64.svg', date:'الثلاثاء 6 مايو' },
      { league:'الدوري الإسباني', home:'برشلونة', away:'أتليتكو', hs:'2', as:'0', hLogo:'https://crests.football-data.org/81.svg', aLogo:'https://crests.football-data.org/78.svg', date:'السبت 4 مايو' },
      { league:'الدوري الإنجليزي', home:'مانشستر سيتي', away:'تشيلسي', hs:'4', as:'1', hLogo:'https://crests.football-data.org/65.svg', aLogo:'https://crests.football-data.org/61.svg', date:'الأحد 5 مايو' },
      { league:'الدوري الألماني', home:'بايرن', away:'دورتموند', hs:'2', as:'2', hLogo:'https://crests.football-data.org/5.svg', aLogo:'https://crests.football-data.org/4.svg', date:'السبت 4 مايو' },
    ];
    grid.innerHTML = classics.map(function(m) {
      return '<div class="arch-card" onclick="openFootballStream(\'archive\',\''+m.home+' '+m.hs+' - '+m.as+' '+m.away+'\')">'+
        '<div class="arch-play-overlay"><i class="ri-play-circle-fill"></i></div>'+
        '<div class="arch-league">'+m.league+'</div>'+
        '<div class="arch-teams-row">'+
          '<div class="arch-team"><img class="arch-logo" src="'+m.hLogo+'" onerror="this.style.display=\'none\'"><span class="arch-name">'+m.home+'</span></div>'+
          '<div class="arch-score">'+m.hs+' - '+m.as+'</div>'+
          '<div class="arch-team"><img class="arch-logo" src="'+m.aLogo+'" onerror="this.style.display=\'none\'"><span class="arch-name">'+m.away+'</span></div>'+
        '</div>'+
        '<div class="arch-date"><i class="ri-calendar-check-line"></i> '+m.date+' — انتهت</div>'+
      '</div>';
    }).join('');
  }
      }
// ===== TRANSFER RADAR =====
function openTransferRadar() {
  const modal = document.getElementById('transferRadar');
  if (!modal) return;
  modal.classList.remove('hidden');
  setTimeout(() => modal.classList.add('open'), 10);
  loadTransferNews();
}
function closeTransferRadar() {
  const modal = document.getElementById('transferRadar');
  modal.classList.remove('open');
  setTimeout(() => modal.classList.add('hidden'), 400);
}
async function loadTransferNews() {
  const list = document.getElementById('trList');
  if (!list) return;
  const FALLBACK = 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=200&q=80';
  try {
    const res = await fetch(
      `https://corsproxy.io/?${encodeURIComponent(CONFIG.API.NEWS_BASE+'/everything?q=football+transfer+انتقالات+لاعبين&language=ar&pageSize=15&sortBy=publishedAt&apiKey='+CONFIG.KEYS.NEWS)}`
    );
    const data = await res.json();
    const articles = (data.articles||[]).slice(0,12);
    if (!articles.length) throw new Error('empty');
    list.innerHTML = articles.map(a => {
      const ago = getTimeAgo(new Date(a.publishedAt));
      const img = a.urlToImage || FALLBACK;
      return `<div class="sp-news-card">
        <div class="sp-news-text-block">
          <div class="sp-news-time">${ago}</div>
          <div class="sp-news-title">${a.title}</div>
          <div class="sp-news-sub">${a.description||''}</div>
        </div>
        <img class="sp-news-img" src="${img}" onerror="this.src='${FALLBACK}'">
      </div>`;
    }).join('');
  } catch(e) {
    const transfers = [
      { time:'منذ ساعة', title:'ريال مدريد يستهدف ضم مبابي بصفقة تاريخية', sub:'الملكي يعرض 200 مليون يورو للنجم الفرنسي', img:FALLBACK },
      { time:'منذ 3 ساعات', title:'برشلونة يتفاوض على لاعب يوفنتوس', sub:'صفقة تبادلية محتملة بين العملاقين', img:FALLBACK },
      { time:'منذ 5 ساعات', title:'مانشستر سيتي يجدد عقد هالاند حتى 2030', sub:'الهداف النرويجي يمدد إقامته في الإتحاد', img:FALLBACK },
    ];
    list.innerHTML = transfers.map(t =>
      `<div class="sp-news-card">
        <div class="sp-news-text-block">
          <div class="sp-news-time">${t.time}</div>
          <div class="sp-news-title">${t.title}</div>
          <div class="sp-news-sub">${t.sub}</div>
        </div>
        <img class="sp-news-img" src="${t.img}" onerror="this.src='${FALLBACK}'">
      </div>`
    ).join('');
  }
}
// ===== NEWS HUB =====
function openNewsHub() {
  const screen = document.getElementById('newsHubScreen');
  if (!screen) return;
  screen.classList.remove('hidden');
  setTimeout(() => screen.classList.add('open'), 10);
  loadHubNews();
}
function closeNewsHub() {
  const screen = document.getElementById('newsHubScreen');
  screen.classList.remove('open');
  setTimeout(() => screen.classList.add('hidden'), 400);
}
async function loadHubNews() {
  const list = document.getElementById('hubNewsList');
  if (!list) return;
  const FALLBACK = 'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=400&q=80';
  list.innerHTML = '<div class="sp-neon-spinner-wrap"><div class="sp-neon-spinner"></div></div>';

  // نجرب مصادر RSS متعددة بترتيب
  const feeds = [
    { url: 'https://www.espn.com/espn/rss/soccer/news', lang: 'en' },
    { url: 'https://www.skysports.com/rss/12040', lang: 'en' },
    { url: 'https://www.bbc.co.uk/sport/football/rss.xml', lang: 'en' },
    { url: 'https://www.goal.com/feeds/en/news', lang: 'en' },
  ];

  let items = [];
  for (const feed of feeds) {
    try {
      const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}&count=15`);
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        items = items.concat(data.items.map(a => ({...a, _src: data.feed?.title || ''})));
      }
    } catch(e) {}
  }

  // تنظيف وترتيب
  items = items.filter((v,i,a) => a.findIndex(x => x.title === v.title) === i);
  items.sort((a,b) => new Date(b.pubDate) - new Date(a.pubDate));

  if (!items.length) {
    // fallback ثابت إذا فشلت كل المصادر
    items = [
      {title:'ريال مدريد يتأهل لنهائي دوري الأبطال',description:'الملكي يتخطى البايرن بثنائية نظيفة في برنابيو',pubDate:'2026-05-25',thumbnail:'https://upload.wikimedia.org/wikipedia/commons/c/c7/UEFA_Champions_League_trophy.jpg'},
      {title:'هالاند يسجل هاتريك أمام أرسنال',description:'الهداف النرويجي يقود السيتي لفوز كبير',pubDate:'2026-05-24',thumbnail:FALLBACK},
      {title:'برشلونة يقترب من صفقة الصيف الكبرى',description:'المفاوضات في مراحلها الأخيرة مع وكيل اللاعب',pubDate:'2026-05-24',thumbnail:FALLBACK},
      {title:'مبابي يقود فرنسا لفوز ساحق',description:'النجم يسجل ثنائية في تصفيات كأس العالم',pubDate:'2026-05-23',thumbnail:FALLBACK},
      {title:'يوفنتوس يجدد عقد نجمه الأساسي حتى 2028',description:'الملكة تؤمن خدمات اللاعب لثلاثة مواسم إضافية',pubDate:'2026-05-23',thumbnail:FALLBACK},
    ];
  }

  list.innerHTML = items.slice(0, 40).map(a => {
    const d = new Date(a.pubDate);
    const ago = typeof getTimeAgo === 'function' ? getTimeAgo(d) : '';
    const dateStr = d.toLocaleDateString('ar-SA', {day:'numeric', month:'long', year:'numeric'});
    // استخراج الصورة من أي مصدر ممكن
    let img = '';
    if (a.thumbnail && a.thumbnail.startsWith('http')) img = a.thumbnail;
    else if (a.enclosure?.link && a.enclosure.link.startsWith('http')) img = a.enclosure.link;
    else {
      // محاولة استخراج صورة من داخل الـ content
      const match = (a.content||a.description||'').match(/<img[^>]+src=["']([^"']+)["']/);
      img = match ? match[1] : FALLBACK;
    }
    return `<div class="hub-news-card" onclick="window.open('${a.link||'#'}','_blank')">
      <img class="hub-news-img" src="${img}" onerror="this.src='${FALLBACK}'" loading="lazy">
      <div class="hub-news-body">
        <div class="hub-news-time">${ago}${ago && dateStr ? ' · ' : ''}${dateStr}</div>
        <div class="hub-news-title">${a.title}</div>
        <div class="hub-news-sub">${(a.description||'').replace(/<[^>]+>/g,'').slice(0,130)}</div>
        ${a._src ? `<div style="font-size:0.65rem;color:rgba(255,255,255,0.25);margin-top:3px">${a._src}</div>` : ''}
      </div>
    </div>`;
  }).join('');
}

// ===== ARCHIVE HUB =====
var _hubAllMatches = [];
function openArchiveHub() {
  const screen = document.getElementById('archiveHubScreen');
  if (!screen) return;
  screen.classList.remove('hidden');
  setTimeout(() => screen.classList.add('open'), 10);
  // بناء قائمة السنوات من 2000 إلى اليوم
  const yearSel = document.getElementById('hubYearSelect');
  if (yearSel && yearSel.options.length <= 1) {
    const thisYear = new Date().getFullYear();
    for (let y = 2025; y >= 2015; y--) {
      const opt = document.createElement('option');
      opt.value = y; opt.textContent = y;
      yearSel.appendChild(opt);
    }
  }
  loadHubArchive();
}
function closeArchiveHub() {
  const screen = document.getElementById('archiveHubScreen');
  screen.classList.remove('open');
  setTimeout(() => screen.classList.add('hidden'), 400);
}
async function loadHubArchive() {
  const grid = document.getElementById('hubArchiveGrid');
  if (!grid) return;
  grid.innerHTML = '<div class="sp-neon-spinner-wrap"><div class="sp-neon-spinner"></div></div>';
  _hubAllMatches = [];

  // TheSportsDB — جلب مواسم متعددة من كل دوري
  const leagueSeasons = [
    {id:'4328', seasons:['2024-2025','2023-2024','2022-2023','2021-2022','2020-2021','2019-2020','2018-2019','2017-2018','2016-2017','2015-2016']},
    {id:'4335', seasons:['2024-2025','2023-2024','2022-2023','2021-2022','2020-2021','2019-2020']},
    {id:'4331', seasons:['2024-2025','2023-2024','2022-2023','2021-2022','2020-2021']},
    {id:'4332', seasons:['2024-2025','2023-2024','2022-2023','2021-2022','2020-2021']},
    {id:'4334', seasons:['2024-2025','2023-2024','2022-2023','2021-2022']},
    {id:'4399', seasons:['2024-2025','2023-2024','2022-2023','2021-2022','2020-2021']},
  ];

  // نجلب أول موسمين من كل دوري أولاً (للسرعة)
  const quickFetches = leagueSeasons.map(l =>
    fetch(`https://www.thesportsdb.com/api/v1/json/3/eventsseason.php?id=${l.id}&s=${l.seasons[0]}`).then(r=>r.json()).catch(()=>null)
  );
  const quickResults = await Promise.allSettled(quickFetches);
  quickResults.forEach(r => {
    if (r.status !== 'fulfilled' || !r.value) return;
    (r.value.events || []).forEach(e => {
      if (!e.dateEvent || !e.intHomeScore) return;
      _hubAllMatches.push({
        league: e.strLeague, leagueId: e.strLeague,
        date: e.dateEvent, time: e.strTime || '20:00:00',
        home: e.strHomeTeam, away: e.strAwayTeam,
        homeLogo: e.strHomeTeamBadge, awayLogo: e.strAwayTeamBadge,
        hs: e.intHomeScore, as: e.intAwayScore,
      });
    });
  });

  // FD للمباريات الحديثة
  try {
    var now = new Date();
    var fdRes = await fetch(
      'https://corsproxy.io/?' + encodeURIComponent(
        CONFIG.FOOTBALL.FD_BASE + '/matches?dateFrom=' +
        new Date(now.getTime()-150*86400000).toISOString().slice(0,10) +
        '&dateTo=' + now.toISOString().slice(0,10) + '&status=FINISHED'
      ),
      { headers: { 'X-Auth-Token': CONFIG.FOOTBALL.FD_KEY } }
    );
    var fdData = await fdRes.json();
    (fdData.matches || []).forEach(m => {
      _hubAllMatches.push({
        league: m.competition.name, leagueId: m.competition.name,
        date: m.utcDate.slice(0,10), time: m.utcDate.slice(11,19),
        home: m.homeTeam.shortName||m.homeTeam.name,
        away: m.awayTeam.shortName||m.awayTeam.name,
        homeLogo: m.homeTeam.crest, awayLogo: m.awayTeam.crest,
        hs: m.score.fullTime.home, as: m.score.fullTime.away,
      });
    });
  } catch(e) {}

  // إذا لا يزال فارغاً — fallback ثابت
  if (!_hubAllMatches.length) {
    _hubAllMatches = [
      {league:'دوري أبطال أوروبا',leagueId:'دوري أبطال أوروبا',date:'2024-05-01',time:'20:00:00',home:'ريال مدريد',away:'بايرن',homeLogo:'https://crests.football-data.org/86.svg',awayLogo:'https://crests.football-data.org/5.svg',hs:'2',as:'1'},
      {league:'الدوري الإسباني',leagueId:'الدوري الإسباني',date:'2024-04-27',time:'18:00:00',home:'برشلونة',away:'ريال مدريد',homeLogo:'https://crests.football-data.org/81.svg',awayLogo:'https://crests.football-data.org/86.svg',hs:'3',as:'2'},
      {league:'الدوري الإنجليزي',leagueId:'الدوري الإنجليزي',date:'2024-04-24',time:'19:30:00',home:'مانشستر سيتي',away:'أرسنال',homeLogo:'https://crests.football-data.org/65.svg',awayLogo:'https://crests.football-data.org/57.svg',hs:'1',as:'0'},
      {league:'الدوري الألماني',leagueId:'الدوري الألماني',date:'2024-04-20',time:'17:30:00',home:'بايرن',away:'دورتموند',homeLogo:'https://crests.football-data.org/5.svg',awayLogo:'https://crests.football-data.org/4.svg',hs:'4',as:'2'},
      {league:'الدوري الإيطالي',leagueId:'الدوري الإيطالي',date:'2024-04-14',time:'19:45:00',home:'إنتر',away:'يوفنتوس',homeLogo:'https://crests.football-data.org/108.svg',awayLogo:'https://crests.football-data.org/109.svg',hs:'2',as:'2'},
      {league:'دوري أبطال أوروبا',leagueId:'دوري أبطال أوروبا',date:'2023-06-10',time:'20:00:00',home:'مانشستر سيتي',away:'إنتر',homeLogo:'https://crests.football-data.org/65.svg',awayLogo:'https://crests.football-data.org/108.svg',hs:'1',as:'0'},
      {league:'الدوري الإسباني',leagueId:'الدوري الإسباني',date:'2023-05-28',time:'18:00:00',home:'ريال مدريد',away:'برشلونة',homeLogo:'https://crests.football-data.org/86.svg',awayLogo:'https://crests.football-data.org/81.svg',hs:'1',as:'2'},
      {league:'الدوري الإنجليزي',leagueId:'الدوري الإنجليزي',date:'2022-05-22',time:'16:00:00',home:'مانشستر سيتي',away:'أستون فيلا',homeLogo:'https://crests.football-data.org/65.svg',awayLogo:'https://crests.football-data.org/58.svg',hs:'3',as:'2'},
    ];
  }

  _hubAllMatches.sort((a,b) => (b.date+b.time).localeCompare(a.date+a.time));
  hubFilterMatches();
}
function hubFilterMatches() {
  const grid = document.getElementById('hubArchiveGrid');
  if (!grid) return;
  const year = document.getElementById('hubYearSelect')?.value || '';
  const month = document.getElementById('hubMonthSelect')?.value || '';
  const leagueId = document.getElementById('hubLeagueSelect')?.value || '';
  let filtered = _hubAllMatches.filter(m => {
    if (year && !m.date.startsWith(year)) return false;
    if (month && m.date.slice(5,7) !== month) return false;
    if (leagueId && !m.league.includes(leagueId) && !m.leagueId.includes(leagueId)) return false;
    return true;
  });
  if (!filtered.length) {
    grid.innerHTML = '<div class="sp-loading" style="color:rgba(255,255,255,0.4);padding:30px;text-align:center">لا توجد مباريات لهذه الفترة</div>';
    return;
  }
  grid.innerHTML = filtered.slice(0, 80).map(function(m) {
    var d = new Date(m.date + 'T' + m.time + 'Z');
    var dateLabel = d.toLocaleDateString('ar-SA', {weekday:'short', day:'numeric', month:'long', year:'numeric'});
    var timeLabel = d.toLocaleTimeString('ar-SA', {hour:'2-digit', minute:'2-digit'});
    var hs = m.hs !== null && m.hs !== '' ? m.hs : '?';
    var as = m.as !== null && m.as !== '' ? m.as : '?';
    return '<div class="arch-card" onclick="openFootballStream(\'archive\',\''+m.home+' '+hs+' - '+as+' '+m.away+'\')">'+
      '<div class="arch-play-overlay"><i class="ri-play-circle-fill"></i></div>'+
      '<div class="arch-league">'+m.league+'</div>'+
      '<div class="arch-teams-row">'+
        '<div class="arch-team">'+
          (m.homeLogo?'<img class="arch-logo" src="'+m.homeLogo+'" onerror="this.style.display=\'none\'">':'')+
          '<span class="arch-name">'+m.home+'</span>'+
        '</div>'+
        '<div class="arch-score">'+hs+' - '+as+'</div>'+
        '<div class="arch-team">'+
          (m.awayLogo?'<img class="arch-logo" src="'+m.awayLogo+'" onerror="this.style.display=\'none\'">':'')+
          '<span class="arch-name">'+m.away+'</span>'+
        '</div>'+
      '</div>'+
      '<div class="arch-date"><i class="ri-time-line"></i> '+timeLabel+' | <i class="ri-calendar-check-line"></i> '+dateLabel+'</div>'+
    '</div>';
  }).join('');
}
