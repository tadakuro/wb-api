const { getDB } = require('../lib/db')

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

function generateKey() {
  let rand = ''
  for (let i = 0; i < 12; i++) rand += CHARS[Math.floor(Math.random() * CHARS.length)]
  return `SK-${rand}-${new Date().getFullYear()}`
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin',  '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-bot-secret')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' })

  // Bot secret check — only your Discord bot can call this
  const secret = req.headers['x-bot-secret']
  if (!secret || secret !== process.env.BOT_SECRET) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' })
  }

  const { discordId, displayName } = req.body
  if (!discordId || !displayName) {
    return res.status(400).json({ ok: false, error: 'discordId and displayName are required' })
  }

  try {
    const db = await getDB()

    // Check if already registered
    const existing = await db.collection('sessions').findOne({ discordId })
    if (existing) {
      return res.status(200).json({ ok: true, data: existing, alreadyExists: true })
    }

    // Create new session
    const session = {
      key:         generateKey(),
      displayName: displayName.trim(),
      discordId:   discordId.trim(),
      plan:        'free',
      createdAt:   new Date(),
      lastAccess:  null,
    }

    await db.collection('sessions').insertOne(session)

    return res.status(201).json({ ok: true, data: session })
  } catch (e) {
    console.error('[register]', e)
    return res.status(500).json({ ok: false, error: 'Server error' })
  }
}
