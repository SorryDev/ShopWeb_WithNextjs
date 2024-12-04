import redis from './redis'

export async function cacheData<T>(key: string, ttl: number, fetchData: () => Promise<T>): Promise<T> {
  try {
    // Try to get data from cache
    const cachedData = await redis.get(key)
    
    if (cachedData) {
      console.log(`Cache hit for key: ${key}`)
      return JSON.parse(cachedData as string)
    }

    // If no cached data, fetch new data
    console.log(`Cache miss for key: ${key}, fetching data...`)
    const data = await fetchData()

    // Store in cache with error handling
    try {
      await redis.setex(key, ttl, JSON.stringify(data))
      console.log(`Successfully cached data for key: ${key}`)
    } catch (error) {
      console.error(`Failed to cache data for key: ${key}:`, error)
      // Continue even if caching fails
    }

    return data
  } catch (error) {
    console.error(`Error in cacheData for key ${key}:`, error)
    // If cache operations fail, fallback to direct data fetch
    return fetchData()
  }
}

// Helper function to clear cache for a specific key
export async function clearCache(key: string): Promise<void> {
  try {
    await redis.del(key)
    console.log(`Successfully cleared cache for key: ${key}`)
  } catch (error) {
    console.error(`Failed to clear cache for key ${key}:`, error)
    throw error
  }
}

