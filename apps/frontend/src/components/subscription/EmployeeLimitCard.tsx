import { Users, TrendingUp, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSubscriptionLimit } from '@/hooks/useSubscriptionLimit';

interface EmployeeLimitCardProps {
  className?: string;
}

export const EmployeeLimitCard: React.FC<EmployeeLimitCardProps> = ({ className }) => {
  const { limitInfo, isLoading, getUpgradeMessage } = useSubscriptionLimit();

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className='p-6'>
          <div className='animate-pulse'>
            <div className='mb-2 h-4 w-3/4 rounded bg-gray-200' />
            <div className='mb-4 h-8 w-full rounded bg-gray-200' />
            <div className='h-2 w-full rounded bg-gray-200' />
          </div>
        </CardContent>
      </Card>
    );
  }

  const usagePercentage =
    limitInfo.maxCount > 0 ? Math.min((limitInfo.currentCount / limitInfo.maxCount) * 100, 100) : 0;

  const getStatusColor = () => {
    if (usagePercentage >= 100) return 'text-red-600';
    if (usagePercentage >= 80) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProgressBarColor = () => {
    if (usagePercentage >= 100) return 'bg-red-500';
    if (usagePercentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getBadgeVariant = (): 'default' | 'secondary' | 'destructive' | 'outline' => {
    return 'default';

    // if (usagePercentage >= 100) return "destructive";
    // if (usagePercentage >= 80) return "secondary";
    // return "default";
  };

  return (
    <Card className='border border-gray-100 transition-shadow hover:shadow-md dark:border-gray-800'>
      <CardHeader className='pb-3'>
        <CardTitle className='flex items-center justify-between text-sm font-medium'>
          <div className='flex items-center gap-2'>
            <Users className='h-4 w-4' />
            Employee Usage
          </div>
          <Badge variant={getBadgeVariant()}>{limitInfo.planName} Plan</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <div className='text-sm text-gray-600 dark:text-gray-400'>
            <div className='mb-1 flex items-center justify-between'>
              <span>Current Tier:</span>
              <span className='font-medium'>
                {limitInfo.tierInfo.minEmployees}-{limitInfo.tierInfo.maxEmployees} Employees
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <span>Employees Used:</span>
              <span className={`font-medium ${getStatusColor()}`}>
                {limitInfo.currentCount} / {limitInfo.maxCount}
              </span>
            </div>
          </div>

          <div className='space-y-2'>
            <div className='h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700'>
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor()}`}
                style={{ width: `${usagePercentage}%` }}
              />
            </div>
            <div className='flex justify-between text-xs text-gray-500'>
              <span>{usagePercentage.toFixed(1)}% used</span>
              <span>{limitInfo.canAddCount} remaining</span>
            </div>
          </div>

          <div className='text-sm'>
            {(() => {
              if (usagePercentage >= 100) {
                return (
                  <div className='flex items-center gap-2 text-red-600'>
                    <AlertTriangle className='h-4 w-4' />
                    <span>Employee limit reached</span>
                  </div>
                );
              }
              if (usagePercentage >= 80) {
                return (
                  <div className='flex items-center gap-2 text-yellow-600'>
                    <TrendingUp className='h-4 w-4' />
                    <span>Approaching limit</span>
                  </div>
                );
              }
              return (
                <div className='flex items-center gap-2 text-green-600'>
                  <Users className='h-4 w-4' />
                  <span>Good capacity available</span>
                </div>
              );
            })()}
          </div>

          <div className='text-sm text-gray-600 dark:text-gray-400'>{getUpgradeMessage()}</div>

          {usagePercentage >= 80 && (
            <div className='pt-2'>
              <Link href='/subscription?view=seat' passHref>
                <Button
                  size='sm'
                  className='w-full'
                  variant={usagePercentage >= 100 ? 'default' : 'outline'}
                  style={{ cursor: 'pointer' }}
                >
                  {usagePercentage >= 100 ? 'Upgrade Now' : 'View Upgrade Options'}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
