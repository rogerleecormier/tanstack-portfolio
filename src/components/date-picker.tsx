'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';

interface DatePickerProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

export function DatePicker({
  value,
  onChange,
  disabled = false,
}: DatePickerProps) {
  // Create a proper Date object from the string value
  const dateObj = value
    ? (() => {
        try {
          // Parse the date string and create a Date at noon to avoid timezone issues
          const [year, month, day] = value.split('-').map(Number);
          if (year && month && day) {
            return new Date(year, month - 1, day, 12, 0, 0, 0);
          }
          return new Date(value);
        } catch (error) {
          console.warn('Failed to parse date:', value, error);
          return new Date(value);
        }
      })()
    : undefined;

  const [open, setOpen] = useState(false);

  console.log('DatePicker value:', value, 'dateObj:', dateObj);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          className={`w-full justify-start rounded border text-left font-normal ${
            !dateObj ? 'text-muted-foreground' : ''
          }`}
          disabled={disabled}
          onClick={() => setOpen(true)}
        >
          {dateObj ? format(dateObj, 'PPP') : <span>Pick a date</span>}
          <CalendarIcon className='ml-auto size-4 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <Calendar
          mode='single'
          selected={dateObj}
          defaultMonth={dateObj}
          onSelect={d => {
            if (d) {
              onChange(d.toISOString().slice(0, 10)); // yyyy-mm-dd only
              setOpen(false); // Auto-close after selection
            }
          }}
          disabled={date =>
            disabled || date > new Date() || date < new Date('1900-01-01')
          }
          captionLayout='dropdown'
        />
      </PopoverContent>
    </Popover>
  );
}
