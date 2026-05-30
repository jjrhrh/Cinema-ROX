const _auth = firebase.auth();
const _gProvider = new firebase.auth.GoogleAuthProvider();

function checkAuthOnLoad() {
  const loader = document.createElement('div');
  loader.id = 'authLoader';
  loader.style.cssText = 'position:fixed;inset:0;background:#0a0a0f;z-index:999999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;';
  loader.innerHTML = `
    <div style="font-size:36px;font-weight:900;letter-spacing:4px;background:linear-gradient(135deg,#fff 0%,#e50914 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">ROX</div>
    <div style="width:40px;height:3px;background:#1c1c1e;border-radius:10px;overflow:hidden;">
      <div id="loaderBar" style="height:100%;width:0%;background:linear-gradient(90deg,#e50914,#ff6b6b);border-radius:10px;transition:width 0.1s;"></div>
    </div>`;
  document.body.appendChild(loader);
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';
  let p = 0;
  const bar = setInterval(() => {
    p = Math.min(p + Math.random() * 15, 85);
    const el = document.getElementById('loaderBar');
    if (el) el.style.width = p + '%';
  }, 200);
  _auth.onAuthStateChanged(user => {
    clearInterval(bar);
    const el = document.getElementById('loaderBar');
    if (el) el.style.width = '100%';
    setTimeout(() => {
      loader.style.opacity = '0';
      loader.style.transition = 'opacity 0.3s';
      setTimeout(() => {
        loader.remove();
        if (!user) {
          showAuthModal();
        } else {
          document.body.style.overflow = '';
          document.documentElement.style.overflow = '';
        }
      }, 300);
    }, 150);
  });
} 

function showAuthModal() {
  if (document.getElementById('authModal')) return;
  const m = document.createElement('div');
  m.id = 'authModal';
  m.innerHTML = `
    <div class="splash-bg">
      <div class="splash-overlay"></div>
      <div class="splash-particles" id="splashParticles"></div>
    </div>
    <div class="splash-content">
      <div class="splash-logo">Cinema<span>ROX</span></div>
      <div class="splash-tagline">عالم الأفلام في مكان واحد</div>
      <div class="splash-card">
        <div class="splash-card-title">مرحباً بك</div>
        <div class="splash-card-sub">سجّل دخولك للاستمتاع بكامل المحتوى</div>
        <button class="splash-google-btn" onclick="signInGoogle()">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="20">
          تسجيل الدخول بـ Google
        </button>
        <div class="splash-divider"><span>أو</span></div>
        <div class="splash-field">
          <input class="splash-input" id="authEmail" type="email" placeholder="البريد الإلكتروني" dir="ltr">
        </div>
        <div class="splash-field">
          <input class="splash-input" id="authPass" type="password" placeholder="كلمة المرور" dir="ltr">
          <span class="splash-forgot" onclick="sendPasswordReset()">نسيت كلمة المرور؟</span>
        </div>
        <button class="splash-btn-login" onclick="signInEmail()">تسجيل الدخول</button>
        <button class="splash-btn-register" onclick="signUpEmail()">إنشاء حساب جديد</button>
        <button class="splash-btn-guest" onclick="enterAsGuest()">تصفح كزائر</button>
        <p id="authError" class="splash-error"></p>
      </div>
    </div>`;
  document.body.appendChild(m);
  initSplashParticles();
}

