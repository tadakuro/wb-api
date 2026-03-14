module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()

  res.status(200).json({
    ok:        true,
    version:   '1.0.0',
    status:    'online',
    timestamp: new Date().toISOString(),
  })
}
