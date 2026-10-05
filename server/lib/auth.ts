import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { config } from 'dotenv'
import prisma from './prisma.js'

// Load .env before reading any env vars — ensures TRUSTED_ORIGIN is available
// even when this module is imported early in the server startup
config()

const allowedOrigins = process.env.TRUSTED_ORIGIN
  ? process.env.TRUSTED_ORIGIN.split(',')
  : ['http://localhost:5173']  // fallback for local dev

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: allowedOrigins,
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  secret: process.env.BETTER_AUTH_SECRET!,
})
