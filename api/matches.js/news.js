export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const r = await fetch(
      `https://gnews.io/api/v4/search?q=football+soccer&lang=en&max=20&sortby=publishedAt&apikey=22923d9dcfadf4899be2864da3cba05b`
    );
    const data = await r.json();
    res.status(200).json(data);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
