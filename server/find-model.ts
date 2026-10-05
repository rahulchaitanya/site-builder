import { config } from 'dotenv'
config()
import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
})

// Fetch all free models
const res = await fetch('https://openrouter.ai/api/v1/models', {
  headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` },
})
const { data } = await res.json() as any
const freeModels: string[] = data
  .filter((m: any) => m.id.endsWith(':free'))
  .map((m: any) => m.id)

console.log(`Found ${freeModels.length} free models. Testing...`)

for (const model of freeModels) {
  try {
    const r = await client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: 'Reply with just: OK' }],
      max_tokens: 5,
    })
    const reply = r.choices[0]?.message.content?.trim()
    if (reply) {
      console.log(`WORKS: ${model} -> "${reply}"`)
      break
    } else {
      console.log(`EMPTY: ${model}`)
    }
  } catch (e: any) {
    const msg = e?.error?.message || e?.message || ''
    console.log(`FAIL: ${model} -> ${msg.slice(0, 60)}`)
  }
}

process.exit(0)
