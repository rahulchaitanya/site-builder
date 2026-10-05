import express from 'express'
import cors from 'cors'
import { config } from 'dotenv'
import { toNodeHandler } from 'better-auth/node'
import { auth } from './lib/auth.js'
import prisma from './lib/prisma.js'
import projectRoutes from './routes/project.routes.js'
import userRoutes from './routes/user.routes.js'
import paymentRoutes from './routes/payment.routes.js'

config()

const app = express()
const PORT = process.env.PORT || 3000

const allowedOrigins = process.env.TRUSTED_ORIGIN
  ? process.env.TRUSTED_ORIGIN.split(',')
  : []

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}))

// Better-auth routes must be registered BEFORE express.json()
app.all('/api/auth/*splat', toNodeHandler(auth))

app.use(express.json())

app.get('/', (req, res) => {
  res.send('Server is running')
})

app.get('/api/test-db', async (req, res) => {
  try {
    const userCount = await prisma.user.count()
    res.json({ message: 'Database connected successfully', userCount })
  } catch (err: any) {
    res.status(500).json({ message: 'Database connection failed', error: err?.message })
  }
})

app.use('/api/project', projectRoutes)
app.use('/api/user', userRoutes)
app.use('/api/payment', paymentRoutes)

app.listen(PORT, () => {
  console.log(`Server is running at localhost:${PORT}`)
})