function initSplashParticles() {
  const c = document.getElementById('splashParticles');
  if (!c) return;
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'splash-particle';
    p.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;animation-delay:${Math.random()*4}s;animation-duration:${4+Math.random()*4}s;width:${2+Math.random()*3}px;height:${2+Math.random()*3}px;opacity:${0.2+Math.random()*0.4};`;
    c.appendChild(p);
  }
}

function sendPasswordReset() {
  const email = document.getElementById('authEmail').value;
  if (!email) { document.getElementById('authError').textContent = 'أدخل بريدك الإلكتروني أولاً'; return; }
  _auth.sendPasswordResetEmail(email).then(() => {
    document.getElementById('authError').style.color = '#46d369';
    document.getElementById('authError').textContent = 'تم إرسال رابط الاستعادة لبريدك ✓';
  }).catch(() => {
    document.getElementById('authError').textContent = 'البريد غير مسجل';
  });
}
function enterAsGuest() {
  window.ROX_GUEST = true;
  window.ROX_USER = null;
  closeAuthModal();
}
function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) modal.remove();
  document.body.style.overflow = '';
  document.documentElement.style.overflow = '';
  const user = _auth.currentUser;
  if (user) {
    const name = user.displayName || 'مرحباً';
    const email = user.email || '';
    const photo = user.photoURL || '';
    const card = document.createElement('div');
    card.id = 'welcomeCard';
    card.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:999999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(10px);';
    card.innerHTML = `
      <div style="background:linear-gradient(145deg,#1a1a2e,#16213e);border:1px solid rgba(255,255,255,0.12);border-radius:28px;padding:40px 36px;text-align:center;width:300px;box-shadow:0 30px 80px rgba(0,0,0,0.9);animation:fadeSlideUp 0.5s ease;">
        ${photo ? `<img src="${photo}" referrerpolicy="no-referrer" style="width:80px;height:80px;border-radius:50%;border:3px solid #e50914;margin-bottom:16px;object-fit:cover;">` : `<div style="width:80px;height:80px;border-radius:50%;background:#e50914;display:flex;align-items:center;justify-content:center;font-size:32px;margin:0 auto 16px;">👤</div>`}
        <div style="font-size:22px;font-weight:900;color:#fff;margin-bottom:6px;font-family:Tajawal;">أهلاً ${name}</div>
        <div style="font-size:13px;color:rgba(255,255,255,0.45);margin-bottom:20px;direction:ltr;">${email}</div>
        <div style="width:100%;height:3px;background:rgba(255,255,255,0.1);border-radius:10px;overflow:hidden;">
          <div id="welcomeBar" style="height:100%;width:100%;background:linear-gradient(90deg,#e50914,#ff6b6b);border-radius:10px;transition:width 5s linear;"></div>
        </div>
        <div style="font-size:11px;color:rgba(255,255,255,0.3);margin-top:8px;" id="welcomeCountdown">يدخلك خلال 5 ثواني...</div>
      </div>`;
    document.body.appendChild(card);
    setTimeout(() => { const bar = document.getElementById('welcomeBar'); if(bar) bar.style.width='0%'; }, 50);
    let sec = 5;
    const timer = setInterval(() => {
      sec--;
      const cd = document.getElementById('welcomeCountdown');
      if(cd) cd.textContent = `يدخلك خلال ${sec} ثواني...`;
      if(sec <= 0) clearInterval(timer);
    }, 1000);
    setTimeout(() => {
      card.style.transition = 'opacity 0.5s';
      card.style.opacity = '0';
      setTimeout(() => card.remove(), 500);
    }, 5000);
  }
}

async function signInGoogle() {
  try {
    await _auth.signInWithPopup(_gProvider);
    closeAuthModal();
  } catch(e) {
    document.getElementById('authError').textContent = 'فشل تسجيل الدخول بـ Google';
  }
}

async function signInEmail() {
  const email = document.getElementById('authEmail').value;
  const pass = document.getElementById('authPass').value;
  try {
    await _auth.signInWithEmailAndPassword(email, pass);
    closeAuthModal();
  } catch(e) {
    document.getElementById('authError').textContent = 'بيانات خاطئة، حاول مجدداً';
  }
}

async function signUpEmail() {
  const email = document.getElementById('authEmail').value;
  const pass = document.getElementById('authPass').value;
  try {
    await _auth.createUserWithEmailAndPassword(email, pass);
    closeAuthModal();
  } catch(e) {
    document.getElementById('authError').textContent = e.message;
  }
}

function signOut() {
  _auth.signOut();
}
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
  window._navStack = [];
  window._detailHistory = [];
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
    document.getElementById('filterBar')?.style.removeProperty('display');
    if (hero) { hero.style.display = ''; hero.style.visibility = ''; }
    loadHeroSwiper();
    loadHomePage();
    window.scrollTo(0, 0);
    return;
  }
  const pageMap = { home:'homePage', search:'searchPage', library:'libraryPage', settings:'settingsPage', football:'footballPage', profile:'profilePage', otaku:'homePage' };
const btnMap = { home:'bnavHome', search:'bnavSearch', library:'bnavLibrary', settings:'bnavSettings', football:'bnavFootball', otaku:'bnavOtaku' };
  
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
  if (tab === 'settings') { initThemeSystem(); initPremSettings(); }
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
  window._platInfinite = null;
  window._genreInfinite = null;
  window.removeEventListener('scroll', _platScrollHandler);
  window.removeEventListener('scroll', _genreScrollHandler);
  if (window._trailerTimer) { clearTimeout(window._trailerTimer); window._trailerTimer = null; }
  if (window._activeTrailerFrame) { window._activeTrailerFrame.src = ''; window._activeTrailerFrame = null; }
  if (window._navStack && window._navStack.length > 0) {
    const prev = window._navStack.pop();
    prev.restore();
    return;
  }
  const hero = document.getElementById('heroSection');
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.bnav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('homePage').classList.add('active');
  if (_otakuOn) {
    document.getElementById('bnavOtaku').classList.add('active');
    if (hero) { hero.style.display = ''; hero.style.visibility = ''; }
    document.getElementById('studioBar').style.display = 'block';
    document.getElementById('newsSection').style.display = 'block';
  } else {
    document.getElementById('bnavHome').classList.add('active');
    if (hero) { hero.style.display = ''; hero.style.visibility = ''; }
  }
  document.getElementById('platformsSection').style.display = '';
  window.scrollTo(0, 0);
}

window._navStack = [];

function pushNav(restoreFn) {
  if (window._navStack.length > 8) window._navStack.shift();
  window._navStack.push({ restore: restoreFn });
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
  ROX_AUTH.signOut().then(() => {
    Object.keys(localStorage).filter(k=>k.startsWith('rox_fav_')||k.startsWith('rox_later_')).forEach(k=>localStorage.removeItem(k));
    showAuthModal();
  });
}
if (window.ROX_AUTH) {
  ROX_AUTH.onAuthStateChanged(user => {
  window.ROX_USER = user || null;
    if (user) syncLibFromCloud();
    updateTopAvatar();
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
    ? '<i class="ri-movie-2-line" style="color:#ffd700;margin-left:5px;vertical-align:middle;filter:drop-shadow(0 0 4px #ffd700)"></i> فيلم'
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
      ${isNew ? `<span class="mc-new-badge">جديد</span>` : ''}
      <img class="movie-poster fade-img" src="${img}" alt="${title}" loading="lazy"
           onload="this.classList.add('loaded')"
           onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}';this.classList.add('loaded')">
      <div class="movie-overlay"><i class="ri-play-circle-fill" style="font-size:2.2rem;color:#fff;filter:drop-shadow(0 0 8px rgba(229,9,20,0.8))"></i></div>
      ${movie.vote_average ? `<div class="mc-rating"><i class="ri-star-fill" style="color:#ffd600;font-size:0.7rem;vertical-align:middle"></i> ${movie.vote_average.toFixed(1)}</div>` : ''}
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
        ${rating ? `<div class="mc-rating">⭐ ${rating}</div>` : ''}
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
      const animes = await fetchMovies('/discover/tv', { type:'tv', limit:20, params: { ...s.params, include_adult: false, without_genres: '10749' } });
      const BLOCKED_KEYWORDS = ['overflow','ishuzoku','to love','high school dxd','monster musume','keijo','prison school','interspecies','yuragi'];
      const filtered = animes.filter(m => {
        const name = (m.name || m.original_name || '').toLowerCase();
        return !BLOCKED_KEYWORDS.some(k => name.includes(k));
      }).slice(0, 10);
      const row = document.getElementById(`${s.id}_row`);
      if (!row) return;
      row.innerHTML = filtered.map((m, idx) => buildAnimeCard(m, idx+1, 'tv')).join('');
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
  cssMode: false,
  touchRatio: 1,
  touchAngle: 45,
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
{ id: 'sec_genres_hub', title: 'الأنواع', endpoint: '', type: 'movie', isGenresHub: true },
{ id: 'sec_toprated', title: 'الأعلى تقييماً',    endpoint: '/movie/top_rated', type: 'movie' },
{ id: 'sec_tvseries', title: 'أحدث المسلسلات',    endpoint: '/tv/popular',      type: 'tv'    },
{ id: 'sec_arabic_movies', title: 'الروائع العربية', endpoint: '/discover/movie', type: 'movie', params: { with_original_language: 'ar', sort_by: 'vote_average.desc', 'vote_count.gte': '100' } },
{ id: 'sec_arabic_series', title: 'الدراما العربية المشتعلة', endpoint: '/discover/tv', type: 'tv', params: { with_original_language: 'ar', sort_by: 'popularity.desc' } },
{ id: 'sec_docs', title: 'الوثائقيات المذهلة', endpoint: '/discover/movie', type: 'movie', params: { with_genres: '99', sort_by: 'vote_average.desc', 'vote_count.gte': '200' } },
{ id: 'sec_indie', title: 'مختارات السينما المستقلة', endpoint: '/discover/movie', type: 'movie', params: { with_genres: '18', sort_by: 'vote_average.desc', 'vote_count.gte': '500', with_original_language: 'en' } },
  ];

  // عرض الـ Skeleton فوراً بدون انتظار
  const cwItems = cwGetAll();
  const cwHTML = cwItems.length ? `
    <div id="continueSection" class="continue-section">
      <div class="section-header">
        <span class="section-bar"></span>
        <h2 class="section-title">مواصلة المشاهدة</h2>
        <button class="browse-all-btn" onclick="openContinueAll()">عرض الكل ‹</button>
      </div>
      <div id="continueList" class="continue-list">
        ${cwItems.map(i => {
          const pct = Math.min(Math.round(i.seconds/7200*100),100);
          const barColor = pct < 40 ? '#00e5ff' : pct < 70 ? '#ffd600' : '#e50914';
          return `<div class="cw-card" onclick="cwResume(${i.id},'${i.type}',${i.seconds},'${i.server||''}','${i.serverUrl||''}')">
            <div class="cw-thumb-wrap">
              <img class="cw-thumb" src="${i.poster}" onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'">
              <div class="cw-play-icon"><div class="cw-play-circle"><i class="ri-play-fill"></i></div></div>
              <div class="cw-bar-wrap"><div class="cw-bar" style="width:${pct}%;background:${barColor}"></div></div>
            </div>
            <div class="cw-info">
              <div class="cw-title">${i.title}</div>
              <div class="cw-meta">${i.type==='tv'?(i.season?`الموسم ${i.season} الحلقة ${i.episode||1}`:'مسلسل'):'فيلم'}</div>
              <div class="cw-pct">${pct}%</div>
            </div>
            <button class=\"cw-del\" onclick=\"event.stopPropagation();cwDelete('${i.id}')\">✕</button>
          </div>`;
        }).join('')}
      </div>
    </div>` : '';

  const genresHubHTML = `
<div class="home-section" id="sec_genres_hub">
  <div class="section-header">
    <span class="section-bar"></span>
    <h2 class="section-title">الأنواع</h2>
  </div>
  <div class="genres-hub-row" id="genresHubRow">
    <div class="ghub-card ghub-animation" onclick="openAnimationHub()">
      <img class="ghub-gif" src="https://media2.giphy.com/media/TKQmWCSaTg7RNIb8ZI/giphy.gif">
      <span class="ghub-label">الرسوم المتحركة</span>
    </div>
    <div class="ghub-card" onclick="openGenrePage('رعب')">
      <img class="ghub-gif" src="https://media3.giphy.com/media/YnbZXaqQCUWD0UGztx/giphy.gif">
      <span class="ghub-label">رعب</span>
    </div>
    <div class="ghub-card" onclick="openGenrePage('أكشن')">
      <img class="ghub-gif" src="https://media2.giphy.com/media/l3q2sGRLPRrLVqqD6/giphy.gif">
      <span class="ghub-label">أكشن</span>
    </div>
    <div class="ghub-card" onclick="openGenrePage('كوميديا')">
      <img class="ghub-gif" src="https://media1.giphy.com/media/2A75RyXVzzSI2bx4Gj/giphy.gif">
      <span class="ghub-label">كوميديا</span>
    </div>
    <div class="ghub-card" onclick="openGenrePage('مغامرة')">
      <img class="ghub-gif" src="https://media4.giphy.com/media/wPyDWwurn8XEWdR9ol/giphy.gif">
      <span class="ghub-label">مغامرة</span>
    </div>
    <div class="ghub-card" onclick="openGenrePage('جريمة')">
      <img class="ghub-gif" src="https://media3.giphy.com/media/hV6rn0naXBLsaFDCQk/giphy.gif">
      <span class="ghub-label">جريمة</span>
    </div>
    <div class="ghub-card" onclick="openGenrePage('تاريخ')">
      <img class="ghub-gif" src="https://media1.giphy.com/media/KbAqIFJxljNtzgJuLV/giphy.gif">
      <span class="ghub-label">تاريخ</span>
    </div>
    <div class="ghub-card" onclick="openGenrePage('بيكسر')">
      <img class="ghub-gif" src="https://media0.giphy.com/media/OpPyw0U5IGZDog5K4U/giphy.gif">
      <span class="ghub-label">بيكسر</span>
    </div>
    <div class="ghub-card" onclick="openGenrePage('أنمي')">
      <img class="ghub-gif" src="https://media1.giphy.com/media/3gTmgzy7wYJfyaGRHQ/giphy.gif">
      <span class="ghub-label">أنمي</span>
    </div>
    <div class="ghub-card" onclick="openGenrePage('خيال')">
      <img class="ghub-gif" src="https://media0.giphy.com/media/qWoY5iquwDQ1mer9dV/giphy.gif">
      <span class="ghub-label">خيال</span>
    </div>
    <div class="ghub-card" onclick="openGenrePage('إثارة')">
      <img class="ghub-gif" src="https://media4.giphy.com/media/d20Xhns1NlrejwLGJY/giphy.gif">
      <span class="ghub-label">إثارة</span>
    </div>
    <div class="ghub-card" onclick="openGenrePage('خيال علمي')">
      <img class="ghub-gif" src="https://media4.giphy.com/media/3ov9jN0SiS8DPqGoNi/giphy.gif">
      <span class="ghub-label">خيال علمي</span>
    </div>
    <div class="ghub-card" onclick="openGenrePage('دراما')">
      <img class="ghub-gif" src="https://media1.giphy.com/media/QNQc5qHY4sEOwbMsyh/giphy.gif">
      <span class="ghub-label">دراما</span>
    </div>
    <div class="ghub-card" onclick="openGenrePage('وثائقي')">
      <img class="ghub-gif" src="https://media3.giphy.com/media/bPDzcb6OADZ9m/giphy.gif">
      <span class="ghub-label">وثائقي</span>
    </div>
    <div class="ghub-card" onclick="openGenrePage('رومانسي')">
      <img class="ghub-gif" src="https://media1.giphy.com/media/3og0IGRNt8B81OkmnS/giphy.gif">
      <span class="ghub-label">رومانسي</span>
    </div>
    <div class="ghub-card" onclick="openGenrePage('الواقع')">
      <img class="ghub-gif" src="https://media0.giphy.com/media/UH5wa89mhqxfgOb95v/giphy.gif">
      <span class="ghub-label">الواقع</span>
    </div>
    <div class="ghub-card" onclick="openGenrePage('الأطفال والعائلة')">
      <img class="ghub-gif" src="https://media3.giphy.com/media/BsFGkUjyPgaOZzGhjP/giphy.gif">
      <span class="ghub-label">الأطفال والعائلة</span>
    </div>
    <div class="ghub-card" onclick="openGenrePage('إثارة وحركة')">
      <img class="ghub-gif" src="https://media1.giphy.com/media/7uurRVHK6eb5K/giphy.gif">
      <span class="ghub-label">إثارة وحركة</span>
    </div>
    <div class="ghub-card" onclick="openGenrePage('غربي')">
      <img class="ghub-gif" src="https://media4.giphy.com/media/kd60CY2xrO9NKTLej7/giphy.gif">
      <span class="ghub-label">غربي</span>
    </div>
    <div class="ghub-card" onclick="openGenrePage('قصص الحرب')">
      <img class="ghub-gif" src="https://media2.giphy.com/media/l1J3Skn2yOcRJ5ib6/giphy.gif">
      <span class="ghub-label">قصص الحرب</span>
    </div>
  </div>
</div>`;

  page.innerHTML = cwHTML + genresHubHTML + SECTIONS.filter(s => !s.isGenresHub).map(s => `
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
      requestIdleCallback(() => applyCardGlow(), { timeout: 2000 });
      if (document.getElementById('sec_indie') && !document.getElementById('sec_matcher')) injectMovieMatcher();
    } catch (e) {
      const container = document.getElementById(s.id);
      if (container) container.remove();
    }
  });
  function injectMovieMatcher() {
  const page = document.getElementById('homePage');
  if (!page) return;
  const old = document.getElementById('sec_matcher');
  if (old) old.remove();
  const card = document.createElement('div');
  card.id = 'sec_matcher';
  card.className = 'matcher-capsule';
  card.innerHTML = `<i class="ri-dice-line"></i><span>اختر لي فيلم السهرة</span>`;
  card.onclick = () => openSurprise();
  page.appendChild(card);
  }
}
function openAnimationHub() {
  const page = document.getElementById('detailPage');
  if (!page) return;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  pushNav(() => bnavGo('home'));
  document.getElementById('heroSection').style.display = 'none';
  document.getElementById('newsSection').style.display = 'none';
  document.getElementById('platformsSection').style.display = 'none';
  page.classList.add('active');
  window.scrollTo(0, 0);

  const ANIM_CHANNELS = [
    { id:'cartoonnetwork', name:'Cartoon Network', color:'#ff6b00', logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Cartoon_Network_2010_logo.svg/200px-Cartoon_Network_2010_logo.svg.png', networkIds:[11,2666], keywords:'16', tvOnly:true },
    { id:'nickelodeon',    name:'Nickelodeon',     color:'#ff8c00', logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Nickelodeon_2009_logo.svg/200px-Nickelodeon_2009_logo.svg.png', networkIds:[13,2297], keywords:'16', tvOnly:true },
    { id:'disney',         name:'Disney Channel',  color:'#0d47a1', logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Disney_Channel_2014_logo.svg/200px-Disney_Channel_2014_logo.svg.png', networkIds:[54,2739,302], keywords:'16', tvOnly:true },
    { id:'disneyjr',       name:'Disney Junior',   color:'#e91e63', logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Disney_Junior_logo.svg/200px-Disney_Junior_logo.svg.png', networkIds:[302,3061], keywords:'16', tvOnly:true },
    { id:'disneyxd',       name:'Disney XD',       color:'#1565c0', logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Disney_XD_2015_logo.svg/200px-Disney_XD_2015_logo.svg.png', networkIds:[2739,1825], keywords:'16', tvOnly:true },
    { id:'nickjr',         name:'Nick Jr',         color:'#ff6d00', logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Nick_Jr._logo_%282009%29.svg/200px-Nick_Jr._logo_%282009%29.svg.png', networkIds:[174,3353], keywords:'16', tvOnly:true },
    { id:'cbeebies',       name:'CBeebies',        color:'#ff5722', logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/CBeebies_2022_logo.svg/200px-CBeebies_2022_logo.svg.png', networkIds:[228,1485], keywords:'16', tvOnly:true },
    { id:'cartoonito',     name:'Cartoonito',      color:'#ff9100', logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Cartoonito_logo.svg/200px-Cartoonito_logo.svg.png', networkIds:[2552,11], keywords:'16', tvOnly:true },
  ];

  const channelsHTML = ANIM_CHANNELS.map(ch => `
    <div class="anim-ch-card" id="animch_${ch.id}" onclick="filterAnimChannel('${ch.id}')" style="--ch-color:${ch.color}">
      <div class="anim-ch-card-inner">
        <img src="${ch.logo}" onerror="this.style.display='none'" class="anim-ch-logo">
        <span class="anim-ch-name">${ch.name}</span>
      </div>
      <div class="anim-ch-glow"></div>
    </div>`).join('');

  page.innerHTML = `
    <div style="background:#0a0a10;min-height:100vh;padding-bottom:80px">
      <div class="anim-hub-header">
        <button class="detail-btn anim-back-btn" onclick="goBack()"><i class="ri-arrow-right-s-line"></i> رجوع</button>
        <h2 class="anim-hub-title"><i class="ri-tv-2-line"></i> الرسوم المتحركة</h2>
      </div>
      <div class="anim-tabs-row">
        <button class="anim-tab active" id="animTabAll" onclick="switchAnimTab('all',this)">الكل</button>
        <button class="anim-tab" id="animTabMovies" onclick="switchAnimTab('movie',this)">أفلام</button>
        <button class="anim-tab" id="animTabSeries" onclick="switchAnimTab('tv',this)">مسلسلات</button>
      </div>
      <div class="anim-channels-scroll"><div class="anim-channels-row">${channelsHTML}</div></div>
      <div id="animResultsGrid" class="anim-results-grid"></div>
    </div>`;

  window._animTab = 'all';
  window._animChannelsList = ANIM_CHANNELS;
  window._animChannel = null;
  loadAnimResults();
}

window.switchAnimTab = function(tab, el) {
  window._animTab = tab;
  document.querySelectorAll('.anim-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  loadAnimResults();
};

window.filterAnimChannel = function(chId) {
  window._animChannel = window._animChannel === chId ? window._animChannel : chId;
  document.querySelectorAll('.anim-ch-card').forEach(c => c.classList.remove('active'));
  document.getElementById('animch_' + window._animChannel)?.classList.add('active');
  loadAnimResults();
};

async function loadAnimResults() {
  const grid = document.getElementById('animResultsGrid');
  if (!grid) return;
  grid.innerHTML = Array(12).fill('<div class="movie-card skeleton-card"></div>').join('');
  const tab = window._animTab || 'all';
  const chId = window._animChannel;
  const channels = window._animChannelsList || [];
  const ch = channels.find(c => c.id === chId);

  const fetchPage = async (ep, params, page) => {
    try {
      const r = await fetch(buildTMDBUrl(ep, {...params, page}));
      const d = await r.json();
      return (d.results||[]).filter(i=>i.poster_path).map(i=>({...i, media_type: ep.includes('tv')?'tv':'movie'}));
    } catch { return []; }
  };

  const pages = [1,2,3,4,5];
  let allResults = [];

  if (ch) {
    const nid = ch.networkIds?.[0] ?? ch.networkId;
    if (ch.tvOnly) {
      if (tab === 'movie') {
        grid.innerHTML = '<div style="color:rgba(255,255,255,0.4);padding:40px;text-align:center;font-family:Tajawal">هذه القناة مسلسلات فقط</div>';
        return;
      }
      const tasks = pages.map(pg => fetchPage('/discover/tv', { with_networks: nid, with_genres:'16', sort_by:'popularity.desc', without_keywords:'210024' }, pg));
      allResults = (await Promise.all(tasks)).flat();
    } else {
      const tasks = [];
      if (tab !== 'movie') pages.forEach(pg => tasks.push(fetchPage('/discover/tv', { with_networks: nid, with_genres:'16', sort_by:'popularity.desc' }, pg)));
      if (tab !== 'tv') pages.forEach(pg => tasks.push(fetchPage('/discover/movie', { with_genres:'16', sort_by:'popularity.desc' }, pg)));
      allResults = (await Promise.all(tasks)).flat();
    }
  } else {
    const tasks = [];
    if (tab !== 'movie') pages.forEach(pg => tasks.push(fetchPage('/discover/tv', { with_genres:'16', sort_by:'popularity.desc', without_origin_country:'JP' }, pg)));
    if (tab !== 'tv') pages.forEach(pg => tasks.push(fetchPage('/discover/movie', { with_genres:'16', sort_by:'popularity.desc', without_origin_country:'JP' }, pg)));
    allResults = (await Promise.all(tasks)).flat();
  }

  const seen = new Set();
  const unique = allResults.filter(i => { if(seen.has(i.id)) return false; seen.add(i.id); return true; });
  unique.sort((a,b) => b.popularity - a.popularity);

  if (!document.getElementById('animResultsGrid')) return;
  grid.innerHTML = unique.length
    ? unique.map((m,i) => buildMovieCard(m, m.media_type, '', i+1)).join('')
    : '<div style="color:rgba(255,255,255,0.4);padding:40px;text-align:center;font-family:Tajawal">لا توجد نتائج</div>';
}
async function openBrowseAll(type, endpoint, title) {
  const page = document.getElementById('detailPage');
  if (!page) return;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  pushNav(() => bnavGo('home'));
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
  if (!window._navStack?.find(n => n._isDetail)) {
    pushNav(Object.assign(() => {
      if (window._detailHistory?.length > 0) { const p = window._detailHistory.pop(); openDetail(p.id, p.type); }
      else { window._navStack = []; goBack(); }
    }, { _isDetail: true }));
  }
  window._lastDetailId = id;
  window._lastDetailType = type;
  document.getElementById('newsSection').style.display = 'none';
  document.getElementById('studioBar').style.display = 'none';
  document.getElementById('filterBar')?.style.setProperty('display','none');
  document.getElementById('platformsSection').style.display = 'none';
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
            <div class="cast-card-wide" onclick="openActorPage(${a.id})" style="cursor:pointer">
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
      const sid = String(id);
      if (localStorage.getItem(`rox_fav_${sid}`) || localStorage.getItem(`rox_fav_${Number(sid)}`)) {
        const fb = document.querySelector(`.dp-btn-fav[data-id="${sid}"]`);
        if (fb) { fb.style.color='#e50914'; fb.style.borderColor='rgba(229,9,20,0.7)'; fb.style.boxShadow='0 0 14px rgba(229,9,20,0.4)'; const s=fb.querySelector('svg'); if(s){s.style.fill='#e50914';s.style.stroke='none';} }
      }
      const laterList = getLib('rox_watchlater');
      if (laterList.find(i => String(i.id) === sid)) {
        const lb = document.querySelector(`.dp-btn-later[data-id="${sid}"]`);
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
  document.getElementById('cyberDock').style.display = '';
  document.body.classList.remove('cinema-mode');
  if (window._roxSheet) { document.body.removeChild(window._roxSheet); window._roxSheet = null; }
  const wsFrame = document.getElementById('wsFrame');
if (wsFrame) { wsFrame.src = ''; }
const roxPlayer = document.getElementById('roxPlayer');
if (roxPlayer) { roxPlayer.pause(); roxPlayer.src = ''; }
if (window._roxHls) { window._roxHls.destroy(); window._roxHls = null; }
if (window._cwTimer) { clearInterval(window._cwTimer); window._cwTimer = null; }
  const dp = document.getElementById('detailPage');
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const fromPage = window._watchFromPage || '';
  if (fromPage === 'libraryPage') {
    loadLibraryPage();
  } else if (dp && dp.innerHTML.trim().length > 50) {
    dp.classList.add('active');
    const hero = document.getElementById('heroSection');
    if (hero) hero.style.display = 'none';
  } else {
    goBack();
  }
  window._watchFromPage = null;
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
function srvUrlCustom(srvKey, type, id, season, episode) {
  const S = CONFIG.SERVERS;
  if (srvKey === 'EMBEDAPI') {
    if (type === 'movie') return `https://player.embed-api.stream/?id=${id}`;
    return `https://player.embed-api.stream/?id=${id}&s=${season}&e=${episode}`;
  }
  if (srvKey === 'RIVESTREAM') {
    if (type === 'movie') return `https://www.rivestream.app/embed?type=movie&id=${id}`;
    return `https://www.rivestream.app/embed?type=tv&id=${id}&season=${season}&episode=${episode}`;
  }
  if (srvKey === 'RIVE_TORRENT') {
    if (type === 'movie') return `https://www.rivestream.app/embed/torrent?type=movie&id=${id}`;
    return `https://www.rivestream.app/embed/torrent?type=tv&id=${id}&season=${season}&episode=${episode}`;
  }
  if (srvKey === 'RIVE_AGG') {
    if (type === 'movie') return `https://www.rivestream.app/embed/agg?type=movie&id=${id}`;
    return `https://www.rivestream.app/embed/agg?type=tv&id=${id}&season=${season}&episode=${episode}`;
  }
  if (srvKey === 'VIDAPI') {
    if (type === 'movie') return `https://vidapi.xyz/embed/movie/${id}`;
    return `https://vidapi.xyz/embed/tv/${id}/${season}/${episode}`;
  }
  return '';
}
async function openWatchPage(id, type, season = 1, episode = 1, resumeSec = 0, resumeSrv = '') {
  const page = document.getElementById('watchPage');
  if (!page) return;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('heroSection').style.display = 'none';
  document.getElementById('platformsSection').style.display = 'none';
  document.getElementById('newsSection').style.display = 'none';
  document.getElementById('cyberDock').style.display = 'none';
  window._watchFromPage = document.querySelector('.page.active')?.id || 'home';
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
  { icon:'<i class="ri-live-line style-icon" style="color:#ff6b6b"></i>',   name:'RIVE',         desc:'Aggregator • متعدد',   url: srvUrlCustom('RIVESTREAM',  type,id,season,episode) },
  { icon:'<i class="ri-seedling-line style-icon" style="color:#51cf66"></i>', name:'RIVE TORRENT', desc:'Torrent • جودة عالية', url: srvUrlCustom('RIVE_TORRENT', type,id,season,episode) },
  { icon:'<i class="ri-stack-line style-icon" style="color:#74c0fc"></i>',   name:'RIVE AGG',     desc:'Multi-Source',         url: srvUrlCustom('RIVE_AGG',     type,id,season,episode) },
  { icon:'<i class="ri-rocket-line style-icon" style="color:#ffd43b"></i>', name:'EMBED-API',    desc:'Multi-Server • سريع',  url: srvUrlCustom('EMBEDAPI',     type,id,season,episode) },
  { icon:'<i class="ri-video-line style-icon" style="color:#da77f2"></i>',  name:'VIDAPI',       desc:'TMDB Direct',          url: srvUrlCustom('VIDAPI',       type,id,season,episode) },
  { icon:'<i class="ri-film-fill style-icon" style="color:#a855f7"></i>', name:'VIDBINGE', desc:'4K • متعدد المصادر', url: type==='movie' ? `${CONFIG.SERVERS.SRV_VIDBINGE.movie}${id}` : `${CONFIG.SERVERS.SRV_VIDBINGE.tv}${id}/${season}/${episode}` },
  { icon:'<i class="ri-live-line style-icon" style="color:#f9ca24"></i>', name:'RIVE', desc:'متعدد المصادر', url: type==='movie' ? `${CONFIG.SERVERS.SRV_RIVE.movie}${id}` : `${CONFIG.SERVERS.SRV_RIVE.tv}${id}&season=${season}&episode=${episode}` },
  { icon:'<i class="ri-stack-line style-icon" style="color:#a29bfe"></i>', name:'RIVE-AGG', desc:'Aggregator', url: type==='movie' ? `${CONFIG.SERVERS.SRV_RIVE_AGG.movie}${id}` : `${CONFIG.SERVERS.SRV_RIVE_AGG.tv}${id}&season=${season}&episode=${episode}` },
  { icon:'<i class="ri-download-2-line style-icon" style="color:#00b894"></i>', name:'RIVE-TORRENT', desc:'Torrent • جودة عالية', url: type==='movie' ? `${CONFIG.SERVERS.SRV_RIVE_TORRENT.movie}${id}` : `${CONFIG.SERVERS.SRV_RIVE_TORRENT.tv}${id}&season=${season}&episode=${episode}` },
  { icon:'<i class="ri-rocket-2-line style-icon" style="color:#00cec9"></i>', name:'EMBED-API', desc:'10+ مصادر', url: type==='movie' ? `${CONFIG.SERVERS.SRV_EMBEDAPI.movie}${id}` : `${CONFIG.SERVERS.SRV_EMBEDAPI.tv}${id}&s=${season}&e=${episode}` },
  { icon:'<i class="ri-signal-tower-line style-icon" style="color:#00ff9d"></i>', name:'VIDSRC-RU', desc:'autonext • أوتونيكست', url: type==='movie' ? `${CONFIG.SERVERS.SRV_VIDSRCRU.movie}${id}?autoplay=true&colour=e50914&autonextepisode=true` : `${CONFIG.SERVERS.SRV_VIDSRCRU.tv}${id}/${season}/${episode}?autoplay=true&colour=e50914&autonextepisode=true` },
  { icon:'<i class="ri-4k-line style-icon" style="color:#3b82f6"></i>', name:'VIDLUX', desc:'7 سيرفرات • 4K', url: type==='movie' ? `${CONFIG.SERVERS.SRV_VIDLUX.movie}${id}?color=e50914&autoplay=true` : `${CONFIG.SERVERS.SRV_VIDLUX.tv}${id}/${season}/${episode}?color=e50914&autoplay=true` },
  { icon:'<i class="ri-movie-line style-icon" style="color:#f9ca24"></i>', name:'BRAFLIX', desc:'سيرفرات متعددة', url: type==='movie' ? `${CONFIG.SERVERS.SRV_BRAFLIX.movie}${id}` : `${CONFIG.SERVERS.SRV_BRAFLIX.tv}${id}?season=${season}&episode=${episode}` },
  { icon:'<i class="ri-skip-forward-line style-icon" style="color:#00cec9"></i>', name:'CINESRC', desc:'Skip Intro • أوتونيكست', url: type==='movie' ? `${CONFIG.SERVERS.SRV_CINESRC.movie}${id}?autoplay=true&autonext=true&autoskip=true&color=%23e50914` : `${CONFIG.SERVERS.SRV_CINESRC.tv}${id}/${season}/${episode}?autoplay=true&autonext=true&autoskip=true&color=%23e50914` },
  { icon:'<i class="ri-server-line style-icon" style="color:#00b894"></i>', name:'APIPLAYER', desc:'ترجمات • أوتونيكست', url: type==='movie' ? `${CONFIG.SERVERS.SRV_APIPLAYER.movie}${id}?autoplay=1&autonext=1&lang=ar&chapters=1` : `${CONFIG.SERVERS.SRV_APIPLAYER.tv}${id}/${season}/${episode}?autoplay=1&autonext=1&lang=ar&chapters=1` },
  { icon:'<i class="ri-play-circle-line style-icon" style="color:#e50914"></i>', name:'AUTOEMBED', desc:'IMDB • تلقائي', url: type==='movie' ? `${CONFIG.SERVERS.SRV_AUTOEMBED.movie}${id}` : `${CONFIG.SERVERS.SRV_AUTOEMBED.tv}${id}-${season}-${episode}` },
  { icon:'<i class="ri-mastercard-line style-icon" style="color:#7c3aed"></i>', name:'EMBEDMASTER', desc:'HLS مباشر', url: type==='movie' ? `${CONFIG.SERVERS.SRV_EMBEDMASTER.movie}${id}` : `${CONFIG.SERVERS.SRV_EMBEDMASTER.tv}${id}/${season}/${episode}` },
  { icon:'<i class="ri-youtube-line style-icon" style="color:#ff0000"></i>', name:'EMBEDPLAYER', desc:'يوتيوب • فيمو', url: type==='movie' ? `${CONFIG.SERVERS.SRV_EMBEDPLAYER.movie}${id}` : `${CONFIG.SERVERS.SRV_EMBEDPLAYER.tv}${id}-${season}-${episode}` },
  { icon:'<i class="ri-play-circle-fill style-icon" style="color:#e50914"></i>', name:'VIDPLUS', desc:'VIP • 99.9% uptime', url:srvUrl(S.SRV_VP,type,id,season,episode) + '?autoplay=true&primarycolor=e50914&secondarycolor=B20710&iconcolor=FFFFFF&chromecast=true&poster=true' },
  { icon:'<i class="ri-shield-star-fill style-icon" style="color:#7c3aed"></i>', name:'STREAMVAULT', desc:'VIP • 12 مصدر', url:srvUrl(S.SRV_SV,type,id,season,episode) },
  { icon:'<i class="ri-flashlight-2-fill style-icon" style="color:#00e5ff"></i>', name:'EZVID', desc:'VIP • 8 مصادر HLS', url: type==='movie' ? `https://ezvidapi.com/embed/movie/${id}` : `https://ezvidapi.com/embed/tv/${id}/${season}/${episode}` },
  { icon:'<i class="ri-global-fill style-icon" style="color:#00cec9"></i>', name:'SUPER', desc:'VIP • HLS سريع', url: type==='movie' ? `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1` : `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1&s=${season}&e=${episode}` },
  { icon:'<i class="ri-vip-diamond-fill style-icon" style="color:#a855f7"></i>', name:'VIDLUX', desc:'VIP • 9 سيرفرات', url:srvUrl(S.SRV_VIDLUX,type,id,season,episode) + '?color=e50914' },
  { icon:'<i class="ri-crown-fill style-icon" style="color:#ffd700"></i>', name:'NHD', desc:'VIP • متعدد الأصوات', url:srvUrl(S.SRV_NHD,type,id,season,episode) + '?subtitle=ar&audio=ar&autonext=true&primarycolor=e50914&secondarycolor=ff2a2a&glasscolor=000000&glassopacity=80&glassblur=20&icons=sharp' },
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
  { icon:'<i class="ri-play-circle-line style-icon" style="color:#e50914"></i>', name:'AUTOEMBED', desc:'IMDB • تلقائي', url: type==='movie' ? `https://autoembed.co/movie/tmdb/${id}` : `https://autoembed.co/tv/tmdb/${id}-${season}-${episode}` },
  { icon:'<i class="ri-youtube-line style-icon" style="color:#ff0000"></i>', name:'EMBEDPLAYER', desc:'يوتيوب • فيمو', url: type==='movie' ? `https://embed-player.com/video/?source=https://autoembed.co/movie/tmdb/${id}` : `https://embed-player.com/video/?source=https://autoembed.co/tv/tmdb/${id}-${season}-${episode}` },
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
  { icon:'<i class="ri-signal-wifi-fill style-icon" style="color:#00b894"></i>', name:'VIDSRC-ME', desc:'جديد', url:srvUrl(S.SRV36,type,id,season,episode) },
  { icon:'<i class="ri-database-2-fill style-icon" style="color:#6c5ce7"></i>', name:'VSRC', desc:'جديد', url:srvUrl(S.SRV37,type,id,season,episode) },
  { icon:'<i class="ri-earth-fill style-icon" style="color:#00cec9"></i>', name:'VIDSRC-IN', desc:'جديد', url:srvUrl(S.SRV38,type,id,season,episode) },
  { icon:'<i class="ri-broadcast-fill style-icon" style="color:#fdcb6e"></i>', name:'VIDSRC-PM', desc:'جديد', url:srvUrl(S.SRV39,type,id,season,episode) },
  { icon:'<i class="ri-wifi-fill style-icon" style="color:#74b9ff"></i>', name:'VIDSRC-NET', desc:'جديد', url:srvUrl(S.SRV40,type,id,season,episode) },
];
const allSrvs = [...vipSrvs, ...proSrvs, ...freeSrvs];
window._vipSrvs = vipSrvs; window._proSrvs = proSrvs; window._freeSrvs = freeSrvs;
// جلب ROX من stream.js
const roxTitle = type === 'movie' ? (det.title || det.original_title) : (det.name || det.original_name);
let roxStreamUrl = null;
try {
  const streamEp = type === 'tv' ? episode : 1;
  const streamRes = await fetch(`https://cinema-rox.vercel.app/api/stream?tmdbId=${id}&type=${type}&season=${season}&ep=${streamEp}`);
  const streamData = await streamRes.json();
  window._roxSources = streamData.sources || [];
const best = window._roxSources.find(s => s.type === 'hls') || window._roxSources[0];
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
  allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
  referrerpolicy="no-referrer-when-downgrade"
  onload="if(this.src)cwTrackTime(${id},'${type}','${cwPoster}','${cwTitle}',${season},${episode})">
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
    <button class="ws-back" onclick="wsGoBack()" style="position:fixed;top:14px;right:14px;z-index:9999;background:rgba(0,0,0,0.7);color:#fff;border:none;border-radius:50px;padding:8px 18px;font-size:14px;font-family:Tajawal;cursor:pointer;backdrop-filter:blur(6px);">← رجوع</button>
  </div>
  <div class="ws-action-row">
  <button class="rox-theater-btn" onclick="showRoxSources()" style="gap:6px">
  <i class="ri-server-line"></i> السيرفرات
</button>
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
function cwTrackTime(id, type, poster, title, season, episode) {
  clearInterval(_cwTimer);
  let sec = 0;
  _cwTimer = setInterval(() => {
    sec += 10;
    const activeCard = document.querySelector('.ws-card.active');
    const srv = activeCard ? (activeCard.dataset.name || '') : '';
    const url = activeCard ? (activeCard.dataset.url || '') : '';
    cwSave(id, type, poster, title, sec, srv, url, season, episode);
  }, 10000);
}
const CW_KEY = 'rox_continue';
const CW_TTL = 604800000; // 7 أيام

function cwSave(id, type, poster, title, seconds, server, serverUrl, season, episode) {
  const list = cwGetAll();
  const idx  = list.findIndex(i => i.id === id);
  const item = { id, type, poster, title, seconds, server, serverUrl, season: season||1, episode: episode||1, savedAt: Date.now() };
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
  const list = cwGetAll().filter(i => String(i.id) !== String(id));
  localStorage.setItem(CW_KEY, JSON.stringify(list));
  loadHomePage();
}
async function checkNewEpisodes() {
  const alerts = getLib('rox_alerts');
  if (!alerts.length) return;
  const cwList = cwGetAll();
  const updates = [];
  await Promise.all(alerts.map(async item => {
    try {
      const data = await fetch(buildTMDBUrl(`/tv/${item.id}`)).then(r => r.json());
      const ep = data.last_episode_to_air;
      if (!ep) return;
      const cw = cwList.find(i => String(i.id) === String(item.id));
      const lastSeen = cw ? { s: cw.season||1, e: cw.episode||1 } : { s:0, e:0 };
      const isNew = ep.season_number > lastSeen.s || (ep.season_number === lastSeen.s && ep.episode_number > lastSeen.e);
      if (!isNew) return;
      updates.push({
        id: item.id,
        title: data.name || item.title,
        poster: data.poster_path ? CONFIG.IMAGES.POSTER_MD + data.poster_path : CONFIG.IMAGES.PLACEHOLDER,
        season: ep.season_number,
        episode: ep.episode_number,
        epName: ep.name || ''
      });
    } catch {}
  }));
  if (!updates.length) return;
  showNewEpisodesCard(updates);
}

function showNewEpisodesCard(updates) {
  if (document.getElementById('newEpsCard')) return;
  let idx = 0;
  const render = () => {
    const u = updates[idx];
    const card = document.getElementById('newEpsCard');
    card.innerHTML = `
      <div style="background:linear-gradient(145deg,#1a1a2e,#16213e);border:1px solid rgba(255,255,255,0.12);border-radius:28px;overflow:hidden;width:320px;box-shadow:0 30px 80px rgba(0,0,0,0.9);animation:fadeSlideUp 0.4s ease;">
        <div style="position:relative;">
          <img src="${u.poster}" style="width:100%;height:180px;object-fit:cover;display:block;">
          <div style="position:absolute;inset:0;background:linear-gradient(to top,#1a1a2e 20%,transparent);"></div>
          <div style="position:absolute;top:12px;right:12px;background:#e50914;color:#fff;font-size:11px;font-family:Tajawal;font-weight:700;padding:4px 10px;border-radius:20px;">🔔 حلقة جديدة</div>
          ${updates.length > 1 ? `<div style="position:absolute;top:12px;left:12px;background:rgba(0,0,0,0.6);color:#fff;font-size:11px;font-family:Tajawal;padding:4px 10px;border-radius:20px;">${idx+1}/${updates.length}</div>` : ''}
        </div>
        <div style="padding:18px 20px 22px;">
          <div style="font-size:17px;font-weight:900;color:#fff;font-family:Tajawal;margin-bottom:6px;">${u.title}</div>
          <div style="font-size:13px;color:rgba(255,255,255,0.5);font-family:Tajawal;margin-bottom:16px;">الموسم ${u.season} · الحلقة ${u.episode}${u.epName ? ' — '+u.epName : ''}</div>
          <div style="display:flex;gap:10px;">
            <button onclick="document.getElementById('newEpsCard').remove();openDetailPage(${u.id},'tv')" style="flex:1;background:#e50914;color:#fff;border:none;border-radius:14px;padding:12px;font-size:14px;font-weight:700;font-family:Tajawal;cursor:pointer;">تفاصيل</button>
            ${updates.length > 1 && idx < updates.length-1 ? `<button onclick="window._newEpsNext()" style="background:rgba(255,255,255,0.1);color:#fff;border:none;border-radius:14px;padding:12px 16px;font-size:14px;cursor:pointer;">›</button>` : ''}
            <button onclick="document.getElementById('newEpsCard').remove()" style="background:rgba(255,255,255,0.07);color:rgba(255,255,255,0.4);border:none;border-radius:14px;padding:12px 16px;font-size:14px;cursor:pointer;">✕</button>
          </div>
        </div>
      </div>`;
  };
  const overlay = document.createElement('div');
  overlay.id = 'newEpsCard';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:99999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px);';
  document.body.appendChild(overlay);
  window._newEpsNext = () => { idx = Math.min(idx+1, updates.length-1); render(); };
  render();
}
function cwRender() {
  loadHomePage();
}
function openContinueAll() {
  const items = cwGetAll();
  const page = document.getElementById('homePage');
  if (!page) return;
  page.innerHTML = `
    <div style="padding:16px 12px 80px">
      <div class="section-header" style="margin-bottom:16px">
        <span class="section-bar"></span>
        <h2 class="section-title">مواصلة المشاهدة</h2>
        <button class="browse-all-btn" onclick="loadHomePage()">‹ رجوع</button>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        ${items.map(i => {
          const pct = Math.min(Math.round(i.seconds/7200*100),100);
          const barColor = pct < 40 ? '#00e5ff' : pct < 70 ? '#ffd600' : '#e50914';
          return `<div class="cw-card" onclick="cwResume(${i.id},'${i.type}',${i.seconds},'${i.server||''}','${i.serverUrl||''}')">
            <div class="cw-thumb-wrap">
              <img class="cw-thumb" src="${i.poster}" onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'">
              <div class="cw-play-icon"><div class="cw-play-circle"><i class="ri-play-fill"></i></div></div>
              <div class="cw-bar-wrap"><div class="cw-bar" style="width:${pct}%;background:${barColor}"></div></div>
            </div>
            <div class="cw-info">
              <div class="cw-title">${i.title}</div>
              <div class="cw-meta">${i.type==='tv'?(i.season?`الموسم ${i.season} الحلقة ${i.episode||1}`:'مسلسل'):'فيلم'}</div>
              <div class="cw-pct">${pct}%</div>
            </div>
            <button class="cw-del" onclick="event.stopPropagation();cwDelete('${i.id}');openContinueAll()">✕</button>
          </div>`;
        }).join('')}
      </div>
    </div>`;
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
  const uid = window.ROX_USER?.uid;
  if (uid && window.ROX_DB) {
    window.ROX_DB.collection('users').doc(uid).set(
      { [key]: arr },
      { merge: true }
    ).catch(e => console.warn('Firestore save error:', e));
  }
}
async function syncLibFromCloud() {
  const uid = window.ROX_USER?.uid;
  if (!uid || !window.ROX_DB) return;
  try {
    const doc = await window.ROX_DB.collection('users').doc(uid).get();
    if (!doc.exists) return;
    const data = doc.data();
    ['rox_watchlist','rox_watchlater','rox_alerts'].forEach(key => {
      if (data[key]) {
        localStorage.setItem(libKey(key), JSON.stringify(data[key]));
      }
    });
    console.log('✅ تم مزامنة المكتبة من السحابة');
  } catch(e) { console.warn('Firestore sync error:', e); }
}
function addToWatchlist(id, type) {
  if (!window.ROX_USER) { showToast('🔐 سجّل دخولك لاستخدام هذه الميزة'); return; }
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
  if (!window.ROX_USER) {
    showToast('🔔 سجّل دخولك بـ Google لتفعيل التنبيهات');
    return;
  }
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
  if (!window.ROX_USER) { showToast('🔐 سجّل دخولك بـ Google لاستخدام هذه الميزة'); return; }
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
          <img class="prof-avatar" src="${user.photoURL}" referrerpolicy="no-referrer" onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'">
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
  checkAuthOnLoad();
  setTimeout(checkAllAlerts, 4000);
  setTimeout(checkNewEpisodes, 3000);
  bnavGo('home');
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
  document.getElementById('newsSection').style.display = 'none';
  const page = document.getElementById('homePage');
  if (!page) return;
  page.classList.add('active');

  const GENRES = [
    { id:28,    name:'أكشن',      icon:'ri-rocket-2-line',      img:'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=80', count:'1250' },
    { id:12,    name:'مغامرة',    icon:'ri-compass-3-line',     img:'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=400&q=80', count:'980'  },
    { id:878,   name:'خيال علمي', icon:'ri-rocket-line',        img:'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&q=80', count:'650'  },
    { id:18,    name:'دراما',     icon:'ri-heart-line',         img:'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&q=80', count:'1750' },
    { id:27,    name:'رعب',       icon:'ri-ghost-2-line',       img:'https://images.unsplash.com/photo-1531686215168-76f81db7d50e?w=400&q=80', count:'560'  },
    { id:37,    name:'غربي',      icon:'ri-user-3-line',        img:'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=400&q=80', count:'320'  },
    { id:16,    name:'أنيميشن',   icon:'ri-emotion-happy-line', img:'https://images.unsplash.com/photo-1543512214-318c7553f230?w=400&q=80', count:'910'  },
    { id:10749, name:'رومانسي',   icon:'ri-heart-3-line',       img:'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=400&q=80', count:'740'  },
  ];

  const MOODS = [
    { name:'خفيف',  icon:'ri-leaf-line',         params:'with_genres=35' },
    { name:'عائلي', icon:'ri-group-line',         params:'with_genres=10751' },
    { name:'مضحك',  icon:'ri-emotion-laugh-line', params:'with_genres=35' },
    { name:'مؤثر',  icon:'ri-drama-line',         params:'with_genres=18' },
    { name:'23+ض',  icon:'ri-prohibited-line',    params:'certification_country=US&certification=R' },
    { name:'ملهم',  icon:'ri-seedling-line',      params:'with_genres=18&sort_by=vote_average.desc' },
  ];

  const CY = new Date().getFullYear();

  window.ALL_COUNTRIES = [
    { code:'US', name:'أمريكا',   flag:'🇺🇸' },
    { code:'GB', name:'بريطانيا', flag:'🇬🇧' },
    { code:'TR', name:'تركيا',    flag:'🇹🇷' },
    { code:'IN', name:'الهند',    flag:'🇮🇳' },
    { code:'JP', name:'اليابان',  flag:'🇯🇵' },
    { code:'KR', name:'كوريا',    flag:'🇰🇷' },
    { code:'FR', name:'فرنسا',    flag:'🇫🇷' },
    { code:'DE', name:'ألمانيا',  flag:'🇩🇪' },
    { code:'IT', name:'إيطاليا',  flag:'🇮🇹' },
    { code:'ES', name:'إسبانيا',  flag:'🇪🇸' },
    { code:'MX', name:'المكسيك',  flag:'🇲🇽' },
    { code:'BR', name:'البرازيل', flag:'🇧🇷' },
    { code:'CN', name:'الصين',    flag:'🇨🇳' },
    { code:'TH', name:'تايلاند',  flag:'🇹🇭' },
    { code:'EG', name:'مصر',      flag:'🇪🇬' },
    { code:'SA', name:'السعودية', flag:'🇸🇦' },
    { code:'MA', name:'المغرب',   flag:'🇲🇦' },
    { code:'PK', name:'باكستان',  flag:'🇵🇰' },
    { code:'NG', name:'نيجيريا',  flag:'🇳🇬' },
    { code:'AR', name:'الأرجنتين',flag:'🇦🇷' },
  ];

  window.ALL_YEARS_LIST = Array.from({length:30}, (_,i) => CY - i);

  const SUB_GENRES = [
    { id:10752, name:'حربي',   img:'https://images.unsplash.com/photo-1534361960057-19f4434a6f6e?w=400&q=80' },
    { id:10402, name:'موسيقي', img:'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80' },
    { id:99,    name:'رياضي',  img:'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&q=80' },
    { id:36, name:'تاريخي', img:'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=400&q=80' },
    { id:99, name:'وثائقي', img:'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&q=80' },
  ];

  const YEARS_SHORT = [CY, CY-1, CY-2, CY-3, CY-4];

  page.innerHTML =
    '<div class="genres-page">' +

    '<div class="section-header"><span class="section-bar"></span><h2 class="section-title">التصنيفات</h2></div>' +
    '<div class="genres-grid">' +
    GENRES.map(g =>
      '<div class="genre-card" onclick="openBrowseAll(\'movie\',\'/discover/movie?with_genres=' + g.id + '\',\'' + g.name + '\')">' +
      '<div class="genre-bg" style="background-image:url(\'' + g.img + '\')"></div>' +
      '<div class="genre-overlay"></div>' +
      '<div class="genre-icon-wrap"><i class="' + g.icon + ' genre-icon"></i></div>' +
      '<span class="genre-name">' + g.name + '</span>' +
      '<span class="genre-count">' + g.count + ' عنوان</span>' +
      '</div>'
    ).join('') +
    '</div>' +

    '<div class="section-header" style="margin-top:24px"><span class="section-bar"></span><h2 class="section-title">تصفح حسب المزاج</h2></div>' +
    '<div class="moods-row">' +
    MOODS.map(m =>
      '<button class="mood-btn" onclick="openBrowseAll(\'movie\',\'/discover/movie?' + m.params + '\',\'' + m.name + '\')">' +
      '<i class="' + m.icon + '"></i><span>' + m.name + '</span></button>'
    ).join('') +
    '</div>' +

    '<div class="section-header" style="margin-top:24px"><span class="section-bar"></span><h2 class="section-title">تصفح حسب السنوات</h2></div>' +
    '<div class="years-row">' +
    YEARS_SHORT.map((y,i) =>
      '<button class="year-btn' + (i===0 ? ' active' : '') + '" onclick="openBrowseAll(\'movie\',\'/discover/movie?primary_release_year=' + y + '\',\'' + y + '\')">' +
      '<span class="year-num">' + y + '</span>' +
      (i===0 ? '<span class="year-new">جديد</span>' : '') +
      '</button>'
    ).join('') +
    '<button class="year-btn year-more-btn" onclick="openAllYearsScreen()"><i class="ri-calendar-line"></i><span class="year-new">المزيد</span></button>' +
    '</div>' +

    '<div class="section-header" style="margin-top:24px"><span class="section-bar"></span><h2 class="section-title">تصفح حسب البلد</h2></div>' +
    '<div class="countries-row">' +
    ALL_COUNTRIES.slice(0,6).map(c =>
      '<button class="country-btn" onclick="openBrowseAll(\'movie\',\'/discover/movie?with_origin_country=' + c.code + '\',\'' + c.name + '\')">' +
      '<span class="country-flag-circle">' + c.flag + '</span>' +
      '<span class="country-name">' + c.name + '</span></button>'
    ).join('') +
    '<button class="country-btn" onclick="openAllCountriesScreen()"><span class="country-flag-circle more-dots">•••</span><span class="country-name">المزيد</span></button>' +
    '</div>' +

    '<div class="section-header" style="margin-top:24px"><span class="section-bar"></span><h2 class="section-title">تصفح حسب النوع</h2></div>' +
    '<div class="sub-genres-row">' +
    SUB_GENRES.map(g =>
      '<div class="sub-genre-card" onclick="openBrowseAll(\'movie\',\'/discover/movie?with_genres=' + g.id + '\',\'' + g.name + '\')">' +
      '<div class="sub-genre-bg" style="background-image:url(\'' + g.img + '\')"></div>' +
      '<div class="sub-genre-overlay"></div>' +
      '<span class="sub-genre-name">' + g.name + '</span>' +
      '</div>'
    ).join('') +
    '</div>' +

    '</div>' +

    '<div class="fullscreen-hub hidden" id="allCountriesScreen">' +
    '<div class="hub-screen-hdr">' +
    '<button class="hub-back-btn" onclick="document.getElementById(\'allCountriesScreen\').classList.add(\'hidden\')"><i class="ri-arrow-right-line"></i></button>' +
    '<div class="hub-screen-title">تصفح حسب البلد</div>' +
    '</div>' +
    '<div class="all-countries-grid">' +
    ALL_COUNTRIES.map(c =>
      '<button class="country-btn-full" onclick="openBrowseAll(\'movie\',\'/discover/movie?with_origin_country=' + c.code + '\',\'' + c.name + '\')">' +
      '<span class="country-flag-lg">' + c.flag + '</span>' +
      '<span class="country-name-lg">' + c.name + '</span></button>'
    ).join('') +
    '</div>' +
    '</div>' +

    '<div class="fullscreen-hub hidden" id="allYearsScreen">' +
    '<div class="hub-screen-hdr">' +
    '<button class="hub-back-btn" onclick="document.getElementById(\'allYearsScreen\').classList.add(\'hidden\')"><i class="ri-arrow-right-line"></i></button>' +
    '<div class="hub-screen-title">تصفح حسب السنوات</div>' +
    '</div>' +
    '<div class="all-years-grid">' +
    ALL_YEARS_LIST.map((y,i) =>
      '<button class="year-btn-full' + (i===0 ? ' active' : '') + '" onclick="openBrowseAll(\'movie\',\'/discover/movie?primary_release_year=' + y + '\',\'' + y + '\')">' +
      y + (i===0 ? '<span class="year-new"> جديد</span>' : '') +
      '</button>'
    ).join('') +
    '</div>' +
    '</div>';
}

function openAllCountriesScreen() {
  document.getElementById('allCountriesScreen').classList.remove('hidden');
  window.scrollTo(0,0);
}

function openAllYearsScreen() {
  document.getElementById('allYearsScreen').classList.remove('hidden');
  window.scrollTo(0,0);
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
function showRoxSources() {
  if (window._roxSheet) {
    document.body.removeChild(window._roxSheet);
    window._roxSheet = null;
    return;
  }
  const sources = window._roxSources || [];
  if (!sources.length) return showToast('لا توجد سيرفرات متاحة');
  const sheet = document.createElement('div');
  sheet.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:#1a1a2e;border-radius:20px 20px 0 0;padding:20px;z-index:9999;max-height:60vh;overflow-y:auto';
  sheet.innerHTML = `<h3 style="color:#fff;margin:0 0 14px;font-family:Tajawal">📡 اختر السيرفر</h3>` +
    sources.map((s, i) => `
      <div onclick="selectRoxSource(${i})" style="background:rgba(255,255,255,0.07);border-radius:10px;padding:12px;margin-bottom:8px;cursor:pointer;font-family:Tajawal;color:#fff">
        <div style="font-weight:700">${s.name}</div>
        <div style="font-size:0.75rem;opacity:0.5">${s.quality || 'auto'} · ${s.lang || ''}</div>
      </div>`).join('');
  document.body.appendChild(sheet);
  window._roxSheet = sheet;
}
function selectRoxSource(i) {
  const s = (window._roxSources || [])[i];
  if (!s?.url) return;
  if (window._roxSheet) { document.body.removeChild(window._roxSheet); window._roxSheet = null; }
  if (window._roxHls) { window._roxHls.destroy(); window._roxHls = null; }
  const wsFrame = document.getElementById('wsFrame');
  if (wsFrame) wsFrame.src = '';
  const vid = document.getElementById('roxPlayer');
  if (vid) { vid.pause(); vid.src = ''; }
  if (s.type === 'hls' && window.Hls?.isSupported()) {
    const hls = new Hls();
    window._roxHls = hls;
    hls.loadSource(s.url);
    hls.attachMedia(vid);
    hls.on(Hls.Events.MANIFEST_PARSED, () => vid.play());
  } else {
    vid.src = s.url;
    vid.play();
  }
  const wrap = document.getElementById('roxPlayerWrap');
  if (wrap) { wrap.style.display = 'block'; wrap.style.visibility = 'visible'; wrap.style.opacity = '1'; }
  document.getElementById('wsOverlay').style.display = 'none';
  window.scrollTo(0, 0);
  showToast('▶ ' + s.name);
}
function toggleProfileDropdown() {
  const drop = document.getElementById('profileDropdown');
  if (!drop) return;
  if (drop.style.display !== 'none') { drop.style.display = 'none'; return; }
  const user = window.ROX_USER;
  if (!user) {
    drop.innerHTML = `
      <div style="padding:18px;text-align:center;">
        <div style="font-size:13px;color:rgba(255,255,255,0.5);font-family:Tajawal;margin-bottom:12px;">سجّل دخولك للوصول لحسابك</div>
        <button onclick="roxSignIn();document.getElementById('profileDropdown').style.display='none'" style="width:100%;background:#e50914;color:#fff;border:none;border-radius:12px;padding:10px;font-size:13px;font-weight:700;font-family:Tajawal;cursor:pointer;">تسجيل الدخول بـ Google</button>
      </div>`;
  } else {
    drop.innerHTML = `
      <div style="padding:16px;border-bottom:1px solid rgba(255,255,255,0.07);display:flex;align-items:center;gap:12px;">
        <img src="${user.photoURL||''}" referrerpolicy="no-referrer" style="width:46px;height:46px;border-radius:50%;object-fit:cover;border:2px solid #e50914;" onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'">
        <div>
          <div style="font-size:14px;font-weight:800;color:#fff;font-family:Tajawal;">${user.displayName||''}</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.4);direction:ltr;">${user.email||''}</div>
        </div>
      </div>
      <div style="padding:8px;">
        <div onclick="bnavGo('profile');document.getElementById('profileDropdown').style.display='none'" style="display:flex;align-items:center;gap:10px;padding:11px 14px;border-radius:12px;cursor:pointer;color:#fff;font-family:Tajawal;font-size:13px;" onmouseover="this.style.background='rgba(255,255,255,0.07)'" onmouseout="this.style.background=''">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="7" r="4"/><path d="M4 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2"/></svg> الملف الشخصي
        </div>
        <div onclick="bnavGo('settings');document.getElementById('profileDropdown').style.display='none'" style="display:flex;align-items:center;gap:10px;padding:11px 14px;border-radius:12px;cursor:pointer;color:#fff;font-family:Tajawal;font-size:13px;" onmouseover="this.style.background='rgba(255,255,255,0.07)'" onmouseout="this.style.background=''">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> الإعدادات
        </div>
        <div onclick="bnavGo('library');document.getElementById('profileDropdown').style.display='none'" style="display:flex;align-items:center;gap:10px;padding:11px 14px;border-radius:12px;cursor:pointer;color:#fff;font-family:Tajawal;font-size:13px;" onmouseover="this.style.background='rgba(255,255,255,0.07)'" onmouseout="this.style.background=''">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> مكتبتي
        </div>
        </div>`;
  }
  drop.style.display = 'block';
  setTimeout(() => document.addEventListener('click', function h(e) {
  if (!document.getElementById('profileDropdown')?.contains(e.target) && e.target.id !== 'topAvatarBtn') {
    document.getElementById('profileDropdown').style.display = 'none';
    document.removeEventListener('click', h);
  }
}), 100);
}
function openThemePanel() {
  document.getElementById('profileDropdown').style.display = 'none';
  renderThemeGrid();
  document.getElementById('themePanel').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeThemePanel() {
  document.getElementById('themePanel').classList.remove('open');
  document.body.style.overflow = '';
}
function updateTopAvatar() {
  const user = window.ROX_USER;
  const img = document.getElementById('topAvatarImg');
  const svg = document.getElementById('topAvatarSvg');
  if (!img || !svg) return;
  if (user?.photoURL) {
    img.src = user.photoURL;
    img.style.display = 'block';
    svg.style.display = 'none';
  } else {
    img.style.display = 'none';
    svg.style.display = 'block';
  }
}
// ─────────────────────────────────────────
//  🎨  THEME SYSTEM — Cinema ROX
// ─────────────────────────────────────────

const ROX_THEMES = [
  {
    id: 'red',
    name: 'الكلاسيكي الأحمر',
    desc: 'أحمر نيتفلكسي',
    accent: '#e50914',
    bg: '#080000',
    bg2: '#180000',
    card: '#1a0000',
  },
  {
    id: 'blue',
    name: 'الأزرق الكوني',
    desc: 'أزرق سايبربانك',
    accent: '#00e5ff',
    bg: '#021024',
    bg2: '#052659',
    card: '#031840',
  },
  {
    id: 'green',
    name: 'الأخضر النيون',
    desc: 'أخضر ماتريكس',
    accent: '#5DD62C',
    bg: '#0F0F0F',
    bg2: '#1a1a1a',
    card: '#161616',
  },
  {
    id: 'gold',
    name: 'الذهبي الملكي',
    desc: 'ذهبي IMDB',
    accent: '#f5c518',
    bg: '#0a0800',
    bg2: '#1a1400',
    card: '#151000',
  },
  {
    id: 'purple',
    name: 'الأرجواني الغامض',
    desc: 'بنفسجي سحري',
    accent: '#a855f7',
    bg: '#08000f',
    bg2: '#14002a',
    card: '#0f0018',
  },
  {
    id: 'light',
    name: 'الأبيض الفاخر',
    desc: 'وضع النهار',
    accent: '#e50914',
    bg: '#f2f2f7',
    bg2: '#e5e5ea',
    card: '#ffffff',
  },
  {
    id: 'rose',
    name: 'Rose Noir',
    desc: 'وردي داكن',
    accent: '#ff2d78',
    bg: '#0d0008',
    bg2: '#1f0014',
    card: '#180010',
  },
  {
    id: 'nebula',
    name: 'Deep Nebula',
    desc: 'أزرق بنفسجي كوني',
    accent: '#7548D2',
    bg: '#000008',
    bg2: '#080523',
    card: '#010094',
  },
  {
    id: 'teal',
    name: 'Deep Teal',
    desc: 'أخضر مائي داكن',
    accent: '#134E5E',
    bg: '#0B3037',
    bg2: '#0d3d45',
    card: '#0a2830',
  },
  {
    id: 'midnight',
    name: 'Midnight Gold',
    desc: 'أسود وذهبي',
    accent: '#5E4B43',
    bg: '#1A1A1A',
    bg2: '#111111',
    card: '#161616',
  },
  {
    id: 'walnut',
    name: 'Walnut Noir',
    desc: 'بني فاخر داكن',
    accent: '#5E4B43',
    bg: '#2E1F1B',
    bg2: '#261a17',
    card: '#1e1410',
  },
  {
    id: 'emerald',
    name: 'Emerald Chrome',
    desc: 'أزرق زمردي',
    accent: '#004E92',
    bg: '#000428',
    bg2: '#001a5e',
    card: '#000f3d',
  },
  {
    id: 'yellow',
    name: 'Sunflower Dark',
    desc: 'أصفر على أسود',
    accent: '#FFD100',
    bg: '#192230',
    bg2: '#1a1a1a',
    card: '#202020',
  },
  {
    id: 'nft',
    name: 'NFT Vibe',
    desc: 'أخضر نيون وبنفسجي',
    accent: '#D0FF00',
    bg: '#000000',
    bg2: '#0a0a0a',
    card: '#111111',
  },
  {
    id: 'royal',
    name: 'Royal Gold',
    desc: 'ذهبي ملكي فاخر',
    accent: '#D8BD71',
    bg: '#000101',
    bg2: '#172531',
    card: '#2C4657',
  },
];

const ROX_FONTS = [
  { id: 'Tajawal',  name: 'Tajawal',  sample: 'سينما روكس الأفلام', preview: 'T' },
  { id: 'Cairo',    name: 'Cairo',    sample: 'سينما روكس الأفلام', preview: 'C' },
  { id: 'Amiri',    name: 'Amiri',    sample: 'سينما روكس الأفلام', preview: 'أ' },
  { id: 'Almarai',  name: 'Almarai',  sample: 'سينما روكس الأفلام', preview: 'M' },
];

let roxCurrentTheme = localStorage.getItem('rox_theme') || 'red';
let roxCurrentFont  = localStorage.getItem('rox_font')  || 'Tajawal';
let roxFontSize     = parseInt(localStorage.getItem('rox_font_size') || '100');

function initThemeSystem() {
  applyTheme(roxCurrentTheme, false);
  applyFont(roxCurrentFont, false);
  applyFontSize(roxFontSize, false);

  const blur = localStorage.getItem('rox_blur') !== 'false';
  const glow = localStorage.getItem('rox_glow') !== 'false';
  const anim = localStorage.getItem('rox_anim') !== 'false';
  const hq   = localStorage.getItem('rox_hq')   !== 'false';

  const tb = document.getElementById('toggleBlur');
  const tg = document.getElementById('toggleGlow');
  const ta = document.getElementById('toggleAnim');
  const th = document.getElementById('toggleHQ');
  if (tb) tb.checked = blur;
  if (tg) tg.checked = glow;
  if (ta) ta.checked = anim;
  if (th) th.checked = hq;

  applyBlur(blur, false);
  applyGlow(glow, false);
  applyAnimations(anim, false);

  const slider = document.getElementById('fontSizeSlider');
  if (slider) slider.value = roxFontSize;
}

function applyTheme(themeId, save = true) {
  roxCurrentTheme = themeId;
  const html = document.getElementById('htmlRoot') || document.documentElement;
  if (themeId === 'red') {
    html.removeAttribute('data-theme');
  } else {
    html.setAttribute('data-theme', themeId);
  }
  const t = ROX_THEMES.find(x => x.id === themeId);
  if (t) {
    document.documentElement.style.setProperty('--accent', t.accent);
    document.documentElement.style.setProperty('--accent-glow', t.accent + '66');
    document.documentElement.style.setProperty('--accent-soft', t.accent + '1a');
    document.documentElement.style.setProperty('--accent2', t.accent2 || t.accent);
    document.documentElement.style.setProperty('--bg', t.bg);
    document.documentElement.style.setProperty('--bg2', t.bg2);
    document.documentElement.style.setProperty('--card-bg', t.card);
  }
  if (t) {
    const label = document.getElementById('activeThemeLabel');
    const badge = document.getElementById('currentThemeName');
    if (label) label.textContent = `${t.name} — ${t.desc}`;
    if (badge) badge.textContent = t.name;
  }
  if (save) {
    localStorage.setItem('rox_theme', themeId);
    renderThemeGrid();
  }
}

function applyFont(fontId, save = true) {
  roxCurrentFont = fontId;
  document.body.style.fontFamily = `'${fontId}', sans-serif`;
  const label = document.getElementById('activeFontLabel');
  if (label) label.textContent = fontId;
  if (save) {
    localStorage.setItem('rox_font', fontId);
    renderThemeGrid();
  }
  if (!document.querySelector(`link[data-rox-font="${fontId}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.setAttribute('data-rox-font', fontId);
    link.href = `https://fonts.googleapis.com/css2?family=${fontId.replace(/ /g,'+')}:wght@400;500;700;800;900&display=swap`;
    document.head.appendChild(link);
  }
}

function applyFontSize(val, save = true) {
  roxFontSize = parseInt(val);
  document.documentElement.style.fontSize = `${roxFontSize}%`;
  const label = document.getElementById('fontSizeLabel');
  if (label) label.textContent = `${roxFontSize}%`;
  const slider = document.getElementById('fontSizeSlider');
  if (slider) slider.value = roxFontSize;
  if (save) localStorage.setItem('rox_font_size', roxFontSize);
}

function applyBlur(on, save = true) {
  document.documentElement.style.setProperty(
    '--backdrop-filter-val', on ? 'blur(36px) saturate(2)' : 'none'
  );
  const nav = document.querySelector('.cyber-dock, .bottom-nav');
  if (nav) nav.style.backdropFilter = on ? 'blur(36px) saturate(2)' : 'none';
  if (save) localStorage.setItem('rox_blur', on);
}

function applyGlow(on, save = true) {
  document.documentElement.style.setProperty('--glow-intensity', on ? '1' : '0');
  document.querySelectorAll('.dock-btn.active, .bnav-btn.active').forEach(el => {
    el.style.filter = on ? '' : 'none';
  });
  if (save) localStorage.setItem('rox_glow', on);
}

function applyAnimations(on, save = true) {
  document.documentElement.style.setProperty('--anim-speed', on ? '1' : '0');
  const style = document.getElementById('rox-no-anim-style');
  if (!on) {
    if (!style) {
      const s = document.createElement('style');
      s.id = 'rox-no-anim-style';
      s.textContent = '*, *::before, *::after { animation-duration: 0s !important; transition-duration: 0s !important; }';
      document.head.appendChild(s);
    }
  } else {
    if (style) style.remove();
  }
  if (save) localStorage.setItem('rox_anim', on);
}

function applyHQ(on, save = true) {
  if (save) localStorage.setItem('rox_hq', on);
}
async function openPlatformPage(platId, tab = 'all', page = 1) {
  const plat = ROX_PLATFORMS.find(p => p.id === platId);
  if (!plat) return;
  const detailPage = document.getElementById('detailPage');
  if (!detailPage) return;

  if (page === 1) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('heroSection').style.display = 'none';
    document.getElementById('newsSection').style.display = 'none';
    document.getElementById('studioBar').style.display = 'none';
    document.getElementById('platformsSection').style.display = 'none';
    detailPage.classList.add('active');
    detailPage.innerHTML = '<div class="loading">⏳ جاري التحميل...</div>';
    window.scrollTo(0, 0);
  }

  const params = { with_watch_providers: String(plat.providerId), watch_region: 'US', sort_by: 'popularity.desc', page };
  let tvData = [], moviesData = [];
  if (tab === 'all' || tab === 'series') tvData = (await fetchMovies('/discover/tv', { type: 'tv', limit: 20, params })).map(i => ({ ...i, media_type: 'tv' }));
  if (tab === 'all' || tab === 'movies') moviesData = (await fetchMovies('/discover/movie', { type: 'movie', limit: 20, params })).map(i => ({ ...i, media_type: 'movie' }));
  const seen = new Set();
  const items = [...tvData, ...moviesData].filter(i => { if (seen.has(i.id)) return false; seen.add(i.id); return true; });

  if (page === 1) {
    detailPage.innerHTML = `
      <div style="padding-bottom:80px">
        <div style="position:relative;height:160px;overflow:hidden">
          <img src="${getPlatformGif(platId)}" style="width:100%;height:100%;object-fit:cover;opacity:0.5">
          <div style="position:absolute;inset:0;background:linear-gradient(to top,#0a0a1a 40%,transparent)"></div>
          <button onclick="goBack()" style="position:absolute;top:14px;right:14px;background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.2);border-radius:50%;width:36px;height:36px;color:#fff;font-size:1.1rem;cursor:pointer">←</button>
          <div style="position:absolute;bottom:14px;left:16px;font-size:1.4rem;font-weight:900;color:#fff;font-family:Tajawal,sans-serif">${plat.name}</div>
        </div>
        <div style="display:flex;border-bottom:2px solid rgba(255,255,255,0.1);padding:0 16px;margin-bottom:12px">
          ${[['all','الكل'],['series','مسلسلات'],['movies','أفلام']].map(([t,label]) => `
            <button onclick="openPlatformPage('${platId}','${t}',1)"
              style="padding:10px 18px;background:transparent;border:none;border-bottom:${tab===t?`2px solid ${plat.color}`:'2px solid transparent'};color:${tab===t?'#fff':'rgba(255,255,255,0.5)'};font-family:Tajawal,sans-serif;font-size:0.9rem;cursor:pointer;margin-bottom:-2px;font-weight:${tab===t?'700':'400'}">${label}</button>
          `).join('')}
        </div>
        <div class="otaku-all-grid" id="platGrid_${platId}" style="padding:0 12px">
          ${items.map((m,i) => buildMovieCard(m, m.media_type, '', i+1)).join('')}
        </div>
        <div id="platLoader_${platId}" style="text-align:center;padding:20px;color:rgba(255,255,255,0.4);font-family:Tajawal,sans-serif">⏳ جاري التحميل...</div>
      </div>`;

    window._platInfinite = { platId, tab, page: 1, loading: false };
    window.addEventListener('scroll', _platScrollHandler);
  } else {
    const grid = document.getElementById(`platGrid_${platId}`);
    if (grid) grid.insertAdjacentHTML('beforeend', items.map((m,i) => buildMovieCard(m, m.media_type, '', i+1)).join(''));
    const loader = document.getElementById(`platLoader_${platId}`);
    if (loader) loader.textContent = items.length < 10 ? 'لا يوجد المزيد' : '⏳ جاري التحميل...';
    if (window._platInfinite) { window._platInfinite.loading = false; }
  }
}

function _platScrollHandler() {
  if (!window._platInfinite) return;
  const { platId, tab, page, loading } = window._platInfinite;
  if (loading) return;
  if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 300) {
    window._platInfinite.loading = true;
    window._platInfinite.page = page + 1;
    openPlatformPage(platId, tab, page + 1);
  }
}
const GENRE_IDS = {
  'رعب':              { movie: 27,    tv: 27    },
  'أكشن':             { movie: 28,    tv: 10759 },
  'كوميديا':          { movie: 35,    tv: 35    },
  'مغامرة':           { movie: 12,    tv: 10759 },
  'جريمة':            { movie: 80,    tv: 80    },
  'تاريخ':            { movie: 36,    tv: 36    },
  'بيكسر':            { movie: 16,    tv: 16    },
  'أنمي':             { movie: null,  tv: 16,   animeOnly: true },
  'خيال':             { movie: 14,    tv: 14    },
  'إثارة':            { movie: 53,    tv: 9648  },
  'خيال علمي':        { movie: 878,   tv: 10765 },
  'دراما':            { movie: 18,    tv: 18    },
  'وثائقي':           { movie: 99,    tv: 99    },
  'رومانسي':          { movie: 10749, tv: 10749 },
  'الواقع':           { movie: null,  tv: 10764 },
  'الأطفال والعائلة': { movie: 10751, tv: 10762 },
  'إثارة وحركة':      { movie: 28,    tv: 10759 },
  'غربي':             { movie: 37,    tv: 37    },
  'قصص الحرب':        { movie: 10752, tv: 10768 },
};

async function openGenrePage(name, tab, page = 1) {
  const genre = GENRE_IDS[name];
  if (!genre) return;
  if (!tab) tab = genre.movie ? 'movies' : 'series';
  const detailPage = document.getElementById('detailPage');
  if (!detailPage) return;

  if (page === 1) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('heroSection').style.display = 'none';
    document.getElementById('newsSection').style.display = 'none';
    document.getElementById('studioBar').style.display = 'none';
    document.getElementById('platformsSection').style.display = 'none';
    detailPage.classList.add('active');
    detailPage.innerHTML = '<div class="loading">⏳ جاري التحميل...</div>';
    window.scrollTo(0, 0);
  }

  let items = [];
  if (tab === 'movies' && genre.movie) {
    items = await fetchMovies('/discover/movie', { type: 'movie', limit: 20, params: { with_genres: String(genre.movie), sort_by: 'popularity.desc', page } });
    items = items.map(i => ({ ...i, media_type: 'movie' }));
  } else if (tab === 'series' && genre.tv) {
    const params = { with_genres: String(genre.tv), sort_by: 'popularity.desc', page };
    if (genre.animeOnly) params.with_origin_country = 'JP';
    items = await fetchMovies('/discover/tv', { type: 'tv', limit: 20, params });
    items = items.map(i => ({ ...i, media_type: 'tv' }));
  }

  const tabs = [
    ...(genre.movie ? [['movies','🎬 أفلام']] : []),
    ...(genre.tv    ? [['series','📺 مسلسلات']] : []),
  ];

  if (page === 1) {
    detailPage.innerHTML = `
      <div style="padding-bottom:80px">
        <div style="padding:14px 16px 0;display:flex;align-items:center;gap:10px">
          <button onclick="goBack()" style="background:rgba(255,255,255,0.08);border:none;border-radius:50%;width:36px;height:36px;color:#fff;font-size:1.1rem;cursor:pointer">←</button>
          <h2 style="color:#fff;font-size:1.2rem;font-family:Tajawal,sans-serif;margin:0">${name}</h2>
        </div>
        <div style="display:flex;border-bottom:2px solid rgba(255,255,255,0.1);padding:0 16px;margin:12px 0 0">
          ${tabs.map(([t, label]) => `
            <button onclick="openGenrePage('${name}','${t}',1)"
              style="padding:10px 18px;background:transparent;border:none;border-bottom:${tab===t?'2px solid #e50914':'2px solid transparent'};color:${tab===t?'#fff':'rgba(255,255,255,0.5)'};font-family:Tajawal,sans-serif;font-size:0.9rem;cursor:pointer;margin-bottom:-2px;font-weight:${tab===t?'700':'400'}">${label}</button>
          `).join('')}
        </div>
        <div class="otaku-all-grid" id="genreGrid_${name}" style="padding:12px">
          ${items.map((m,i) => buildMovieCard(m, m.media_type, '', i+1)).join('')}
        </div>
        <div id="genreLoader_${name}" style="text-align:center;padding:20px;color:rgba(255,255,255,0.4);font-family:Tajawal,sans-serif">⏳ جاري التحميل...</div>
      </div>`;

    window._genreInfinite = { name, tab, page: 1, loading: false };
    window.addEventListener('scroll', _genreScrollHandler);
  } else {
    const grid = document.getElementById(`genreGrid_${name}`);
    if (grid) grid.insertAdjacentHTML('beforeend', items.map((m,i) => buildMovieCard(m, m.media_type, '', i+1)).join(''));
    const loader = document.getElementById(`genreLoader_${name}`);
    if (loader) loader.textContent = items.length < 10 ? 'لا يوجد المزيد' : '⏳ جاري التحميل...';
    if (window._genreInfinite) window._genreInfinite.loading = false;
  }
}

function _genreScrollHandler() {
  if (!window._genreInfinite) return;
  const { name, tab, page, loading } = window._genreInfinite;
  if (loading) return;
  if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 300) {
    window._genreInfinite.loading = true;
    window._genreInfinite.page = page + 1;
    openGenrePage(name, tab, page + 1);
  }
}
const ROX_PLATFORMS = [
  { id: 'netflix',    name: 'Netflix',      color: '#e50914', providerId: 8,    gifs: ['https://i.postimg.cc/5JrQJYTw/GIF-20260412-181509-853.gif?dl=1'] },
  { id: 'disney',     name: 'Disney+',      color: '#0063e5', providerId: 337,  gifs: ['https://media1.tenor.com/m/qYlalc1KzQUAAAAC/disney-disney-plus.gif'] },
  { id: 'prime',      name: 'Prime Video',  color: '#00a8e1', providerId: 9,    gifs: ['https://media1.tenor.com/m/T7L_NCdPIvAAAAAC/prime-video.gif'] },
  { id: 'hbo',        name: 'HBO Max',      color: '#8000ff', providerId: 1899, gifs: ['https://media1.tenor.com/m/pjHZN-n1kvkAAAAC/hbo-max.gif'] },
  { id: 'apple',      name: 'Apple TV+',    color: '#ffffff', providerId: 350,  gifs: ['https://media1.tenor.com/m/1FiEEnGTgUcAAAAC/apple-appletv.gif'] },
  { id: 'paramount',  name: 'Paramount+',   color: '#0064ff', providerId: 531,  gifs: ['https://media1.tenor.com/m/5kb_E-h0LmYAAAAC/paramount-plus-paramount-global.gif'] },
  { id: 'peacock',    name: 'Peacock',      color: '#f5a623', providerId: 386,  gifs: ['https://i.ibb.co/JjQMjVnd/b921ca21-fbc8-4d43-885b-62b07f814c58.gif'] },
  { id: 'crunchyroll',name: 'Crunchyroll',  color: '#f47521', providerId: 283,  gifs: ['https://media0.giphy.com/media/S7uxh9ken9NwaU5E1m/giphy.gif'] },
  { id: 'mubi',       name: 'MUBI',         color: '#00b4b4', providerId: 11,   gifs: ['https://i.postimg.cc/s2g7F0zy/mubi-opt.gif'] },
  { id: 'starz',      name: 'Starz',        color: '#000000', providerId: 43,   gifs: ['https://i.postimg.cc/3rGgnnPG/1000390458_(1).gif'] },
  { id: 'bbc',        name: 'BBC iPlayer',  color: '#ff4444', providerId: 38,   gifs: ['https://i.postimg.cc/0yYGqsp2/IMG-1294.gif'] },
  { id: 'itv',        name: 'ITV',          color: '#e4003b', providerId: 584,  gifs: ['https://i.postimg.cc/5NPngJJH/ITVXStartup-Animation.gif'] },
  { id: 'dc',         name: 'DC Studios',   color: '#0476d0', providerId: 1899, gifs: ['https://i.postimg.cc/50GVmBDm/DCStudios-Optimized.gif'] },
  { id: 'universal',  name: 'Universal',    color: '#1a1aff', providerId: 9,    gifs: ['https://i.postimg.cc/8ChLYL58/universal-(1).gif'] },
  { id: 'sony',       name: 'Sony',         color: '#003087', providerId: 1759, gifs: ['https://media1.tenor.com/m/R9g8h8RTQrMAAAAd/sony-pictures-television-logos.gif'] },
  { id: 'sky',        name: 'Sky',          color: '#0072c9', providerId: 1773, gifs: ['https://i.postimg.cc/4N7nnvWt/skygoanimation.gif'] },
  { id: 'marvel',     name: 'Marvel',       color: '#ec1d24', providerId: 337,  gifs: ['https://giffiles.alphacoders.com/127/12700.gif'] },
  { id: 'natgeo',     name: 'Nat Geo',      color: '#ffcc00', providerId: 337,  gifs: ['https://cdn.dribbble.com/userupload/28768734/file/original-ef8fb082e33363bacbbf73da8c08a2f2.gif'] },
  { id: 'hulu',       name: 'Hulu',         color: '#1ce783', providerId: 15,   gifs: ['https://nuvioapp.space/uploads/covers/c237c4b2-875e-4d54-802a-42a4316ff7ab.gif'] },
];
function getPlatformGif(id) {
  const saved = localStorage.getItem('rox_plat_gif_' + id);
  const plat = ROX_PLATFORMS.find(p => p.id === id);
  return saved || (plat ? plat.gifs[0] : '');
}

function renderPlatformsGrid() {
  const grid = document.getElementById('platformsGrid');
  if (!grid) return;
  grid.innerHTML = ROX_PLATFORMS.map(p => `
    <div class="plat-card-new" onclick="openPlatformPage('${p.id}')" style="--plat-color:${p.color}">
      <img class="plat-gif" src="${getPlatformGif(p.id)}" alt="${p.name}" loading="lazy">
      <div class="plat-name-new">${p.name}</div>
      <div class="plat-glow" style="background:${p.color}"></div>
    </div>
  `).join('');
}
function renderPlatformCustomizer() {
  const wrap = document.getElementById('platformCustomizer');
  if (!wrap) return;
  wrap.innerHTML = ROX_PLATFORMS.map(p => `
    <div class="plat-cust-item">
      <div class="plat-cust-name" style="color:${p.color}">${p.name}</div>
      <div class="plat-cust-gifs">
        ${p.gifs.map((g, i) => `
          <img src="${g}" class="plat-cust-gif ${getPlatformGif(p.id) === g ? 'selected' : ''}"
            onclick="selectPlatformGif('${p.id}','${g}',this)"
            loading="lazy">
        `).join('')}
      </div>
    </div>
  `).join('');
}

function selectPlatformGif(id, gif, el) {
  localStorage.setItem('rox_plat_gif_' + id, gif);
  el.closest('.plat-cust-gifs').querySelectorAll('.plat-cust-gif').forEach(i => i.classList.remove('selected'));
  el.classList.add('selected');
  renderPlatformsGrid();
  showToast('✅ تم تغيير GIF المنصة');
}
const ROX_BACKGROUNDS = [
  { id: 'none', name: 'بلا خلفية', icon: '⬛' },
  { id: 'stars', name: 'نجوم', icon: '✨' },
  { id: 'grid', name: 'شبكة', icon: '🔲' },
  { id: 'waves', name: 'موجات', icon: '🌊' },
  { id: 'particles', name: 'جزيئات', icon: '🔮' },
  { id: 'gradient', name: 'تدرج متحرك', icon: '🎨' },
  { id: 'img1', name: 'كوني 1', type: 'image', url: 'https://i.postimg.cc/Ss2h6Rs6/de44f31adbe78e9c0c8a3412a1fed621.jpg' },
  { id: 'img2', name: 'طبقات زرقاء', type: 'image', url: 'https://i.postimg.cc/s20zG7VF/417a1aa9056e366722d87d3715842f6c.jpg' },
  { id: 'img3', name: 'خط بنفسجي', type: 'image', url: 'https://i.postimg.cc/JhhmhPCX/dd4d3b0ed63a451fd4c792481cf0f5e3.jpg' },
  { id: 'img4', name: 'نيون بنفسجي', type: 'image', url: 'https://i.postimg.cc/Dw6nFRHv/36c8e2c03a50cecae9e8aa770c9c832f.jpg' },
  { id: 'img5', name: 'كوكب', type: 'image', url: 'https://i.postimg.cc/P5TTgd63/2df1170c3061b5577ac12d132996ac9a.jpg' },
  { id: 'img6', name: 'بنفسجي دائري', type: 'image', url: 'https://i.postimg.cc/Dyq7pScb/a90a41e6237a8c67920a6972cc77ed5c.jpg' },
  { id: 'img7', name: 'أزرق هندسي', type: 'image', url: 'https://i.postimg.cc/gJnYg4MY/c0a17b3cecec65fd70e5e1c41f0ada59.jpg' },
];

function renderBgGrid() {
  const grid = document.getElementById('bgGrid');
  if (!grid) return;
  const current = localStorage.getItem('rox_bg') || 'none';
  grid.innerHTML = ROX_BACKGROUNDS.map(b => `
    <div class="bg-option ${current === b.id ? 'selected' : ''}" onclick="applyBackground('${b.id}')">
      ${b.type === 'image'
        ? `<img src="${b.url}" style="width:100%;height:100%;object-fit:cover;border-radius:10px;position:absolute;inset:0">`
        : `<div class="bg-option-icon">${b.icon}</div>`}
      <div class="bg-option-name">${b.name}</div>
    </div>
  `).join('');
}

function applyBackground(id) {
  localStorage.setItem('rox_bg', id);
  const el = document.getElementById('roxBgCanvas');
  if (el) el.remove();
  const oldImg = document.getElementById('roxBgImg');
  if (oldImg) oldImg.remove();
  const bg = ROX_BACKGROUNDS.find(b => b.id === id);
  if (id === 'none') { renderBgGrid(); return; }
  if (bg?.type === 'image') {
    let imgBg = document.getElementById('roxBgImg');
    if (!imgBg) { imgBg = document.createElement('div'); imgBg.id = 'roxBgImg'; document.body.prepend(imgBg); }
    imgBg.style.cssText = `position:fixed;inset:0;z-index:0;pointer-events:none;background-image:url('${bg.url}');background-size:cover;background-position:center;opacity:${(parseFloat(localStorage.getItem('rox_bg_opacity'))||0.18)};transition:opacity 0.3s;`;
    renderBgGrid();
    renderBgBrightness();
    return;
  }
  const canvas = document.createElement('canvas');
  canvas.id = 'roxBgCanvas';
  canvas.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none;width:100vw;height:100vh;opacity:0.55;';
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#e50914';
  if (id === 'stars') roxBgStars(ctx, canvas, accent);
  else if (id === 'grid') roxBgGrid(ctx, canvas, accent);
  else if (id === 'waves') roxBgWaves(ctx, canvas, accent);
  else if (id === 'particles') roxBgParticles(ctx, canvas, accent);
  else if (id === 'gradient') roxBgGradient(ctx, canvas, accent);
  renderBgGrid();
}
function renderBgBrightness() {
  const old = document.getElementById('bgBrightnessCtrl');
  if (old) old.remove();
  const bg = ROX_BACKGROUNDS.find(b => b.id === (localStorage.getItem('rox_bg')||'none'));
  if (!bg || bg.type !== 'image') return;
  const op = parseFloat(localStorage.getItem('rox_bg_opacity')) || 0.18;
  const ctrl = document.createElement('div');
  ctrl.id = 'bgBrightnessCtrl';
  ctrl.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-top:14px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:12px 16px;">
      <button onclick="changeBgOpacity(-0.05)" style="width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);color:#fff;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;">−</button>
      <div style="flex:1;height:4px;background:rgba(255,255,255,0.1);border-radius:4px;overflow:hidden;">
        <div id="bgOpacityBar" style="height:100%;width:${Math.round(op/0.6*100)}%;background:var(--accent);border-radius:4px;transition:width 0.2s;"></div>
      </div>
      <button onclick="changeBgOpacity(+0.05)" style="width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);color:#fff;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;">+</button>
    </div>`;
  const grid = document.getElementById('bgGrid');
  if (grid) grid.after(ctrl);
}
function changeBgOpacity(delta) {
  let op = parseFloat(localStorage.getItem('rox_bg_opacity')) || 0.18;
  op = Math.min(0.6, Math.max(0.04, op + delta));
  localStorage.setItem('rox_bg_opacity', op.toFixed(2));
  const imgBg = document.getElementById('roxBgImg');
  if (imgBg) imgBg.style.opacity = op;
  const bar = document.getElementById('bgOpacityBar');
  if (bar) bar.style.width = Math.round(op/0.6*100) + '%';
}
function roxBgStars(ctx, canvas, accent) {
  const stars = Array.from({length: 120}, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.5 + 0.3,
    speed: Math.random() * 0.3 + 0.1,
    opacity: Math.random()
  }));
  function draw() {
    if (!document.getElementById('roxBgCanvas')) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      s.opacity += s.speed * 0.02;
      if (s.opacity > 1) s.opacity = 0;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${s.opacity * 0.8})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
}

function roxBgGrid(ctx, canvas, accent) {
  let offset = 0;
  function draw() {
    if (!document.getElementById('roxBgCanvas')) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = accent + '44';
    ctx.lineWidth = 1;
    const size = 40;
    for (let x = (offset % size) - size; x < canvas.width; x += size) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = (offset % size) - size; y < canvas.height; y += size) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }
    offset += 0.3;
    requestAnimationFrame(draw);
  }
  draw();
}

function roxBgWaves(ctx, canvas, accent) {
  let t = 0;
  function draw() {
    if (!document.getElementById('roxBgCanvas')) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      for (let x = 0; x < canvas.width; x++) {
        const y = canvas.height / 2 + Math.sin(x * 0.008 + t + i * 1.5) * (30 + i * 15);
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = accent + (i === 0 ? '33' : i === 1 ? '22' : '11');
      ctx.lineWidth = 2 - i * 0.5;
      ctx.stroke();
    }
    t += 0.02;
    requestAnimationFrame(draw);
  }
  draw();
}

function roxBgParticles(ctx, canvas, accent) {
  const pts = Array.from({length: 60}, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5,
    r: Math.random() * 2 + 1
  }));
  function draw() {
    if (!document.getElementById('roxBgCanvas')) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = accent + '66';
      ctx.fill();
    });
    pts.forEach((a, i) => pts.slice(i+1).forEach(b => {
      const d = Math.hypot(a.x-b.x, a.y-b.y);
      if (d < 100) {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = accent + Math.floor((1 - d/100) * 40).toString(16).padStart(2,'0');
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }));
    requestAnimationFrame(draw);
  }
  draw();
}

function roxBgGradient(ctx, canvas, accent) {
  let t = 0;
  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    return [r,g,b];
  }
  const [r,g,b] = hexToRgb(accent.length === 7 ? accent : '#e50914');
  function draw() {
    if (!document.getElementById('roxBgCanvas')) return;
    const grad = ctx.createRadialGradient(
      canvas.width/2 + Math.sin(t)*100, canvas.height/2 + Math.cos(t)*80, 0,
      canvas.width/2, canvas.height/2, canvas.width * 0.8
    );
    grad.addColorStop(0, `rgba(${r},${g},${b},0.15)`);
    grad.addColorStop(0.5, `rgba(${r},${g},${b},0.05)`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    t += 0.008;
    requestAnimationFrame(draw);
  }
  draw();
  }
function openThemePanel() {
  document.getElementById('profileDropdown').style.display = 'none';
  const saved = localStorage.getItem('rox_custom_color');
  if (saved) applyCustomColor(saved);
  document.getElementById('themePanel').classList.add('open');
  document.body.style.overflow = 'hidden';
  showThemeSection('themes');
}

function closeThemePanel() {
  document.getElementById('themePanel').classList.remove('open');
  document.body.style.overflow = '';
}
function showThemeHome() {
  document.querySelectorAll('.theme-panel-section').forEach(s => s.style.display = 'none');
  document.getElementById('themePanelHome').style.display = 'flex';
  document.getElementById('themePanelTitle').textContent = '⚙️ التخصيص';
  document.getElementById('themePanelBackBtn').style.display = 'none';
}

function showThemeSection(section) {
  document.querySelectorAll('.theme-panel-section').forEach(s => s.classList.remove('active-section'));
  document.querySelectorAll('.tph-btn').forEach(b => b.classList.remove('active'));
  const titles = { themes:'🎨 الثيمات', colors:'🌈 الألوان المخصصة', fonts:'🔤 الخط', platforms:'🎬 تخصيص المنصات', backgrounds:'🌌 خلفية الموقع' };
  const titleEl = document.getElementById('themePanelTitle');
  if (titleEl) titleEl.textContent = titles[section] || '';
  const el = document.getElementById('themeSection' + section.charAt(0).toUpperCase() + section.slice(1));
  if (el) el.classList.add('active-section');
  const btn = document.getElementById('tphBtn' + section.charAt(0).toUpperCase() + section.slice(1));
  if (btn) btn.classList.add('active');
  if (section === 'themes') renderThemeGrid();
  if (section === 'fonts') renderThemeGrid();
  if (section === 'platforms') renderPlatformCustomizer();
  if (section === 'backgrounds') renderBgGrid();
  if (section === 'colors') renderColorCustomizer();
}

function renderColorCustomizer() {
  const wrap = document.getElementById('colorCustomizer');
  if (!wrap) return;
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#e50914';
  wrap.innerHTML = `
    <div class="tpc-row">
      <div class="tpc-label">🎨 اللون الرئيسي</div>
      <input type="color" class="tpc-picker" value="${accent}" oninput="applyCustomColor(this.value)">
    </div>
    <div class="tpc-presets">
      ${['#e50914','#00e5ff','#a855f7','#5DD62C','#f5c518','#ff2d78','#ff6b00','#00b4b4','#3b82f6','#ec4899','#14b8a6','#f97316'].map(c => `
        <div class="tpc-preset" style="background:${c}" onclick="applyCustomColor('${c}')"></div>
      `).join('')}
    </div>
    <div class="tpc-hint">اختر لوناً من الألوان الجاهزة أو استخدم منتقي الألوان</div>
  `;
}

function applyCustomColor(color) {
  document.documentElement.style.setProperty('--accent', color);
  const r = parseInt(color.slice(1,3),16), g = parseInt(color.slice(3,5),16), b = parseInt(color.slice(5,7),16);
  document.documentElement.style.setProperty('--accent-glow', `rgba(${r},${g},${b},0.4)`);
  document.documentElement.style.setProperty('--accent-soft', `rgba(${r},${g},${b},0.1)`);
  document.documentElement.style.setProperty('--accent2', color);
  localStorage.setItem('rox_custom_color', color);
  const picker = document.querySelector('.tpc-picker');
  if (picker) picker.value = color;
}
function openFontPanel() { openThemePanel(); }

function renderThemeGrid() {
  const grid = document.getElementById('themeGrid');
  if (!grid) return;
  grid.innerHTML = ROX_THEMES.map(t => `
    <div class="theme-card ${roxCurrentTheme === t.id ? 'selected' : ''}"
         style="--theme-card-accent:${t.accent}"
         onclick="applyTheme('${t.id}')">
      <div class="theme-card-preview" style="background:${t.bg}">
        <div class="theme-card-bar"  style="background:${t.accent}"></div>
        <div class="theme-card-bar2" style="background:${t.accent}"></div>
        <div class="theme-card-dots">
          <div class="theme-card-dot" style="background:${t.bg2}"></div>
          <div class="theme-card-dot" style="background:${t.accent}"></div>
          <div class="theme-card-dot" style="background:${t.card}"></div>
        </div>
        <div class="theme-card-check">✓</div>
      </div>
      <div class="theme-card-foot" style="background:${t.bg2}">
        <div class="theme-card-name">${t.name}</div>
        <div class="theme-card-desc">${t.desc}</div>
      </div>
    </div>
  `).join('');

  const fontGrid = document.getElementById('fontGrid');
  if (!fontGrid) return;
  fontGrid.innerHTML = ROX_FONTS.map(f => `
    <div class="font-option ${roxCurrentFont === f.id ? 'selected' : ''}"
         onclick="applyFont('${f.id}')">
      <div class="font-option-preview" style="font-family:'${f.id}',sans-serif">${f.preview}</div>
      <div class="font-option-body">
        <div class="font-option-name">${f.name}</div>
        <div class="font-option-sample" style="font-family:'${f.id}',sans-serif">${f.sample}</div>
      </div>
      <div class="font-option-radio"></div>
    </div>
  `).join('');
}

function clearCache() {
  if (confirm('هل تريد مسح الكاش؟')) {
    Object.keys(localStorage).filter(k => k.startsWith('rox_cache')).forEach(k => localStorage.removeItem(k));
    alert('✅ تم مسح الكاش بنجاح');
  }
}

// تشغيل النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => { initThemeSystem(); renderPlatformsGrid(); renderBgGrid(); const savedBg = localStorage.getItem('rox_bg'); if (savedBg && savedBg !== 'none') applyBackground(savedBg); });
if (document.readyState !== 'loading') initThemeSystem();
function themeDrillDown(sub) {
  const L1 = document.getElementById('themeLevel1');
  const L2 = document.getElementById('themeLevel2');
  const cnt = document.getElementById('themeSubContent');
  if (!L1||!L2||!cnt) return;
  L1.style.opacity='0'; L1.style.transform='translateX(20px)'; L1.style.transition='all 0.25s';
  setTimeout(()=>{ L1.style.display='none'; L2.style.display='block'; L2.style.opacity='0'; L2.style.transform='translateX(-20px)'; L2.style.transition='all 0.25s';
    const titles={themes:'الثيمات',colors:'الألوان',bg:'الخلفيات',font:'الخط',platforms:'المنصات'};
    const subHtml = {
      themes:`<div class="prem-section-title">${titles.themes}</div><div class="prem-theme-grid" id="premThemeGrid2"></div>`,
      colors:`<div class="prem-section-title">${titles.colors}</div>
        <div class="prem-label">لون النيون</div>
        <div class="prem-colors-row">
          ${['#e50914','#a855f7','#22c55e','#06b6d4','#f5c518','#ff2d78','#3b82f6','#f97316','#ec4899'].map(c=>`<div class="prem-color-orb" data-color="${c}" style="--c:${c}" onclick="applyCustomColor('${c}');document.querySelectorAll('.prem-color-orb').forEach(o=>o.classList.remove('active'));this.classList.add('active')"></div>`).join('')}
        </div>
        <div class="prem-label" style="margin-top:14px">لون مخصص</div>
        <div style="display:flex;align-items:center;gap:10px;margin-top:8px">
          <input type="color" class="tpc-picker" value="#e50914" oninput="applyCustomColor(this.value)" style="width:48px;height:48px;border-radius:12px;border:none;cursor:pointer;background:none">
          <span style="font-size:12px;color:rgba(255,255,255,0.4);font-family:Tajawal">اختر أي لون تريده</span>
        </div>`,
      bg:`<div class="prem-section-title">${titles.bg}</div><div class="bg-grid-wrap" id="bgGrid"></div>`,
      font:`<div class="prem-section-title">${titles.font}</div><div class="font-grid" id="fontGrid2"></div>`,
      platforms:`<div class="prem-section-title">${titles.platforms}</div><div id="platformCustomizer2"></div>`
    };
    cnt.innerHTML = subHtml[sub]||'';
    requestAnimationFrame(()=>{ L2.style.opacity='1'; L2.style.transform='translateX(0)'; });
    if (sub==='themes'){ const g=document.getElementById('premThemeGrid2'); if(g) g.innerHTML=ROX_THEMES.map(t=>`<div class="prem-theme-card ${roxCurrentTheme===t.id?'selected':''}" onclick="applyTheme('${t.id}');document.querySelectorAll('.prem-theme-card').forEach(c=>c.classList.remove('selected'));this.classList.add('selected')" style="--theme-card-accent:${t.accent}"><div class="prem-theme-preview" style="background:${t.bg}"><div class="prem-theme-bar" style="background:${t.accent}"></div><div class="prem-theme-bar2" style="background:${t.accent}"></div></div><div class="prem-theme-foot" style="background:${t.bg2}"><div class="prem-theme-name">${t.name}</div><div class="prem-theme-desc">${t.desc}</div></div></div>`).join(''); }
    if (sub==='bg') renderBgGrid();
    if (sub==='font'){ const fg=document.getElementById('fontGrid2'); if(fg) fg.innerHTML=ROX_FONTS.map(f=>`<div class="font-option ${roxCurrentFont===f.id?'selected':''}" onclick="applyFont('${f.id}')"><div class="font-option-preview" style="font-family:'${f.id}',sans-serif">${f.preview}</div><div class="font-option-body"><div class="font-option-name">${f.name}</div><div class="font-option-sample" style="font-family:'${f.id}',sans-serif">${f.sample}</div></div><div class="font-option-radio"></div></div>`).join(''); }
    if (sub==='platforms'){ const pc=document.getElementById('platformCustomizer2'); if(pc){ pc.innerHTML=ROX_PLATFORMS.map(p=>`<div class="plat-cust-item"><div class="plat-cust-name" style="color:${p.color}">${p.name}</div><div class="plat-cust-gifs">${p.gifs.map(g=>`<img src="${g}" class="plat-cust-gif ${getPlatformGif(p.id)===g?'selected':''}" onclick="selectPlatformGif('${p.id}','${g}',this)" loading="lazy">`).join('')}</div></div>`).join(''); } }
  },250);
}
function themeBack() {
  const L1=document.getElementById('themeLevel1'); const L2=document.getElementById('themeLevel2');
  if(!L1||!L2) return;
  L2.style.opacity='0'; L2.style.transform='translateX(-20px)'; L2.style.transition='all 0.25s';
  setTimeout(()=>{ L2.style.display='none'; L1.style.display='block'; L1.style.opacity='0'; L1.style.transform='translateX(20px)'; requestAnimationFrame(()=>{ L1.style.opacity='1'; L1.style.transform='translateX(0)'; L1.style.transition='all 0.25s'; }); },250);
      }
function initPremSettings() {
  document.querySelectorAll('.prem-nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.prem-nav-item').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.prem-section').forEach(s => s.classList.add('hidden'));
      btn.classList.add('active');
      const sec = document.getElementById('psec-' + btn.dataset.sec);
      if (sec) sec.classList.remove('hidden');
    });
  });
  const user = _auth.currentUser;
  if (user) {
    const n = document.getElementById('psecName');
    const e = document.getElementById('psecEmail');
    const ec = document.getElementById('psecEmailCell');
    const img = document.getElementById('psecAvatarImg');
    const ico = document.getElementById('psecAvatarIcon');
    if (n) n.textContent = user.displayName || 'مستخدم ROX';
    if (e) e.textContent = user.email || '—';
    if (ec) ec.textContent = user.email || '—';
    if (user.photoURL && img) { img.src = user.photoURL; img.style.display = 'block'; if (ico) ico.style.display = 'none'; }
  }
  document.querySelectorAll('.prem-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.prem-mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
  document.querySelectorAll('.prem-color-orb').forEach(orb => {
    orb.addEventListener('click', () => {
      document.querySelectorAll('.prem-color-orb').forEach(o => o.classList.remove('active'));
      orb.classList.add('active');
      document.documentElement.style.setProperty('--accent', orb.dataset.color);
      document.documentElement.style.setProperty('--accent-glow', orb.dataset.color + '66');
    });
  });
  const slider = document.getElementById('radiusSlider');
  if (slider) {
    slider.addEventListener('input', () => {
      document.documentElement.style.setProperty('--radius-md', slider.value + 'px');
    });
  }
  const grid = document.getElementById('premThemeGrid');
if (grid) {
  grid.innerHTML = ROX_THEMES.map(t => `
    <div class="prem-theme-card ${roxCurrentTheme === t.id ? 'selected' : ''}" onclick="applyTheme('${t.id}');document.querySelectorAll('.prem-theme-card').forEach(c=>c.classList.remove('selected'));this.classList.add('selected')">
      <div class="prem-theme-preview" style="background:${t.bg}">
        <div class="prem-theme-bar" style="background:${t.accent}"></div>
        <div class="prem-theme-bar2" style="background:${t.accent}"></div>
      </div>
      <div class="prem-theme-foot" style="background:${t.bg2}">
        <div class="prem-theme-name">${t.name}</div>
        <div class="prem-theme-desc">${t.desc}</div>
      </div>
    </div>`).join('');
}
  // ===== SECURITY =====
const tog2FA = document.getElementById('tog2FA');
if (tog2FA) {
  tog2FA.checked = localStorage.getItem('rox_2fa') === 'true';
  tog2FA.addEventListener('change', () => {
    localStorage.setItem('rox_2fa', tog2FA.checked);
    const dot = document.getElementById('dot2FA');
    if (dot) dot.style.background = tog2FA.checked ? '#a855f7' : '';
  });
}
const saveSecBtn = document.getElementById('saveSecBtn');
if (saveSecBtn) {
  saveSecBtn.addEventListener('click', () => {
    const cur = document.getElementById('curPass')?.value;
    const nw = document.getElementById('newPass')?.value;
    if (!cur || !nw) { roxToast('أدخل كلمة المرور الحالية والجديدة', '#ef4444'); return; }
    if (nw.length < 6) { roxToast('كلمة المرور يجب أن تكون 6 أحرف على الأقل', '#ef4444'); return; }
    const user = _auth.currentUser;
    if (!user) return;
    const cred = firebase.auth.EmailAuthProvider.credential(user.email, cur);
    user.reauthenticateWithCredential(cred).then(() => user.updatePassword(nw)).then(() => {
      roxToast('تم تغيير كلمة المرور بنجاح', '#a855f7');
    }).catch(() => roxToast('كلمة المرور الحالية غير صحيحة', '#ef4444'));
  });
}

// ===== NOTIFICATIONS TOGGLES =====
['togEpisodes','togMatches','togNew'].forEach(id => {
  const el = document.getElementById(id);
  if (!el) return;
  el.checked = localStorage.getItem('rox_' + id) !== 'false';
  el.addEventListener('change', () => localStorage.setItem('rox_' + id, el.checked));
});

// ===== ANIMATIONS TOGGLE =====
const togAnim = document.getElementById('togAnim');
if (togAnim) {
  togAnim.checked = localStorage.getItem('rox_anim') !== 'false';
  document.documentElement.classList.toggle('no-anim', !togAnim.checked);
  togAnim.addEventListener('change', () => {
    localStorage.setItem('rox_anim', togAnim.checked);
    document.documentElement.classList.toggle('no-anim', !togAnim.checked);
  });
}

// ===== RADIUS SLIDER SAVE =====
if (slider) {
  const savedRadius = localStorage.getItem('rox_radius');
  if (savedRadius) { slider.value = savedRadius; document.documentElement.style.setProperty('--radius-md', savedRadius + 'px'); }
  slider.addEventListener('change', () => localStorage.setItem('rox_radius', slider.value));
}

// ===== COLOR ORB SAVE =====
const savedColor = localStorage.getItem('rox_accent');
if (savedColor) {
  document.documentElement.style.setProperty('--accent', savedColor);
  document.querySelectorAll('.prem-color-orb').forEach(o => {
    if (o.dataset.color === savedColor) o.classList.add('active');
    else o.classList.remove('active');
  });
}
document.querySelectorAll('.prem-color-orb').forEach(orb => {
  orb.addEventListener('click', () => localStorage.setItem('rox_accent', orb.dataset.color));
});

// ===== PING TEST =====
const pingBtn = document.getElementById('pingBtn');
const pingResult = document.getElementById('pingResult');
if (pingBtn && pingResult) {
  pingBtn.addEventListener('click', async () => {
    pingResult.textContent = 'جاري القياس...';
    const t0 = performance.now();
    try {
      await fetch('https://vidsrc-embed.ru/embed/movie/385687', { mode: 'no-cors', cache: 'no-store' });
    } catch(e) {}
    const ms = Math.round(performance.now() - t0);
    const color = ms < 200 ? '#22c55e' : ms < 500 ? '#eab308' : '#ef4444';
    pingResult.innerHTML = `<span style="color:${color};font-weight:900;font-size:18px;text-shadow:0 0 10px ${color}">${ms}ms</span>`;
  });
}

// ===== SIDEBAR FADE TRANSITIONS =====
document.querySelectorAll('.prem-section').forEach(s => {
  s.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
});
document.querySelectorAll('.prem-nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.prem-section').forEach(s => {
      s.style.opacity = '0'; s.style.transform = 'translateY(8px)';
    });
    setTimeout(() => {
      const sec = document.getElementById('psec-' + btn.dataset.sec);
      if (sec) { sec.style.opacity = '1'; sec.style.transform = 'translateY(0)'; }
    }, 200);
  });
});
}
async function openActorPage(personId) {
  const page = document.getElementById('actorPage');
  if (!page) return;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  page.classList.add('active');
  document.getElementById('heroSection')?.style && (document.getElementById('heroSection').style.display = 'none');
  page.innerHTML = '<div class="ap-loading"><div class="ap-spinner"></div></div>';
  window.scrollTo(0, 0);
  try {
    const base = `https://api.themoviedb.org/3/person/${personId}`;
    const key = `?api_key=${CONFIG.TMDB_KEY}&language=ar-SA`;
    const [info, credits, ext] = await Promise.all([
      fetch(base + key).then(r => r.json()),
      fetch(base + `/combined_credits` + key).then(r => r.json()),
      fetch(base + key.replace('ar-SA','en-US')).then(r => r.json())
    ]);
    const img = info.profile_path ? `https://image.tmdb.org/t/p/w500${info.profile_path}` : CONFIG.IMAGES.PLACEHOLDER;
    const name = info.name || '';
    const bio = info.biography || ext.biography || 'لا توجد سيرة ذاتية متاحة.';
    const bday = info.birthday || '';
    const place = info.place_of_birth || '';
    const dept = info.known_for_department || '';
    const now = new Date().toISOString().slice(0,10);
    const allMovies = (credits.cast||[]).filter(m => m.media_type==='movie' && m.poster_path).sort((a,b)=>(b.release_date||'').localeCompare(a.release_date||''));
    const pastMovies = allMovies.filter(m => (m.release_date||'9999') <= now);
    const upMovies  = allMovies.filter(m => (m.release_date||'9999') > now);
    const allTV     = (credits.cast||[]).filter(m => m.media_type==='tv' && m.poster_path).sort((a,b)=>(b.first_air_date||'').localeCompare(a.first_air_date||''));
    const pastTV    = allTV.filter(m => (m.first_air_date||'9999') <= now);
    const upTV      = allTV.filter(m => (m.first_air_date||'9999') > now);
    const buildCard = (m, type, isUp) => {
      const poster = `https://image.tmdb.org/t/p/w342${m.poster_path}`;
      const title = m.title || m.name || '';
      const year = (m.release_date || m.first_air_date || '').slice(0,4);
      const rat = m.vote_average ? m.vote_average.toFixed(1) : '';
      return `<div class="ap-card" onclick="openDetail(${m.id},'${type}')">
        <div class="ap-card-wrap">
          <img class="ap-card-img" src="${poster}" loading="lazy" onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'">
          ${isUp ? '<span class="ap-soon-badge">قريباً</span>' : ''}
          ${rat ? `<span class="ap-rat">${rat}</span>` : ''}
          <div class="ap-card-hover">▶</div>
        </div>
        <div class="ap-card-title">${title}</div>
        ${year ? `<div class="ap-card-year">${year}</div>` : ''}
      </div>`;
    };
    const buildSection = (title, items, type, isUp) => items.length ? `
      <div class="ap-sub-section">
        <div class="ap-sub-title">${title} <span class="ap-count">${items.length}</span></div>
        <div class="ap-cards-row">${items.slice(0,20).map(m => buildCard(m, type, isUp)).join('')}</div>
      </div>` : '';
    const ageStr = bday ? (() => { const y = new Date().getFullYear() - parseInt(bday); return `${y} سنة`; })() : '';
    page.innerHTML = `
    <div class="ap-wrap">
      <div class="ap-bg-blur" style="background-image:url('${img}')"></div>
      <div class="ap-bg-dim"></div>
      <button class="ap-back-btn" onclick="goBack()"><i class="ri-arrow-right-line"></i> رجوع</button>
      <div class="ap-hero">
        <div class="ap-photo-ring"><img class="ap-photo" src="${img}" onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'"></div>
        <div class="ap-hero-info">
          <div class="ap-name">${name}</div>
          ${dept ? `<div class="ap-dept"><i class="ri-movie-2-line"></i> ${dept}</div>` : ''}
          <div class="ap-meta-row">
            ${bday ? `<span class="ap-meta-chip"><i class="ri-cake-2-line"></i> ${bday}${ageStr?' · '+ageStr:''}</span>` : ''}
            ${place ? `<span class="ap-meta-chip"><i class="ri-map-pin-2-line"></i> ${place}</span>` : ''}
          </div>
        </div>
      </div>
      ${bio ? `<div class="ap-bio-section"><div class="ap-bio-title"><i class="ri-article-line"></i> السيرة الذاتية</div><div class="ap-bio" id="apBio">${bio.slice(0,400)}${bio.length>400?`<span id="apBioMore" style="display:none">${bio.slice(400)}</span> <span class="ap-bio-more-btn" onclick="document.getElementById('apBioMore').style.display='inline';this.style.display='none'">... المزيد</span>`:''}</div></div>` : ''}
      <div class="ap-tabs-bar">
        <button class="ap-tab active" onclick="apSwitchTab('movies',this)"><i class="ri-film-line"></i> الأفلام</button>
        <button class="ap-tab" onclick="apSwitchTab('tv',this)"><i class="ri-tv-2-line"></i> المسلسلات</button>
      </div>
      <div class="ap-tab-content" id="apTabMovies">
        ${buildSection('الأفلام السابقة', pastMovies, 'movie', false)}
        ${buildSection('قريباً في السينما', upMovies, 'movie', true)}
        ${!pastMovies.length && !upMovies.length ? '<p class="ap-empty">لا توجد أفلام مسجلة</p>' : ''}
      </div>
      <div class="ap-tab-content" id="apTabTv" style="display:none">
        ${buildSection('المسلسلات السابقة', pastTV, 'tv', false)}
        ${buildSection('مسلسلات قادمة', upTV, 'tv', true)}
        ${!pastTV.length && !upTV.length ? '<p class="ap-empty">لا توجد مسلسلات مسجلة</p>' : ''}
      </div>
    </div>`;
  } catch(e) {
    page.innerHTML = `<button class="ap-back-btn" onclick="goBack()"><i class="ri-arrow-right-line"></i> رجوع</button><p style="color:#fff;text-align:center;padding:40px">حدث خطأ في تحميل البيانات</p>`;
  }
}
function apSwitchTab(tab, btn) {
  document.querySelectorAll('.ap-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('apTabMovies').style.display = tab === 'movies' ? 'block' : 'none';
  document.getElementById('apTabTv').style.display     = tab === 'tv'     ? 'block' : 'none';
}
document.addEventListener('scroll', () => {
  document.querySelectorAll('.ghub-gif, .platform-card img').forEach(el => {
    const rect = el.closest('.ghub-card, .platform-card').getBoundingClientRect();
    const center = rect.left + rect.width / 2;
    const screenCenter = window.innerWidth / 2;
    const offset = (center - screenCenter) / screenCenter;
    el.style.transform = `scale(1.15) translateX(${offset * 12}px)`;
  });
}, { passive: true });
