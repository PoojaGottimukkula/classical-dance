let ACH = {};

export default function handler(req, res) {
  if (req.method === 'POST') {
    const body = req.body || {};
    const user_id = body.user_id || body.userId || req.query.user_id;
    const achievement = body.achievement || req.query.achievement;
    if (!user_id || !achievement) return res.status(400).json({ error: 'user_id and achievement required' });
    const arr = ACH[user_id] || [];
    if (!arr.includes(achievement)) arr.push(achievement);
    ACH[user_id] = arr;
    return res.status(200).json({ ok: true, achievements: arr });
  }
  return res.status(200).json(ACH);
}
