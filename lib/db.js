const { MongoClient } = require('mongodb')

const URI    = process.env.MONGODB_URI
const DB     = process.env.MONGODB_DB || 'waveboard'

let client = null
let db     = null

async function getDB() {
  if (db) return db
  if (!URI) throw new Error('MONGODB_URI env var is not set')
  client = new MongoClient(URI, { maxPoolSize: 10 })
  await client.connect()
  db = client.db(DB)

  // Ensure indexes
  await db.collection('sessions').createIndex({ key: 1 },       { unique: true })
  await db.collection('sessions').createIndex({ discordId: 1 }, { unique: true })

  return db
}

module.exports = { getDB }
