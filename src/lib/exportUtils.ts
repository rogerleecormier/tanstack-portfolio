// Export utilities for PM tools
import * as ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

export const createStyledXLSX = async (tableData: { headers: string[]; rows: string[][] }, projectName: string, filename: string) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Matrix');

  // Title row
  const titleRow = worksheet.addRow([`Project: ${projectName}`]);
  titleRow.getCell(1).font = { bold: true, size: 14, color: { argb: 'FF000000' } };
  titleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

  // Header row
  const headerRow = worksheet.addRow(tableData.headers);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    };
  });

  // Data rows
  const colors = ['FFF9FAFB', 'FFFFFFFF'];
  tableData.rows.forEach((rowData, index) => {
    const row = worksheet.addRow(rowData);
    row.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors[index % 2] } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };
    });
  });

  // Column widths
  worksheet.columns = tableData.headers.map(() => ({ width: 15 }));

  // Save the file
  await workbook.xlsx.writeFile(filename);
};

export const createStyledPDF = async (tableData: { headers: string[]; rows: string[][] }, projectName: string, filename: string, captureElementId?: string) => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text(`${projectName} - Matrix`, 14, 20);

  // @ts-expect-error jsPDF autoTable method
  doc.autoTable({
    head: [tableData.headers],
    body: tableData.rows,
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold', halign: 'center' },
    bodyStyles: { halign: 'center', valign: 'middle' },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    columnStyles: tableData.headers.map(() => ({ cellWidth: 40 })),
    margin: { top: 30 },
  });

  if (captureElementId) {
    const element = document.getElementById(captureElementId);
    if (element) {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const imgProps = doc.getImageProperties(imgData);
      const pdfWidth = doc.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      doc.addPage();
      doc.addImage(imgData, 'PNG', 14, 20, pdfWidth - 28, pdfHeight);
    }
  }

  doc.save(filename);
};