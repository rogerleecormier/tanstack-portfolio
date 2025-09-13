import { MatrixTable } from '@/components/MatrixTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { H1, H3, P } from '@/components/ui/typography';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  pdf,
} from '@react-pdf/renderer';
import * as ExcelJS from 'exceljs';
import { Download, Plus, Target, Trash2, Users } from 'lucide-react';
import mermaid from 'mermaid';
import React, { useEffect, useRef, useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import * as z from 'zod';

interface MatrixCell {
  value: string;
  color?: 'R' | 'A' | 'C' | 'I';
}

interface MatrixRow {
  taskName: string;
  cells: MatrixCell[];
}

interface MatrixData {
  headers: string[]; // ['Task', 'Role1', 'Role2', ...]
  rows: MatrixRow[];
}

// Schema for form validation
const taskSchema = z.object({
  name: z.string().min(1, 'Task name is required'),
  raci: z.record(
    z.string(),
    z.object({
      R: z.boolean(),
      A: z.boolean(),
      C: z.boolean(),
      I: z.boolean(),
    })
  ),
});

const formSchema = z
  .object({
    projectName: z.string().min(1, 'Project name is required'),
    roles: z
      .array(z.object({ name: z.string().min(1, 'Role name is required') }))
      .min(1, 'At least one role is required')
      .refine(
        roles =>
          new Set(roles.map(role => role.name.toLowerCase().trim())).size ===
          roles.length,
        { message: 'Role names must be unique (case-insensitive)' }
      ),
    tasks: z
      .array(taskSchema)
      .min(1, 'At least one task is required')
      .refine(
        tasks =>
          new Set(tasks.map(task => task.name.toLowerCase().trim())).size ===
          tasks.length,
        { message: 'Task names must be unique (case-insensitive)' }
      ),
  })
  .superRefine((val, ctx) => {
    const roleNames = val.roles
      .map((r: { name: string }) => r.name.trim())
      .filter(Boolean);
    if (roleNames.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['roles'],
        message: 'At least one role is required',
      });
      return;
    }
    val.tasks.forEach((_, index) => {
      const hasAccountable = roleNames.some(
        role => val.tasks[index]?.raci?.[role]?.A
      );
      if (!hasAccountable) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['tasks', index],
          message: 'Each task must have an Accountable assigned',
        });
      }
      roleNames.forEach(role => {
        const assignments = val.tasks[index]?.raci?.[role];
        if (assignments) {
          const trueCount =
            (assignments.R ? 1 : 0) +
            (assignments.A ? 1 : 0) +
            (assignments.C ? 1 : 0) +
            (assignments.I ? 1 : 0);
          if (trueCount > 1) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['tasks', index, 'raci', role],
              message: 'Only one RACI category per role',
            });
          }
        }
      });
    });
  });

type FormData = z.infer<typeof formSchema>;

interface RoleField {
  id: string;
  name: string;
}

const isValidRoleName = (name?: string): boolean => {
  if (!name) return false;
  const trimmed = name.trim();
  if (trimmed === '') return false;
  const isIncomplete =
    ['R', 'A', 'C', 'I'].includes(trimmed) ||
    trimmed.length < 4 ||
    trimmed.endsWith(' ') ||
    /^\w+\s\w{1,3}$/.test(trimmed) ||
    /^\w{1,3}$/.test(trimmed) ||
    trimmed.includes('New Role');
  return !isIncomplete;
};

