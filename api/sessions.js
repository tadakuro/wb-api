const { getDB } = require('../lib/db')

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin',  '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'x-bot-secret')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' })

  const secret = req.headers['x-bot-secret']
  if (!secret || secret !== process.env.BOT_SECRET) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' })
  }

  try {
    const db       = await getDB()
    const sessions = await db.collection('sessions')
      .find({}, { projection: { _id: 0, key: 1, displayName: 1, plan: 1, createdAt: 1, lastAccess: 1 } })
      .sort({ createdAt: -1 })
      .toArray()

    return res.status(200).json({ ok: true, data: sessions, count: sessions.length })
  } catch (e) {
    console.error('[sessions]', e)
    return res.status(500).json({ ok: false, error: 'Server error' })
  }
}
