import { Router } from 'express'
import type { Response } from 'express'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import prisma from '../lib/prisma.js'
import { protect } from '../middlewares/auth.js'
import type { AuthRequest } from '../middlewares/auth.js'

const router = Router()

// Lazily init Razorpay so it reads env after dotenvx loads it
let _razorpay: Razorpay | null = null
function getRazorpay() {
  if (!_razorpay) {
    _razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })
  }
  return _razorpay
}

// Plans — amount is in paise (1 INR = 100 paise)
const PLANS: Record<string, { credits: number; amount: number; name: string }> = {
  basic:      { name: 'Basic',      amount: 100, credits: 100  }, // ₹1
  pro:        { name: 'Pro',        amount: 200, credits: 400  }, // ₹2
  enterprise: { name: 'Enterprise', amount: 250, credits: 1000 }, // ₹2.50
}

// ── POST /api/payment/create-order ──────────────────────────────────
// Creates a Razorpay order. Frontend uses the returned orderId to open the payment popup.
router.post('/create-order', protect, async (req: AuthRequest, res: Response) => {
  const { planId } = req.body

  const plan = PLANS[planId]
  if (!plan) return res.status(400).json({ message: 'Invalid plan' })

  try {
    const order = await getRazorpay().orders.create({
      amount: plan.amount,
      currency: 'INR',
      receipt: `receipt_${req.userId}_${Date.now()}`,
      notes: {
        userId: req.userId!,
        planId,
        credits: plan.credits.toString(),
      },
    })

    res.json({
      orderId: order.id,
      amount: plan.amount,
      currency: 'INR',
      planId,
      planName: plan.name,
      credits: plan.credits,
      keyId: process.env.RAZORPAY_KEY_ID,
    })
  } catch (err: any) {
    console.error('Razorpay create-order error:', err)
    res.status(500).json({ message: 'Failed to create order', error: err?.message })
  }
})

// ── POST /api/payment/verify ─────────────────────────────────────────
// Verifies the payment signature from Razorpay and adds credits to the user.
// This is the critical step — it proves the payment actually happened.
router.post('/verify', protect, async (req: AuthRequest, res: Response) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, planId } = req.body

  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !planId) {
    return res.status(400).json({ message: 'Missing payment details' })
  }

  // Verify the signature — this is how we know Razorpay actually processed the payment
  // The signature is HMAC-SHA256 of "orderId|paymentId" using your key secret
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ message: 'Invalid payment signature. Payment not verified.' })
  }

  const plan = PLANS[planId]
  if (!plan) return res.status(400).json({ message: 'Invalid plan' })

  try {
    // Save transaction record
    await prisma.transaction.create({
      data: {
        userId: req.userId!,
        credits: plan.credits,
        amount: plan.amount / 100, // store in INR
        status: 'completed',
      },
    })

    // Add credits to user
    const updatedUser = await prisma.user.update({
      where: { id: req.userId! },
      data: { credits: { increment: plan.credits } },
    })

    res.json({
      message: 'Payment verified! Credits added.',
      credits: updatedUser.credits,
    })
  } catch (err: any) {
    console.error('Razorpay verify error:', err)
    res.status(500).json({ message: 'Failed to add credits', error: err?.message })
  }
})

export default router
