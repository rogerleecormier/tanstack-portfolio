import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Download } from 'lucide-react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ReferenceLine } from 'recharts';
import ExcelJS from 'exceljs';

// Schema for form validation
const taskSchema = z.object({
  name: z.string().min(1, 'Task name is required'),
  importance: z.string().min(1, 'Importance is required'),
  urgency: z.string().min(1, 'Urgency is required'),
});

const formSchema = z.object({
  projectName: z.string().min(1, 'Project name is required'),
  tasks: z.array(taskSchema).min(1, 'At least one task is required'),
});

type FormData = z.infer<typeof formSchema>;

interface MatrixTask {
  name: string;
  importance: number;
  urgency: number;
  quadrant: string;
}

const PriorityMatrixPage: React.FC = () => {
  const [matrixData, setMatrixData] = useState<MatrixTask[]>([]);
  const isMobile = useIsMobile();

  // Chart config for shadcn
  const chartConfig = {
    Do: { label: 'Do', color: 'hsl(142, 76%, 36%)' },
    Decide: { label: 'Decide', color: 'hsl(45, 100%, 51%)' },
    Delegate: { label: 'Delegate', color: 'hsl(217, 91%, 60%)' },
    Delete: { label: 'Delete', color: 'hsl(0, 84%, 60%)' },
  };

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectName: '',
      tasks: [{ name: '', importance: '3', urgency: '3' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'tasks',
  });

  const onSubmit = (data: FormData) => {
    const parsedTasks = data.tasks.map(task => ({
      name: task.name,
      importance: parseInt(task.importance),
      urgency: parseInt(task.urgency),
      quadrant: getQuadrant(parseInt(task.importance), parseInt(task.urgency)),
    }));

    setMatrixData(parsedTasks);
  };

  const getQuadrant = (importance: number, urgency: number) => {
    if (importance > 3 && urgency > 3) return 'Do';
    if (importance <= 3 && urgency > 3) return 'Delegate';
    if (importance > 3 && urgency <= 3) return 'Decide';
    return 'Delete';
  };

  const handleExport = async () => {
    if (matrixData.length === 0) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Priority Matrix');

    // Add column headers
    worksheet.columns = [
      { header: 'Task', key: 'task', width: 30 },
      { header: 'Importance', key: 'importance', width: 15 },
      { header: 'Urgency', key: 'urgency', width: 15 },
      { header: 'Quadrant', key: 'quadrant', width: 15 },
    ];

    // Add data rows
    matrixData.forEach(task => {
      worksheet.addRow({
        task: task.name,
        importance: task.importance,
        urgency: task.urgency,
        quadrant: task.quadrant,
      });
    });

    // Generate buffer and download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'priority-matrix.xlsx';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Priority Matrix Generator</CardTitle>
            <p className="text-gray-600">Prioritize tasks using the Eisenhower Matrix based on importance and urgency scores (1-5).</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="projectName">Project Name</Label>
                <Input id="projectName" {...register('projectName')} />
                {errors.projectName && <p className="text-red-500 text-sm">{errors.projectName.message}</p>}
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Tasks</h3>
                {fields.map((field, index) => (
                  <div key={field.id} className="border p-4 mb-4 rounded">
                    <Input
                      placeholder="Task Name"
                      {...register(`tasks.${index}.name` as const)}
                      className="mb-2"
                    />
                    {errors.tasks?.[index]?.name && <p className="text-red-500 text-sm">{errors.tasks[index]?.name?.message}</p>}
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div>
                        <Label>Importance (1-5)</Label>
                        <Controller
                          name={`tasks.${index}.importance`}
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select importance" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 5 }, (_, i) => i + 1).map(num => (
                                  <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <div>
                        <Label>Urgency (1-5)</Label>
                        <Controller
                          name={`tasks.${index}.urgency`}
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select urgency" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 5 }, (_, i) => i + 1).map(num => (
                                  <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>
                    <Button type="button" variant="outline" onClick={() => remove(index)} className="mt-2">
                      <Trash2 className="h-4 w-4 mr-2" /> Remove Task
                    </Button>
                  </div>
                ))}
                <Button type="button" onClick={() => append({ name: '', importance: '3', urgency: '3' })}>
                  <Plus className="h-4 w-4 mr-2" /> Add Task
                </Button>
              </div>

              <Button type="submit">Generate Priority Matrix</Button>
            </form>

            {matrixData.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-2">Priority Matrix Visualization</h3>
                <>
                  {(() => {
                    const doData = matrixData.filter(task => task.quadrant === 'Do');
                    const decideData = matrixData.filter(task => task.quadrant === 'Decide');
                    const delegateData = matrixData.filter(task => task.quadrant === 'Delegate');
                    const deleteData = matrixData.filter(task => task.quadrant === 'Delete');

                    return (
                      <div className="relative mt-8">
                        {/* X-Axis Labels above chart */}
                        <div className="absolute top-[-35px] left-0 translate-x-[230px] text-sm italic text-gray-700 z-20">Urgent</div>
                        <div className="absolute top-[-35px] right-0 translate-x-[-150px] text-sm italic text-gray-700 z-20">Not Urgent</div>
                        <ChartContainer config={chartConfig} className="h-[400px] w-full relative z-10">
                          <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart>
                              <CartesianGrid />
                              <XAxis type="number" dataKey="urgency" name="Urgency" domain={[5, 1]} ticks={[5,4,3,2,1]} />
                              <YAxis type="number" dataKey="importance" name="Importance" domain={[1, 5]} ticks={[1,2,3,4,5]} />
                              <ChartTooltip content={<ChartTooltipContent className="bg-white border border-gray-200 shadow-lg rounded-md p-2" />} />
                              <ReferenceLine x={3} stroke="gray" strokeDasharray="3 3" label={false} />
                              <ReferenceLine y={3} stroke="gray" strokeDasharray="3 3" label={false} />
                              <Scatter name="Do" data={doData} fill={chartConfig.Do.color} />
                              <Scatter name="Decide" data={decideData} fill={chartConfig.Decide.color} />
                              <Scatter name="Delegate" data={delegateData} fill={chartConfig.Delegate.color} />
                              <Scatter name="Delete" data={deleteData} fill={chartConfig.Delete.color} />
                            </ScatterChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                        {/* Quadrant Overlay Wrapper to align with plot area */}
                        <div className={`absolute ${isMobile ? 'w-[95%] h-[97%]' : 'w-[91.5%] h-[90.5%]'} pointer-events-none z-0`} style={{ left: 'calc(5% + 25px)', top: 'calc(8% - 28px)' }}>
                          {/* Quadrant Shading */}
                          <div className="absolute inset-0">
                            {/* Delegate: high urgency low importance - bottom left */}
                            <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-blue-200 opacity-20"></div>
                            {/* Delete: low urgency low importance - bottom right */}
                            <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-red-200 opacity-20"></div>
                            {/* Do: high urgency high importance - top left */}
                            <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-green-200 opacity-20"></div>
                            {/* Decide: low urgency high importance - top right */}
                            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-yellow-200 opacity-20"></div>
                          </div>
                          {/* Quadrant Labels */}
                          <div className="absolute inset-0">
                            <div className="absolute top-0 left-0 ml-1 mt-1 text-xs font-bold text-black bg-white px-2 py-1 rounded shadow-sm">Do</div>
                            <div className="absolute top-0 right-0 mr-1 mt-1 text-xs font-bold text-black bg-white px-2 py-1 rounded shadow-sm">Decide</div>
                            <div className="absolute bottom-0 left-0 ml-1 mb-1 text-xs font-bold text-black bg-white px-2 py-1 rounded shadow-sm">Delegate</div>
                            <div className="absolute bottom-0 right-0 mr-1 mb-1 text-xs font-bold text-black bg-white px-2 py-1 rounded shadow-sm">Delete</div>
                          </div>
                        </div>
                {/* Axis Labels outside chart */}
                {/* Y-Axis Labels positioned outside left */}
                <div className="absolute left-0 top-[10%] -translate-x-3 translate-y-[30px] text-sm italic text-gray-700 writing-mode-vertical-rl transform -rotate-90 z-20 whitespace-nowrap">Important</div>
                <div className="absolute left-0 bottom-[10%] -translate-x-[27px] -translate-y-[120px] text-sm italic text-gray-700 writing-mode-vertical-rl transform -rotate-90 z-20 whitespace-nowrap">Not Important</div>
                      </div>
                    );
                  })()}
                </>
                <Button onClick={handleExport} className="mt-4">
                  <Download className="h-4 w-4 mr-2" /> Export to Excel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PriorityMatrixPage;