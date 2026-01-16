import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Crown, Check, Download, Zap, Shield, Star, Sparkles, 
  CreditCard, Loader2, X, BadgeCheck
} from 'lucide-react';
import Header from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  popular?: boolean;
  savings?: string;
}

const plans: Plan[] = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: 99,
    period: 'month',
    features: [
      'Ad-free streaming',
      'Download for offline',
      'HD & 4K quality',
      'Custom badge',
    ],
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: 799,
    period: 'year',
    features: [
      'Everything in Monthly',
      'Priority support',
      'Early access to new features',
      'Exclusive content',
    ],
    popular: true,
    savings: 'Save ₹389',
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: 1999,
    period: 'once',
    features: [
      'Everything forever',
      'VIP badge',
      'Direct developer access',
      'Future features included',
    ],
  },
];

export default function PremiumPage() {
  const { user, isPremium, updateProfile } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string>('yearly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleSubscribe = async (plan: Plan) => {
    if (!user) {
      toast.error('Please login to subscribe');
      return;
    }

    setSelectedPlan(plan.id);
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    setIsProcessing(true);
    
    // Simulate Razorpay integration
    // In production, this would call Razorpay SDK
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful payment
      updateProfile({ 
        isPremium: true, 
        role: 'premium',
        premiumSince: Date.now(),
        premiumPlan: selectedPlan,
      });
      
      toast.success('🎉 Welcome to Premium! Enjoy your benefits.');
      setShowPaymentModal(false);
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Simulated Razorpay checkout
  const initializeRazorpay = (plan: Plan) => {
    // This would be the actual Razorpay integration
    const options = {
      key: 'rzp_test_xxxx', // Replace with actual key
      amount: plan.price * 100,
      currency: 'INR',
      name: 'AniCrew Premium',
      description: `${plan.name} Subscription`,
      handler: function(response: any) {
        // Handle successful payment
        updateProfile({ isPremium: true, role: 'premium' });
        toast.success('Payment successful!');
      },
      prefill: {
        email: user?.email || '',
      },
    };
    
    // @ts-ignore - Razorpay SDK would be loaded
    // const rzp = new Razorpay(options);
    // rzp.open();
    
    // For demo, show modal instead
    setShowPaymentModal(true);
  };

  if (isPremium) {
    return (
      <div className="min-h-screen theme-transition">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-2xl text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass-card p-12"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 flex items-center justify-center shadow-[0_0_40px_hsl(45_100%_50%/0.4)]">
                <Crown className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-3xl font-bold mb-4">You're Premium! 👑</h1>
              <p className="text-muted-foreground mb-6">
                Enjoy all the exclusive benefits of your membership.
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { icon: Download, label: 'Unlimited Downloads' },
                  { icon: Zap, label: 'Ad-Free Streaming' },
                  { icon: Star, label: 'Custom Badge' },
                  { icon: Shield, label: 'Priority Support' },
                ].map((benefit, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-secondary/50 flex items-center gap-3">
                    <benefit.icon className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm font-medium">{benefit.label}</span>
                  </div>
                ))}
              </div>
              
              <p className="text-sm text-muted-foreground">
                Premium since {new Date(user?.premiumSince || Date.now()).toLocaleDateString()}
              </p>
            </motion.div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen theme-transition">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 mb-6">
              <Crown className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">Unlock Premium Features</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Upgrade to <span className="text-glow bg-gradient-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent">Premium</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Download anime, go ad-free, and get exclusive perks
            </p>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
            {plans.map((plan, idx) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`relative glass-card p-6 ${
                  plan.popular 
                    ? 'border-2 border-yellow-500 shadow-[0_0_40px_hsl(45_100%_50%/0.2)]' 
                    : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 text-xs font-bold text-black">
                    MOST POPULAR
                  </div>
                )}
                
                {plan.savings && (
                  <div className="absolute -top-3 right-4 px-3 py-1 rounded-full bg-green-500 text-xs font-bold text-white">
                    {plan.savings}
                  </div>
                )}

                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">₹{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan)}
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${
                    plan.popular
                      ? 'btn-hero'
                      : 'bg-secondary hover:bg-primary hover:text-primary-foreground'
                  }`}
                >
                  <span className="relative z-10">
                    {plan.popular ? 'Get Started' : 'Choose Plan'}
                  </span>
                </button>
              </motion.div>
            ))}
          </div>

          {/* Features List */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-2xl font-bold text-center mb-8">Premium Benefits</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { 
                  icon: Download, 
                  title: 'Download Anime', 
                  desc: 'Save episodes offline and watch anytime, anywhere' 
                },
                { 
                  icon: Zap, 
                  title: 'Ad-Free Experience', 
                  desc: 'Uninterrupted streaming without any advertisements' 
                },
                { 
                  icon: BadgeCheck, 
                  title: 'Custom Badge', 
                  desc: 'Add a logo or emoji next to your name like Telegram Premium' 
                },
                { 
                  icon: Star, 
                  title: 'HD & 4K Quality', 
                  desc: 'Watch in the highest quality available' 
                },
                { 
                  icon: Sparkles, 
                  title: 'Early Access', 
                  desc: 'Be the first to try new features and content' 
                },
                { 
                  icon: Shield, 
                  title: 'Priority Support', 
                  desc: 'Get help faster with dedicated support' 
                },
              ].map((feature, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-xl bg-secondary/30">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Payment Methods */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12"
          >
            <p className="text-sm text-muted-foreground mb-4">Secure Payment via</p>
            <div className="flex items-center justify-center gap-6">
              <div className="px-4 py-2 rounded-lg bg-secondary/50 font-semibold text-sm">
                Razorpay
              </div>
              <div className="px-4 py-2 rounded-lg bg-secondary/50 font-semibold text-sm">
                UPI
              </div>
              <div className="px-4 py-2 rounded-lg bg-secondary/50 font-semibold text-sm">
                Cards
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Payment Modal */}
      {showPaymentModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => !isProcessing && setShowPaymentModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-card p-6 max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Complete Payment
              </h3>
              {!isProcessing && (
                <button onClick={() => setShowPaymentModal(false)} className="p-1">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="p-4 rounded-xl bg-secondary/50 mb-6">
              <p className="text-sm text-muted-foreground mb-1">Selected Plan</p>
              <p className="font-bold text-lg">
                {plans.find(p => p.id === selectedPlan)?.name} - 
                ₹{plans.find(p => p.id === selectedPlan)?.price}
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <button className="w-full p-4 rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium">
                Pay with UPI
              </button>
              <button className="w-full p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2 font-medium">
                Pay with Card
              </button>
            </div>

            <button
              onClick={processPayment}
              disabled={isProcessing}
              className="w-full btn-hero py-4 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="relative z-10">Processing...</span>
                </>
              ) : (
                <span className="relative z-10">
                  Pay ₹{plans.find(p => p.id === selectedPlan)?.price}
                </span>
              )}
            </button>

            <p className="text-xs text-muted-foreground text-center mt-4">
              Secured by Razorpay • 100% Safe Payment
            </p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
