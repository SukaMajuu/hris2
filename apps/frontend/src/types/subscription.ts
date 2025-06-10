export interface SubscriptionFeature {
	id: number;
	name: string;
	code: string;
	description: string;
	is_core?: boolean;
}

export interface SeatPlan {
	id: number;
	name: string; // sizeTierID from backend
	min_employees: number;
	max_employees: number;
	price_per_month: number;
	price_per_year: number;
	is_active: boolean;
	created_at: string;
}

export interface SubscriptionPlan {
	id: number;
	name: string;
	type: "standard" | "premium" | "ultra";
	description: string;
	features: SubscriptionFeature[];
	seat_plans: SeatPlan[];
	is_active: boolean;
	created_at: string;
}

export interface UserSubscription {
	id: number;
	status:
		| "trial"
		| "active"
		| "inactive"
		| "suspended"
		| "expired"
		| "cancelled";
	subscription_plan: SubscriptionPlan | null;
	seat_plan: SeatPlan | null;
	start_date: string;
	end_date: string | null;
	is_auto_renew: boolean;
	current_employee_count: number;
	max_employee_count: number;
	is_trial_used: boolean;
	is_in_trial: boolean;
	trial_start_date: string | null;
	trial_end_date: string | null;
	remaining_trial_days: number | null;
	created_at: string;
	updated_at: string;
}

export interface ApiResponse<T> {
	status: number;
	message: string;
	data: T;
}

export interface CheckoutSession {
	id: string;
	user_id: number;
	subscription_plan_id: number;
	seat_plan_id: number;
	amount: number;
	currency: string;
	session_type: "trial" | "paid";
	status: "pending" | "completed" | "expired";
	initiated_at: string;
	expires_at: string | null;
	completed_at: string | null;
}

export interface InvoiceResponse {
	id: string;
	invoice_url: string;
	amount: number;
	currency: string;
	expiry_date: string;
}

export interface InitiatePaidCheckoutResponse {
	checkout_session: CheckoutSession;
	invoice: InvoiceResponse;
}

// Request types for API calls
export interface InitiateTrialCheckoutRequest {
	subscription_plan_id: number;
	seat_plan_id: number;
}

export interface InitiatePaidCheckoutRequest {
	subscription_plan_id: number;
	seat_plan_id: number;
	is_monthly: boolean;
}

export interface CompleteTrialCheckoutRequest {
	session_id: string;
	company_name: string;
	company_address: string;
	company_phone: string;
	company_email: string;
	tax_number?: string;
	bank_name?: string;
	bank_account_number?: string;
	bank_account_name?: string;
}
