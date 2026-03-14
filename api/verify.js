const { getDB } = require('../lib/db')

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin',  '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' })

  const { key } = req.query
  if (!key?.trim()) return res.status(400).json({ ok: false, error: 'Key is required' })

  try {
    const db      = await getDB()
    const session = await db.collection('sessions').findOne({ key: key.trim() })
    if (!session) return res.status(404).json({ ok: false, error: 'Session not found. Check your key or register via Discord.' })

    // Touch last_access
    await db.collection('sessions').updateOne({ key: key.trim() }, { $set: { lastAccess: new Date() } })

    return res.status(200).json({
      ok:   true,
      data: {
        key:         session.key,
        displayName: session.displayName,
        discordId:   session.discordId,
        plan:        session.plan,
        createdAt:   session.createdAt,
      }
    })
  } catch (e) {
    console.error('[verify]', e)
    return res.status(500).json({ ok: false, error: 'Server error' })
  }
}
