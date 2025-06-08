import { FEATURE_CODES, type FeatureCode } from '@/const/features';

/**
 * Route feature mapping - defines which features are required for specific routes
 */
export const ROUTE_FEATURE_MAP: { [key: string]: FeatureCode } = {
	'/dashboard': FEATURE_CODES.ADMIN_DASHBOARD, // For admin, employee dashboard uses EMPLOYEE_DASHBOARD
	'/employee-management': FEATURE_CODES.EMPLOYEE_MANAGEMENT,
	'/check-clock': FEATURE_CODES.CHECK_CLOCK_SYSTEM,
	'/check-clock/work-schedule': FEATURE_CODES.CHECK_CLOCK_SETTINGS,
	'/check-clock/location': FEATURE_CODES.CHECK_CLOCK_SETTINGS,
	'/attendance': FEATURE_CODES.EMPLOYEE_DASHBOARD,
};

/**
 * Component feature mapping - defines which features are required for specific components
 */
export const COMPONENT_FEATURE_MAP = {
	EmployeeManagement: FEATURE_CODES.EMPLOYEE_MANAGEMENT,
	DocumentManagement: FEATURE_CODES.DOCUMENT_EMPLOYEE_MANAGEMENT,
	CheckClockSystem: FEATURE_CODES.CHECK_CLOCK_SYSTEM,
	CheckClockSettings: FEATURE_CODES.CHECK_CLOCK_SETTINGS,
	AdminDashboard: FEATURE_CODES.ADMIN_DASHBOARD,
	EmployeeDashboard: FEATURE_CODES.EMPLOYEE_DASHBOARD,
} as const;

/**
 * Check if a route requires a specific feature
 */
export const getRouteRequiredFeature = (pathname: string): FeatureCode | null => {
	// Check for exact match first
	if (pathname in ROUTE_FEATURE_MAP) {
		return ROUTE_FEATURE_MAP[pathname] || null;
	}

	// Check for partial matches (useful for dynamic routes)
	for (const route in ROUTE_FEATURE_MAP) {
		if (pathname.startsWith(route) && route !== '/') {
			return ROUTE_FEATURE_MAP[route] || null;
		}
	}

	return null;
};

/**
 * Filter navigation items based on feature access
 */
export const filterNavigationByFeatures = <T extends { href: string; requiredFeature?: FeatureCode }>(
	items: T[],
	hasFeature: (feature: FeatureCode) => boolean,
	isAdmin: boolean = false
): T[] => {
	return items.filter(item => {
		if (!item.requiredFeature) return true;

		// Special handling for dashboard routes
		if (item.href === '/dashboard') {
			return isAdmin
				? hasFeature(FEATURE_CODES.ADMIN_DASHBOARD)
				: hasFeature(FEATURE_CODES.EMPLOYEE_DASHBOARD);
		}

		return hasFeature(item.requiredFeature);
	});
};

/**
 * Check if user can access a specific route
 */
export const canAccessRoute = (
	pathname: string,
	hasFeature: (feature: FeatureCode) => boolean,
	isAdmin: boolean = false
): boolean => {
	const requiredFeature = getRouteRequiredFeature(pathname);

	if (!requiredFeature) return true;

	// Special handling for dashboard
	if (pathname === '/dashboard') {
		return isAdmin
			? hasFeature(FEATURE_CODES.ADMIN_DASHBOARD)
			: hasFeature(FEATURE_CODES.EMPLOYEE_DASHBOARD);
	}

	return hasFeature(requiredFeature);
};

/**
 * Get upgrade message for a specific feature
 */
export const getFeatureUpgradeMessage = (featureCode: FeatureCode): string => {
	const messages: Record<FeatureCode, string> = {
		[FEATURE_CODES.ADMIN_DASHBOARD]: 'Upgrade to access the Admin Dashboard with comprehensive business insights and analytics.',
		[FEATURE_CODES.EMPLOYEE_DASHBOARD]: 'Upgrade to access the Employee Dashboard for personal overview and self-service features.',
		[FEATURE_CODES.EMPLOYEE_MANAGEMENT]: 'Upgrade to access Employee Management features including add, edit, delete, and import/export capabilities.',
		[FEATURE_CODES.DOCUMENT_EMPLOYEE_MANAGEMENT]: 'Upgrade to Premium to manage employee documents including contracts, certificates, and training records.',
		[FEATURE_CODES.CHECK_CLOCK_SETTINGS]: 'Upgrade to Premium to configure check-clock locations, GPS settings, and work schedules.',
		[FEATURE_CODES.CHECK_CLOCK_SYSTEM]: 'Upgrade to Premium to access the complete attendance and check-clock system.',
	};

	return messages[featureCode] || `Upgrade to access ${featureCode} feature.`;
};

/**
 * Check which plan includes a specific feature
 */
export const getFeaturePlanAvailability = (featureCode: FeatureCode): string[] => {
	const standardFeatures: FeatureCode[] = [
		FEATURE_CODES.ADMIN_DASHBOARD,
		FEATURE_CODES.EMPLOYEE_DASHBOARD,
		FEATURE_CODES.EMPLOYEE_MANAGEMENT,
	];

	const premiumFeatures: FeatureCode[] = [
		...standardFeatures,
		FEATURE_CODES.CHECK_CLOCK_SETTINGS,
		FEATURE_CODES.CHECK_CLOCK_SYSTEM,
		FEATURE_CODES.DOCUMENT_EMPLOYEE_MANAGEMENT,
	];

	if (standardFeatures.includes(featureCode)) {
		return ['standard', 'premium', 'ultra'];
	}

	if (premiumFeatures.includes(featureCode)) {
		return ['premium', 'ultra'];
	}

	return ['ultra'];
};

/**
 * Get the minimum required plan for a feature
 */
export const getMinimumPlanForFeature = (featureCode: FeatureCode): 'standard' | 'premium' | 'ultra' => {
	const availability = getFeaturePlanAvailability(featureCode);
	return availability[0] as 'standard' | 'premium' | 'ultra';
};
