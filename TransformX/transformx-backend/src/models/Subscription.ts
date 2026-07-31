export interface Subscription {
  id: string;
  userId: string;
  subscriptionType: 'monthly' | 'annual';
  status: 'active' | 'cancelled' | 'expired';
  externalId: string;
  startedAt: Date;
  expiresAt: Date;
  autoRenew: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionPlan {
  type: 'free' | 'monthly' | 'annual';
  name: string;
  price: number;
  currency: string;
  features: string[];
  description: string;
}

export interface VerifyReceiptDTO {
  receipt: string;
  packageName?: string;
  productId?: string;
}

export interface RevenueCatPayload {
  product_id: string;
  period_type: string;
  purchase_date: string;
  expiration_date: string;
  is_trial: boolean;
  is_sandbox: boolean;
  original_purchase_date: string;
}
