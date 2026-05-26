import express from 'express';
const app = express();
app.get('/api/stream', (req, res) => handler(req, res));
app.listen(process.env.PORT || 3000);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  return res.status(200).json({ sources: [] });
}
