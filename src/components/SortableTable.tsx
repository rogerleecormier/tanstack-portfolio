import { useState, useMemo } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export interface TableData {
  headers: string[]
  rows: string[][]
}

interface SortableTableProps {
  data: TableData
  className?: string
}

type SortConfig = {
  key: number
  direction: 'asc' | 'desc'
}

export function SortableTable({ data, className }: SortableTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null)

  const sortedData = useMemo(() => {
    if (!sortConfig) return data

    const sortedRows = [...data.rows].sort((a, b) => {
      const aValue = a[sortConfig.key] || ''
      const bValue = b[sortConfig.key] || ''

      // Try to convert to numbers for numeric sorting
      const aNum = parseFloat(aValue)
      const bNum = parseFloat(bValue)

      if (!isNaN(aNum) && !isNaN(bNum)) {
        // Numeric comparison
        if (sortConfig.direction === 'asc') {
          return aNum - bNum
        } else {
          return bNum - aNum
        }
      } else {
        // String comparison
        if (sortConfig.direction === 'asc') {
          return aValue.localeCompare(bValue)
        } else {
          return bValue.localeCompare(aValue)
        }
      }
    })

    return {
      headers: data.headers,
      rows: sortedRows
    }
  }, [data, sortConfig])

  const requestSort = (key: number) => {
    let direction: 'asc' | 'desc' = 'asc'
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    
    setSortConfig({ key, direction })
  }

  const getSortIcon = (key: number) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="h-4 w-4" />
    }
    
    if (sortConfig.direction === 'asc') {
      return <ArrowUp className="h-4 w-4" />
    } else {
      return <ArrowDown className="h-4 w-4" />
    }
  }

  if (!data.headers || data.headers.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No table data available
      </div>
    )
  }

  return (
    <div className={`w-full ${className}`}>
      <Table>
        <TableHeader>
          <TableRow>
            {data.headers.map((header, index) => (
              <TableHead key={index}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{header}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => requestSort(index)}
                    className="h-6 w-6 p-0 hover:bg-muted"
                  >
                    {getSortIcon(index)}
                  </Button>
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.rows.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {data.headers.map((_, colIndex) => (
                <TableCell key={colIndex}>
                  {row[colIndex] || ''}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
