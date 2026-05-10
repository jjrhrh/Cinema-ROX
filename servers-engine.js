const QUICK_SERVERS = {
  anime: [
    { label: '1', url: (id, s, e) => `https://vidsrc-embed.ru/embed/tv/${id}/${s}/${e}` },
    { label: '2', url: (id, s, e) => `https://vidsrc.dev/embed/tv/${id}/${s}/${e}` },
    { label: '3', url: (id, s, e) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}` },
    { label: '4', url: (id, s, e) => `https://vidsrc.cc/v2/embed/tv/${id}/${s}/${e}` },
    { label: '5', url: (id, s, e) => `https://vidlink.pro/tv/${id}/${s}/${e}` },
  ],
  tv: [
    { label: '1', url: (id, s, e) => `https://vidsrc-embed.ru/embed/tv/${id}/${s}/${e}` },
    { label: '2', url: (id, s, e) => `https://vidsrc.dev/embed/tv/${id}/${s}/${e}` },
    { label: '3', url: (id, s, e) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}` },
    { label: '4', url: (id, s, e) => `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1&s=${s}&e=${e}` },
    { label: '5', url: (id, s, e) => `https://embed.su/embed/tv/${id}/${s}/${e}` },
  ],
  movie: [
    { label: '1', url: (id) => `https://vidsrc-embed.ru/embed/movie/${id}` },
    { label: '2', url: (id) => `https://vidsrc.dev/embed/movie/${id}` },
    { label: '3', url: (id) => `https://vidsrc.to/embed/movie/${id}` },
    { label: '4', url: (id) => `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1` },
    { label: '5', url: (id) => `https://embed.su/embed/movie/${id}` },
  ],
};
