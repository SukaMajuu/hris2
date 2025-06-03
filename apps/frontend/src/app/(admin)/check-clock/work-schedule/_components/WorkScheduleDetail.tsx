import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import WorkTypeBadge from '@/components/workTypeBadge';
import { WorkType } from '@/const/work';
import { WorkScheduleDetailItem } from '@/types/work-schedule.types';

interface WorkScheduleDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scheduleName?: string;
  workScheduleType?: string;
  workScheduleDetails: WorkScheduleDetailItem[];
}

const WorkScheduleDetailDialog = ({
  open,
  onOpenChange,
  scheduleName,
  workScheduleType,
  workScheduleDetails,
}: WorkScheduleDetailDialogProps) => {
  // Define day order for sorting (Monday to Sunday)
  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']; // Flatten details: satu hari = satu baris
  const flattenDetails = (details: WorkScheduleDetailItem[]) => {
    const result: Array<WorkScheduleDetailItem & { singleDay: string }> = [];
    details.forEach((detail) => {
      if (Array.isArray(detail.workdays) && detail.workdays.length > 0) {
        detail.workdays.forEach((day) => {
          result.push({ ...detail, singleDay: day });
        });
      } else {
        // Handle case where workdays is empty or not an array
        result.push({ ...detail, singleDay: '-' });
      }
    });

    // Sort by day order (Monday to Sunday)
    return result.sort((a, b) => {
      const dayIndexA = dayOrder.indexOf(a.singleDay);
      const dayIndexB = dayOrder.indexOf(b.singleDay);

      // If day is not found in dayOrder, put it at the end
      if (dayIndexA === -1 && dayIndexB === -1) return 0;
      if (dayIndexA === -1) return 1;
      if (dayIndexB === -1) return -1;

      return dayIndexA - dayIndexB;
    });
  };
  const flattenedDetails = flattenDetails(workScheduleDetails);
  // Helper format waktu
  const formatTimeRange = (start?: string | null, end?: string | null) => {
    if (!start && !end) return '-';
    const startTime = start || '--:--';
    const endTime = end || '--:--';
    return `${startTime} - ${endTime}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-[calc(100vw-2rem)] sm:max-w-4xl'>
        <DialogHeader>
          <DialogTitle>Work Schedule Detail</DialogTitle>
          <DialogDescription>
            Detail jadwal kerja untuk schedule: <strong>{scheduleName}</strong> ({workScheduleType})
          </DialogDescription>
        </DialogHeader>
        <Card className='border-none py-0 shadow-sm'>
          <CardContent className='p-6'>
            <div className='overflow-x-auto rounded-md border'>
              <table className='w-full table-fixed text-sm'>
                <colgroup>
                  <col className='w-24' />
                  <col className='w-28' />
                  <col className='w-32' />
                  <col className='w-32' />
                  <col className='w-32' />
                  <col className='w-40' />
                </colgroup>
                <thead>
                  <tr className='bg-slate-50'>
                    <th className='px-3 py-2 text-left whitespace-nowrap'>Hari</th>
                    <th className='px-3 py-2 text-left whitespace-nowrap'>Work Type</th>
                    <th className='px-3 py-2 text-left whitespace-nowrap'>Check-in</th>
                    <th className='px-3 py-2 text-left whitespace-nowrap'>Break</th>
                    <th className='px-3 py-2 text-left whitespace-nowrap'>Check-out</th>
                    <th className='px-3 py-2 text-left whitespace-nowrap'>Location</th>
                  </tr>
                </thead>
                <tbody>
                  {flattenedDetails.length === 0 ? (
                    <tr>
                      <td colSpan={6} className='py-4 text-center text-slate-400'>
                        No details available.
                      </td>
                    </tr>
                  ) : (
                    flattenedDetails.map((detail, idx) => (
                      <tr key={idx} className='border-b last:border-b-0'>
                        <td className='px-3 py-2 font-medium whitespace-nowrap'>
                          {detail.singleDay}
                        </td>
                        <td className='px-3 py-2 whitespace-nowrap'>
                          <WorkTypeBadge workType={detail.worktype_detail as WorkType} />
                        </td>{' '}
                        <td className='px-3 py-2 whitespace-nowrap'>
                          {formatTimeRange(detail.checkin_start, detail.checkin_end)}
                        </td>
                        <td className='px-3 py-2 whitespace-nowrap'>
                          {formatTimeRange(detail.break_start, detail.break_end)}
                        </td>
                        <td className='px-3 py-2 whitespace-nowrap'>
                          {formatTimeRange(detail.checkout_start, detail.checkout_end)}
                        </td>
                        <td
                          className='max-w-[10rem] truncate px-3 py-2'
                          title={detail.location_name || '-'}
                        >
                          {detail.location_name || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default WorkScheduleDetailDialog;
