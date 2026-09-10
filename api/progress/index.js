let PROGRESS = {};

export default function handler(req, res) {
  if (req.method === 'POST') {
    // Expect form-encoded fields: user_id, lesson, progress
    const body = req.body || {};
    // support JSON body or urlencoded
    const user_id = body.user_id || body.userId || req.query.user_id;
    const lesson = body.lesson || req.query.lesson;
    const progress = parseFloat(body.progress || req.query.progress || 0);
    if (!user_id || !lesson) return res.status(400).json({ error: 'user_id and lesson required' });
    const user = PROGRESS[user_id] || {};
    user[lesson] = { progress };
    PROGRESS[user_id] = user;
    return res.status(200).json({ ok: true, progress: PROGRESS[user_id] });
  }
  // GET returns all progress (useful for demo)
  return res.status(200).json(PROGRESS);
}
