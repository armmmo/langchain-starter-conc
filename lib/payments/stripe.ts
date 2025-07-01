import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
});

export const PLANS = {
  free: {
    name: 'Free',
    description: 'Perfect for trying out our AI features',
    price: 0,
    stripePriceId: null,
    features: [
      '100 AI queries per month',
      '10 documents',
      '100MB storage',
      'Basic chat support',
    ],
    limits: {
      queryLimit: 100,
      documentsLimit: 10,
      storageLimit: 100, // MB
    },
  },
  pro: {
    name: 'Pro',
    description: 'For professionals and small teams',
    price: 29,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID,
    features: [
      '5,000 AI queries per month',
      '500 documents',
      '10GB storage',
      'Advanced RAG capabilities',
      'Priority support',
      'Team collaboration',
    ],
    limits: {
      queryLimit: 5000,
      documentsLimit: 500,
      storageLimit: 10000, // MB
    },
  },
  enterprise: {
    name: 'Enterprise',
    description: 'For large organizations with advanced needs',
    price: 99,
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    features: [
      'Unlimited AI queries',
      'Unlimited documents',
      'Unlimited storage',
      'Custom AI models',
      'Advanced analytics',
      'Dedicated support',
      'SSO integration',
      'API access',
    ],
    limits: {
      queryLimit: -1, // Unlimited
      documentsLimit: -1, // Unlimited
      storageLimit: -1, // Unlimited
    },
  },
} as const;

export type PlanType = keyof typeof PLANS;

export async function createCheckoutSession({
  priceId,
  teamId,
  userId,
  successUrl,
  cancelUrl,
}: {
  priceId: string;
  teamId: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    billing_address_collection: 'required',
    customer_creation: 'always',
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      teamId,
      userId,
    },
  });

  return session;
}

export async function createBillingPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

export async function cancelSubscription(subscriptionId: string) {
  return await stripe.subscriptions.cancel(subscriptionId);
}

export async function updateSubscription({
  subscriptionId,
  priceId,
}: {
  subscriptionId: string;
  priceId: string;
}) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  return await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: priceId,
      },
    ],
    proration_behavior: 'create_prorations',
  });
}

export function getPlanByPriceId(priceId: string): PlanType | null {
  for (const [planKey, plan] of Object.entries(PLANS)) {
    if (plan.stripePriceId === priceId) {
      return planKey as PlanType;
    }
  }
  return null;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}