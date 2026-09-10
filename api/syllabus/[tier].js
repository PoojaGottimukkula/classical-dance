import syllabus from './index.js';

export default function handler(req, res) {
  const { tier } = req.query || {};
  const data = syllabus ? JSON.parse(JSON.stringify(syllabus)) : null;
  if (!data) return res.status(500).json({ error: 'Syllabus not available' });
  const t = (data.tiers || []).find(x => x.id === tier);
  if (!t) return res.status(404).json({ error: 'Tier not found' });
  res.status(200).json(t);
}
