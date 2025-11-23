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
      return 'bg-hunter-600/15 text-hunter-300 border-hunter-600/40';
    case 'A':
      return 'bg-gold-600/15 text-strategy-gold border-gold-600/40';
    case 'C':
      return 'bg-slate-600/15 text-slate-300 border-slate-600/40';
    case 'I':
      return 'bg-purple-600/15 text-purple-300 border-purple-600/40';
    default:
      return 'bg-slate-800/30 text-slate-400 border-slate-600/20';
  }
};

export const MatrixTable: React.FC<MatrixTableProps> = ({ data }) => {
  if (!data || data.rows.length === 0) {
    return <div className='text-slate-400'>No data available</div>;
  }

  return (
    <div className='overflow-x-auto'>
      <table className='min-w-full border-collapse divide-y divide-hunter-600/20 rounded-lg bg-slate-900/40 shadow-sm backdrop-blur-sm'>
        <thead>
          <tr>
            <th className='border-r border-hunter-600/20 bg-slate-800/50 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white'>
              Task
            </th>
            {data.headers.slice(1).map((header, index) => (
              <th
                key={index}
                className='border-r border-hunter-600/20 bg-slate-800/50 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white'
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className='divide-y divide-hunter-600/20'>
          {data.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <td className='whitespace-nowrap border-r border-hunter-600/20 bg-slate-800/30 px-6 py-4 text-sm font-medium text-slate-300'>
                {row.taskName}
              </td>
              {row.cells.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className={`whitespace-nowrap px-6 py-4 text-center text-sm font-medium ${getCellClass(cell.color)} border-r border-hunter-600/20`}
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
