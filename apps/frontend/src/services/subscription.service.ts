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
	UpgradePreviewResponse,
	SubscriptionChangeResponse,
	UpgradeSubscriptionPlanRequest,
	ChangeSeatPlanRequest,
	ConvertTrialToPaidRequest,
	VerifyPaymentRequest,
	PaymentVerificationResponse,
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
	async getSeatPlans(planId: number): Promise<SeatPlan[]> {
		const response = await this.apiService.get<ApiResponse<SeatPlan[]>>(
			`/api/subscription/plans/${planId}/seat-plans`
		);
		return response.data.data;
	}

	// Get user's current subscription
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

	// Preview subscription plan change
	async previewSubscriptionPlanChange(
		request: UpgradeSubscriptionPlanRequest
	): Promise<UpgradePreviewResponse> {
		const response = await this.apiService.post<
			ApiResponse<UpgradePreviewResponse>
		>("/api/subscription/preview/plan-change", request);
		return response.data.data;
	}

	// Change subscription plan
	async changeSubscriptionPlan(
		request: UpgradeSubscriptionPlanRequest
	): Promise<SubscriptionChangeResponse> {
		const response = await this.apiService.post<
			ApiResponse<SubscriptionChangeResponse>
		>("/api/subscription/plan/change", request);
		return response.data.data;
	}

	// Preview seat plan change
	async previewSeatPlanChange(
		request: ChangeSeatPlanRequest
	): Promise<UpgradePreviewResponse> {
		const response = await this.apiService.post<
			ApiResponse<UpgradePreviewResponse>
		>("/api/subscription/preview/seat-change", request);
		return response.data.data;
	}

	// Change seat plan
	async changeSeatPlan(
		request: ChangeSeatPlanRequest
	): Promise<SubscriptionChangeResponse> {
		const response = await this.apiService.post<
			ApiResponse<SubscriptionChangeResponse>
		>("/api/subscription/seat/change", request);
		return response.data.data;
	}

	// Convert trial to paid
	async convertTrialToPaid(
		request: ConvertTrialToPaidRequest
	): Promise<SubscriptionChangeResponse> {
		const response = await this.apiService.post<
			ApiResponse<SubscriptionChangeResponse>
		>("/api/subscription/trial/convert", request);
		return response.data.data;
	}

	// Verify payment and activate subscription
	async verifyPayment(
		request: VerifyPaymentRequest
	): Promise<PaymentVerificationResponse> {
		const response = await this.apiService.post<
			ApiResponse<PaymentVerificationResponse>
		>("/api/subscription/verify-payment", request);
		return response.data.data;
	}
}

export const subscriptionService = new SubscriptionService();
