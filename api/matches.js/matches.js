export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const today = new Date().toISOString().slice(0,10);
  const tomorrow = new Date(Date.now()+86400000).toISOString().slice(0,10);
  try {
    const r = await fetch(
      `https://api.football-data.org/v4/matches?dateFrom=${today}&dateTo=${tomorrow}&competitions=PL,PD,SA,BL1,FL1,CL,EL`,
      { headers: { 'X-Auth-Token': '161287f676394fec817e8056efda8b9b' } }
    );
    const data = await r.json();
    res.status(200).json(data);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
