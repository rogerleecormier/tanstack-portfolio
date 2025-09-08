import React, { useState, useEffect, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Download } from 'lucide-react';
import { SortableTable } from '@/components/SortableTable';
import mermaid from 'mermaid';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Schema for form validation
const taskSchema = z.object({
  name: z.string().min(1, 'Task name is required'),
  responsible: z.string().min(1),
  accountable: z.string().min(1),
  consulted: z.string(),
  informed: z.string(),
});

const formSchema = z.object({
  projectName: z.string().min(1, 'Project name is required'),
  tasks: z.array(taskSchema).min(1, 'At least one task is required'),
});

type FormData = z.infer<typeof formSchema>;

const RACIBuilderPage: React.FC = () => {
  const [tableData, setTableData] = useState<{ headers: string[]; rows: string[][] } | null>(null);
  const [mermaidCode, setMermaidCode] = useState<string>('');
  const [mermaidSvg, setMermaidSvg] = useState<string>('');
  const mermaidRef = useRef<HTMLDivElement>(null);

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectName: '',
      tasks: [{ name: '', responsible: '', accountable: '', consulted: '', informed: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'tasks',
  });

  const onSubmit = (data: FormData) => {
    // Generate table data for SortableTable
    const headers = ['Task', 'Responsible', 'Accountable', 'Consulted', 'Informed'];
    const rows = data.tasks.map(task => [
      task.name,
      task.responsible,
      task.accountable,
      task.consulted || '-',
      task.informed || '-',
    ]);
    setTableData({ headers, rows });

    // Generate Mermaid code for flowchart (simple matrix representation)
    const roles = [...new Set(data.tasks.flatMap(t => [t.responsible, t.accountable, t.consulted, t.informed].filter(Boolean)))];
    let code = `graph TD\n`;
    code += `    subgraph "${data.projectName}"\n`;
    data.tasks.forEach((task, index) => {
      code += `        T${index}[${task.name}]\n`;
      if (task.responsible) code += `        T${index} -->|R| ${task.responsible}\n`;
      if (task.accountable) code += `        T${index} -->|A| ${task.accountable}\n`;
      if (task.consulted) code += `        T${index} -->|C| ${task.consulted}\n`;
      if (task.informed) code += `        T${index} -->|I| ${task.informed}\n`;
    });
    code += `    end\n`;
    code += `    classDef raciRole fill:#e1f5fe,stroke:#01579b,stroke-width:2px\n`;
    roles.forEach(role => code += `    class ${role} raciRole\n`);

    setMermaidCode(code);
  };

  useEffect(() => {
    if (mermaidCode && mermaidRef.current) {
      const renderMermaid = async () => {
        try {
          await mermaid.initialize({ startOnLoad: false, theme: 'default' });
          const { svg } = await mermaid.render('mermaid-diag', mermaidCode);
          setMermaidSvg(svg);
        } catch (error) {
          console.error('Mermaid rendering error:', error);
        }
      };
      renderMermaid();
    }
  }, [mermaidCode]);

  const handleXLSXExport = () => {
    if (!tableData) return;

    const ws = XLSX.utils.aoa_to_sheet([tableData.headers, ...tableData.rows]);
    // Format headers
    const headerRange = XLSX.utils.decode_range(ws['!ref']!);
    for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
      const cellAddress = {c: C, r: 0};
      const cellRef = XLSX.utils.encode_cell(cellAddress);
      if (!ws[cellRef]) ws[cellRef] = {};
      ws[cellRef].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4F46E5" } },
        alignment: { horizontal: "center" }
      };
    }
    // Color columns
    const colors = ['#E0F2FE', '#DBEAFE', '#BFDBFE', '#93C5FD', '#60A5FA'];
    for (let C = 0; C < tableData.headers.length; ++C) {
      for (let R = 1; R <= tableData.rows.length; ++R) {
        const cellAddress = {c: C, r: R};
        const cellRef = XLSX.utils.encode_cell(cellAddress);
        if (!ws[cellRef]) ws[cellRef] = {};
        ws[cellRef].s = {
          fill: { fgColor: { rgb: colors[C] } },
          alignment: { horizontal: "center" }
        };
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'RACI Matrix');
    XLSX.writeFile(wb, 'raci-matrix.xlsx');
  };

  const handlePDFExport = async () => {
    const doc = new jsPDF();

    doc.text('RACI Matrix', 14, 20);
    doc.autoTable({
      head: [tableData?.headers || []],
      body: tableData?.rows || [],
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { fillColor: [224, 242, 254] },
        2: { fillColor: [219, 234, 254] },
        3: { fillColor: [191, 219, 254] },
        4: { fillColor: [147, 197, 253] },
      },
      margin: { top: 25 },
    });

    // Add Mermaid diagram as image
    if (mermaidRef.current) {
      const canvas = await html2canvas(mermaidRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const imgProps = doc.getImageProperties(imgData);
      const pdfWidth = doc.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      doc.addPage();
      doc.addImage(imgData, 'PNG', 14, 30, pdfWidth - 28, pdfHeight);
    }

    doc.save('raci-matrix.pdf');
  };

  const handleSVGDownload = () => {
    if (mermaidSvg) {
      const svgBlob = new Blob([mermaidSvg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'raci-chart.svg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">RACI Chart Builder</CardTitle>
            <p className="text-gray-600">Define tasks and roles to generate a RACI matrix for your projects.</p>
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
                    {errors.tasks?.[index]?.name && <p className="text-red-500 text-sm">{errors.tasks?.[index]?.name?.message}</p>}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div>
                        <Label>Responsible</Label>
                        <Input {...register(`tasks.${index}.responsible` as const)} />
                      </div>
                      <div>
                        <Label>Accountable</Label>
                        <Input {...register(`tasks.${index}.accountable` as const)} />
                      </div>
                      <div>
                        <Label>Consulted</Label>
                        <Input {...register(`tasks.${index}.consulted` as const)} />
                      </div>
                      <div>
                        <Label>Informed</Label>
                        <Input {...register(`tasks.${index}.informed` as const)} />
                      </div>
                    </div>
                    <Button type="button" variant="outline" onClick={() => remove(index)} className="mt-2">
                      <Trash2 className="h-4 w-4 mr-2" /> Remove Task
                    </Button>
                  </div>
                ))}
                <Button type="button" onClick={() => append({ name: '', responsible: '', accountable: '', consulted: '', informed: '' })}>
                  <Plus className="h-4 w-4 mr-2" /> Add Task
                </Button>
              </div>

              <Button type="submit">Generate RACI Chart</Button>
            </form>

            {(tableData || mermaidSvg) && (
              <div className="mt-8">
                {tableData && (
                  <>
                    <h3 className="text-lg font-semibold mb-2">RACI Matrix Table</h3>
                    <SortableTable data={tableData} />
                  </>
                )}
                {mermaidSvg && (
                  <>
                    <h3 className="text-lg font-semibold mb-2">Mermaid Diagram</h3>
                    <div ref={mermaidRef} dangerouslySetInnerHTML={{ __html: mermaidSvg }} className="mermaid" />
                    <pre className="mt-4 p-4 bg-gray-100 rounded text-sm overflow-auto">{mermaidCode}</pre>
                  </>
                )}
                <div className="flex gap-2 mt-4">
                  {tableData && (
                    <>
                      <Button onClick={handleXLSXExport}>
                        <Download className="h-4 w-4 mr-2" /> Export XLSX
                      </Button>
                      <Button onClick={handlePDFExport}>
                        <Download className="h-4 w-4 mr-2" /> Export PDF
                      </Button>
                    </>
                  )}
                  {mermaidSvg && (
                    <Button onClick={handleSVGDownload}>
                      <Download className="h-4 w-4 mr-2" /> Download SVG
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RACIBuilderPage;