import type { Request, Response, NextFunction } from 'express'
import { fromNodeHeaders } from 'better-auth/node'
import { auth } from '../lib/auth.js'

export interface AuthRequest extends Request {
  userId?: string
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    })
    if (!session || !session.user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    req.userId = session.user.id
    next()
  } catch (err) {
    console.error(err)
    res.status(401).json({ message: 'Unauthorized' })
  }
}
