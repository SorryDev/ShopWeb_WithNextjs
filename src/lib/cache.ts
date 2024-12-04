import redis from './redis'

export async function cacheData<T>(key: string, ttl: number, fetchData: () => Promise<T>): Promise<T> {
  const cachedData = await redis.get(key)
  if (cachedData) {
    return JSON.parse(cachedData as string)
  }

  const data = await fetchData()
  await redis.setex(key, ttl, JSON.stringify(data))
  return data
}

