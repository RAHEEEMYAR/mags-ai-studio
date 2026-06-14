export interface PricingTier {
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  popular?: boolean;
  features: Array<{
    name: string;
    included: boolean;
    limit?: number | string;
  }>;
  cta: string;
  ctaUrl: string;
}

export interface PricingComparison {
  feature: string;
  free: string | number | boolean;
  pro: string | number | boolean;
  team: string | number | boolean;
  enterprise: string | number | boolean;
}