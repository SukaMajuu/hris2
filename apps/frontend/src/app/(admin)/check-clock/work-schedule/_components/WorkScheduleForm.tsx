'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  WorkScheduleFormType,
  WorkScheduleDetailRow,
  CreateWorkScheduleRequest,
  UpdateWorkScheduleRequest,
  transformFormToCreateRequest,
  transformFormToUpdateRequest,
  transformWorkScheduleToForm,
  WorkSchedule,
} from '@/types/work-schedule.types';
import { CalendarClock, CalendarCog, MapPin, PlusCircle, Trash2 } from 'lucide-react'; // Added PlusCircle, Trash2
import { MultiSelect } from '@/components/multiSelect';

interface Location {
  value: string;
  label: string;
  latitude?: string;
  longitude?: string;
}

interface WorkScheduleFormProps {
  initialData?: WorkSchedule; // API type
  onSubmit: (data: CreateWorkScheduleRequest | UpdateWorkScheduleRequest) => void; // Accepts both types
  isEditMode?: boolean;
  isLoading?: boolean;
  locations?: Location[];
  MapComponent?: React.ComponentType<{
    latitude?: number;
    longitude?: number;
    radius?: number;
    interactive?: boolean;
  }>;
}

// Default empty work schedule detail untuk inisialisasi
const emptyWorkScheduleDetail: WorkScheduleDetailRow = {
  id: 0,
  workTypeChildren: '',
  workDays: [],
  checkInStart: '',
  checkInEnd: '',
  breakStart: '',
  breakEnd: '',
  checkOutStart: '',
  checkOutEnd: '',
  locationId: '',
  locationName: '',
  addressDetails: '',
  latitude: '',
  longitude: '',
  radiusM: null,
};

// Pilihan hari kerja
const daysOfWeek = [
  { label: 'Monday', value: 'Monday' },
  { label: 'Tuesday', value: 'Tuesday' },
  { label: 'Wednesday', value: 'Wednesday' },
  { label: 'Thursday', value: 'Thursday' },
  { label: 'Friday', value: 'Friday' },
  { label: 'Saturday', value: 'Saturday' },
  { label: 'Sunday', value: 'Sunday' },
];

// Default locations jika tidak ada props
const defaultLocations: Location[] = [
  {
    value: '1',
    label: 'Default Office 1 (Malang)',
    latitude: '-7.983908',
    longitude: '112.621391',
  },
  { value: '2', label: 'Default Office 2 (Jakarta)', latitude: '-6.2088', longitude: '106.8456' },
];

