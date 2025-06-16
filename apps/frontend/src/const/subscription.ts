export const SUBSCRIPTION_STATUS = {
	TRIAL: "trial",
	ACTIVE: "active",
	INACTIVE: "inactive",
	SUSPENDED: "suspended",
	EXPIRED: "expired",
	CANCELLED: "cancelled",
} as const;

export type SubscriptionStatus = typeof SUBSCRIPTION_STATUS[keyof typeof SUBSCRIPTION_STATUS];

export const SUBSCRIPTION_PLAN_TYPE = {
	STANDARD: "standard",
	PREMIUM: "premium",
	ULTRA: "ultra",
} as const;

export type SubscriptionPlanType = typeof SUBSCRIPTION_PLAN_TYPE[keyof typeof SUBSCRIPTION_PLAN_TYPE];

export const PAYMENT_STATUS = {
	PENDING: "pending",
	PAID: "paid",
	COMPLETED: "completed",
	FAILED: "failed",
	CANCELLED: "cancelled",
	EXPIRED: "expired",
	REFUNDED: "refunded",
	NOT_FOUND: "not_found",
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

export const CHECKOUT_STATUS = {
	INITIATED: "initiated",
	PENDING: "pending",
	COMPLETED: "completed",
	FAILED: "failed",
	CANCELLED: "cancelled",
	EXPIRED: "expired",
} as const;

export type CheckoutStatus = typeof CHECKOUT_STATUS[keyof typeof CHECKOUT_STATUS];

export const SUBSCRIPTION_CHANGE_TYPE = {
	PLAN_UPGRADE: "plan_upgrade",
	PLAN_DOWNGRADE: "plan_downgrade",
	SEAT_UPGRADE: "seat_upgrade",
	SEAT_DOWNGRADE: "seat_downgrade",
	TRIAL_CONVERSION: "trial_conversion",
} as const;

export type SubscriptionChangeType = typeof SUBSCRIPTION_CHANGE_TYPE[keyof typeof SUBSCRIPTION_CHANGE_TYPE];

// Arrays for validation and select options
export const SUBSCRIPTION_STATUSES = Object.values(SUBSCRIPTION_STATUS);
export const SUBSCRIPTION_PLAN_TYPES = Object.values(SUBSCRIPTION_PLAN_TYPE);
export const PAYMENT_STATUSES = Object.values(PAYMENT_STATUS);
export const CHECKOUT_STATUSES = Object.values(CHECKOUT_STATUS);
export const SUBSCRIPTION_CHANGE_TYPES = Object.values(
	SUBSCRIPTION_CHANGE_TYPE
);
