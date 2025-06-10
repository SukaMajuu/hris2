import { ApiService } from "./api.service";
import {
	SubscriptionPlan,
	SeatPlan,
	UserSubscription,
	CheckoutSession,
	ApiResponse,
	InitiateTrialCheckoutRequest,
	InitiatePaidCheckoutRequest,
	CompleteTrialCheckoutRequest,
	InitiatePaidCheckoutResponse,
} from "@/types/subscription";

class SubscriptionService {
	private apiService = new ApiService();

	// Get all subscription plans
	async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
		const response = await this.apiService.get<
			ApiResponse<SubscriptionPlan[]>
		>("/api/subscription/plans");
		return response.data.data;
	}

	// Get seat plans for a specific subscription plan
	async getSeatPlans(subscriptionPlanId: number): Promise<SeatPlan[]> {
		const response = await this.apiService.get<ApiResponse<SeatPlan[]>>(
			`/api/subscription/plans/${subscriptionPlanId}/seat-plans`
		);
		return response.data.data;
	}

	// Get current user's subscription
	async getUserSubscription(): Promise<UserSubscription> {
		const response = await this.apiService.get<
			ApiResponse<UserSubscription>
		>("/api/subscription/me");
		return response.data.data;
	}

	// Get checkout session details
	async getCheckoutSession(sessionId: string): Promise<CheckoutSession> {
		const response = await this.apiService.get<
			ApiResponse<CheckoutSession>
		>(`/api/subscription/checkout/${sessionId}`);
		return response.data.data;
	}

	// Initiate trial checkout
	async initiateTrialCheckout(
		request: InitiateTrialCheckoutRequest
	): Promise<CheckoutSession> {
		const response = await this.apiService.post<
			ApiResponse<CheckoutSession>
		>("/api/subscription/checkout/trial", request);
		return response.data.data;
	}

	// Initiate paid checkout
	async initiatePaidCheckout(
		request: InitiatePaidCheckoutRequest
	): Promise<InitiatePaidCheckoutResponse> {
		const response = await this.apiService.post<
			ApiResponse<InitiatePaidCheckoutResponse>
		>("/api/subscription/checkout/paid", request);
		return response.data.data;
	}

	// Complete trial checkout
	async completeTrialCheckout(
		request: CompleteTrialCheckoutRequest
	): Promise<UserSubscription> {
		const response = await this.apiService.post<
			ApiResponse<UserSubscription>
		>("/api/subscription/checkout/complete-trial", request);
		return response.data.data;
	}

	// Activate trial for user
	async activateTrial(): Promise<void> {
		await this.apiService.post<ApiResponse<null>>(
			"/api/subscription/trial/activate"
		);
	}
}

export const subscriptionService = new SubscriptionService();
