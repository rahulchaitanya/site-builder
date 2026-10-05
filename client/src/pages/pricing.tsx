import { useState } from 'react'
import { Check, Zap, Star, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useSession } from '../lib/authClient'
import { useNavigate } from 'react-router-dom'
import api from '../lib/axios'

// Extend window type for Razorpay
declare global {
  interface Window {
    Razorpay: any
  }
}

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: '₹1',
    credits: 100,
    description: 'Perfect for trying out the platform',
    features: [
      '100 AI generations',
      'All templates',
      'Community support',
      'Download source code',
    ],
    highlighted: false,
    border: 'border-white/10',
    glow: '',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₹2',
    credits: 400,
    description: 'For builders who ship regularly',
    features: [
      '400 AI generations',
      'All templates',
      'Priority support',
      'Publish to community',
      'Download source code',
    ],
    highlighted: true,
    border: 'border-violet-500/40',
    glow: 'shadow-lg shadow-violet-500/20',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '₹2.50',
    credits: 1000,
    description: 'For agencies and power users',
    features: [
      '1000 AI generations',
      'All templates',
      'Priority support',
      'Publish to community',
      'Download source code',
      'Early access to new features',
    ],
    highlighted: false,
    border: 'border-white/10',
    glow: '',
  },
]

const Pricing = () => {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const { data: session } = useSession()
  const navigate = useNavigate()

  const handlePurchase = async (planId: string) => {
    // If not logged in, redirect to auth first
    if (!session?.user) {
      navigate('/auth')
      return
    }

    setLoadingPlan(planId)

    try {
      // Step 1: Create Razorpay order on our backend
      const { data } = await api.post('/api/payment/create-order', { planId })

      // Step 2: Open Razorpay popup with the order details
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount,          // in paise
        currency: data.currency,
        name: 'SiteBuilder AI',
        description: `${data.planName} Plan — ${data.credits} credits`,
        order_id: data.orderId,
        // Step 3: On payment success, verify with our backend
        handler: async (response: {
          razorpay_payment_id: string
          razorpay_order_id: string
          razorpay_signature: string
        }) => {
          try {
            const verify = await api.post('/api/payment/verify', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_signature:  response.razorpay_signature,
              planId,
            })
            toast.success(`🎉 ${verify.data.credits} credits added to your account!`)
            // Reload to refresh the credit count in the navbar
            setTimeout(() => window.location.reload(), 1500)
          } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Payment verification failed')
          }
        },
        prefill: {
          email: (session.user as any).email || '',
          name:  (session.user as any).name  || '',
        },
        theme: {
          color: '#7c3aed', // violet to match our UI
        },
        modal: {
          ondismiss: () => setLoadingPlan(null),
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.on('payment.failed', (response: any) => {
        toast.error(`Payment failed: ${response.error.description}`)
        setLoadingPlan(null)
      })
      razorpay.open()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Something went wrong')
      setLoadingPlan(null)
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-73px)] px-6 md:px-16 lg:px-24 xl:px-32 py-20">

      {/* Background orbs */}
      <div className="orb w-96 h-96 bg-violet-600 top-0 left-1/2 -translate-x-1/2" />
      <div className="orb w-64 h-64 bg-blue-600 bottom-0 left-0" />

      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-16 animate-fade-up opacity-0">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-violet-500/30 text-violet-300 text-xs font-medium mb-6">
          <Zap size={12} className="fill-violet-400 text-violet-400" />
          Simple Pricing
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white">
          Buy <span className="text-shimmer">Credits</span>
        </h1>
        <p className="text-gray-400 mt-4 text-lg">
          Every generation uses 5 credits. Pick a plan and build something great.
        </p>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan, i) => (
          <div
            key={plan.id}
            className={`relative card-shine rounded-2xl p-7 border transition-all duration-300 animate-fade-up opacity-0 ${
              plan.highlighted
                ? `bg-gradient-to-b from-violet-500/20 to-blue-500/20 ${plan.border} ${plan.glow} scale-105`
                : `glass ${plan.border} hover:border-white/20`
            }`}
            style={{ animationDelay: `${0.1 + i * 0.1}s` }}
          >
            {plan.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="flex items-center gap-1 bg-gradient-to-r from-violet-500 to-blue-500 text-white text-xs font-semibold px-4 py-1 rounded-full shadow-lg">
                  <Star size={10} className="fill-white" />
                  Most Popular
                </span>
              </div>
            )}

            <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
            <p className="text-gray-500 text-xs mt-1">{plan.description}</p>

            <div className="mt-5 flex items-baseline gap-1">
              <span className="text-4xl font-bold text-white">{plan.price}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <Zap size={12} className="text-violet-400 fill-violet-400" />
              <span className="text-sm text-violet-300 font-medium">{plan.credits} credits</span>
            </div>

            <ul className="mt-6 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm text-gray-300">
                  <div className="w-4 h-4 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={10} className="text-violet-400" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handlePurchase(plan.id)}
              disabled={loadingPlan === plan.id}
              className={`mt-8 w-full py-3 rounded-full text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                plan.highlighted
                  ? 'btn-glow text-white'
                  : 'glass border border-white/10 text-gray-300 hover:text-white hover:border-white/20'
              }`}
            >
              {loadingPlan === plan.id ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <span>Buy Now</span>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <p className="text-center text-gray-600 text-sm mt-12 animate-fade-up opacity-0 delay-500">
        Secure payments via Razorpay · UPI, Cards, Net Banking, Wallets · Credits never expire
      </p>
    </div>
  )
}

export default Pricing
