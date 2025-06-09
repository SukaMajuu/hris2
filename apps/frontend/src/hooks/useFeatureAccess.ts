import { useMemo } from 'react';
import { useSubscriptionStatus } from './useSubscriptionStatus';
import { FEATURE_CODES, PLAN_FEATURES, type FeatureCode, type PlanType } from '@/const/features';

export function useFeatureAccess() {
	const { userSubscription, hasActiveSubscription, isAdmin } = useSubscriptionStatus();

	const availableFeatures = useMemo(() => {
		if (!hasActiveSubscription || !userSubscription?.subscription_plan) {
			return [];
		}

		// If features are explicitly provided by the API, use them
		if (userSubscription.subscription_plan.features && Array.isArray(userSubscription.subscription_plan.features)) {
			return userSubscription.subscription_plan.features.map(feature => feature.code);
		}

		// Fallback: determine features based on plan type
		const planType = userSubscription.subscription_plan.type as PlanType;
		if (planType && PLAN_FEATURES[planType]) {
			return [...PLAN_FEATURES[planType]];
		}

		return [];
	}, [hasActiveSubscription, userSubscription]);

	/**
	 * Check if a specific feature is available for the current user's subscription
	 */
	const hasFeature = (featureCode: FeatureCode): boolean => {
		// Admin-only features that regular users cannot access
		if (!isAdmin && (
			featureCode === FEATURE_CODES.ADMIN_DASHBOARD ||
			featureCode === FEATURE_CODES.EMPLOYEE_MANAGEMENT ||
			featureCode === FEATURE_CODES.CHECK_CLOCK_SETTINGS
		)) {
			return false;
		}

		// Employee dashboard is available for all users if they have active subscription
		if (featureCode === FEATURE_CODES.EMPLOYEE_DASHBOARD) {
			return hasActiveSubscription;
		}

		// Features available for both admin and regular users if they have active subscription and the feature
		if (featureCode === FEATURE_CODES.CHECK_CLOCK_SYSTEM ||
			featureCode === FEATURE_CODES.DOCUMENT_EMPLOYEE_MANAGEMENT) {
			return hasActiveSubscription && availableFeatures.includes(featureCode);
		}

		// For other features, check if the feature is in the subscription plan
		return hasActiveSubscription && availableFeatures.includes(featureCode);
	};

	/**
	 * Check if multiple features are available
	 */
	const hasFeatures = (featureCodes: FeatureCode[]): boolean => {
		return featureCodes.every(featureCode => hasFeature(featureCode));
	};

	/**
	 * Check if any of the provided features are available
	 */
	const hasAnyFeature = (featureCodes: FeatureCode[]): boolean => {
		return featureCodes.some(featureCode => hasFeature(featureCode));
	};

	/**
	 * Get the user's current plan type
	 */
	const getCurrentPlanType = (): string | null => {
		return userSubscription?.subscription_plan?.type || null;
	};

	/**
	 * Check if user has access to admin features
	 */
	const hasAdminAccess = (): boolean => {
		return isAdmin && hasActiveSubscription;
	};

	/**
	 * Check if user has access to employee features
	 */
	const hasEmployeeAccess = (): boolean => {
		return hasActiveSubscription && hasFeature(FEATURE_CODES.EMPLOYEE_DASHBOARD);
	};

	return {
		hasFeature,
		hasFeatures,
		hasAnyFeature,
		availableFeatures,
		getCurrentPlanType,
		hasAdminAccess,
		hasEmployeeAccess,
		// Commonly used feature checks
		canAccessAdminDashboard: () => hasFeature(FEATURE_CODES.ADMIN_DASHBOARD),
		canAccessEmployeeDashboard: () => hasFeature(FEATURE_CODES.EMPLOYEE_DASHBOARD),
		canManageEmployees: () => hasFeature(FEATURE_CODES.EMPLOYEE_MANAGEMENT),
		canManageDocuments: () => hasFeature(FEATURE_CODES.DOCUMENT_EMPLOYEE_MANAGEMENT),
		canConfigureCheckClock: () => hasFeature(FEATURE_CODES.CHECK_CLOCK_SETTINGS),
		canUseCheckClockSystem: () => hasFeature(FEATURE_CODES.CHECK_CLOCK_SYSTEM),
	};
}
