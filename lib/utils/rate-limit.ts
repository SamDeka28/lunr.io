/**
 * Lightweight rate limiter.
 * Uses Upstash Redis REST if UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 * are set; otherwise falls back to an in-memory sliding window (per-instance).
 */

type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

type WindowEntry = { timestamps: number[] };

const memoryStore = new Map<string, WindowEntry>();

function memoryLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const entry = memoryStore.get(key) || { timestamps: [] };
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= limit) {
    memoryStore.set(key, entry);
    const oldest = entry.timestamps[0] || now;
    return {
      success: false,
      limit,
      remaining: 0,
      reset: oldest + windowMs,
    };
  }

  entry.timestamps.push(now);
  memoryStore.set(key, entry);
  return {
    success: true,
    limit,
    remaining: Math.max(0, limit - entry.timestamps.length),
    reset: now + windowMs,
  };
}

async function upstashLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const now = Date.now();
  const windowStart = now - windowMs;
  const redisKey = `rl:${key}`;

  try {
    // ZREMRANGEBYSCORE + ZADD + ZCARD + PEXPIRE via pipeline
    const pipeline = [
      ["ZREMRANGEBYSCORE", redisKey, "0", String(windowStart)],
      ["ZADD", redisKey, String(now), `${now}:${Math.random()}`],
      ["ZCARD", redisKey],
      ["PEXPIRE", redisKey, String(windowMs)],
    ];

    const response = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pipeline),
    });

    if (!response.ok) {
      console.error("Upstash rate limit error:", response.status);
      return null;
    }

    const results = await response.json();
    const count = Number(results?.[2]?.result ?? 0);
    const success = count <= limit;

    return {
      success,
      limit,
      remaining: Math.max(0, limit - count),
      reset: now + windowMs,
    };
  } catch (error) {
    console.error("Upstash rate limit failed:", error);
    return null;
  }
}

export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const remote = await upstashLimit(key, limit, windowMs);
  if (remote) return remote;
  return memoryLimit(key, limit, windowMs);
}

/** Presets used across the app */
export const RateLimitPresets = {
  redirect: { limit: 120, windowMs: 60_000 }, // 120/min per IP
  api: { limit: 1000, windowMs: 60 * 60_000 }, // 1000/hr per API key
  auth: { limit: 20, windowMs: 15 * 60_000 }, // 20 / 15min per IP
  password: { limit: 10, windowMs: 15 * 60_000 }, // 10 / 15min per IP+code
} as const;

export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.reset / 1000)),
  };
}
