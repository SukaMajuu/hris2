'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { FilterX, Calendar, CheckCircle, Clock, Timer } from 'lucide-react';

interface FilterOptions {
  date?: string;
  attendanceStatus?: string;
}

interface AttendanceFilterProps {
  onApplyFilters: (filters: FilterOptions) => void;
  onResetFilters: () => void;
  currentFilters: FilterOptions;
  isVisible: boolean;
}

export function AttendanceFilter({
  onApplyFilters,
  onResetFilters,
  currentFilters,
  isVisible,
}: AttendanceFilterProps) {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(currentFilters);

  const handleInputChange = (field: keyof FilterOptions, value: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      [field]: value || undefined,
    }));
  };

  const handleApply = () => {
    // Remove empty values
    const cleanFilters = Object.entries(localFilters).reduce((acc, [key, value]) => {
      if (value && value.trim() !== '') {
        acc[key as keyof FilterOptions] = value.trim();
      }
      return acc;
    }, {} as FilterOptions);

    onApplyFilters(cleanFilters);
  };

  const handleReset = () => {
    setLocalFilters({});
    onResetFilters();
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'On Time':
        return <CheckCircle className='h-4 w-4 text-green-500' />;
      case 'Early Leave':
        return <CheckCircle className='h-4 w-4 text-yellow-500' />;
      case 'Late':
        return <Clock className='h-4 w-4 text-red-500' />;
      case 'Leave':
        return <Timer className='h-4 w-4 text-red-500' />;
      case 'Permission':
        return <Timer className='h-4 w-4 text-purple-500' />;
      default:
        return <CheckCircle className='h-4 w-4 text-slate-500' />;
    }
  };
  // Always show filter regardless of isVisible prop
  return (
    <Card className='rounded-xl border-2 border-slate-200 bg-white py-0 shadow-xs transition-shadow duration-200 dark:border-slate-700 dark:bg-slate-900'>
      <CardContent className='p-6'>
        {' '}
        <div className='space-y-6'>
          {/* Filter Controls */}
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {/* Date Filter */}
            <div className='space-y-2'>
              <Label
                htmlFor='date-filter'
                className='flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300'
              >
                <Calendar className='h-4 w-4 flex-shrink-0 text-slate-500' />
                <span className='truncate'>Select Date</span>
              </Label>{' '}
              <Input
                id='date-filter'
                type='date'
                value={localFilters.date || ''}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className='h-11 w-full rounded-md border-slate-300 bg-white px-3 transition-colors duration-200 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:focus:ring-blue-800'
                placeholder='dd/mm/yyyy'
              />
            </div>

            {/* Attendance Status Filter */}
            <div className='flex flex-col gap-2'>
              <Label
                htmlFor='status-filter'
                className='flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300'
              >
                <CheckCircle className='h-4 w-4 flex-shrink-0 text-green-500' />
                <span className='truncate'>Attendance Status</span>
              </Label>
              <Select
                value={localFilters.attendanceStatus || 'all'}
                onValueChange={(value) =>
                  handleInputChange('attendanceStatus', value === 'all' ? '' : value)
                }
              >
                <SelectTrigger className='w-full flex-1 rounded-md border-slate-300 bg-white px-3 transition-colors duration-200 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:focus:ring-blue-800'>
                  <SelectValue placeholder='All Status' />
                </SelectTrigger>
                <SelectContent className='rounded-md border-slate-300 bg-white p-1 shadow-lg dark:border-slate-600 dark:bg-slate-800'>
                  <SelectItem
                    value='all'
                    className='cursor-pointer rounded-sm px-3 py-2 transition-colors duration-150 hover:bg-slate-100 dark:hover:bg-slate-700'
                  >
                    <div className='flex w-full items-center gap-3'>
                      <CheckCircle className='h-4 w-4 flex-shrink-0 text-slate-500' />
                      <span className='font-medium'>All Status</span>
                    </div>
                  </SelectItem>
                  <SelectItem
                    value='Present'
                    className='cursor-pointer rounded-sm px-3 py-2 transition-colors duration-150 hover:bg-green-50 dark:hover:bg-green-950'
                  >
                    <div className='flex w-full items-center gap-3'>
                      <CheckCircle className='h-4 w-4 flex-shrink-0 text-green-500' />
                      <span className='font-medium text-green-700 dark:text-green-300'>
                        On Time
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem
                    value='Early Leave'
                    className='cursor-pointer rounded-sm px-3 py-2 transition-colors duration-150 hover:bg-green-50 dark:hover:bg-green-950'
                  >
                    <div className='flex w-full items-center gap-3'>
                      <CheckCircle className='h-4 w-4 flex-shrink-0 text-green-500' />
                      <span className='font-medium text-green-700 dark:text-green-300'>
                        Early Leave
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem
                    value='Late'
                    className='cursor-pointer rounded-sm px-3 py-2 transition-colors duration-150 hover:bg-red-50 dark:hover:bg-red-950'
                  >
                    <div className='flex w-full items-center gap-3'>
                      <Clock className='h-4 w-4 flex-shrink-0 text-red-500' />
                      <span className='font-medium text-red-700 dark:text-red-300'>Late</span>
                    </div>
                  </SelectItem>
                  <SelectItem
                    value='Absent'
                    className='cursor-pointer rounded-sm px-3 py-2 transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-950'
                  >
                    <div className='flex w-full items-center gap-3'>
                      <Timer className='h-4 w-4 flex-shrink-0 text-gray-500' />
                      <span className='font-medium text-gray-700 dark:text-gray-300'>Absent</span>
                    </div>
                  </SelectItem>
                  <SelectItem
                    value='On Leave'
                    className='cursor-pointer rounded-sm px-3 py-2 transition-colors duration-150 hover:bg-purple-50 dark:hover:bg-purple-950'
                  >
                    <div className='flex w-full items-center gap-3'>
                      <Calendar className='h-4 w-4 flex-shrink-0 text-purple-500' />
                      <span className='font-medium text-purple-700 dark:text-purple-300'>
                        On Leave
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filter Actions */}
            <div className='space-y-2'>
              <Label className='flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300'>
                <FilterX className='h-4 w-4 flex-shrink-0 text-slate-500' />
                <span className='truncate'>Actions</span>
              </Label>
              <div className='flex w-full gap-3'>
                <Button
                  onClick={handleReset}
                  variant='outline'
                  className='h-11 flex-1 gap-2 rounded-md border-2 border-red-300 px-6 font-medium text-red-600 transition-colors duration-200 hover:border-red-400 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950'
                >
                  <FilterX className='h-4 w-4' />
                  Reset
                </Button>
                <Button
                  onClick={handleApply}
                  className='h-11 flex-1 gap-2 rounded-md border-2 border-blue-500 bg-blue-500 px-6 font-semibold text-white shadow-sm transition-colors duration-200 hover:border-blue-600 hover:bg-blue-600 hover:shadow-md active:bg-blue-700'
                >
                  <span>Apply Filter</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {(localFilters.date || localFilters.attendanceStatus) && (
            <div className='mt-4 border-t border-slate-200 pt-4 dark:border-slate-700'>
              <div className='flex flex-wrap items-center gap-2'>
                <span className='text-sm font-medium text-slate-600 dark:text-slate-400'>
                  Active Filters:
                </span>
                {localFilters.date && (
                  <span className='inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-200'>
                    <Calendar className='h-3 w-3' />
                    {new Date(localFilters.date).toLocaleDateString()}
                  </span>
                )}
                {localFilters.attendanceStatus && (
                  <span className='inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs text-green-800 dark:bg-green-900 dark:text-green-200'>
                    {getStatusIcon(localFilters.attendanceStatus)}
                    {localFilters.attendanceStatus}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
