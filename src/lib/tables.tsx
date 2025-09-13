import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';

interface SortableTableProps {
  data: Record<string, unknown>[];
  headers: string[];
}

export function SortableTable({ data, headers }: SortableTableProps) {
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn) return 0;

    const aValue = a[sortColumn];
    const bValue = b[sortColumn];

    if (aValue === bValue) return 0;

    // Handle different types safely
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue < bValue ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      const comparison = aValue < bValue ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    }

    // Fallback to string comparison
    const aStr = typeof aValue === 'string' ? aValue : '';
    const bStr = typeof bValue === 'string' ? bValue : '';
    const comparison = aStr < bStr ? -1 : 1;
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {headers.map(header => (
            <TableHead
              key={header}
              onClick={() => handleSort(header)}
              style={{ cursor: 'pointer' }}
              className='select-none'
            >
              {header}
              {sortColumn === header && (
                <span className='ml-1'>
                  {sortDirection === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedData.length ? (
          sortedData.map((row, index) => (
            <TableRow key={index}>
              {headers.map(header => (
                <TableCell key={header}>
                  {typeof row[header] === 'string' ? row[header] : ''}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={headers.length} className='h-24 text-center'>
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
