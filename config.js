// ============================================================
//   Cinema-ROX — CONFIG.JS
//   الدستور الرسمي للموقع | النسخة 2.0
//   ⚠️  لا تُعدِّل هذا الملف إلا من هنا — كل الموقع يتبعه
// ============================================================

const CONFIG = Object.freeze({

  // ─────────────────────────────────────────
  //  🔑  مفاتيح API
  // ─────────────────────────────────────────
  KEYS: Object.freeze({
    TMDB    : '943bac496146cd6404017535d3c0e8ec',
    OMDB    : '629bc3c5',
    FANART  : '06c3be40269e45894e300cddff3950bc',
    YOUTUBE : 'AIzaSyC14y1pNjfqbP8h0eMYLynl_XIi87yXyis',
    TRAKT   : '11ce43a6882f1da18a6f875a07d2a863ee62b1a7e3bd1d00a64f7a9fd8759301',
    NEWS    : '7451bf041d1e4011a57e520ebba343e8',
   GNEWS_KEY: '22923d9dcfadf4899be2864da3cba05b',
  }),
HERO: Object.freeze({
    LIMIT         : 5,
    AUTOPLAY_MS   : 6500,
    TRANSITION_MS : 400,
    POSTER_SIZE   : 'POSTER_XL',
    BACKDROP_SIZE : 'BACKDROP',
  }),
  // ─────────────────────────────────────────
  //  🌐  روابط قواعد البيانات (Base URLs)
  // ─────────────────────────────────────────
  API: Object.freeze({
    TMDB_BASE   : 'https://api.themoviedb.org/3',
    OMDB_BASE   : 'https://www.omdbapi.com',
    TRAKT_BASE  : 'https://api.trakt.tv',
    FANART_BASE : 'https://webservice.fanart.tv/v3',
    JIKAN_BASE  : 'https://api.jikan.moe/v4',
    NEWS_BASE   : 'https://newsapi.org/v2',
  }),

  // ─────────────────────────────────────────
  //  🖼️  مسارات الصور
  // ─────────────────────────────────────────
  IMAGES: Object.freeze({
    POSTER_SM   : 'https://image.tmdb.org/t/p/w185',
    POSTER_MD   : 'https://image.tmdb.org/t/p/w342',
    POSTER_LG   : 'https://image.tmdb.org/t/p/w780',
    POSTER_XL   : 'https://image.tmdb.org/t/p/original',
    BACKDROP    : 'https://image.tmdb.org/t/p/original',
    ORIGINAL    : 'https://image.tmdb.org/t/p/original',
    PLACEHOLDER : 'https://placehold.co/342x513/111/555?text=ROX',
    STILL_SM    : 'https://image.tmdb.org/t/p/w300',
    STILL_MD    : 'https://image.tmdb.org/t/p/w780',
    PROFILE     : 'https://image.tmdb.org/t/p/w342',
  }),

  // ─────────────────────────────────────────
  //  🔍  إعدادات البحث
  // ─────────────────────────────────────────
  SEARCH: Object.freeze({
    MIN_CHARS         : 2,       // أقل عدد أحرف لتفعيل البحث
    DEBOUNCE_MS       : 400,     // تأخير البحث التلقائي (مللي ثانية)
    MAX_RESULTS       : 10,      // أقصى عدد نتائج في القائمة
    INCLUDE_ADULT     : false,   // إخفاء المحتوى الكبار
  }),
  VIDEO: Object.freeze({
    YOUTUBE_EMBED    : 'https://www.youtube.com/embed/',
    TMDB_VIDEO_PATH  : '/videos',
    YOUTUBE_PARAMS   : '?autoplay=0&rel=0&modestbranding=1&cc_load_policy=0',
    YOUTUBE_NOCOOKIE : 'https://www.youtube-nocookie.com/embed/',
    PROXY: 'https://rox-proxy.vercel.app/fetch?url=',
    TRAILER_TYPE     : 'Trailer',
  }),
  SERVERS: Object.freeze({
    SRV1 : { mov: 'https://vidsrc-embed.ru/embed/movie/',             tv: 'https://vidsrc-embed.ru/embed/tv/'              },
    SRV2 : { mov: 'https://vidsrc-embed.su/embed/movie/',             tv: 'https://vidsrc-embed.su/embed/tv/'              },
    SRV3 : { mov: 'https://vidlink.pro/movie/',                       tv: 'https://vidlink.pro/tv/'                        },
    SRV4 : { mov: 'https://www.2embed.online/embed/movie/',           tv: 'https://www.2embed.online/embed/tv/'            },
    SRV5 : { mov: 'https://vidsrc.icu/embed/movie/',                  tv: 'https://vidsrc.icu/embed/tv/'                   },
    SRV6 : { mov: 'https://moviesapi.club/movie/',                    tv: 'https://moviesapi.club/tv/'                     },
    SRV7 : { mov: 'https://player.smashy.stream/movie/',              tv: 'https://player.smashy.stream/tv/'               },
    SRV8 : { mov: 'https://multiembed.mov/?video_id=',                tv: 'https://multiembed.mov/directstream.php?video_id=' },
    SRV9 : { mov: 'https://vidsrc.cc/v2/embed/movie/',                tv: 'https://vidsrc.cc/v2/embed/tv/'                 },
    SRV10: { mov: 'https://www.NontonGo.win/embed/movie/',            tv: 'https://www.NontonGo.win/embed/tv/'             },
    SRV11: { mov: 'https://player.videasy.net/movie/',                tv: 'https://player.videasy.net/tv/'                 },
    SRV12: { mov: 'https://vidsrc.ru/movie/',                         tv: 'https://vidsrc.ru/tv/'                          },
    SRV13: { mov: 'https://www.2embed.cc/embed/',                     tv: 'https://www.2embed.cc/embedtv/'                 },
    SRV14: { mov: 'https://player.vidzee.wtf/embed/movie/',           tv: 'https://player.vidzee.wtf/embed/tv/'            },
    SRV15: { mov: 'https://vidfast.pro/movie/',                       tv: 'https://vidfast.pro/tv/'                        },
    SRV16: { mov: 'https://player.vidify.top/embed/movie/',           tv: 'https://player.vidify.top/embed/tv/'            },
    SRV17: { mov: 'https://vidrock.net/movie/',                       tv: 'https://vidrock.net/tv/'                        },
    SRV18: { mov: 'https://vidsrc.to/embed/movie/',                   tv: 'https://vidsrc.to/embed/tv/'                    },
    SRV19: { mov: 'https://vidsrc.mov/embed/movie/',                  tv: 'https://vidsrc.mov/embed/tv/'                   },
    SRV20: { mov: 'https://vidsrc.online/embed/movie/',               tv: 'https://vidsrc.online/embed/tv/'                },
    SRV21: { mov: 'https://111movies.net/movie/',                     tv: 'https://111movies.net/tv/'                      },
    SRV22: { mov: 'https://vidsrc.me/embed/movie/',                   tv: 'https://vidsrc.me/embed/tv/'                    },
    SRV23: { mov: 'https://autoembed.cc/movie/tmdb/',                 tv: 'https://autoembed.cc/tv/tmdb/'                  },
    SRV24: { mov: 'https://embed.su/embed/movie/',                    tv: 'https://embed.su/embed/tv/'                     },
    SRV25: { mov: 'https://vidsrc.dev/embed/movie/',                  tv: 'https://vidsrc.dev/embed/tv/'                   },
    SRV26: { mov: 'https://autoembed.co/movie/tmdb/',                 tv: 'https://autoembed.co/tv/tmdb/'                  },
    SRV27: { mov: 'https://player.autoembed.cc/embed/movie/',         tv: 'https://player.autoembed.cc/embed/tv/'          },
    SRV28: { mov: 'https://hnembed.com/embed/movie/',                 tv: 'https://hnembed.com/embed/tv/'                  },
    SRV29: { mov: 'https://superembed.stream/embed/movie/',           tv: 'https://superembed.stream/embed/tv/'            },
    SRV30: { mov: 'https://vidsrc.xyz/embed/movie/',                  tv: 'https://vidsrc.xyz/embed/tv/'                   },
    SRV31: { mov: 'https://2embed.org/embed/movie/',                  tv: 'https://2embed.org/embed/tv/'                   },
    SRV32: { mov: 'https://player.vidsrc.nl/embed/movie/',            tv: 'https://player.vidsrc.nl/embed/tv/'             },
    SRV33: { mov: 'https://embed.smashystream.com/playere.php?tmdb=', tv: 'https://embed.smashystream.com/playere.php?tmdb=' },
    SRV34: { mov: 'https://vidrock.ru/movie/',                        tv: 'https://vidrock.ru/tv/'                         },
    SRV35: { mov: 'https://player.videasy.net/movie/',                tv: 'https://player.videasy.net/tv/'                 },
    SRV36: { mov: 'https://vidsrcme.ru/embed/movie/',                  tv: 'https://vidsrcme.ru/embed/tv/'                  },
    SRV37: { mov: 'https://vsrc.su/embed/movie/',                      tv: 'https://vsrc.su/embed/tv/'                      },
    SRV38: { mov: 'https://vidsrc.in/embed/movie/',                    tv: 'https://vidsrc.in/embed/tv/'                    },
    SRV39: { mov: 'https://vidsrc.pm/embed/movie/',                    tv: 'https://vidsrc.pm/embed/tv/'                    },
    SRV40: { mov: 'https://vidsrc.net/embed/movie/',                   tv: 'https://vidsrc.net/embed/tv/'                   },
    SRV_NHD: { mov: 'https://nhdapi.com/embed/movie/',                 tv: 'https://nhdapi.com/embed/tv/'                   },
    SRV_VIDLUX: { mov: 'https://vidlux.xyz/embed/movie/',              tv: 'https://vidlux.xyz/embed/tv/'                   },
    SRV_EZV: { mov: 'https://ezvidapi.com/embed/movie/',               tv: 'https://ezvidapi.com/embed/tv/'                 },
    SRV_SV: { mov: 'https://streamvaultsrc.click/embed/movie/',        tv: 'https://streamvaultsrc.click/embed/tv/'         },
    SRV_VP: { mov: 'https://player.vidplus.to/embed/movie/',           tv: 'https://player.vidplus.to/embed/tv/'            },
  }),
  
  // ─────────────────────────────────────────
  //  🎬  إعدادات عرض المحتوى
  // ─────────────────────────────────────────
  DISPLAY: Object.freeze({
    POSTERS_PER_ROW   : 6,       // عدد البوسترات في كل صف
    POSTERS_IN_SEARCH : 20,      // عدد البوسترات في نتائج البحث
    TRENDING_LIMIT    : 20,      // عدد عناصر قسم الرائج
    ANIMATION_SPEED   : 300,     // سرعة الأنيميشن (مللي ثانية)
    LAZY_LOAD         : true,    // تحميل الصور عند الظهور فقط
  }),

  // ─────────────────────────────────────────
  //  🌍  إعدادات اللغة والمنطقة
  // ─────────────────────────────────────────
  LOCALE: Object.freeze({
    DEFAULT_LANG   : 'ar',       // اللغة الافتراضية
    FALLBACK_LANG  : 'en',       // لغة بديلة إذا لم تتوفر الترجمة
    REGION         : 'SA',       // المنطقة (تؤثر على ترتيب النتائج)
    DATE_FORMAT    : 'ar-SA',    // تنسيق التواريخ
    RTL            : true,       // اتجاه النص من اليمين لليسار
  }),

  // ─────────────────────────────────────────
  //  🎨  إعدادات الثيم والواجهة
  // ─────────────────────────────────────────
  THEME: Object.freeze({
    DEFAULT         : 'dark',            // الثيم الافتراضي: 'dark' | 'light'
    ACCENT_COLOR    : '#e50914',         // اللون المميز (أحمر Netflix-style)
    SECONDARY_COLOR : '#f5c518',         // اللون الثانوي (ذهبي IMDb-style)
    FONT_FAMILY     : 'Cairo, sans-serif',
    ENABLE_BLUR     : true,              // تأثير الضبابية في الخلفية
    ENABLE_PARTICLES: false,             // جسيمات متحركة في الخلفية
  }),

  // ─────────────────────────────────────────
  //  ⚡  إعدادات الأداء والكاش
  // ─────────────────────────────────────────
  PERFORMANCE: Object.freeze({
    CACHE_DURATION_MIN : 30,     // مدة الكاش بالدقائق
    MAX_CACHE_ITEMS    : 100,    // أقصى عدد عناصر في الكاش
    ENABLE_CACHE       : true,
    REQUEST_TIMEOUT_MS : 8000,   // مهلة انتظار الطلبات
  }),

  // ─────────────────────────────────────────
  //  ℹ️  معلومات الموقع
  // ─────────────────────────────────────────
  APP: Object.freeze({
    NAME        : 'Cinema-ROX',
    VERSION     : '2.0.0',
    DESCRIPTION : 'موقع أفلام ومسلسلات بمستوى عالمي',
    AUTHOR      : 'Cinema-ROX Team',
  }),
  
NEWS: Object.freeze({
    PROXY  : 'https://api.rss2json.com/v1/api.json?rss_url=',
    CINEMA : 'https://www.aljazeera.net/rss/culture-arts',
    ANIME  : 'https://myanimelist.net/rss/news.xml',
  }),
  FOOTBALL: Object.freeze({
    FD_KEY: '161287f676394fec817e8056efda8b9b',
    FD_BASE: 'https://api.football-data.org/v4',
    APIF_KEY: '4892914a1c196a558042c078efd1ed8a44b177542f29256b021de759f5d1e0aa',
    APIF_BASE: 'https://v3.football.api-sports.io',
  }),
});

