import { Search, Filter, FileText, Upload, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

interface TableHeaderProps {
  nameSearch: string;
  setNameSearch: (value: string) => void;
  onRefetch: () => void;
}

export function TableHeader({ nameSearch, setNameSearch, onRefetch }: TableHeaderProps) {
  return (
    <header className='mb-6 flex flex-col items-start justify-between gap-4'>
      <div className='flex w-full flex-row flex-wrap items-center justify-between gap-4'>
        <h2 className='text-xl font-semibold'>All Employees Information</h2>
        <div className='flex flex-wrap gap-2'>
          <Button
            variant='outline'
            className='cursor-pointer gap-2 hover:bg-[#5A89B3] hover:text-white'
          >
            <FileText className='h-4 w-4' />
            Export
          </Button>
          <Button
            variant='outline'
            className='cursor-pointer gap-2 hover:bg-[#5A89B3] hover:text-white'
          >
            <Upload className='h-4 w-4' />
            Import
          </Button>
          <Link href='/employee-management/add'>
            <Button className='cursor-pointer gap-2 bg-[#6B9AC4] hover:bg-[#5A89B3]'>
              <Plus className='h-4 w-4' />
              Add Data
            </Button>
          </Link>
        </div>
      </div>
      <div className='flex w-full flex-wrap gap-2 md:w-[400px]'>
        <div className='relative flex-[1]'>
          <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
          <Input
            className='w-full border-gray-200 bg-white pl-10'
            placeholder='Search Employee by Name'
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
          />
        </div>
        <Button
          variant='outline'
          className='cursor-pointer gap-2 hover:bg-[#5A89B3] hover:text-white'
          onClick={onRefetch}
        >
          <Filter className='h-4 w-4' />
          Filter
        </Button>
      </div>
    </header>
  );
}
