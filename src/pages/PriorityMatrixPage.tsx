import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Download } from 'lucide-react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import * as XLSX from 'xlsx';

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
    if (importance <= 3 && urgency > 3) return 'Decide';
    if (importance > 3 && urgency <= 3) return 'Delegate';
    return 'Delete';
  };

  const handleExport = () => {
    if (matrixData.length === 0) return;

    const ws = XLSX.utils.json_to_sheet(matrixData.map(task => ({
      Task: task.name,
      Importance: task.importance,
      Urgency: task.urgency,
      Quadrant: task.quadrant,
    })));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Priority Matrix');
    XLSX.writeFile(wb, 'priority-matrix.xlsx');
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
                        <Select {...register(`tasks.${index}.importance` as const)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select importance" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 5 }, (_, i) => i + 1).map(num => (
                              <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Urgency (1-5)</Label>
                        <Select {...register(`tasks.${index}.urgency` as const)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select urgency" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 5 }, (_, i) => i + 1).map(num => (
                              <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart>
                    <CartesianGrid />
                    <XAxis type="number" dataKey="urgency" name="Urgency" domain={[1, 5]} />
                    <YAxis type="number" dataKey="importance" name="Importance" domain={[1, 5]} />
                    <ZAxis type="category" dataKey="quadrant" name="Quadrant" />
                    <Tooltip />
                    <Legend />
                    <Scatter data={matrixData} fill="#8884d8">
                      {matrixData.map((entry, index) => (
                        <circle key={`point-${index}`} r={4} fill={`hsl(${entry.quadrant === 'Do' ? 0 : entry.quadrant === 'Decide' ? 120 : entry.quadrant === 'Delegate' ? 240 : 300}, 70%, 50%)`} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
                <p className="text-sm text-gray-500 mt-2">Quadrants: Do (High Urgency/High Importance), Decide (High Urgency/Low Importance), Delegate (Low Urgency/High Importance), Delete (Low Urgency/Low Importance)</p>
                <Button onClick={handleExport} className="mt-4">
                  <Download className="h-4 w-4 mr-2" /> Export to XLSX
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