const RACIBuilderPage: React.FC = () => {
  const [matrixData, setMatrixData] = useState<MatrixData | null>(null);
  const [projectName, setProjectName] = useState<string>('');
  const [mermaidCode, setMermaidCode] = useState<string>('');
  const [mermaidSvg, setMermaidSvg] = useState<string>('');
  const mermaidRef = useRef<HTMLDivElement>(null);

  const {
    register,
    control,
    formState: { errors },
    getValues,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectName: '',
      roles: [{ name: '' }],
      tasks: [{ name: '', raci: {} }],
    },
  });

  const {
    fields: taskFields,
    append: taskAppend,
    remove: taskRemove,
  } = useFieldArray({
    control,
    name: 'tasks',
  });

  const addDebugLog = (message: string) => {
    console.log(message);
  };

  const {
    fields: roleFields,
    append: roleAppend,
    remove: roleRemove,
  } = useFieldArray({
    control,
    name: 'roles',
  });

  // Override role functions to add logging and sync RACI
  const customRoleAppend = (value: { name: string }) => {
    addDebugLog(`➕ Adding new role: ${JSON.stringify(value)}`);
    roleAppend(value);
    // Sync RACI after append
    setTimeout(() => updateRaciForRoles(), 0);
  };

  const customRoleRemove = (index: number) => {
    const roleToRemove = watchedRolesRaw[index]; // Use raw data to get the actual role being removed
    addDebugLog(`🗑️ Removing role: ${JSON.stringify(roleToRemove)}`);
    roleRemove(index);
    // Sync RACI after remove
    setTimeout(() => updateRaciForRoles(), 0);
  };

  const watchedRolesRaw = useWatch({
    control,
    name: 'roles',
  }) as unknown as RoleField[];
  const watchedTasks = useWatch({ control, name: 'tasks' });

  const lastValidRolesRef = useRef<string[]>([]);

  // Function to update RACI structure based on current valid roles
  const updateRaciForRoles = () => {
    const currentValidRoles = getValues('roles')
      .filter(r => isValidRoleName(r.name))
      .map(r => r.name.trim())
      .sort();
    const lastValidRoles = lastValidRolesRef.current.sort();
    if (JSON.stringify(currentValidRoles) === JSON.stringify(lastValidRoles)) {
      addDebugLog('📝 No change in valid roles, skipping update');
      return;
    }
    addDebugLog(
      `🔄 Updating RACI for valid roles: [${currentValidRoles.join(', ')}]`
    );
    const tasks = getValues('tasks');
    const updatedTasks = tasks.map(task => {
      const newRaci = { ...task.raci };
      // Add missing valid roles
      currentValidRoles.forEach(roleName => {
        if (!newRaci[roleName]) {
          newRaci[roleName] = { R: false, A: false, C: false, I: false };
          addDebugLog(`➕ Added role "${roleName}" to RACI`);
        }
      });
      // Remove invalid or old roles
      Object.keys(newRaci).forEach(key => {
        if (!currentValidRoles.includes(key)) {
          delete newRaci[key];
          addDebugLog(`🗑️ Removed role "${key}" from RACI`);
        }
      });
      return { ...task, raci: newRaci };
    });
    const currentTasks = getValues('tasks');
    if (JSON.stringify(updatedTasks) !== JSON.stringify(currentTasks)) {
      setValue('tasks', updatedTasks, { shouldDirty: false });
      addDebugLog('✅ RACI structure updated');
    } else {
      addDebugLog('📝 No task changes needed');
    }
    lastValidRolesRef.current = currentValidRoles;
  };

  // Handle role name change on blur for rename/validity
  const handleRoleNameBlur = (
    index: number,
    e: React.FocusEvent<HTMLInputElement>
  ) => {
    const newName = e.target.value.trim();
    const currentRoles = getValues('roles');
    const oldName = currentRoles[index]?.name;
    if (oldName !== newName) {
      // If rename between valid names, migrate data
      if (
        isValidRoleName(oldName) &&
        isValidRoleName(newName) &&
        oldName !== newName
      ) {
        const tasks = getValues('tasks');
        const updatedTasks = tasks.map(task => {
          if (oldName && task.raci[oldName]) {
            const newRaci = { ...task.raci };
            const oldRaci = newRaci[oldName];
            if (oldRaci) {
              newRaci[newName] = oldRaci;
            }
            delete newRaci[oldName];
            return { ...task, raci: newRaci };
          }
          return task;
        });
        setValue('tasks', updatedTasks, { shouldDirty: false });
        addDebugLog(`🔄 Renamed role "${oldName}" to "${newName}" in RACI`);
      }
      // Always sync after change, deferred to avoid loop
      setTimeout(() => updateRaciForRoles(), 0);
    }
  };

  // Filter out incomplete role names to prevent spurious RACI entries
  const watchedRoles = watchedRolesRaw.filter(role =>
    isValidRoleName(role?.name)
  );

  const onSubmit = (cleanData: FormData) => {
    addDebugLog('🚀 Form submission started with clean data');
    addDebugLog('📝 Clean form data: ' + safeStringify(cleanData));
    addDebugLog('🔍 Checking RACI assignments...');

    // Check each task's RACI assignments
    cleanData.tasks.forEach(task => {
      addDebugLog(`📋 Task "${task.name}" RACI assignments:`);
      Object.entries(task.raci).forEach(([roleName, raciValues]) => {
        const assignments = Object.entries(raciValues).filter(
          ([, value]) => value === true
        );
        addDebugLog(
          `  ${roleName}: ${assignments.map(([key]) => key).join(', ') || 'none'}`
        );
      });
    });

    addDebugLog(
      '✅ Validation passed! All checkbox values are booleans and RACI rules are followed'
    );
    addDebugLog('🎉 RACI matrix generation successful!');
    setProjectName(cleanData.projectName);

    // Generate matrix data for color-coded visualization
    const allRoles = cleanData.roles.map(r => r.name.trim()).filter(Boolean);
    addDebugLog('👥 All roles: ' + JSON.stringify(allRoles));

    const matrixRows = cleanData.tasks.map(task => ({
      taskName: task.name,
      cells: allRoles.map(role => {
        const assignments = task.raci[role];
        addDebugLog(
          `📋 Task "${task.name}", Role "${role}": ${JSON.stringify(assignments)}`
        );
        if (!assignments) return { value: '', color: 'R' as const };
        if (assignments.R) return { value: 'R', color: 'R' as const };
        if (assignments.A) return { value: 'A', color: 'A' as const };
        if (assignments.C) return { value: 'C', color: 'C' as const };
        if (assignments.I) return { value: 'I', color: 'I' as const };
        return { value: '', color: 'R' as const };
      }),
    }));
    addDebugLog('📊 Generated matrix rows: ' + safeStringify(matrixRows));
    setMatrixData({ headers: ['Task', ...allRoles], rows: matrixRows });

    // Generate Mermaid code for flowchart (simple matrix representation)
    const roles = allRoles;
    const roleMap = new Map(roles.map((role, i) => [role, `R${i}`]));
    let code = `graph TD\n`;
    code += `    subgraph "${cleanData.projectName}"\n`;
    // Add role nodes
    roles.forEach(role => {
      const roleId = roleMap.get(role);
      code += `        ${roleId}[${role}]\n`;
    });
    // Add task nodes and links
    cleanData.tasks.forEach((task, index) => {
      code += `        T${index}[${task.name}]\n`;
      allRoles.forEach(role => {
        const assignments = task.raci[role];
        if (assignments) {
          if (assignments.R)
            code += `        T${index} -->|R| ${roleMap.get(role)}\n`;
          if (assignments.A)
            code += `        T${index} -->|A| ${roleMap.get(role)}\n`;
          if (assignments.C)
            code += `        T${index} -->|C| ${roleMap.get(role)}\n`;
          if (assignments.I)
            code += `        T${index} -->|I| ${roleMap.get(role)}\n`;
        }
      });
    });
    code += `    end\n`;
    code += `    classDef raciRole fill:#e1f5fe,stroke:#01579b,stroke-width:2px\n`;
    roles.forEach(
      role => (code += `    class ${roleMap.get(role)} raciRole\n`)
    );

    addDebugLog('🎨 Generated Mermaid code:\n' + code);
    setMermaidCode(code);
    addDebugLog('✅ Chart generation completed successfully');
  };

  // Safe JSON stringify that handles circular references
  const safeStringify = (obj: unknown) => {
    try {
      return JSON.stringify(
        obj,
        (key: string, value: unknown) => {
          // Skip properties that might cause circular references
          if (key === 'ref' || key === 'refs' || key.startsWith('__react')) {
            return '[Circular]';
          }
          return value;
        },
        2
      );
    } catch (error) {
      return '[Unable to stringify: ' + (error as Error).message + ']';
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addDebugLog('📤 Form submit triggered');

    // Get current form data
    const currentFormData = getValues();
    addDebugLog('📋 Current form data: ' + safeStringify(currentFormData));

    // Clean spurious entries from the data for processing (but don't update the form)
    const cleanedData = {
      ...currentFormData,
      tasks: currentFormData.tasks.map(task => ({
        ...task,
        raci: Object.fromEntries(
          Object.entries(task.raci).filter(([roleName]) => {
            return (
              isValidRoleName(roleName) &&
              watchedRolesRaw.some(r => r.name?.trim() === roleName)
            );
          })
        ),
      })),
    };

    addDebugLog(
      '📋 Cleaned data for validation: ' + safeStringify(cleanedData)
    );

    // Validate the cleaned data manually by creating a temporary form state
    const validationResult = formSchema.safeParse(cleanedData);

    if (!validationResult.success) {
      addDebugLog(
        '❌ Validation errors occurred: ' +
          safeStringify(validationResult.error.format())
      );
      addDebugLog('💡 Issue: Multiple categories selected per role');
      addDebugLog(
        '📋 Check the "Debug Form Values" button to see current checkbox states'
      );
      addDebugLog(
        '🎯 Solution: Each role should have exactly ONE category: R, A, C, or I'
      );
      addDebugLog(
        '📖 Example: Developer=R, Manager=A, Product Owner=C, Team Lead=I'
      );
      return;
    }

    // If validation passes, proceed with onSubmit using cleaned data
    addDebugLog('✅ Validation passed, proceeding with chart generation');
    onSubmit(cleanedData);
  };

  useEffect(() => {
    if (mermaidCode && mermaidRef.current) {
      addDebugLog('🔄 Mermaid code changed, triggering diagram render');
      const renderMermaid = async () => {
        try {
          addDebugLog('🎨 Starting Mermaid diagram rendering...');
          mermaid.initialize({ startOnLoad: false, theme: 'default' });
          addDebugLog('📊 Mermaid initialized, rendering diagram...');
          const result = (await mermaid.render(
            'mermaid-diag',
            mermaidCode
          )) as unknown as { svg: string };
          setMermaidSvg(result.svg);
          addDebugLog('✅ Mermaid diagram rendered successfully');
        } catch (error) {
          addDebugLog(
            '❌ Mermaid rendering error: ' +
              (error instanceof Error ? error.message : String(error))
          );
          console.error('Mermaid rendering error:', error);
        }
      };
      void renderMermaid();
    }
  }, [mermaidCode]);

  const handleXLSXExport = async () => {
    if (!matrixData || !projectName) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('RACI Matrix');

    const date = new Date().toLocaleDateString();
    const headerText = `Project: ${projectName} | Date: ${date}`;
    const fullHeaders = matrixData.headers;
    const fullRows = matrixData.rows.map(row => [
      row.taskName,
      ...row.cells.map(cell => cell.value || ''),
    ]);

    // Add header row (subtle indigo for title)
    const headerRow = worksheet.addRow([headerText]);
    headerRow.font = { bold: true, color: { argb: 'FF1E40AF' }, size: 14 };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    headerRow.eachCell(cell => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } },
      };
    });

    // Merge header row across all columns
    worksheet.mergeCells(1, 1, 1, fullHeaders.length);

    // Add column headers (subtle gray only for role cells, white for Task)
    const headerCellsRow = worksheet.addRow(fullHeaders);
    headerCellsRow.font = { bold: true, color: { argb: 'FF374151' } }; // dark gray text
    headerCellsRow.alignment = { horizontal: 'center', vertical: 'middle' };
    headerCellsRow.eachCell((cell, colNumber) => {
      if (colNumber > 1) {
        // Role columns (skip Task column)
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFD6E4FF' },
        }; // light blue
      } // Task column remains default white
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } },
      };
    });

    // Add data rows
    const dataBorder: Partial<ExcelJS.Borders> = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } },
    };
    fullRows.forEach(rowData => {
      const row = worksheet.addRow(rowData);
      row.eachCell((cell, colNumber) => {
        const cellValue = rowData[colNumber - 1];
        const cellColor = cellValue as 'R' | 'A' | 'C' | 'I' | '';
        let fillColor = { argb: 'FFFFFFFF' }; // white default
        if (cellColor === 'R')
          fillColor = { argb: 'FFD1FAE5' }; // light green
        else if (cellColor === 'A')
          fillColor = { argb: 'FFFEF3C7' }; // light amber
        else if (cellColor === 'C')
          fillColor = { argb: 'FFD6E4FF' }; // light blue
        else if (cellColor === 'I') fillColor = { argb: 'FFF3F4F6' }; // light gray
        cell.font = { bold: cellColor !== '' };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: fillColor };
        cell.alignment = {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: true,
        };
        cell.border = dataBorder;
      });
    });

    // Auto-fit column widths based on content
    const maxLengths = fullHeaders.map((_, colIndex) => {
      let maxLen = fullHeaders[colIndex]?.length ?? 0;
      fullRows.forEach(rowData => {
        const cellValue = rowData[colIndex];
        maxLen = Math.max(maxLen, (cellValue ?? '').length);
      });
      return Math.max(maxLen, 8) + 2;
    });
    worksheet.columns = maxLengths.map(width => ({ width }));

    // Write to buffer and download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'raci-formatted.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleRawXLSXExport = async () => {
    if (!matrixData || !projectName) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('RACI Raw');

    const date = new Date().toLocaleDateString();
    const headerText = `Project: ${projectName} | Date: ${date}`;
    const fullHeaders = matrixData.headers;
    const fullRows = matrixData.rows.map(row => [
      row.taskName,
      ...row.cells.map(cell => cell.value || ''),
    ]);

    // Add header row
    worksheet.addRow([headerText]);

    // Add column headers
    worksheet.addRow(fullHeaders);

    // Add data rows
    fullRows.forEach(rowData => worksheet.addRow(rowData));

    // Write to buffer and download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'raci-raw.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePDFExport = async () => {
    if (!matrixData || !projectName) return;

    const date = new Date().toLocaleDateString();
    const title = `Project: ${projectName} | Date: ${date}`;
    const fullHeaders = matrixData.headers;
    const fullRows = matrixData.rows;

    const numRoles = fullHeaders.length - 1; // Exclude 'Task'
    const taskWidth = 150; // Fixed width for task column in points (A4 width ~595)
    const roleWidth = (595 - 40 - taskWidth) / numRoles; // Margins 20 each side, approx

    const baseTableCell = {
      borderStyle: 'solid' as const,
      borderWidth: 1,
      borderColor: '#000',
      padding: 5,
      fontSize: 8,
    };

    const styles = StyleSheet.create({
      page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 20,
      },
      section: {
        margin: 10,
        padding: 10,
      },
      title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
      },
      tableContainer: {
        marginTop: 20,
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#000',
      },
      tableRow: {
        flexDirection: 'row',
      },
      headerCell: {
        ...baseTableCell,
        backgroundColor: '#F9FAFB', // light gray
        fontWeight: 'bold',
        textAlign: 'center',
      },
      taskCell: {
        width: taskWidth,
        ...baseTableCell,
        backgroundColor: '#FFFFFF',
        textAlign: 'left',
      },
      roleCell: {
        width: roleWidth,
        ...baseTableCell,
        backgroundColor: '#FFFFFF',
        textAlign: 'center',
      },
      boldCell: { fontWeight: 'bold' },
      mermaidTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 5,
      },
      code: {
        fontSize: 8,
        fontFamily: 'Courier', // Monospace if available, else default
        backgroundColor: '#F3F4F6',
        padding: 5,
        borderWidth: 1,
        borderColor: '#000',
      },
    });

    const getCellColor = (color?: 'R' | 'A' | 'C' | 'I') => {
      switch (color) {
        case 'R':
          return '#D1FAE5'; // light green
        case 'A':
          return '#FEF3C7'; // light amber
        case 'C':
          return '#D6E4FF'; // light blue
        case 'I':
          return '#F3F4F6'; // light gray
        default:
          return '#FFFFFF';
      }
    };

    const TableHeaderRow = () => (
      <View style={styles.tableRow}>
        {fullHeaders.map(header => (
          <View
            key={header}
            style={[
              styles.headerCell,
              header === 'Task' ? { width: taskWidth } : { width: roleWidth },
            ]}
          >
            <Text>{header}</Text>
          </View>
        ))}
      </View>
    );

    const TableBodyRows = () => (
      <>
        {fullRows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.tableRow}>
            <View style={styles.taskCell}>
              <Text>{row.taskName}</Text>
            </View>
            {row.cells.map((cell, cellIndex) => (
              <View
                key={cellIndex}
                style={[
                  styles.roleCell,
                  { backgroundColor: getCellColor(cell.color) },
                  cell.value ? styles.boldCell : {},
                ]}
              >
                <Text>{cell.value || ''}</Text>
              </View>
            ))}
          </View>
        ))}
      </>
    );

    const MyDocument = () => (
      <Document>
        <Page size='A4' style={styles.page}>
          <View style={styles.section}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.tableContainer}>
              <TableHeaderRow />
              <TableBodyRows />
            </View>
          </View>
        </Page>
      </Document>
    );

    const doc = <MyDocument />;
    const blob = await pdf(doc).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'raci-formatted.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSVGDownload = () => {
    if (mermaidSvg) {
      const svgBlob = new Blob([mermaidSvg], {
        type: 'image/svg+xml;charset=utf-8',
      });
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

  // Generic handler for checkbox changes to reduce duplication
  const handleCheckboxChange = (
    taskIndex: number,
    roleName: string,
    category: 'R' | 'A' | 'C' | 'I',
    checked: boolean
  ) => {
    addDebugLog(`📋 Checkbox clicked: ${roleName}.${category} = ${checked}`);

    // Get current form values
    const currentValues = getValues();
    const currentTask = currentValues.tasks[taskIndex];

    if (!currentTask?.raci[roleName]) {
      addDebugLog(
        `❌ Task or role not found: taskIndex=${taskIndex}, roleName=${roleName}`
      );
      return;
    }

    // Create updated RACI object
    const updatedRaci = { ...currentTask.raci };
    const updatedRoleRaci = {
      R: false,
      A: false,
      C: false,
      I: false,
      ...updatedRaci[roleName],
    };

    if (checked) {
      // Uncheck other categories for this role
      (['R', 'A', 'C', 'I'] as const).forEach(cat => {
        if (cat !== category) {
          updatedRoleRaci[cat] = false;
        }
      });
      addDebugLog(`🔄 Unchecked other categories for ${roleName} (RACI rule)`);
    }

    // Set the current category
    updatedRoleRaci[category] = checked;
    updatedRaci[roleName] = updatedRoleRaci;

    // Update the entire task
    const updatedTask = { ...currentTask, raci: updatedRaci };
    const updatedTasks = [...currentValues.tasks];
    updatedTasks[taskIndex] = updatedTask;

    setValue('tasks', updatedTasks, {
      shouldValidate: false,
      shouldDirty: true,
    });

    // Verify the value was set correctly
    setTimeout(() => {
      const newValues = getValues();
      const newTask = newValues.tasks[taskIndex];
      const currentValue = newTask?.raci?.[roleName]?.[category];
      addDebugLog(
        `✅ ${roleName}.${category} set to: ${currentValue} (expected: ${checked})`
      );
    }, 0);
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-blue-50 dark:from-slate-950 dark:via-teal-950 dark:to-blue-950'>
      {/* Targeting Theme Header */}
      <div className='relative overflow-hidden border-b border-teal-200 dark:border-teal-800'>
        <div className='absolute inset-0 bg-gradient-to-r from-teal-600/5 via-blue-600/5 to-teal-600/5 dark:from-teal-400/10 dark:via-blue-400/10 dark:to-teal-400/10'></div>

        <div className='relative px-4 py-8 sm:px-6 lg:px-8'>
          <div className='mx-auto max-w-4xl text-center'>
            {/* Icon and Title with Targeting Theme */}
            <div className='mb-4 flex items-center justify-center gap-4'>
              <div className='relative'>
                <div className='flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-blue-600 shadow-lg'>
                  <Users className='size-7 text-white' />
                </div>
                {/* Targeting indicator dots */}
                <div className='absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600'>
                  <div className='size-2 rounded-full bg-white'></div>
                </div>
                <div className='absolute -bottom-1 -left-1 flex size-3 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-blue-500'>
                  <div className='size-1.5 rounded-full bg-white'></div>
                </div>
              </div>
              <div>
                <H1
                  className='text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl lg:text-5xl'
                  style={{ fontWeight: 700 }}
                >
                  <span className='bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent'>
                    RACI Chart Builder
                  </span>
                </H1>
                <div className='mx-auto mt-2 h-1 w-20 rounded-full bg-gradient-to-r from-teal-500 to-blue-500'></div>
              </div>
            </div>

            {/* Description with Targeting Language */}
            <P className='mx-auto max-w-3xl text-lg leading-7 text-gray-600 dark:text-gray-300'>
              Strategic team alignment using RACI methodology.
              <span className='font-medium text-teal-700 dark:text-teal-300'>
                {' '}
                Target responsibilities{' '}
              </span>
              with precision role assignments for project success.
            </P>

            {/* Quick Stats with Targeting Theme */}
            <div className='mt-6 flex justify-center gap-6'>
              <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
                <div className='size-2 rounded-full bg-teal-500'></div>
                <span>Role Clarity</span>
              </div>
              <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
                <div className='size-2 rounded-full bg-blue-500'></div>
                <span>Accountability</span>
              </div>
              <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
                <div className='size-2 rounded-full bg-purple-500'></div>
                <span>Team Alignment</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='mx-auto max-w-4xl px-4 py-8'>
        <Card className='border border-teal-200/50 bg-white/80 shadow-xl backdrop-blur-sm dark:border-teal-800/50 dark:bg-slate-900/80'>
          <CardContent className='space-y-8 p-8'>
            {/* Validation Errors Summary */}
            {Object.keys(errors).length > 0 && (
              <div className='mb-6 rounded-lg border border-red-200 bg-red-50 p-4'>
                <h3 className='mb-2 text-lg font-semibold text-red-800'>
                  Validation Errors
                </h3>
                <div className='space-y-1 text-sm text-red-700'>
                  {errors.projectName && (
                    <p>• Project name: {errors.projectName.message}</p>
                  )}
                  {errors.roles && <p>• Roles: {errors.roles.message}</p>}
                  {errors.tasks && typeof errors.tasks.message === 'string' && (
                    <p>• Tasks: {errors.tasks.message}</p>
                  )}
                  {errors.tasks &&
                    Array.isArray(errors.tasks) &&
                    (errors.tasks as Array<Record<string, unknown>>)
                      .filter(taskError => taskError)
                      .map(
                        (taskError: Record<string, unknown>, index: number) => (
                          <div key={index}>
                            <p className='font-medium'>Task {index + 1}:</p>
                            {(taskError as { name?: { message?: string } })
                              .name && (
                              <p className='ml-4'>
                                • Name:{' '}
                                {
                                  (taskError as { name: { message: string } })
                                    .name.message
                                }
                              </p>
                            )}
                            {(taskError as { message?: string }).message && (
                              <p className='ml-4'>
                                • {(taskError as { message: string }).message}
                              </p>
                            )}
                            {(taskError as { raci?: Record<string, unknown> })
                              .raci &&
                              Object.entries(
                                (taskError as { raci: Record<string, unknown> })
                                  .raci
                              ).map(([roleName, roleError]) => (
                                <div key={roleName} className='ml-4'>
                                  {roleError &&
                                  typeof roleError === 'object' &&
                                  'message' in roleError &&
                                  typeof roleError.message === 'string' ? (
                                    <p>
                                      • {roleName}: {roleError.message}
                                    </p>
                                  ) : roleError &&
                                    typeof roleError === 'object' &&
                                    !('message' in roleError) ? (
                                    // Handle nested RACI category errors
                                    <div>
                                      <p className='font-medium'>
                                        • {roleName}:
                                      </p>
                                      {Object.entries(roleError).map(
                                        ([category, categoryError]) =>
                                          categoryError &&
                                          typeof categoryError === 'object' &&
                                          'message' in categoryError &&
                                          typeof (
                                            categoryError as Record<
                                              string,
                                              unknown
                                            >
                                          ).message === 'string' ? (
                                            <p key={category} className='ml-6'>
                                              • {category}:{' '}
                                              {
                                                (
                                                  categoryError as Record<
                                                    string,
                                                    unknown
                                                  >
                                                ).message as string
                                              }
                                            </p>
                                          ) : null
                                      )}
                                    </div>
                                  ) : null}
                                </div>
                              ))}
                          </div>
                        )
                      )}
                </div>
              </div>
            )}

            <form
              onSubmit={e => void handleFormSubmit(e)}
              className='space-y-8'
            >
              {/* Project Name Section */}
              <div className='space-y-3'>
                <H3 className='flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white'>
                  <div className='size-2 rounded-full bg-gradient-to-r from-teal-500 to-blue-500'></div>
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
                    className='border-teal-200 focus:border-teal-500 focus:ring-teal-500/20 dark:border-teal-700'
                    placeholder='Enter your project name'
                  />
                  {errors.projectName && (
                    <p className='mt-1 text-sm text-red-500'>
                      {errors.projectName.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Roles Section */}
              <div className='space-y-3'>
                <H3 className='flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white'>
                  <div className='size-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500'></div>
                  Team Roles
                </H3>
                <div className='space-y-4'>
                  {roleFields.map((field, index) => (
                    <div
                      key={field.id}
                      className='rounded-xl border border-teal-200/50 bg-gradient-to-r from-slate-50 to-teal-50 p-6 shadow-sm dark:border-teal-700/50 dark:from-slate-800 dark:to-teal-900/30'
                    >
                      <div className='flex items-center gap-2'>
                        <Input
                          placeholder='e.g. Developer, Project Manager, Product Owner'
                          {...register(`roles.${index}.name` as const)}
                          className='flex-1 border-teal-200 text-gray-600 placeholder:text-teal-500 focus:border-teal-500 focus:ring-teal-500/20 focus:placeholder:text-transparent dark:border-teal-700 dark:text-gray-300'
                          onFocus={e => {
                            if (e.target.placeholder && !e.target.value) {
                              e.target.placeholder = '';
                            }
                          }}
                          onBlur={e => {
                            if (!e.target.value) {
                              e.target.placeholder =
                                'e.g. Developer, Project Manager, Product Owner';
                            }
                            handleRoleNameBlur(index, e);
                          }}
                        />
                        <Button
                          type='button'
                          variant='outline'
                          onClick={() => customRoleRemove(index)}
                          size='sm'
                          className='border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20'
                        >
                          <Trash2 className='size-4' />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                {errors.roles && (
                  <p className='text-sm text-red-500'>{errors.roles.message}</p>
                )}
                <Button
                  type='button'
                  onClick={() => {
                    addDebugLog('🔘 Add Role button clicked');
                    customRoleAppend({ name: '' });
                  }}
                  className='w-full border-0 bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-lg transition-all duration-200 hover:from-teal-600 hover:to-blue-700 hover:shadow-xl'
                >
                  <Plus className='mr-2 size-4' /> Add Team Role
                </Button>
              </div>

              <div>
                <H3 className='flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white'>
                  <div className='size-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500'></div>
                  Project Tasks
                </H3>
                <div className='space-y-4'>
                  {taskFields.map((field, index) => (
                    <div
                      key={field.id}
                      className='rounded-xl border border-teal-200/50 bg-gradient-to-r from-white to-slate-50 p-6 shadow-sm dark:border-teal-700/50 dark:from-slate-800 dark:to-slate-700/50'
                    >
                      <div className='mb-4 flex items-center gap-2'>
                        <Input
                          placeholder='Task Name'
                          {...register(`tasks.${index}.name` as const)}
                          className='flex-1 border-teal-200 focus:border-teal-500 focus:ring-teal-500/20 dark:border-teal-700'
                        />
                        <Button
                          type='button'
                          variant='outline'
                          onClick={() => taskRemove(index)}
                          size='sm'
                          className='border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20'
                        >
                          <Trash2 className='size-4' />
                        </Button>
                      </div>
                      {errors.tasks?.[index]?.name && (
                        <p className='text-sm text-red-500'>
                          {errors.tasks?.[index]?.name?.message}
                        </p>
                      )}
                      {errors.tasks?.[index] && (
                        <p className='text-sm text-red-500'>
                          {errors.tasks[index]?.message}
                        </p>
                      )}
                      <div className='space-y-2'>
                        <div className='mb-2 rounded border border-teal-200 bg-teal-50 p-2 text-xs text-gray-600 dark:border-teal-700 dark:bg-teal-900/20'>
                          💡{' '}
                          <strong className='text-primary'>RACI Rule:</strong>{' '}
                          Select only ONE category per role (R/A/C/I)
                        </div>
                        {roleFields.map((roleField, roleIndex) => {
                          const role = watchedRolesRaw[roleIndex]; // Use raw data for rendering all roles
                          const roleName = role?.name?.trim() ?? '';

                          // Check if this role is filtered out (incomplete)
                          const isFilteredOut = !watchedRoles.some(
                            filteredRole =>
                              filteredRole.name?.trim() === roleName
                          );

                          if (isFilteredOut) {
                            return (
                              <div
                                key={roleField.id}
                                className='flex items-center gap-2 opacity-50'
                              >
                                <Label className='w-24 font-medium text-gray-600'>
                                  {roleName || `Role ${roleIndex + 1}`}{' '}
                                  (incomplete)
                                </Label>
                                <div className='flex gap-2 text-xs text-gray-600'>
                                  Complete role name to enable checkboxes
                                </div>
                              </div>
                            );
                          }

                          // Check if this role already has a category selected for this task
                          const currentAssignments =
                            watchedTasks[index]?.raci?.[roleName];
                          const hasCategorySelected =
                            Boolean(currentAssignments?.R) ||
                            Boolean(currentAssignments?.A) ||
                            Boolean(currentAssignments?.C) ||
                            Boolean(currentAssignments?.I);

                          return (
                            <div
                              key={roleField.id}
                              className='flex items-center gap-2'
                            >
                              <Label className='w-24 font-medium text-primary'>
                                {roleName}
                              </Label>
                              <div className='flex gap-2'>
                                <div className='flex items-center gap-1'>
                                  <Checkbox
                                    {...register(
                                      `tasks.${index}.raci.${roleName}.R` as const
                                    )}
                                    disabled={
                                      hasCategorySelected &&
                                      !currentAssignments?.R
                                    }
                                    onCheckedChange={checked =>
                                      handleCheckboxChange(
                                        index,
                                        roleName,
                                        'R',
                                        checked as boolean
                                      )
                                    }
                                    className='focus:ring-teal-500'
                                  />
                                  <Label
                                    className={`text-sm ${hasCategorySelected && !currentAssignments?.R ? 'text-gray-500' : 'text-primary'}`}
                                  >
                                    Responsible
                                  </Label>
                                </div>
                                <div className='flex items-center gap-1'>
                                  <Checkbox
                                    {...register(
                                      `tasks.${index}.raci.${roleName}.A` as const
                                    )}
                                    disabled={
                                      hasCategorySelected &&
                                      !currentAssignments?.A
                                    }
                                    onCheckedChange={checked =>
                                      handleCheckboxChange(
                                        index,
                                        roleName,
                                        'A',
                                        checked as boolean
                                      )
                                    }
                                    className='focus:ring-teal-500'
                                  />
                                  <Label
                                    className={`text-sm ${hasCategorySelected && !currentAssignments?.A ? 'text-gray-500' : 'text-primary'}`}
                                  >
                                    Accountable
                                  </Label>
                                </div>
                                <div className='flex items-center gap-1'>
                                  <Checkbox
                                    {...register(
                                      `tasks.${index}.raci.${roleName}.C` as const
                                    )}
                                    disabled={
                                      hasCategorySelected &&
                                      !currentAssignments?.C
                                    }
                                    onCheckedChange={checked =>
                                      handleCheckboxChange(
                                        index,
                                        roleName,
                                        'C',
                                        checked as boolean
                                      )
                                    }
                                    className='focus:ring-teal-500'
                                  />
                                  <Label
                                    className={`text-sm ${hasCategorySelected && !currentAssignments?.C ? 'text-gray-500' : 'text-primary'}`}
                                  >
                                    Consulted
                                  </Label>
                                </div>
                                <div className='flex items-center gap-1'>
                                  <Checkbox
                                    {...register(
                                      `tasks.${index}.raci.${roleName}.I` as const
                                    )}
                                    disabled={
                                      hasCategorySelected &&
                                      !currentAssignments?.I
                                    }
                                    onCheckedChange={checked =>
                                      handleCheckboxChange(
                                        index,
                                        roleName,
                                        'I',
                                        checked as boolean
                                      )
                                    }
                                    className='focus:ring-teal-500'
                                  />
                                  <Label
                                    className={`text-sm ${hasCategorySelected && !currentAssignments?.I ? 'text-gray-500' : 'text-primary'}`}
                                  >
                                    Informed
                                  </Label>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  type='button'
                  onClick={() => {
                    const currentRoles = getValues('roles')
                      .filter(r => isValidRoleName(r.name))
                      .map(r => r.name?.trim() ?? '');
                    const newRaci = Object.fromEntries(
                      currentRoles.map(roleName => [
                        roleName,
                        { R: false, A: false, C: false, I: false },
                      ])
                    );
                    taskAppend({ name: '', raci: newRaci });
                    // Sync after add task if needed, but since new task has fresh raci, no need
                  }}
                  className='w-full border-0 bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg transition-all duration-200 hover:from-purple-600 hover:to-pink-700 hover:shadow-xl'
                >
                  <Plus className='mr-2 size-4' /> Add Project Task
                </Button>
              </div>

              <div className='flex justify-center pt-4'>
                <Button
                  type='submit'
                  className='bg-gradient-to-r from-teal-600 to-blue-700 px-8 py-3 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-teal-700 hover:to-blue-800 hover:shadow-xl'
                >
                  <Target className='mr-2 size-5' />
                  Generate RACI Chart
                </Button>
              </div>
            </form>

            {(matrixData ?? mermaidSvg) && (
              <div className='mt-12 border-t border-teal-200/50 pt-8 dark:border-teal-700/50'>
                <div className='mb-8 text-center'>
                  <H3 className='mb-2 flex items-center justify-center gap-2 text-xl font-semibold text-gray-900 dark:text-white'>
                    <div className='size-3 rounded-full bg-gradient-to-r from-teal-500 to-blue-500'></div>
                    Strategic RACI Matrix
                  </H3>
                  <P className='text-sm text-gray-600 dark:text-gray-400'>
                    RACI methodology visualization with targeted responsibility
                    assignments
                  </P>
                </div>
                {matrixData && (
                  <div className='mb-8'>
                    <MatrixTable data={matrixData} />
                  </div>
                )}
                {mermaidSvg && (
                  <div className='mb-8'>
                    <H3 className='mb-4 text-lg font-semibold text-gray-900 dark:text-white'>
                      Relationship Flowchart
                    </H3>
                    <div
                      ref={mermaidRef}
                      dangerouslySetInnerHTML={{ __html: mermaidSvg }}
                      className='rounded border border-teal-200 bg-white p-4 dark:border-teal-700 dark:bg-slate-800'
                    />
                    <pre className='mt-4 overflow-auto rounded border border-teal-200 bg-teal-50 p-4 text-sm text-gray-600 dark:border-teal-700 dark:bg-slate-800/50 dark:text-gray-300'>
                      {mermaidCode}
                    </pre>
                  </div>
                )}
                <div className='mt-8 flex flex-col justify-center gap-4 sm:flex-row'>
                  {matrixData && (
                    <>
                      <Button
                        onClick={() => void handleRawXLSXExport()}
                        variant='outline'
                        className='border-teal-200 text-teal-700 hover:border-teal-300 hover:bg-teal-50 dark:border-teal-700 dark:text-teal-300 dark:hover:bg-teal-900/20'
                      >
                        <Download className='mr-2 size-4' /> Export Raw XLSX
                      </Button>
                      <Button
                        onClick={() => void handleXLSXExport()}
                        className='border-0 bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-lg transition-all duration-200 hover:from-teal-600 hover:to-blue-700 hover:shadow-xl'
                      >
                        <Download className='mr-2 size-4' /> Export Matrix XLSX
                      </Button>
                      <Button
                        onClick={() => void handlePDFExport()}
                        variant='outline'
                        className='border-purple-200 text-purple-700 hover:border-purple-300 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-300 dark:hover:bg-purple-900/20'
                      >
                        <Download className='mr-2 size-4' /> Export Matrix PDF
                      </Button>
                    </>
                  )}
                  {mermaidSvg && (
                    <Button
                      onClick={handleSVGDownload}
                      variant='outline'
                      className='border-green-200 text-green-700 hover:border-green-300 hover:bg-green-50 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900/20'
                    >
                      <Download className='mr-2 size-4' /> Download Flowchart
                      SVG
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
