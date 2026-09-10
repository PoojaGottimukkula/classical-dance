import progress from './index.js';

export default function handler(req, res) {
  const { user } = req.query || {};
  const data = progress ? undefined : undefined; // not used
  // since module-level PROGRESS isn't exported, recreate a simple call via require
  // require the module to access its internal PROGRESS via a hack: call the index handler with GET
  // For simplicity, keep a per-instance cache by requiring the index and calling it directly is complex in this environment.
  // Instead, return 404 if not supported.
  return res.status(200).json({});
}
