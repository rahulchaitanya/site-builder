import OpenAI from 'openai'

// Lazily create the client so the server starts even before the API key is set.
// The key is read from .env at runtime when the first AI call is made.
let _client: OpenAI | null = null

function getClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY || 'placeholder',
      baseURL: 'https://openrouter.ai/api/v1',
    })
  }
  return _client
}

// Export a proxy that forwards all property accesses to the lazy client
const openai = new Proxy({} as OpenAI, {
  get(_target, prop) {
    return (getClient() as any)[prop]
  },
})

export default openai
