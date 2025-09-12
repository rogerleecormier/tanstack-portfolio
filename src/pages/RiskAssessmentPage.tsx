import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Download } from 'lucide-react';
import { SortableTable } from '@/components/SortableTable';
import * as ExcelJS from 'exceljs';

// Schema for form validation
const riskSchema = z.object({
  description: z.string().min(1, 'Risk description is required'),
  likelihood: z.string().min(1, 'Likelihood is required'),
  impact: z.string().min(1, 'Impact is required'),
});

const formSchema = z.object({
  projectName: z.string().min(1, 'Project name is required'),
  risks: z.array(riskSchema).min(1, 'At least one risk is required'),
});

type FormData = z.infer<typeof formSchema>;

const RiskAssessmentPage: React.FC = () => {
  const [matrixData, setMatrixData] = useState<{
    headers: string[];
    rows: string[][];
  } | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectName: '',
      risks: [{ description: '', likelihood: '3', impact: '3' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'risks',
  });

  const onSubmit = (data: FormData) => {
    const parsedRisks = data.risks.map(risk => ({
      description: risk.description,
      likelihood: parseInt(risk.likelihood),
      impact: parseInt(risk.impact),
      score: parseInt(risk.likelihood) * parseInt(risk.impact),
      level: getRiskLevel(parseInt(risk.likelihood), parseInt(risk.impact)),
    }));

    // Generate table data
    const headers = [
      'Risk Description',
      'Likelihood',
      'Impact',
      'Score',
      'Risk Level',
    ];
    const rows = parsedRisks.map(risk => [
      risk.description,
      risk.likelihood.toString(),
      risk.impact.toString(),
      risk.score.toString(),
      risk.level,
    ]);

    setMatrixData({ headers, rows });
  };

  const getRiskLevel = (likelihood: number, impact: number) => {
    const score = likelihood * impact;
    if (score >= 15) return 'High';
    if (score >= 8) return 'Medium';
    return 'Low';
  };

  const handleExport = async () => {
    if (!matrixData) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Risk Assessment');

    // Add header row
    const headerRow = worksheet.addRow(matrixData.headers);
    headerRow.eachCell(cell => {
      cell.font = { bold: true };
    });

    // Add data rows
    matrixData.rows.forEach(row => {
      worksheet.addRow(row);
    });

    // Set column widths
    worksheet.columns = matrixData.headers.map(() => ({ width: 20 }));

    // Save the file
    await workbook.xlsx.writeFile('risk-assessment.xlsx');
  };

  // Placeholder for AI augmentation
  const handleAIMitigate = () => {
    // TODO: Call Cloudflare Worker for AI-suggested mitigations
    alert(
      'AI mitigation suggestions coming soon - will generate recommendations using Cloudflare AI.'
    );
  };

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-4xl mx-auto px-4'>
        <Card>
          <CardHeader>
            <CardTitle className='text-2xl font-bold'>
              Risk Assessment Tool
            </CardTitle>
            <p className='text-gray-600'>
              Assess project risks with likelihood and impact scores. Generate
              matrix and export to XLSX. Ready for AI mitigation suggestions.
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
                <h3 className='text-lg font-semibold mb-2'>Risks</h3>
                {fields.map((field, index) => (
                  <div key={field.id} className='border p-4 mb-4 rounded'>
                    <Input
                      placeholder='Risk Description'
                      {...register(`risks.${index}.description` as const)}
                      className='mb-2'
                    />
                    {errors.risks?.[index]?.description && (
                      <p className='text-red-500 text-sm'>
                        {errors.risks[index]?.description?.message}
                      </p>
                    )}
                    <div className='grid grid-cols-2 gap-2'>
                      <div>
                        <Label>Likelihood (1-5)</Label>
                        <Select
                          {...register(`risks.${index}.likelihood` as const)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Select likelihood' />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 5 }, (_, i) => i + 1).map(
                              num => (
                                <SelectItem key={num} value={num.toString()}>
                                  {num}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Impact (1-5)</Label>
                        <Select {...register(`risks.${index}.impact` as const)}>
                          <SelectTrigger>
                            <SelectValue placeholder='Select impact' />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 5 }, (_, i) => i + 1).map(
                              num => (
                                <SelectItem key={num} value={num.toString()}>
                                  {num}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => remove(index)}
                      className='mt-2'
                    >
                      <Trash2 className='h-4 w-4 mr-2' /> Remove Risk
                    </Button>
                  </div>
                ))}
                <Button
                  type='button'
                  onClick={() =>
                    append({ description: '', likelihood: '3', impact: '3' })
                  }
                >
                  <Plus className='h-4 w-4 mr-2' /> Add Risk
                </Button>
              </div>

              <div className='flex gap-2'>
                <Button type='submit'>Generate Risk Matrix</Button>
                <Button
                  type='button'
                  variant='outline'
                  onClick={handleAIMitigate}
                >
                  AI Suggest Mitigations
                </Button>
              </div>
            </form>

            {matrixData && (
              <div className='mt-8'>
                <h3 className='text-lg font-semibold mb-2'>
                  Risk Matrix Table
                </h3>
                <SortableTable data={matrixData} />
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

export default RiskAssessmentPage;
