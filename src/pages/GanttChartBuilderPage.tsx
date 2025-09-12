import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Download } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import * as ExcelJS from 'exceljs';
import { format, differenceInDays } from 'date-fns';

// Schema for form validation
const taskSchema = z.object({
  name: z.string().min(1, 'Task name is required'),
  startDate: z.string({ required_error: 'Start date is required' }),
  endDate: z.string({ required_error: 'End date is required' }),
});

const formSchema = z.object({
  projectName: z.string().min(1, 'Project name is required'),
  tasks: z.array(taskSchema).min(1, 'At least one task is required'),
});

type FormData = z.infer<typeof formSchema>;

interface GanttTask {
  name: string;
  start: string;
  duration: number;
  end: string;
}

const GanttChartBuilderPage: React.FC = () => {
  const [ganttData, setGanttData] = useState<GanttTask[]>([]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectName: '',
      tasks: [{ name: '', startDate: '', endDate: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'tasks',
  });

  const onSubmit = (data: FormData) => {
    const processedTasks = data.tasks.map(task => {
      const startDate = new Date(task.startDate);
      const endDate = new Date(task.endDate);
      const duration = differenceInDays(endDate, startDate);
      return {
        name: task.name,
        start: format(startDate, 'MMM dd'),
        duration: duration > 0 ? duration : 1,
        end: format(endDate, 'MMM dd'),
        fill: '#8884d8',
      };
    });

    setGanttData(processedTasks);
  };

  const handleExport = async () => {
    if (ganttData.length === 0) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Gantt Chart');

    // Add header row
    const headerRow = worksheet.addRow(['Task', 'Start', 'Duration', 'End']);
    headerRow.eachCell(cell => {
      cell.font = { bold: true };
    });

    // Add data rows
    ganttData.forEach(task => {
      worksheet.addRow([task.name, task.start, task.duration, task.end]);
    });

    // Set column widths
    worksheet.columns = [
      { key: 'task', width: 20 },
      { key: 'start', width: 15 },
      { key: 'duration', width: 15 },
      { key: 'end', width: 15 },
    ];

    // Save the file
    await workbook.xlsx.writeFile('gantt-chart.xlsx');
  };

  // Placeholder for AI augmentation
  const handleAISuggest = () => {
    // TODO: Call Cloudflare Worker for AI-suggested schedule
    alert(
      'AI suggestion feature coming soon - will optimize timeline using Cloudflare AI.'
    );
  };

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-6xl mx-auto px-4'>
        <Card>
          <CardHeader>
            <CardTitle className='text-2xl font-bold'>
              Gantt Chart Builder
            </CardTitle>
            <p className='text-gray-600'>
              Create project timelines with tasks, start and end dates.
              Visualize with Gantt chart and export to XLSX. Ready for AI
              optimization.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
              <div>
                <Label htmlFor='projectName'>Project Name</Label>
                <Input id='projectName' {...register('projectName')} />
                {errors.projectName && (
                  <p className='text-red-500 text-sm'>
                    {errors.projectName.message}
                  </p>
                )}
              </div>

              <div>
                <h3 className='text-lg font-semibold mb-2'>Tasks</h3>
                {fields.map((field, index) => (
                  <div key={field.id} className='border p-4 mb-4 rounded'>
                    <Input
                      placeholder='Task Name'
                      {...register(`tasks.${index}.name` as const)}
                      className='mb-2'
                    />
                    {errors.tasks?.[index]?.name && (
                      <p className='text-red-500 text-sm'>
                        {errors.tasks[index]?.name?.message}
                      </p>
                    )}
                    <div className='grid grid-cols-2 gap-2 mb-2'>
                      <div>
                        <Label>Start Date</Label>
                        <Input
                          type='date'
                          {...register(`tasks.${index}.startDate` as const)}
                        />
                        {errors.tasks?.[index]?.startDate && (
                          <p className='text-red-500 text-sm'>
                            {errors.tasks[index]?.startDate?.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label>End Date</Label>
                        <Input
                          type='date'
                          {...register(`tasks.${index}.endDate` as const)}
                        />
                        {errors.tasks?.[index]?.endDate && (
                          <p className='text-red-500 text-sm'>
                            {errors.tasks[index]?.endDate?.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => remove(index)}
                      className='mt-2'
                    >
                      <Trash2 className='h-4 w-4 mr-2' /> Remove Task
                    </Button>
                  </div>
                ))}
                <Button
                  type='button'
                  onClick={() =>
                    append({ name: '', startDate: '', endDate: '' })
                  }
                >
                  <Plus className='h-4 w-4 mr-2' /> Add Task
                </Button>
              </div>

              <div className='flex gap-2'>
                <Button type='submit'>Generate Gantt Chart</Button>
                <Button
                  type='button'
                  variant='outline'
                  onClick={handleAISuggest}
                >
                  AI Suggest Schedule
                </Button>
              </div>
            </form>

            {ganttData.length > 0 && (
              <div className='mt-8'>
                <h3 className='text-lg font-semibold mb-2'>
                  Gantt Chart Visualization
                </h3>
                <ResponsiveContainer width='100%' height={400}>
                  <BarChart
                    data={ganttData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='name' />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey='duration'
                      fill='#8884d8'
                      name='Duration (days)'
                    />
                  </BarChart>
                </ResponsiveContainer>
                <Button onClick={handleExport} className='mt-4'>
                  <Download className='h-4 w-4 mr-2' /> Export to XLSX
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GanttChartBuilderPage;
