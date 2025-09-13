import React from 'react';
import UnifiedTableRenderer from './UnifiedTableRenderer';

interface TableData {
  headers: string[];
  rows: string[][];
}

interface SortableTableProps {
  data: TableData;
}

export const SortableTable: React.FC<SortableTableProps> = ({ data }) => {
  // Convert the table data to markdown format for UnifiedTableRenderer
  const markdownContent = React.useMemo(() => {
    if (!data || !data.headers || !data.rows) return '';

    // Create markdown table string
    const headerRow = `| ${data.headers.join(' | ')} |`;
    const separatorRow = `| ${data.headers.map(() => '---').join(' | ')} |`;
    const dataRows = data.rows.map(row => `| ${row.join(' | ')} |`);

    return [headerRow, separatorRow, ...dataRows].join('\n');
  }, [data]);

  return (
    <UnifiedTableRenderer
      content={markdownContent}
      showSorting={true}
      className='my-4'
    />
  );
};