// ─────────────────────────────────────────
//  🛠️  دوال مساعدة (Helpers)
// ─────────────────────────────────────────

/**
 * يبني رابط صورة TMDB بالحجم المطلوب
 * @param {string} path   - مسار الصورة من TMDB
 * @param {string} size   - الحجم: 'SM' | 'MD' | 'LG' | 'XL' | 'BACKDROP' | 'ORIGINAL'
 * @returns {string}
 */
function buildImageURL(path, size = 'LG') {
  if (!path) return CONFIG.IMAGES.PLACEHOLDER;
  const base = CONFIG.IMAGES[size] || CONFIG.IMAGES.POSTER_LG;
  return `${base}${path}`;
}

/**
 * يبني رابط TMDB API كاملاً مع المفتاح واللغة
 * @param {string} endpoint  - مثال: '/movie/popular'
 * @param {Object} params    - بارامترات إضافية
 * @returns {string}
 */
function buildTMDBUrl(endpoint, params = {}) {
  const url = new URL(`${CONFIG.API.TMDB_BASE}${endpoint}`);
  url.searchParams.set('api_key', CONFIG.KEYS.TMDB);
  url.searchParams.set('language', 'en-US');
url.searchParams.set('include_image_language', 'en,null');
  url.searchParams.set('region',   CONFIG.LOCALE.REGION);
  for (const [key, val] of Object.entries(params)) {
    url.searchParams.set(key, val);
  }
  return url.toString();
}
