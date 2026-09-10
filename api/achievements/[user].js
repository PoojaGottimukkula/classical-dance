export default function handler(req, res) {
  // Not persistent per-instance; return empty array by default for demo
  return res.status(200).json([]);
}
