/**
 * EnhancedWeightEntry Component
 * 
 * A form component for adding weight measurements with date selection.
 * Extracted from HealthBridgeEnhanced.tsx for better modularity.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Activity, CalendarIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CreateWeightMeasurementRequest,
  HealthBridgeEnhancedAPI,
} from '@/api/healthBridgeEnhanced';

export function EnhancedWeightEntry() {
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState<'lb' | 'kg'>('lb');
  const [date, setDate] = useState<Date | undefined>(new Date());

  const mutation = useMutation({
    mutationFn: async (data: CreateWeightMeasurementRequest) => {
      return await HealthBridgeEnhancedAPI.createWeightMeasurement(data);
    },
    onSuccess: () => {
      setSuccess(true);
      setWeight('');
      void queryClient.invalidateQueries({ queryKey: ['enhanced-weights'] });
      void queryClient.invalidateQueries({ queryKey: ['projections'] });
      void queryClient.invalidateQueries({ queryKey: ['analytics'] });
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (err: Error) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const val = Number(weight);
    if (isNaN(val) || val <= 0) {
      setError(`Enter a valid weight in ${unit}`);
      return;
    }

    if (!date) {
      setError('Please select a date/time');
      return;
    }

    const data: CreateWeightMeasurementRequest = {
      weight: val,
      unit,
      timestamp: date.toISOString(),
      source: 'manual',
    };

    mutation.mutate(data);
  };

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Activity className='size-5' />
          Add Weight Measurement
        </CardTitle>
        <CardDescription>
          Track your weight to monitor your weight loss progress (all data
          displayed in pounds)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='weight'>Weight</Label>
              <div className='flex gap-2'>
                <Input
                  id='weight'
                  type='number'
                  step='0.1'
                  placeholder='Enter weight'
                  value={weight}
                  onChange={e => setWeight(e.target.value)}
                  required
                />
                <Select
                  value={unit}
                  onValueChange={(value: 'lb' | 'kg') => setUnit(value)}
                >
                  <SelectTrigger className='w-20'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='lb'>lb</SelectItem>
                    <SelectItem value='kg'>kg</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='date'>Date & Time</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    className='w-full justify-start text-left font-normal'
                  >
                    <CalendarIcon className='mr-2 size-4' />
                    {date ? format(date, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0'>
                  <Calendar
                    mode='single'
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {error && <div className='text-sm text-strategy-rose'>{error}</div>}

          {success && (
            <div className='text-sm text-strategy-emerald'>
              Weight measurement added successfully!
            </div>
          )}

          <Button
            type='submit'
            disabled={mutation.isPending}
            className='w-full'
          >
            {mutation.isPending ? 'Adding...' : 'Add Measurement'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
