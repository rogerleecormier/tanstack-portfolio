import React from 'react';

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

interface MatrixTableProps {
  data: MatrixData;
}

const getCellClass = (color: string | undefined): string => {
  switch (color) {
    case 'R':
      return 'bg-green-50 text-green-800 border-green-200';
    case 'A':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'C':
      return 'bg-blue-50 text-blue-800 border-blue-200';
    case 'I':
      return 'bg-gray-50 text-gray-800 border-gray-200';
    default:
      return 'bg-white text-gray-500 border-gray-100';
  }
};

export const MatrixTable: React.FC<MatrixTableProps> = ({ data }) => {
  if (!data || data.rows.length === 0) {
    return <div className='text-gray-500'>No data available</div>;
  }

  return (
    <div className='overflow-x-auto'>
      <table className='min-w-full border-collapse divide-y divide-gray-200 bg-white rounded-lg shadow-sm'>
        <thead>
          <tr>
            <th className='px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider border-r border-gray-100 bg-gray-50'>
              Task
            </th>
            {data.headers.slice(1).map((header, index) => (
              <th
                key={index}
                className='px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider border-r border-gray-100 bg-slate-50'
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className='divide-y divide-gray-200'>
          {data.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50 border-r border-gray-100'>
                {row.taskName}
              </td>
              {row.cells.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className={`px-6 py-4 whitespace-nowrap text-sm text-center font-medium ${getCellClass(cell.color)} border-r border-gray-100`}
                >
                  {cell.value || ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
