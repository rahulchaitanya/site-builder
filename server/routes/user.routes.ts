import { Router } from 'express'
import type { Response } from 'express'
import prisma from '../lib/prisma.js'
import { protect } from '../middlewares/auth.js'
import type { AuthRequest } from '../middlewares/auth.js'

const router = Router()

// GET /me — Return the current user's data including credits
// Used by the Navbar to display live credit count
router.get('/me', protect, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findFirst({ where: { id: req.userId! } })
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ user })
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to fetch user', error: err?.message })
  }
})

export default router
