'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Check, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PLANS, formatPrice } from '@/lib/payments/stripe';
import { toast } from 'sonner';

export default function PricingPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planKey: string) => {
    if (!session?.user) {
      toast.error('Please sign in to subscribe');
      return;
    }

    const plan = PLANS[planKey as keyof typeof PLANS];
    if (!plan.stripePriceId) {
      toast.error('This plan is not available for subscription');
      return;
    }

    setLoading(planKey);

    try {
      const response = await fetch('/api/payments/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: plan.stripePriceId,
          userId: session.user.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        toast.error(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('Failed to start subscription process');
    } finally {
      setLoading(null);
    }
  };

  const getCurrentPlan = () => {
    // This would come from the user's team data in a real app
    return 'free';
  };

  const currentPlan = getCurrentPlan();

  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your AI Plan</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Unlock the power of AI-driven document search and chat. Select the plan that fits your needs.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {Object.entries(PLANS).map(([planKey, plan]) => {
          const isCurrentPlan = currentPlan === planKey;
          const isPopular = planKey === 'pro';

          return (
            <Card key={planKey} className={`relative ${isPopular ? 'border-2 border-blue-500' : ''}`}>
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white">
                    <Zap className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="text-4xl font-bold my-4">
                  {plan.price === 0 ? 'Free' : formatPrice(plan.price)}
                  {plan.price > 0 && <span className="text-sm font-normal text-gray-600">/month</span>}
                </div>
                <CardDescription className="text-center">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-4">
                  {isCurrentPlan ? (
                    <Button disabled className="w-full">
                      Current Plan
                    </Button>
                  ) : planKey === 'free' ? (
                    <Button variant="outline" className="w-full" disabled>
                      Always Free
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => handleSubscribe(planKey)}
                      disabled={loading === planKey}
                      variant={isPopular ? 'default' : 'outline'}
                    >
                      {loading === planKey ? 'Processing...' : `Upgrade to ${plan.name}`}
                    </Button>
                  )}
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                  <p>• {plan.limits.queryLimit === -1 ? 'Unlimited' : plan.limits.queryLimit.toLocaleString()} AI queries</p>
                  <p>• {plan.limits.documentsLimit === -1 ? 'Unlimited' : plan.limits.documentsLimit.toLocaleString()} documents</p>
                  <p>• {plan.limits.storageLimit === -1 ? 'Unlimited' : `${plan.limits.storageLimit}MB`} storage</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto space-y-6 text-left">
          <div>
            <h3 className="font-semibold mb-2">Can I change plans anytime?</h3>
            <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">What happens to my documents if I downgrade?</h3>
            <p className="text-gray-600">Your documents will remain accessible, but you may hit storage limits. We&apos;ll help you manage your documents accordingly.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Do you offer enterprise plans?</h3>
            <p className="text-gray-600">Yes! Our Enterprise plan includes custom integrations, dedicated support, and unlimited usage. Contact us for pricing.</p>
          </div>
        </div>
      </div>
    </div>
  );
}