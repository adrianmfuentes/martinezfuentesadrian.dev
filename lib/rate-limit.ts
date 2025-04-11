export interface RateLimitOptions {
    interval: number // Time window in milliseconds
    limit: number // Max number of requests per interval
    uniqueTokenPerInterval: number // Max number of unique tokens to track
  }
  
  export function rateLimit(options: RateLimitOptions) {
    const { interval, uniqueTokenPerInterval } = options
    const tokenCache = new Map<string, number[]>()
  
    return {
      check: (maxTokens: number, token: string) =>
        new Promise<void>((resolve, reject) => {
          const now = Date.now()
          const tokenKey = token
  
          // Initialize or get the token's timestamps
          let tokenTimestamps = tokenCache.get(tokenKey) || []
          tokenTimestamps = tokenTimestamps.filter((timestamp) => now - timestamp < interval)
  
          // Check if the token has exceeded the rate limit
          if (tokenTimestamps.length >= maxTokens) {
            return reject(new Error("Rate limit exceeded"))
          }
  
          // Add the current timestamp and update the cache
          tokenTimestamps.push(now)
          tokenCache.set(tokenKey, tokenTimestamps)
  
          // Clean up old tokens if we have too many
          if (tokenCache.size > uniqueTokenPerInterval) {
            const oldestToken = [...tokenCache.entries()].sort((a, b) => Math.min(...a[1]) - Math.min(...b[1])).shift()
            if (oldestToken) tokenCache.delete(oldestToken[0])
          }
  
          resolve()
        }),
    }
  }
  