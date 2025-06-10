import { useUserSubscription } from '@/api/queries/subscription.queries';
import { useEmployeeStatsQuery } from '@/api/queries/employee.queries';
import { useCallback, useMemo } from 'react';

export interface SubscriptionLimitInfo {
  currentCount: number;
  maxCount: number;
  canAddEmployees: boolean;
  canAddCount: number;
  planName: string;
  planType: string;
  tierInfo: {
    minEmployees: number;
    maxEmployees: number;
    sizeTierName: string;
  };
}

export const useSubscriptionLimit = () => {
  const { data: userSubscription, isLoading: isLoadingSubscription } = useUserSubscription();
  const { data: employeeStats, isLoading: isLoadingStats } = useEmployeeStatsQuery();

  const limitInfo: SubscriptionLimitInfo = useMemo(() => {
    const currentCount = employeeStats?.total_employees || 0;

    if (!userSubscription?.subscription_plan || !userSubscription?.seat_plan) {
      return {
        currentCount,
        maxCount: 100,
        canAddEmployees: currentCount < 100,
        canAddCount: Math.max(0, 100 - currentCount),
        planName: 'Premium',
        planType: 'premium',
        tierInfo: {
          minEmployees: 51,
          maxEmployees: 100,
          sizeTierName: 'Premium Tier',
        },
      };
    }

    const maxCount = userSubscription.seat_plan.max_employees;
    const canAddEmployees = currentCount < maxCount;
    const canAddCount = Math.max(0, maxCount - currentCount);

    return {
      currentCount,
      maxCount,
      canAddEmployees,
      canAddCount,
      planName: userSubscription.subscription_plan.name,
      planType: userSubscription.subscription_plan.type,
      tierInfo: {
        minEmployees: userSubscription.seat_plan.min_employees,
        maxEmployees: userSubscription.seat_plan.max_employees,
        sizeTierName: userSubscription.seat_plan.name,
      },
    };
  }, [userSubscription, employeeStats]);

  const checkCanAddEmployees = useCallback(
    (count = 1): boolean => {
      return limitInfo.canAddEmployees && limitInfo.canAddCount >= count;
    },
    [limitInfo.canAddEmployees, limitInfo.canAddCount],
  );

  const getAddEmployeeErrorMessage = useCallback(
    (count = 1): string => {
      if (!userSubscription?.subscription_plan) {
        if (limitInfo.currentCount >= limitInfo.maxCount) {
          return `Employee limit reached! You have ${limitInfo.currentCount} employees. The current limit is ${limitInfo.maxCount} employees. Please upgrade your plan to add more employees.`;
        }

        if (limitInfo.currentCount + count > limitInfo.maxCount) {
          return `Cannot add ${count} employee(s). You have ${limitInfo.currentCount} employees and can only add ${limitInfo.canAddCount} more with the current limit of ${limitInfo.maxCount} employees.`;
        }

        return 'Unknown employee limit error';
      }

      if (limitInfo.currentCount >= limitInfo.maxCount) {
        return `Employee limit reached! Your ${limitInfo.planName} plan (${limitInfo.tierInfo.minEmployees}-${limitInfo.tierInfo.maxEmployees} employees tier) allows maximum ${limitInfo.maxCount} employees. You currently have ${limitInfo.currentCount} employees. Please upgrade to a higher tier to add more employees.`;
      }

      if (limitInfo.currentCount + count > limitInfo.maxCount) {
        return `Cannot add ${count} employee(s). Your ${limitInfo.planName} plan (${limitInfo.tierInfo.minEmployees}-${limitInfo.tierInfo.maxEmployees} employees tier) allows maximum ${limitInfo.maxCount} employees. You currently have ${limitInfo.currentCount} employees and can only add ${limitInfo.canAddCount} more. Please upgrade to a higher tier to add more employees.`;
      }

      return 'Unknown employee limit error';
    },
    [userSubscription, limitInfo],
  );

  const getUpgradeMessage = useCallback((): string => {
    if (!userSubscription?.subscription_plan) {
      const usagePercentage = (limitInfo.currentCount / limitInfo.maxCount) * 100;

      if (usagePercentage >= 100) {
        return `You've reached the employee limit (${limitInfo.maxCount} employees). Upgrade your plan for more employees.`;
      } else if (usagePercentage >= 80) {
        return `You're approaching the employee limit (${limitInfo.currentCount}/${limitInfo.maxCount}). Consider upgrading your plan.`;
      }

      return `Current limit: ${limitInfo.maxCount} employees`;
    }

    const usagePercentage = (limitInfo.currentCount / limitInfo.maxCount) * 100;

    if (usagePercentage >= 100) {
      return `You've reached your ${limitInfo.planName} plan limit (${limitInfo.tierInfo.minEmployees}-${limitInfo.tierInfo.maxEmployees} employees). Upgrade to a higher tier for more employees.`;
    } else if (usagePercentage >= 80) {
      return `You're approaching your ${limitInfo.planName} plan limit (${limitInfo.tierInfo.minEmployees}-${limitInfo.tierInfo.maxEmployees} employees). Consider upgrading to a higher tier.`;
    }

    return `Current tier: ${limitInfo.planName} (${limitInfo.tierInfo.minEmployees}-${limitInfo.tierInfo.maxEmployees} employees)`;
  }, [userSubscription, limitInfo]);

  return {
    limitInfo,
    isLoading: isLoadingSubscription || isLoadingStats,
    checkCanAddEmployees,
    getAddEmployeeErrorMessage,
    getUpgradeMessage,
  };
};
