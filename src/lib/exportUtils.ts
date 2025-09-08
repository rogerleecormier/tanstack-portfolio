// Export utilities for PM tools
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

export const createStyledXLSX = (tableData: { headers: string[]; rows: string[][] }, projectName: string, filename: string) => {
  const titleRow = [`Project: ${projectName}`];
  const headerRow = tableData.headers;
  const dataRows = tableData.rows;
  const ws = XLSX.utils.aoa_to_sheet([titleRow, headerRow, ...dataRows]);

  // Title styling
  const titleCell = XLSX.utils.encode_cell({ c: 0, r: 0 });
  ws[titleCell].s = {
    font: { bold: true, sz: 14, color: { rgb: "000000" } },
    alignment: { horizontal: "center", vertical: "center" }
  };

  // Header styling
  const headerRange = XLSX.utils.decode_range(ws['!ref']!);
  for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
    const cellAddress = { c: C, r: 1 };
    const cellRef = XLSX.utils.encode_cell(cellAddress);
    if (!ws[cellRef]) ws[cellRef] = {};
    ws[cellRef].s = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4F46E5" } },
      alignment: { horizontal: "center", vertical: "center" },
      border: { top: { style: "thin", color: { rgb: "000000" } }, bottom: { style: "thin", color: { rgb: "000000" } }, left: { style: "thin", color: { rgb: "000000" } }, right: { style: "thin", color: { rgb: "000000" } } }
    };
  }

  // Data rows styling with borders and alternating colors
  const colors = ['#F9FAFB', '#FFFFFF'];
  for (let R = 2; R <= dataRows.length + 1; ++R) {
    for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
      const cellAddress = { c: C, r: R };
      const cellRef = XLSX.utils.encode_cell(cellAddress);
      if (!ws[cellRef]) ws[cellRef] = {};
      ws[cellRef].s = {
        fill: { fgColor: { rgb: colors[(R - 2) % 2] } },
        alignment: { horizontal: "center", vertical: "center" },
        border: { top: { style: "thin", color: { rgb: "000000" } }, bottom: { style: "thin", color: { rgb: "000000" } }, left: { style: "thin", color: { rgb: "000000" } }, right: { style: "thin", color: { rgb: "000000" } } }
      };
    }
  }

  // Column widths
  ws['!cols'] = tableData.headers.map(() => ({ wch: 15 }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Matrix');
  XLSX.writeFile(wb, filename);
};

export const createStyledPDF = async (tableData: { headers: string[]; rows: string[][] }, projectName: string, filename: string, captureElementId?: string) => {
  // @ts-expect-error jsPDF autoTable extension
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