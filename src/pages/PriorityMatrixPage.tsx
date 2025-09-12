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
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Download, Target, TrendingUp } from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import ExcelJS from 'exceljs';
import html2canvas from 'html2canvas';
import { H1, H3, P } from '@/components/ui/typography';

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

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
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
    if (importance === 3 && urgency === 3) return 'Decide'; // Center point needs evaluation
    return 'Delete';
  };

  const getFormattedDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getFormattedTitle = () => {
    return `Priority Matrix | September 10, 2025`;
  };

  const handleExport = async (
    type: 'raw' | 'formatted-xlsx' | 'formatted-pdf'
  ) => {
    if (matrixData.length === 0) return;

    if (type === 'raw') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(getFormattedTitle());

      // Add column headers for raw export
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
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `priority-matrix-${getFormattedDate().replace(/ /g, '-')}-${type}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } else if (type === 'formatted-xlsx') {
      // Create Excel with embedded chart visualization
      const createExcelWithChart = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Priority Matrix');

        // First, capture and add the chart at the top
        try {
          // Wait for chart to be fully rendered
          await new Promise(resolve => setTimeout(resolve, 100));

          // Try to capture the entire chart area including overlays and axis labels
          let chartElement = document.querySelector(
            '.relative.mt-8'
          ) as HTMLElement;

          // If not found, try to find the chart container div
          if (!chartElement) {
            chartElement = document.querySelector('.priority-matrix-chart')
              ?.parentElement as HTMLElement;
          }

          // If still not found, try the ChartContainer itself
          if (!chartElement) {
            chartElement = document.querySelector(
              '.priority-matrix-chart'
            ) as HTMLElement;
          }

          // Final fallback - look for any div containing the chart elements
          if (!chartElement) {
            const allDivs = document.querySelectorAll('div');
            for (const div of allDivs) {
              if (
                div.querySelector('.priority-matrix-chart') ||
                div.querySelector('.recharts-wrapper') ||
                (div.querySelector('svg') &&
                  div.querySelector('[class*="bg-blue-200"]'))
              ) {
                chartElement = div;
                break;
              }
            }
          }

          if (chartElement) {
            console.log('Found chart element:', chartElement);

            const canvas = await html2canvas(chartElement, {
              backgroundColor: '#ffffff',
              scale: 2,
              width: 850, // Wider to capture axis labels
              height: 500, // Taller to capture urgency labels above chart
              useCORS: true,
              allowTaint: true,
              logging: false,
              scrollX: 0,
              scrollY: 0,
              x: 0,
              y: -50, // Start capturing 50px above to include urgency labels
            });

            const imageData = canvas.toDataURL('image/png');
            console.log(
              'Chart captured successfully, image data length:',
              imageData.length
            );

            // Add title merged across 4 columns above the chart
            worksheet.mergeCells('A1:D1');
            worksheet.getCell('A1').value = getFormattedTitle();
            worksheet.getCell('A1').font = { bold: true, size: 16 };
            worksheet.getCell('A1').alignment = {
              horizontal: 'center',
              vertical: 'middle',
            };

            const imageId = workbook.addImage({
              base64: imageData.replace('data:image/png;base64,', ''),
              extension: 'png',
            });

            // Position the chart image in the worksheet (starting at row 2, fitting within 4 columns)
            worksheet.addImage(imageId, {
              tl: { col: 0, row: 1 }, // Start at row 2 (after title), column A
              ext: { width: 525, height: 390 }, // Scaled proportionally to fit within 4 columns (A-D)
            });

            console.log('Chart image added to Excel successfully');
          } else {
            console.warn('Could not find chart element for Excel export');
          }
        } catch (error) {
          console.warn('Could not capture chart for Excel:', error);
        }

        // Add data table below the chart (starting at row 22 to leave space for larger chart)
        const dataStartRow = 22;

        worksheet.columns = [
          { key: 'task', width: 30 },
          { key: 'importance', width: 15 },
          { key: 'urgency', width: 15 },
          { key: 'quadrant', width: 15 },
        ];

        // Style headers
        const headerStyle = {
          font: { bold: true, color: { argb: 'FFFFFFFF' } },
          fill: {
            type: 'pattern' as const,
            pattern: 'solid' as const,
            fgColor: { argb: 'FF374151' },
          },
          alignment: { horizontal: 'center' as const },
          border: {
            top: { style: 'thin' as const, color: { argb: 'FF000000' } },
            left: { style: 'thin' as const, color: { argb: 'FF000000' } },
            bottom: { style: 'thin' as const, color: { argb: 'FF000000' } },
            right: { style: 'thin' as const, color: { argb: 'FF000000' } },
          },
        };

        // Set header row
        worksheet.getRow(dataStartRow).getCell(1).value = 'Task';
        worksheet.getRow(dataStartRow).getCell(2).value = 'Importance';
        worksheet.getRow(dataStartRow).getCell(3).value = 'Urgency';
        worksheet.getRow(dataStartRow).getCell(4).value = 'Quadrant';

        // Apply header styling to all 4 columns
        for (let i = 1; i <= 4; i++) {
          worksheet.getRow(dataStartRow).getCell(i).style = headerStyle;
        }

        // Add data rows
        matrixData.forEach((task, index) => {
          const row = worksheet.getRow(dataStartRow + index + 1);
          row.getCell(1).value = task.name;
          row.getCell(2).value = task.importance;
          row.getCell(3).value = task.urgency;
          row.getCell(4).value = task.quadrant;

          // Style data rows (columns 1-4)
          for (let i = 1; i <= 4; i++) {
            row.getCell(i).style = {
              alignment: { horizontal: 'center' as const },
              border: {
                top: { style: 'thin' as const, color: { argb: 'FFE5E7EB' } },
                left: { style: 'thin' as const, color: { argb: 'FFE5E7EB' } },
                bottom: { style: 'thin' as const, color: { argb: 'FFE5E7EB' } },
                right: { style: 'thin' as const, color: { argb: 'FFE5E7EB' } },
              },
            };
          }
        });

        // Generate and download
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `priority-matrix-with-chart-${getFormattedDate().replace(/ /g, '-')}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
      };

      // Execute Excel creation
      createExcelWithChart().catch(error => {
        console.error('Error creating Excel:', error);
        // Fallback to basic Excel without chart
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(getFormattedTitle());

        worksheet.columns = [
          { header: 'Task', key: 'task', width: 30 },
          { header: 'Importance', key: 'importance', width: 15 },
          { header: 'Urgency', key: 'urgency', width: 15 },
          { header: 'Quadrant', key: 'quadrant', width: 15 },
        ];

        const headerStyle = {
          font: { bold: true, color: { argb: 'FFFFFFFF' } },
          fill: {
            type: 'pattern' as const,
            pattern: 'solid' as const,
            fgColor: { argb: 'FF374151' },
          },
          alignment: { horizontal: 'center' as const },
          border: {
            top: { style: 'thin' as const, color: { argb: 'FF000000' } },
            left: { style: 'thin' as const, color: { argb: 'FF000000' } },
            bottom: { style: 'thin' as const, color: { argb: 'FF000000' } },
            right: { style: 'thin' as const, color: { argb: 'FF000000' } },
          },
        };

        worksheet.getRow(1).eachCell(cell => {
          cell.style = headerStyle;
        });

        matrixData.forEach(task => {
          const row = worksheet.addRow({
            task: task.name,
            importance: task.importance,
            urgency: task.urgency,
            quadrant: task.quadrant,
          });

          row.eachCell(cell => {
            cell.style = {
              alignment: { horizontal: 'center' as const },
              border: {
                top: { style: 'thin' as const, color: { argb: 'FFE5E7EB' } },
                left: { style: 'thin' as const, color: { argb: 'FFE5E7EB' } },
                bottom: { style: 'thin' as const, color: { argb: 'FFE5E7EB' } },
                right: { style: 'thin' as const, color: { argb: 'FFE5E7EB' } },
              },
            };
          });
        });

        workbook.xlsx.writeBuffer().then(buffer => {
          const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `priority-matrix-${getFormattedDate().replace(/ /g, '-')}.xlsx`;
          link.click();
          window.URL.revokeObjectURL(url);
        });
      });
    } else if (type === 'formatted-pdf') {
      import('@react-pdf/renderer')
        .then(({ pdf, Document, Page, View, Text, StyleSheet }) => {
          const styles = StyleSheet.create({
            page: {
              flexDirection: 'row',
              backgroundColor: '#fff',
              padding: 15,
            },
            section: {
              margin: 5,
              padding: 5,
              flexGrow: 1,
            },
            header: {
              fontSize: 18,
              marginBottom: 10,
              textAlign: 'center',
            },
            tableContainer: {
              width: '100%',
              maxWidth: 500,
              marginTop: 10,
              alignSelf: 'center',
              borderStyle: 'solid',
              borderWidth: 1,
              borderColor: '#374151',
            },
            tableHeader: {
              flexDirection: 'row',
              backgroundColor: '#F9FAFB',
              borderBottomWidth: 1,
              borderBottomColor: '#374151',
              borderBottomStyle: 'solid',
              paddingVertical: 4,
            },
            tableRow: {
              flexDirection: 'row',
              borderBottomWidth: 1,
              borderBottomColor: '#E5E7EB',
              borderBottomStyle: 'solid',
              paddingVertical: 4,
            },
            tableCell: {
              flex: 1,
              textAlign: 'center',
              fontSize: 9,
              paddingHorizontal: 4,
            },
            tableCellTask: {
              flex: 2, // Double width for task names
              textAlign: 'left',
              fontSize: 9,
              paddingHorizontal: 4,
            },
            tableCellHeader: {
              flex: 1,
              textAlign: 'center',
              fontSize: 9,
              fontWeight: 'bold',
              paddingHorizontal: 4,
            },
            tableCellHeaderTask: {
              flex: 2, // Double width for task names
              textAlign: 'left',
              fontSize: 9,
              fontWeight: 'bold',
              paddingHorizontal: 4,
            },
          });

          const MyDocument = () => (
            <Document>
              <Page size='A4' style={styles.page}>
                <View style={styles.section}>
                  <Text style={styles.header}>{getFormattedTitle()}</Text>
                  <View style={styles.tableContainer}>
                    <View style={styles.tableHeader}>
                      <View style={styles.tableCellHeaderTask}>
                        <Text>Task</Text>
                      </View>
                      <View style={styles.tableCellHeader}>
                        <Text>Importance</Text>
                      </View>
                      <View style={styles.tableCellHeader}>
                        <Text>Urgency</Text>
                      </View>
                      <View style={styles.tableCellHeader}>
                        <Text>Quadrant</Text>
                      </View>
                    </View>
                    {matrixData.map((task, index) => (
                      <View key={index} style={styles.tableRow}>
                        <View style={styles.tableCellTask}>
                          <Text>{task.name}</Text>
                        </View>
                        <View style={styles.tableCell}>
                          <Text>{task.importance}</Text>
                        </View>
                        <View style={styles.tableCell}>
                          <Text>{task.urgency}</Text>
                        </View>
                        <View style={styles.tableCell}>
                          <Text>{task.quadrant}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </Page>
            </Document>
          );

          // Generate and download PDF programmatically
          pdf(<MyDocument />)
            .toBlob()
            .then(blob => {
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `priority-matrix-${getFormattedDate().replace(/ /g, '-')}.pdf`;
              link.click();
              window.URL.revokeObjectURL(url);
            })
            .catch(error => {
              console.error('Error generating PDF:', error);
              alert('Error generating PDF. Please try again.');
            });

          // Create a simple visual representation of the priority matrix
          const ChartVisualization = () => {
            const chartWidth = 400;
            const chartHeight = 300;
            const margin = 40;

            // Scale functions to convert data coordinates to PDF coordinates
            const scaleX = (value: number) =>
              margin + ((5 - value) / 4) * (chartWidth - 2 * margin);
            const scaleY = (value: number) =>
              margin + ((value - 1) / 4) * (chartHeight - 2 * margin);

            return (
              <View
                style={{
                  width: chartWidth,
                  height: chartHeight,
                  margin: '20px auto',
                  border: '1pt solid #374151',
                  position: 'relative',
                }}
              >
                {/* Grid lines */}
                <View
                  style={{
                    position: 'absolute',
                    top: margin,
                    left: margin,
                    right: margin,
                    bottom: margin,
                  }}
                >
                  {/* Vertical grid lines */}
                  {[0, 1, 2, 3, 4].map(i => (
                    <View
                      key={`v-${i}`}
                      style={{
                        position: 'absolute',
                        left: `${(i / 4) * 100}%`,
                        top: 0,
                        bottom: 0,
                        width: '0.5pt',
                        backgroundColor: '#9CA3AF',
                      }}
                    />
                  ))}
                  {/* Horizontal grid lines */}
                  {[0, 1, 2, 3, 4].map(i => (
                    <View
                      key={`h-${i}`}
                      style={{
                        position: 'absolute',
                        top: `${(i / 4) * 100}%`,
                        left: 0,
                        right: 0,
                        height: '0.5pt',
                        backgroundColor: '#ccc',
                      }}
                    />
                  ))}
                </View>

                {/* Quadrant backgrounds */}
                <View
                  style={{
                    position: 'absolute',
                    top: margin,
                    left: margin,
                    width: chartWidth - 2 * margin,
                    height: chartHeight - 2 * margin,
                  }}
                >
                  {/* Do quadrant (top-left) - green */}
                  <View
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: 0,
                      width: '50%',
                      height: '50%',
                      backgroundColor: '#8BC34A',
                      opacity: 0.2,
                    }}
                  />
                  {/* Decide quadrant (top-right) - yellow */}
                  <View
                    style={{
                      position: 'absolute',
                      top: '50%',
                      right: 0,
                      width: '50%',
                      height: '50%',
                      backgroundColor: '#FFEB3B',
                      opacity: 0.2,
                    }}
                  />
                  {/* Delegate quadrant (bottom-left) - blue */}
                  <View
                    style={{
                      position: 'absolute',
                      bottom: '50%',
                      left: 0,
                      width: '50%',
                      height: '50%',
                      backgroundColor: '#4FC3F7',
                      opacity: 0.2,
                    }}
                  />
                  {/* Delete quadrant (bottom-right) - red */}
                  <View
                    style={{
                      position: 'absolute',
                      bottom: '50%',
                      right: 0,
                      width: '50%',
                      height: '50%',
                      backgroundColor: '#E57373',
                      opacity: 0.2,
                    }}
                  />
                </View>

                {/* Quadrant labels */}
                <Text
                  style={{
                    position: 'absolute',
                    top: margin + 5,
                    left: margin + 5,
                    fontSize: 8,
                    fontWeight: 'bold',
                  }}
                >
                  Do
                </Text>
                <Text
                  style={{
                    position: 'absolute',
                    top: margin + 5,
                    right: margin + 5,
                    fontSize: 8,
                    fontWeight: 'bold',
                  }}
                >
                  Decide
                </Text>
                <Text
                  style={{
                    position: 'absolute',
                    bottom: margin + 5,
                    left: margin + 5,
                    fontSize: 8,
                    fontWeight: 'bold',
                  }}
                >
                  Delegate
                </Text>
                <Text
                  style={{
                    position: 'absolute',
                    bottom: margin + 5,
                    right: margin + 5,
                    fontSize: 8,
                    fontWeight: 'bold',
                  }}
                >
                  Delete
                </Text>

                {/* Data points */}
                {matrixData.map((task, index) => {
                  const x = scaleX(task.urgency);
                  const y = scaleY(task.importance);
                  let color = '#000';
                  switch (task.quadrant) {
                    case 'Do':
                      color = '#4CAF50';
                      break;
                    case 'Decide':
                      color = '#FFC107';
                      break;
                    case 'Delegate':
                      color = '#2196F3';
                      break;
                    case 'Delete':
                      color = '#F44336';
                      break;
                  }

                  return (
                    <View
                      key={index}
                      style={{
                        position: 'absolute',
                        left: x - 3,
                        top: y - 3,
                        width: 6,
                        height: 6,
                        backgroundColor: color,
                        borderRadius: 3,
                      }}
                    >
                      <Text
                        style={{
                          position: 'absolute',
                          left: 6,
                          top: -3,
                          fontSize: 6,
                          maxWidth: 50,
                        }}
                      >
                        {task.name.length > 6
                          ? `${task.name.substring(0, 6)}...`
                          : task.name}
                      </Text>
                    </View>
                  );
                })}

                {/* Horizontal axis scale (Urgency: 1-5) */}
                {[1, 2, 3, 4, 5].map(value => (
                  <Text
                    key={`urgency-${value}`}
                    style={{
                      position: 'absolute',
                      top: chartHeight - margin + 2,
                      left:
                        margin +
                        ((value - 1) / 4) * (chartWidth - 2 * margin) -
                        3,
                      fontSize: 7,
                      color: '#666',
                    }}
                  >
                    {value}
                  </Text>
                ))}

                {/* Vertical axis scale (Importance: 1-5) */}
                {[1, 2, 3, 4, 5].map(value => (
                  <Text
                    key={`importance-${value}`}
                    style={{
                      position: 'absolute',
                      left: margin - 8,
                      top:
                        chartHeight -
                        margin -
                        ((value - 1) / 4) * (chartHeight - 2 * margin) -
                        3,
                      fontSize: 7,
                      color: '#666',
                    }}
                  >
                    {value}
                  </Text>
                ))}

                {/* Axis labels - centered on their quadrants */}
                <Text
                  style={{
                    position: 'absolute',
                    top: margin - 15,
                    left: margin + (chartWidth - 2 * margin) / 4 - 15, // Center of left half
                    fontSize: 9,
                    fontStyle: 'italic',
                  }}
                >
                  Urgent
                </Text>
                <Text
                  style={{
                    position: 'absolute',
                    top: margin - 15,
                    left: margin + (3 * (chartWidth - 2 * margin)) / 4 - 20, // Center of right half
                    fontSize: 9,
                    fontStyle: 'italic',
                  }}
                >
                  Not Urgent
                </Text>
                <Text
                  style={{
                    position: 'absolute',
                    left: margin - 27,
                    top: margin + (chartHeight - 2 * margin) / 4 - 8, // Center of top half
                    fontSize: 9,
                    fontStyle: 'italic',
                    transform: 'rotate(-90deg)',
                    transformOrigin: 'center',
                  }}
                >
                  Important
                </Text>
                <Text
                  style={{
                    position: 'absolute',
                    left: margin - 35,
                    top: margin + (3 * (chartHeight - 2 * margin)) / 4 - 12, // Center of bottom half
                    fontSize: 9,
                    fontStyle: 'italic',
                    transform: 'rotate(-90deg)',
                    transformOrigin: 'center',
                  }}
                >
                  Not Important
                </Text>
              </View>
            );
          };

          const MyDocumentWithChart = () => (
            <Document>
              <Page size='A4' style={styles.page}>
                <View style={styles.section}>
                  <Text style={styles.header}>{getFormattedTitle()}</Text>

                  {/* Chart Visualization */}
                  <Text
                    style={{
                      fontSize: 12,
                      marginBottom: 5,
                      textAlign: 'center',
                    }}
                  >
                    Priority Matrix Visualization
                  </Text>
                  <ChartVisualization />

                  {/* Data Table */}
                  <Text
                    style={{
                      fontSize: 12,
                      marginTop: 15,
                      marginBottom: 5,
                      textAlign: 'center',
                    }}
                  >
                    Task Details
                  </Text>
                  <View style={styles.tableContainer}>
                    <View style={styles.tableHeader}>
                      <View style={styles.tableCellHeaderTask}>
                        <Text>Task</Text>
                      </View>
                      <View style={styles.tableCellHeader}>
                        <Text>Importance</Text>
                      </View>
                      <View style={styles.tableCellHeader}>
                        <Text>Urgency</Text>
                      </View>
                      <View style={styles.tableCellHeader}>
                        <Text>Quadrant</Text>
                      </View>
                    </View>
                    {matrixData.map((task, index) => (
                      <View key={index} style={styles.tableRow}>
                        <View style={styles.tableCellTask}>
                          <Text>{task.name}</Text>
                        </View>
                        <View style={styles.tableCell}>
                          <Text>{task.importance}</Text>
                        </View>
                        <View style={styles.tableCell}>
                          <Text>{task.urgency}</Text>
                        </View>
                        <View style={styles.tableCell}>
                          <Text>{task.quadrant}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </Page>
            </Document>
          );

          // Generate PDF with chart
          pdf(<MyDocumentWithChart />)
            .toBlob()
            .then(blob => {
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `priority-matrix-with-chart-${getFormattedDate().replace(/ /g, '-')}.pdf`;
              link.click();
              window.URL.revokeObjectURL(url);
            })
            .catch(error => {
              console.error('Error generating PDF with chart:', error);
              // Fallback to original PDF without chart
              pdf(<MyDocument />)
                .toBlob()
                .then(blob => {
                  const url = window.URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `priority-matrix-${getFormattedDate().replace(/ /g, '-')}.pdf`;
                  link.click();
                  window.URL.revokeObjectURL(url);
                });
            });
        })
        .catch(error => {
          console.error('Error loading PDF library:', error);
          alert('Error loading PDF library. Please try again.');
        });
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-blue-50 dark:from-slate-950 dark:via-teal-950 dark:to-blue-950'>
      {/* Targeting Theme Header */}
      <div className='relative overflow-hidden border-b border-teal-200 dark:border-teal-800'>
        <div className='absolute inset-0 bg-gradient-to-r from-teal-600/5 via-blue-600/5 to-teal-600/5 dark:from-teal-400/10 dark:via-blue-400/10 dark:to-teal-400/10'></div>

        <div className='relative px-4 py-8 sm:px-6 lg:px-8'>
          <div className='mx-auto max-w-4xl text-center'>
            {/* Icon and Title with Targeting Theme */}
            <div className='flex items-center justify-center gap-4 mb-4'>
              <div className='relative'>
                <div className='w-14 h-14 bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg'>
                  <Target className='h-7 w-7 text-white' />
                </div>
                {/* Targeting indicator dots */}
                <div className='absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center'>
                  <div className='w-2 h-2 bg-white rounded-full'></div>
                </div>
                <div className='absolute -bottom-1 -left-1 w-3 h-3 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center'>
                  <div className='w-1.5 h-1.5 bg-white rounded-full'></div>
                </div>
              </div>
              <div>
                <H1
                  className='text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl lg:text-5xl'
                  style={{ fontWeight: 700 }}
                >
                  <span className='bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent'>
                    Priority Matrix Generator
                  </span>
                </H1>
                <div className='h-1 w-20 bg-gradient-to-r from-teal-500 to-blue-500 mx-auto mt-2 rounded-full'></div>
              </div>
            </div>

            {/* Description with Targeting Language */}
            <P className='text-lg leading-7 text-gray-600 dark:text-gray-300 max-w-3xl mx-auto'>
              Strategic task prioritization using the Eisenhower Matrix
              methodology.
              <span className='font-medium text-teal-700 dark:text-teal-300'>
                {' '}
                Target your priorities{' '}
              </span>
              with precision scoring for importance and urgency.
            </P>

            {/* Quick Stats with Targeting Theme */}
            <div className='flex justify-center gap-6 mt-6'>
              <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
                <div className='w-2 h-2 bg-teal-500 rounded-full'></div>
                <span>Strategic Focus</span>
              </div>
              <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
                <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                <span>Priority Analysis</span>
              </div>
              <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
                <div className='w-2 h-2 bg-purple-500 rounded-full'></div>
                <span>Action Targeting</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='max-w-4xl mx-auto px-4 py-8'>
        <Card className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-teal-200/50 dark:border-teal-800/50 shadow-xl'>
          <CardContent className='p-8'>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
              {/* Project Name Section */}
              <div className='space-y-3'>
                <H3 className='text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2'>
                  <div className='w-2 h-2 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full'></div>
                  Project Details
                </H3>
                <div className='space-y-2'>
                  <Label
                    htmlFor='projectName'
                    className='text-sm font-medium text-teal-700 dark:text-teal-300'
                  >
                    Project Name
                  </Label>
                  <Input
                    id='projectName'
                    {...register('projectName')}
                    className='border-teal-200 dark:border-teal-700 focus:border-teal-500 focus:ring-teal-500/20'
                    placeholder='Enter your project name'
                  />
                  {errors.projectName && (
                    <p className='text-red-500 text-sm mt-1'>
                      {errors.projectName.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Tasks Section */}
              <div className='space-y-3'>
                <H3 className='text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2'>
                  <div className='w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full'></div>
                  Priority Tasks
                </H3>
                <P className='text-sm text-gray-600 dark:text-gray-400'>
                  Add tasks with importance (1-5) and urgency (1-5) scores to
                  generate your priority matrix.
                </P>

                <div className='space-y-4'>
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className='bg-gradient-to-r from-slate-50 to-teal-50 dark:from-slate-800 dark:to-teal-900/30 border border-teal-200/50 dark:border-teal-700/50 p-6 rounded-xl shadow-sm'
                    >
                      <div className='space-y-4'>
                        <div className='space-y-2'>
                          <Label className='text-sm font-medium text-teal-700 dark:text-teal-300'>
                            Task Description
                          </Label>
                          <Input
                            placeholder='Enter task description'
                            {...register(`tasks.${index}.name` as const)}
                            className='border-teal-200 dark:border-teal-700 focus:border-teal-500 focus:ring-teal-500/20'
                          />
                          {errors.tasks?.[index]?.name && (
                            <p className='text-red-500 text-sm'>
                              {errors.tasks[index]?.name?.message}
                            </p>
                          )}
                        </div>

                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                          <div className='space-y-2'>
                            <Label className='text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center gap-1'>
                              <TrendingUp className='h-3 w-3' />
                              Importance (1-5)
                            </Label>
                            <Controller
                              name={`tasks.${index}.importance`}
                              control={control}
                              render={({ field }) => (
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <SelectTrigger className='border-teal-200 dark:border-teal-700 focus:border-teal-500 focus:ring-teal-500/20'>
                                    <SelectValue placeholder='Select importance' />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Array.from(
                                      { length: 5 },
                                      (_, i) => i + 1
                                    ).map(num => (
                                      <SelectItem
                                        key={num}
                                        value={num.toString()}
                                      >
                                        <div className='flex items-center gap-2'>
                                          <div
                                            className={`w-2 h-2 rounded-full ${num >= 4 ? 'bg-red-500' : num >= 3 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                          ></div>
                                          {num} -{' '}
                                          {num >= 4
                                            ? 'Critical'
                                            : num >= 3
                                              ? 'High'
                                              : num >= 2
                                                ? 'Medium'
                                                : 'Low'}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          </div>

                          <div className='space-y-2'>
                            <Label className='text-sm font-medium text-purple-700 dark:text-purple-300 flex items-center gap-1'>
                              <Target className='h-3 w-3' />
                              Urgency (1-5)
                            </Label>
                            <Controller
                              name={`tasks.${index}.urgency`}
                              control={control}
                              render={({ field }) => (
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <SelectTrigger className='border-teal-200 dark:border-teal-700 focus:border-teal-500 focus:ring-teal-500/20'>
                                    <SelectValue placeholder='Select urgency' />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Array.from(
                                      { length: 5 },
                                      (_, i) => i + 1
                                    ).map(num => (
                                      <SelectItem
                                        key={num}
                                        value={num.toString()}
                                      >
                                        <div className='flex items-center gap-2'>
                                          <div
                                            className={`w-2 h-2 rounded-full ${num >= 4 ? 'bg-red-500' : num >= 3 ? 'bg-orange-500' : 'bg-blue-500'}`}
                                          ></div>
                                          {num} -{' '}
                                          {num >= 4
                                            ? 'Immediate'
                                            : num >= 3
                                              ? 'Soon'
                                              : num >= 2
                                                ? 'Later'
                                                : 'Future'}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          </div>
                        </div>

                        <Button
                          type='button'
                          variant='outline'
                          onClick={() => remove(index)}
                          className='w-full sm:w-auto border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20'
                        >
                          <Trash2 className='h-4 w-4 mr-2' /> Remove Task
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    type='button'
                    onClick={() =>
                      append({ name: '', importance: '3', urgency: '3' })
                    }
                    className='w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200'
                  >
                    <Plus className='h-4 w-4 mr-2' /> Add Priority Task
                  </Button>
                </div>
              </div>

              <div className='flex justify-center pt-4'>
                <Button
                  type='submit'
                  className='bg-gradient-to-r from-teal-600 to-blue-700 hover:from-teal-700 hover:to-blue-800 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105'
                >
                  <Target className='h-5 w-5 mr-2' />
                  Generate Priority Matrix
                </Button>
              </div>
            </form>

            {matrixData.length > 0 && (
              <div className='mt-12 pt-8 border-t border-teal-200/50 dark:border-teal-700/50'>
                <div className='text-center mb-8'>
                  <H3 className='text-xl font-semibold text-gray-900 dark:text-white flex items-center justify-center gap-2 mb-2'>
                    <div className='w-3 h-3 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full'></div>
                    Strategic Priority Matrix
                  </H3>
                  <P className='text-sm text-gray-600 dark:text-gray-400'>
                    Eisenhower Matrix visualization with targeted action
                    quadrants
                  </P>
                </div>
                <>
                  {(() => {
                    const doData = matrixData.filter(
                      task => task.quadrant === 'Do'
                    );
                    const decideData = matrixData.filter(
                      task => task.quadrant === 'Decide'
                    );
                    const delegateData = matrixData.filter(
                      task => task.quadrant === 'Delegate'
                    );
                    const deleteData = matrixData.filter(
                      task => task.quadrant === 'Delete'
                    );

                    return (
                      <div className='relative mt-8'>
                        {/* X-Axis Labels above chart */}
                        <div className='absolute top-[-35px] left-0 translate-x-[230px] text-sm italic text-gray-700 z-20'>
                          Urgent
                        </div>
                        <div className='absolute top-[-35px] right-0 translate-x-[-150px] text-sm italic text-gray-700 z-20'>
                          Not Urgent
                        </div>
                        <ChartContainer
                          config={chartConfig}
                          className='h-[400px] w-full relative z-10 priority-matrix-chart'
                        >
                          <ScatterChart width={800} height={400}>
                            <CartesianGrid />
                            <XAxis
                              type='number'
                              dataKey='urgency'
                              name='Urgency'
                              domain={[5, 1]}
                              ticks={[5, 4, 3, 2, 1]}
                            />
                            <YAxis
                              type='number'
                              dataKey='importance'
                              name='Importance'
                              domain={[1, 5]}
                              ticks={[1, 2, 3, 4, 5]}
                            />
                            <ChartTooltip
                              content={
                                <ChartTooltipContent className='bg-white border border-gray-200 shadow-lg rounded-md p-2' />
                              }
                            />
                            <ReferenceLine
                              x={3}
                              stroke='gray'
                              strokeDasharray='3 3'
                              label={false}
                            />
                            <ReferenceLine
                              y={3}
                              stroke='gray'
                              strokeDasharray='3 3'
                              label={false}
                            />
                            <Scatter
                              name='Do'
                              data={doData}
                              fill={chartConfig.Do.color}
                            />
                            <Scatter
                              name='Decide'
                              data={decideData}
                              fill={chartConfig.Decide.color}
                            />
                            <Scatter
                              name='Delegate'
                              data={delegateData}
                              fill={chartConfig.Delegate.color}
                            />
                            <Scatter
                              name='Delete'
                              data={deleteData}
                              fill={chartConfig.Delete.color}
                            />
                          </ScatterChart>
                        </ChartContainer>
                        {/* Quadrant Overlay Wrapper to align with plot area */}
                        <div
                          className={`absolute ${isMobile ? 'w-[95%] h-[97%]' : 'w-[91.5%] h-[90.5%]'} pointer-events-none z-0`}
                          style={{
                            left: 'calc(5% + 25px)',
                            top: 'calc(8% - 28px)',
                          }}
                        >
                          {/* Quadrant Shading */}
                          <div className='absolute inset-0'>
                            {/* Delegate: high urgency low importance - bottom left */}
                            <div className='absolute bottom-0 left-0 w-1/2 h-1/2 bg-blue-200 opacity-20'></div>
                            {/* Delete: low urgency low importance - bottom right */}
                            <div className='absolute bottom-0 right-0 w-1/2 h-1/2 bg-red-200 opacity-20'></div>
                            {/* Do: high urgency high importance - top left */}
                            <div className='absolute top-0 left-0 w-1/2 h-1/2 bg-green-200 opacity-20'></div>
                            {/* Decide: low urgency high importance - top right */}
                            <div className='absolute top-0 right-0 w-1/2 h-1/2 bg-yellow-200 opacity-20'></div>
                          </div>
                          {/* Quadrant Labels */}
                          <div className='absolute inset-0'>
                            <div className='absolute top-0 left-0 ml-1 mt-1 text-xs font-bold text-black bg-white px-2 py-1 rounded shadow-sm'>
                              Do
                            </div>
                            <div className='absolute top-0 right-0 mr-1 mt-1 text-xs font-bold text-black bg-white px-2 py-1 rounded shadow-sm'>
                              Decide
                            </div>
                            <div className='absolute bottom-0 left-0 ml-1 mb-1 text-xs font-bold text-black bg-white px-2 py-1 rounded shadow-sm'>
                              Delegate
                            </div>
                            <div className='absolute bottom-0 right-0 mr-1 mb-1 text-xs font-bold text-black bg-white px-2 py-1 rounded shadow-sm'>
                              Delete
                            </div>
                          </div>
                        </div>
                        {/* Axis Labels outside chart */}
                        {/* Y-Axis Labels positioned outside left */}
                        <div className='absolute left-0 top-[10%] -translate-x-3 translate-y-[30px] text-sm italic text-gray-700 writing-mode-vertical-rl transform -rotate-90 z-20 whitespace-nowrap'>
                          Important
                        </div>
                        <div className='absolute left-0 bottom-[10%] -translate-x-[27px] -translate-y-[120px] text-sm italic text-gray-700 writing-mode-vertical-rl transform -rotate-90 z-20 whitespace-nowrap'>
                          Not Important
                        </div>
                      </div>
                    );
                  })()}
                </>
                <div className='flex flex-col sm:flex-row gap-4 mt-8 justify-center'>
                  <Button
                    onClick={() => handleExport('raw')}
                    variant='outline'
                    className='border-teal-200 text-teal-700 hover:bg-teal-50 hover:border-teal-300 dark:border-teal-700 dark:text-teal-300 dark:hover:bg-teal-900/20'
                  >
                    <Download className='h-4 w-4 mr-2' /> Export Raw XLSX
                  </Button>
                  <Button
                    onClick={() => handleExport('formatted-xlsx')}
                    className='bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200'
                  >
                    <Download className='h-4 w-4 mr-2' /> Export Matrix XLSX
                  </Button>
                  <Button
                    onClick={() => handleExport('formatted-pdf')}
                    variant='outline'
                    className='border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 dark:border-purple-700 dark:text-purple-300 dark:hover:bg-purple-900/20'
                  >
                    <Download className='h-4 w-4 mr-2' /> Export Matrix PDF
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PriorityMatrixPage;
