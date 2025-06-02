import { CalendarIcon, UsersIcon, UserPlusIcon, BriefcaseIcon } from 'lucide-react';
import { StatCard } from './StatCard';

interface StatsSectionProps {
  totalEmployees: number;
  totalNewHire: number;
  currentPeriod: string;
}

export function StatsSection({ totalEmployees, totalNewHire, currentPeriod }: StatsSectionProps) {
  return (
    <div className='mb-6'>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <StatCard
          label='Period'
          value={currentPeriod}
          icon={<CalendarIcon className='h-5 w-5' />}
          description='Current reporting period'
        />
        <StatCard
          label='Total Employee'
          value={totalEmployees}
          icon={<UsersIcon className='h-5 w-5' />}
          trend={{ value: 5, label: 'from last month' }}
        />
        <StatCard
          label='Total New Hire'
          value={totalNewHire}
          icon={<UserPlusIcon className='h-5 w-5' />}
          trend={{ value: 15, label: 'from last month' }}
        />
        <StatCard
          label='Full Time Employee'
          value='188'
          icon={<BriefcaseIcon className='h-5 w-5' />}
          trend={{ value: 3, label: 'from last month' }}
        />
      </div>
    </div>
  );
}
