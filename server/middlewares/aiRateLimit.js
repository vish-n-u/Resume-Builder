// Simple in-memory per-user rate limiter for AI endpoints.
// Limits are per server instance; move to Redis if the server is scaled horizontally.

const WINDOW_MS = 60 * 60 * 1000 // 1 hour
const MAX_REQUESTS = Number(process.env.AI_RATE_LIMIT_PER_HOUR) || 60

const hits = new Map() // userId -> array of request timestamps

const aiRateLimit = (req, res, next) => {
    const key = req.userId || req.ip
    const now = Date.now()
    const recent = (hits.get(key) || []).filter(t => now - t < WINDOW_MS)

    if (recent.length >= MAX_REQUESTS) {
        const retryAfterSec = Math.ceil((recent[0] + WINDOW_MS - now) / 1000)
        res.set('Retry-After', String(retryAfterSec))
        return res.status(429).json({ message: `AI usage limit reached. Please try again in ${Math.ceil(retryAfterSec / 60)} minutes.` })
    }

    recent.push(now)
    hits.set(key, recent)
    next()
}

// Drop idle users so the map doesn't grow forever
setInterval(() => {
    const now = Date.now()
    for (const [key, times] of hits) {
        if (!times.some(t => now - t < WINDOW_MS)) hits.delete(key)
    }
}, WINDOW_MS).unref()

export default aiRateLimit
