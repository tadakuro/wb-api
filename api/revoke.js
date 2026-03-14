const { getDB } = require('../lib/db')

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin',  '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-bot-secret')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' })

  const secret = req.headers['x-bot-secret']
  if (!secret || secret !== process.env.BOT_SECRET) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' })
  }

  const { discordId } = req.body
  if (!discordId) return res.status(400).json({ ok: false, error: 'discordId required' })

  try {
    const db     = await getDB()
    const result = await db.collection('sessions').deleteOne({ discordId })

    if (result.deletedCount === 0) {
      return res.status(404).json({ ok: false, error: 'Session not found' })
    }

    return res.status(200).json({ ok: true, message: 'Session revoked' })
  } catch (e) {
    console.error('[revoke]', e)
    return res.status(500).json({ ok: false, error: 'Server error' })
  }
}