export function WorkScheduleForm({
  initialData,
  onSubmit,
  isEditMode = false,
  isLoading = false,
  locations = [],
  MapComponent,
}: WorkScheduleFormProps) {
  const router = useRouter();
  const formRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isDataLoaded = useRef(false); // Prevent multiple data loads
  const lastProcessedId = useRef<number | undefined>(undefined); // Track last processed ID

  // Track deleted details for update requests
  const [deletedDetailIds, setDeletedDetailIds] = useState<number[]>([]);

  // Initialize with transformed data if available, otherwise use defaults
  const [formData, setFormData] = useState<WorkScheduleFormType>(() => {
    if (initialData?.id) {
      return transformWorkScheduleToForm(initialData);
    }
    return {
      nama: '',
      workType: '',
      workScheduleDetails: [{ ...emptyWorkScheduleDetail }],
    };
  }); // Update form data when initialData changes (for edit mode)
  useEffect(() => {
    // Only process if we have valid data and haven't processed this ID yet
    if (!initialData?.id) {
      return;
    }

    // Check if this is the same ID we already processed
    if (lastProcessedId.current === initialData.id) {
      return;
    }

    try {
      const transformedData = transformWorkScheduleToForm(initialData);

      // Update tracking refs before setting state
      lastProcessedId.current = initialData.id;
      isDataLoaded.current = true;

      setFormData(transformedData);
      // Reset deleted details when loading new data
      setDeletedDetailIds([]);
    } catch (error) {
      console.error('Error transforming data:', error);
    }
  }, [initialData]);
  // Update referensi DOM saat jumlah detail berubah
  useEffect(() => {
    formRefs.current = formRefs.current.slice(0, formData.workScheduleDetails?.length || 0);
  }, [formData.workScheduleDetails?.length]);

  // Gunakan locations dari props atau default
  const locationsList = locations.length ? locations : defaultLocations;
  /**
   * Handler untuk mengubah satu field dari detail jadwal kerja
   */
  const handleDetailChange = (
    idx: number,
    key: keyof WorkScheduleDetailRow,
    value: string | string[],
  ) => {
    setFormData((prev) => {
      const details = [...prev.workScheduleDetails];
      const currentDetail = details[idx] || { ...emptyWorkScheduleDetail };
      details[idx] = { ...currentDetail, [key]: value };
      return { ...prev, workScheduleDetails: details };
    });
  };

  /**
   * Handler khusus untuk perubahan lokasi
   * Akan mengisi otomatis data lokasi (lat, long, address) berdasarkan pilihan
   */
  const handleLocationChange = (idx: number, locationId: string) => {
    const selectedLocation = locationsList.find((loc) => loc.value === locationId);
    if (!selectedLocation) return;

    setFormData((prev) => {
      const details = [...prev.workScheduleDetails];
      const currentDetail = details[idx] || { ...emptyWorkScheduleDetail };
      details[idx] = {
        ...currentDetail,
        locationId,
        locationName: selectedLocation.label,
        latitude: selectedLocation.latitude || '',
        longitude: selectedLocation.longitude || '',
        addressDetails: selectedLocation.label || '', // Or a more specific address if available
      };
      return { ...prev, workScheduleDetails: details };
    });
  }; /**
   * Menambahkan detail jadwal baru
   */
  const handleAddDetail = () => {
    setFormData((prev) => {
      const newDetail = { ...emptyWorkScheduleDetail };

      // Auto-set work type based on main work type
      if (prev.workType === 'WFO') {
        newDetail.workTypeChildren = 'WFO';
      } else if (prev.workType === 'WFA') {
        newDetail.workTypeChildren = 'WFA';
      } else if (prev.workType === 'Hybrid') {
        // For hybrid, check what types are missing
        const hasWFO = prev.workScheduleDetails.some(
          (detail) => detail?.workTypeChildren === 'WFO',
        );
        const hasWFA = prev.workScheduleDetails.some(
          (detail) => detail?.workTypeChildren === 'WFA',
        );

        // Default to the missing type, or WFO if both exist
        if (!hasWFO) {
          newDetail.workTypeChildren = 'WFO';
        } else if (!hasWFA) {
          newDetail.workTypeChildren = 'WFA';
        } else {
          newDetail.workTypeChildren = 'WFO'; // Default if both exist
        }
      }

      const newDetails = [...prev.workScheduleDetails, newDetail];
      setTimeout(() => {
        formRefs.current[newDetails.length - 1]?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
      return { ...prev, workScheduleDetails: newDetails };
    });
  }; /**
   * Menghapus detail jadwal
   */
  const handleRemoveDetail = (idx: number) => {
    setFormData((prev) => {
      // Check if removing this detail would violate Hybrid rules
      if (prev.workType === 'Hybrid') {
        const remainingDetails = prev.workScheduleDetails.filter((_, index) => index !== idx);

        if (remainingDetails.length < 2) {
          alert('Hybrid work type requires at least 2 work schedule details.');
          return prev;
        }

        const hasWFO = remainingDetails.some((detail) => detail?.workTypeChildren === 'WFO');
        const hasWFA = remainingDetails.some((detail) => detail?.workTypeChildren === 'WFA');

        if (!hasWFO || !hasWFA) {
          alert(
            'Cannot remove this detail. Hybrid work type must have at least one WFO and one WFA detail.',
          );
          return prev;
        }
      }

      const detailToRemove = prev.workScheduleDetails[idx];

      // If this is an existing detail (has an ID), add it to deleted list
      if (detailToRemove?.id && isEditMode) {
        setDeletedDetailIds((currentDeleted) => [...currentDeleted, detailToRemove.id!]);
      }

      const details = prev.workScheduleDetails.filter((_, index) => index !== idx);
      // Ensure at least one detail row remains
      if (details.length === 0) {
        return { ...prev, workScheduleDetails: [{ ...emptyWorkScheduleDetail }] };
      }
      return { ...prev, workScheduleDetails: details };
    });
  }; /**
   * Handler untuk perubahan main work type
   * Mengatur logika work schedule detail berdasarkan main work type
   */
  const handleMainWorkTypeChange = (value: string) => {
    setFormData((prev) => {
      let updatedDetails = [...prev.workScheduleDetails];

      if (value === 'WFO') {
        // Jika main work type WFO, semua detail harus WFO
        updatedDetails = updatedDetails.map((detail) => ({
          ...detail,
          workTypeChildren: 'WFO',
          // Clear location data jika sebelumnya WFA
          locationId: detail.workTypeChildren === 'WFA' ? '' : detail.locationId,
          locationName: detail.workTypeChildren === 'WFA' ? '' : detail.locationName,
          latitude: detail.workTypeChildren === 'WFA' ? '' : detail.latitude,
          longitude: detail.workTypeChildren === 'WFA' ? '' : detail.longitude,
          addressDetails: detail.workTypeChildren === 'WFA' ? '' : detail.addressDetails,
        }));
      } else if (value === 'WFA') {
        // Jika main work type WFA, semua detail harus WFA
        updatedDetails = updatedDetails.map((detail) => ({
          ...detail,
          workTypeChildren: 'WFA',
          // Clear location data untuk WFA
          locationId: '',
          locationName: '',
          latitude: '',
          longitude: '',
          addressDetails: '',
        }));
      } else if (value === 'Hybrid') {
        // Jika Hybrid, pastikan minimal ada 2 detail dengan WFO dan WFA
        if (updatedDetails.length === 1 && updatedDetails[0]) {
          // Tambah detail kedua dengan work type berbeda
          const firstDetailType = updatedDetails[0].workTypeChildren;
          const secondType = firstDetailType === 'WFO' ? 'WFA' : 'WFO';

          const newDetail = { ...emptyWorkScheduleDetail, workTypeChildren: secondType };
          updatedDetails.push(newDetail);
        } else if (updatedDetails.length >= 2) {
          // Pastikan ada minimal 1 WFO dan 1 WFA
          const hasWFO = updatedDetails.some((detail) => detail?.workTypeChildren === 'WFO');
          const hasWFA = updatedDetails.some((detail) => detail?.workTypeChildren === 'WFA');

          if (!hasWFO && updatedDetails[0]) {
            updatedDetails[0] = {
              ...updatedDetails[0],
              workTypeChildren: 'WFO',
              workDays: updatedDetails[0].workDays || [],
            };
          }
          if (!hasWFA) {
            const wfaIndex = updatedDetails.findIndex(
              (detail) => detail?.workTypeChildren !== 'WFO',
            );
            if (wfaIndex >= 0 && updatedDetails[wfaIndex]) {
              updatedDetails[wfaIndex] = {
                ...updatedDetails[wfaIndex],
                workTypeChildren: 'WFA',
                workDays: updatedDetails[wfaIndex]?.workDays || [],
                // Clear location data untuk WFA
                locationId: '',
                locationName: '',
                latitude: '',
                longitude: '',
                addressDetails: '',
              };
            }
          }
        }
      }

      return { ...prev, workType: value, workScheduleDetails: updatedDetails };
    });
  };

  /**
   * Handler untuk perubahan work type pada detail
   * Menangani validasi dan update location data sesuai work type
   */
  const handleDetailWorkTypeChange = (idx: number, value: string) => {
    setFormData((prev) => {
      const details = [...prev.workScheduleDetails];
      const currentDetail = details[idx] || { ...emptyWorkScheduleDetail };

      let updatedDetail = { ...currentDetail, workTypeChildren: value };

      // Clear location data jika berubah ke WFA
      if (value === 'WFA') {
        updatedDetail = {
          ...updatedDetail,
          locationId: '',
          locationName: '',
          latitude: '',
          longitude: '',
          addressDetails: '',
        };
      }

      details[idx] = updatedDetail;
      return { ...prev, workScheduleDetails: details };
    });
  };

  /**
   * Menentukan opsi work type yang diizinkan untuk detail berdasarkan main work type
   */
  const getAllowedWorkTypes = (detailIndex: number): string[] => {
    const mainWorkType = formData.workType;

    if (mainWorkType === 'WFO') {
      return ['WFO'];
    } else if (mainWorkType === 'WFA') {
      return ['WFA'];
    } else if (mainWorkType === 'Hybrid') {
      // Untuk Hybrid, pastikan minimal ada 1 WFO dan 1 WFA
      const otherDetails = formData.workScheduleDetails.filter((_, idx) => idx !== detailIndex);
      const hasOtherWFO = otherDetails.some((detail) => detail?.workTypeChildren === 'WFO');
      const hasOtherWFA = otherDetails.some((detail) => detail?.workTypeChildren === 'WFA');

      // Jika ini adalah satu-satunya WFO atau WFA, tidak bisa diubah
      const currentDetail = formData.workScheduleDetails[detailIndex];
      const isOnlyWFO = currentDetail?.workTypeChildren === 'WFO' && !hasOtherWFO;
      const isOnlyWFA = currentDetail?.workTypeChildren === 'WFA' && !hasOtherWFA;

      if (isOnlyWFO) {
        return ['WFO'];
      } else if (isOnlyWFA) {
        return ['WFA'];
      } else {
        return ['WFO', 'WFA'];
      }
    }

    return ['WFO', 'WFA'];
  };

  /**
   * Validasi enhanced untuk form
   */
  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!formData.nama) {
      errors.push('Schedule Name is required.');
    }

    if (!formData.workType) {
      errors.push('Main Work Type is required.');
    }

    if (!formData.workScheduleDetails || formData.workScheduleDetails.length === 0) {
      errors.push('At least one work schedule detail is required.');
    }

    // Validasi untuk Hybrid work type
    if (formData.workType === 'Hybrid') {
      if (formData.workScheduleDetails.length < 2) {
        errors.push('Hybrid work type requires at least 2 work schedule details.');
      }

      const hasWFO = formData.workScheduleDetails.some(
        (detail) => detail?.workTypeChildren === 'WFO',
      );
      const hasWFA = formData.workScheduleDetails.some(
        (detail) => detail?.workTypeChildren === 'WFA',
      );

      if (!hasWFO || !hasWFA) {
        errors.push('Hybrid work type must have at least one WFO and one WFA detail.');
      }
    }

    // Validasi untuk detail WFO atau WFA
    if (formData.workType === 'WFO') {
      const hasNonWFO = formData.workScheduleDetails.some(
        (detail) => detail?.workTypeChildren !== 'WFO',
      );
      if (hasNonWFO) {
        errors.push('All work schedule details must be WFO when main work type is WFO.');
      }
    }

    if (formData.workType === 'WFA') {
      const hasNonWFA = formData.workScheduleDetails.some(
        (detail) => detail?.workTypeChildren !== 'WFA',
      );
      if (hasNonWFA) {
        errors.push('All work schedule details must be WFA when main work type is WFA.');
      }
    }

    // Validasi detail individu
    for (const [index, detail] of formData.workScheduleDetails.entries()) {
      if (!detail.workTypeChildren) {
        errors.push(`Detail #${index + 1}: Work Type is required.`);
      }

      if (!detail.workDays || detail.workDays.length === 0) {
        errors.push(`Detail #${index + 1}: At least one work day is required.`);
      }

      if (detail.workTypeChildren === 'WFO' && !detail.locationId) {
        errors.push(`Detail #${index + 1}: Location is required for WFO details.`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }; /**
   * Submit handler yang mentransform data form ke format API
   */
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Enhanced validation
    const validation = validateForm();
    if (!validation.isValid) {
      alert(validation.errors.join('\n'));
      return;
    }

    // Use the appropriate transformation based on edit mode
    if (isEditMode) {
      const updateRequest = transformFormToUpdateRequest(formData, deletedDetailIds);
      onSubmit(updateRequest);
    } else {
      const createRequest = transformFormToCreateRequest(formData);
      onSubmit(createRequest);
    }
  };

  return (
    <form onSubmit={handleSave} className='mx-auto max-w-4xl space-y-6'>
      {/* Basic Information */}
      <Card className='border-gray-200 shadow-sm'>
        <CardContent className='p-6'>
          <div className='mb-6 flex items-center gap-2'>
            <CalendarClock className='h-6 w-6 text-[#6B9AC4]' />
            <h3 className='text-xl font-semibold text-gray-800'>Work Schedule Information</h3>
          </div>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='nama' className='text-sm font-medium'>
                Schedule Name <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='nama'
                value={formData.nama ?? ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, nama: e.target.value }))}
                placeholder='Enter Schedule Name'
                className='focus-visible:border-[#6B9AC4] focus-visible:ring-[#6B9AC4]'
                required
              />
            </div>{' '}
            <div className='space-y-2'>
              <Label htmlFor='workType' className='text-sm font-medium'>
                Main Work Type <span className='text-red-500'>*</span>
              </Label>
              <Select
                value={formData.workType ?? ''}
                onValueChange={handleMainWorkTypeChange}
                required
              >
                <SelectTrigger className='w-full border-gray-300 bg-white'>
                  <SelectValue placeholder='Select main work type' />
                </SelectTrigger>
                <SelectContent className='bg-white'>
                  <SelectItem value='WFO'>Work From Office (WFO)</SelectItem>
                  <SelectItem value='WFA'>Work From Anywhere (WFA)</SelectItem>
                  <SelectItem value='Hybrid'>Hybrid</SelectItem>
                </SelectContent>
              </Select>
              {/* Helper text for work type rules */}
              {formData.workType && (
                <div className='mt-1 text-xs text-gray-500'>
                  {formData.workType === 'WFO' && 'All work schedule details will be set to WFO'}
                  {formData.workType === 'WFA' && 'All work schedule details will be set to WFA'}
                  {formData.workType === 'Hybrid' &&
                    'Requires at least 2 details with both WFO and WFA'}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Work Schedule Details */}
      {formData.workScheduleDetails.map((detail, idx) => (
        <div
          key={idx}
          className='relative rounded-lg border border-gray-200 shadow-sm'
          ref={(el) => {
            formRefs.current[idx] = el;
          }}
        >
          <Card className='border-none'>
            <div className='flex items-center justify-between rounded-t-lg bg-gray-50 p-4'>
              <div className='flex items-center gap-2'>
                <CalendarCog className='h-5 w-5 text-gray-600' />
                <h4 className='text-md font-semibold text-gray-700'>Schedule Detail #{idx + 1}</h4>
              </div>
              {formData.workScheduleDetails.length > 1 && (
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={() => handleRemoveDetail(idx)}
                  className='text-red-500 hover:bg-red-50 hover:text-red-700'
                >
                  <Trash2 className='mr-1 h-4 w-4' /> Remove Detail
                </Button>
              )}
            </div>

            <CardContent className='p-6'>
              <div className='mb-6 grid grid-cols-1 gap-6 md:grid-cols-2'>
                {' '}
                <div className='space-y-2'>
                  <Label htmlFor={`workTypeChildren-${idx}`} className='text-sm font-medium'>
                    Detail Work Type <span className='text-red-500'>*</span>
                  </Label>
                  <Select
                    value={detail.workTypeChildren}
                    onValueChange={(value) => handleDetailWorkTypeChange(idx, value)}
                    required
                  >
                    <SelectTrigger className='w-full border-gray-300 bg-white'>
                      <SelectValue placeholder='Select detail work type' />
                    </SelectTrigger>
                    <SelectContent className='bg-white'>
                      {getAllowedWorkTypes(idx).includes('WFO') && (
                        <SelectItem value='WFO'>Work From Office (WFO)</SelectItem>
                      )}
                      {getAllowedWorkTypes(idx).includes('WFA') && (
                        <SelectItem value='WFA'>Work From Anywhere (WFA)</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {/* Show constraint info for Hybrid mode */}
                  {formData.workType === 'Hybrid' && getAllowedWorkTypes(idx).length === 1 && (
                    <div className='mt-1 text-xs text-amber-600'>
                      🔒 Required to maintain Hybrid balance (need both WFO and WFA)
                    </div>
                  )}
                </div>
                <div className='space-y-2'>
                  <Label htmlFor={`workDays-${idx}`} className='text-sm font-medium'>
                    Work Days <span className='text-red-500'>*</span>
                  </Label>
                  <MultiSelect
                    options={daysOfWeek}
                    value={detail.workDays} // Changed from selected to value
                    onChange={(selected) => handleDetailChange(idx, 'workDays', selected)}
                    placeholder='Select work days'
                    className='border-gray-300 bg-white'
                  />
                </div>
              </div>

              {/* Time Inputs */}
              <div className='mb-6 grid grid-cols-1 gap-6 md:grid-cols-3'>
                <div className='space-y-2'>
                  <Label htmlFor={`checkIn-${idx}`} className='text-sm font-medium'>
                    Check-in (Start - End)
                  </Label>
                  <div className='flex gap-2'>
                    <Input
                      type='time'
                      value={detail.checkInStart}
                      onChange={(e) => handleDetailChange(idx, 'checkInStart', e.target.value)}
                      className='bg-white'
                    />
                    <Input
                      type='time'
                      value={detail.checkInEnd}
                      onChange={(e) => handleDetailChange(idx, 'checkInEnd', e.target.value)}
                      className='bg-white'
                    />
                  </div>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor={`break-${idx}`} className='text-sm font-medium'>
                    Break (Start - End)
                  </Label>
                  <div className='flex gap-2'>
                    <Input
                      type='time'
                      value={detail.breakStart}
                      onChange={(e) => handleDetailChange(idx, 'breakStart', e.target.value)}
                      className='bg-white'
                    />
                    <Input
                      type='time'
                      value={detail.breakEnd}
                      onChange={(e) => handleDetailChange(idx, 'breakEnd', e.target.value)}
                      className='bg-white'
                    />
                  </div>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor={`checkOut-${idx}`} className='text-sm font-medium'>
                    Check-out (Start - End)
                  </Label>
                  <div className='flex gap-2'>
                    <Input
                      type='time'
                      value={detail.checkOutStart}
                      onChange={(e) => handleDetailChange(idx, 'checkOutStart', e.target.value)}
                      className='bg-white'
                    />
                    <Input
                      type='time'
                      value={detail.checkOutEnd}
                      onChange={(e) => handleDetailChange(idx, 'checkOutEnd', e.target.value)}
                      className='bg-white'
                    />
                  </div>
                </div>
              </div>

              {/* Location Section - Conditional */}
              {detail.workTypeChildren === 'WFO' && (
                <div className='space-y-4 border-t border-gray-200 pt-6'>
                  <div className='flex items-center gap-2'>
                    <MapPin className='h-5 w-5 text-gray-600' />
                    <h5 className='text-md font-semibold text-gray-700'>
                      Location (for WFO) <span className='text-red-500'>*</span>
                    </h5>
                  </div>
                  <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                    <div className='space-y-2'>
                      <Label htmlFor={`location-${idx}`} className='text-sm font-medium'>
                        Select Location
                      </Label>
                      <Select
                        value={detail.locationId || ''}
                        onValueChange={(value) => handleLocationChange(idx, value)}
                        required={detail.workTypeChildren === 'WFO'}
                      >
                        <SelectTrigger className='w-full border-gray-300 bg-white'>
                          <SelectValue placeholder='Select location' />
                        </SelectTrigger>
                        <SelectContent className='bg-white'>
                          {locationsList.map((loc) => (
                            <SelectItem key={loc.value} value={loc.value}>
                              {loc.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {detail.locationName && (
                      <div className='space-y-2'>
                        <Label className='text-sm font-medium'>Selected Location Details</Label>
                        <p className='rounded-md border border-gray-200 bg-gray-50 p-2 text-sm'>
                          {detail.locationName}
                          <br />
                          <span className='text-xs text-gray-500'>
                            Lat: {detail.latitude || 'N/A'}, Long: {detail.longitude || 'N/A'}{' '}
                            <br />
                            Address: {detail.addressDetails || 'N/A'}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                  {MapComponent && detail.latitude && detail.longitude && (
                    <div className='mt-4 h-48 w-full overflow-hidden rounded-md border border-gray-300'>
                      <MapComponent
                        latitude={parseFloat(detail.latitude)}
                        longitude={parseFloat(detail.longitude)}
                        radius={50} // Example radius
                        interactive={false}
                      />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ))}

      <div className='mt-6 flex items-center justify-between'>
        <Button
          type='button'
          variant='outline'
          onClick={handleAddDetail}
          className='border-dashed border-[#6B9AC4] text-[#6B9AC4] hover:bg-[#6B9AC4]/10'
        >
          <PlusCircle className='mr-2 h-4 w-4' /> Add Another Detail
        </Button>
        <div className='flex gap-3'>
          <Button
            type='button'
            variant='outline'
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type='submit'
            className='bg-[#6B9AC4] text-white hover:bg-[#5A89B3]'
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Schedule'}
          </Button>
        </div>
      </div>
    </form>
  );
}
