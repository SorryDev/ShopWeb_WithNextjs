import { Redis } from '@upstash/redis'

// Validate environment variables
const requiredEnvs = {
  KV_REST_API_URL: process.env.KV_REST_API_URL,
  KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
}

// Check all required environment variables are set
Object.entries(requiredEnvs).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`${key} is not defined in environment variables`)
  }
})

// Create Redis client with error handling
let redis: Redis

try {
  redis = new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  })
} catch (error) {
  console.error('Failed to initialize Redis client:', error)
  throw error
}

export default redis

