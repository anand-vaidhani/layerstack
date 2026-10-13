import type { SubscriptionPlan } from "@/generated/prisma/client";

export type PlanKey = "FREE" | "PRO" | "ENTERPRISE";

export type PlanInfo = {
  key: PlanKey;
  label: string;
  /** Monthly price in USD; null = custom/contact sales */
  priceMonthly: number | null;
  /** Max projects; null = unlimited */
  maxProjects: number | null;
  /** Max team members; null = unlimited */
  maxMembers: number | null;
  blurb: string;
  features: string[];
};

export const PLANS: Record<PlanKey, PlanInfo> = {
  FREE: {
    key: "FREE",
    label: "Free",
    priceMonthly: 0,
    maxProjects: 3,
    maxMembers: 2,
    blurb: "For individuals and side projects.",
    features: ["Up to 3 projects", "Up to 2 team members", "Community support", "Basic dashboard analytics"],
  },
  PRO: {
    key: "PRO",
    label: "Pro",
    priceMonthly: 29,
    maxProjects: null,
    maxMembers: 10,
    blurb: "For growing teams that need room to scale.",
    features: ["Unlimited projects", "Up to 10 team members", "Priority support", "Advanced analytics"],
  },
  ENTERPRISE: {
    key: "ENTERPRISE",
    label: "Enterprise",
    priceMonthly: null,
    maxProjects: null,
    maxMembers: null,
    blurb: "For organizations with advanced needs.",
    features: ["Unlimited projects & members", "SSO / SAML", "Audit logs & SLAs", "Dedicated success manager"],
  },
};

export function planInfo(plan: SubscriptionPlan): PlanInfo {
  return PLANS[plan];
}

export function canCreateProject(plan: SubscriptionPlan, currentCount: number): boolean {
  const max = PLANS[plan].maxProjects;
  return max === null || currentCount < max;
}

export function canAddMember(plan: SubscriptionPlan, currentCount: number): boolean {
  const max = PLANS[plan].maxMembers;
  return max === null || currentCount < max;
}
