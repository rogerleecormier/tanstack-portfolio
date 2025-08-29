import React, { useState, useMemo } from 'react'
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
import { parseMarkdownTable } from '@/utils/tableParser'
import { logger } from '@/utils/logger'

// Helper function to extract table data from React table nodes
function extractTableFromReactNodes(content: React.ReactNode): TableData | null {
  try {
    logger.debug("=== EXTRACTING TABLE FROM REACT NODES ===")
    
    // If content is an array with thead/tbody structure, handle it specially FIRST
    if (Array.isArray(content)) {
      logger.debug("Processing array content with length:", content.length)
      
      // Check if this is a thead/tbody structure
      const hasTheadTbody = content.some(node => 
        React.isValidElement(node) && (node.type === 'thead' || node.type === 'tbody')
      )
      
      if (hasTheadTbody) {
        logger.debug("Detected thead/tbody structure")
        const headers: string[] = []
        const rows: string[][] = []
        
        // Look for thead first to get headers
        const theadElement = content.find(node => 
          React.isValidElement(node) && node.type === 'thead'
        )
        
                 if (theadElement && React.isValidElement(theadElement)) {
           logger.debug("Found thead element")
           const theadChildren = (theadElement as React.ReactElement<{ children?: React.ReactNode }>).props?.children
           logger.debug("Thead children:", theadChildren)
           
           // Handle both array and single element cases
           const theadRows = Array.isArray(theadChildren) ? theadChildren : [theadChildren]
           
           theadRows.forEach((theadChild) => {
             if (React.isValidElement(theadChild) && theadChild.type === 'tr') {
               logger.debug("Processing thead tr:", theadChild)
               const headerCells = (theadChild as React.ReactElement<{ children?: React.ReactNode }>).props?.children
               logger.debug("Header cells:", headerCells)
               
               // Handle both array and single element cases for header cells
               const cells = Array.isArray(headerCells) ? headerCells : [headerCells]
               
                               cells.forEach((cell: React.ReactNode) => {
                  if (React.isValidElement(cell) && cell.type === 'th') {
                    const cellElement = cell as React.ReactElement<{ children?: React.ReactNode }>
                    const cellChildren = cellElement.props?.children
                    logger.debug("Header cell children:", cellChildren)
                    
                    // Extract text content from the cell children
                    let cellContent = ''
                    if (typeof cellChildren === 'string') {
                      cellContent = cellChildren
                                         } else if (React.isValidElement(cellChildren)) {
                       // If it's a React element, try to get its text content
                       const cellChildrenElement = cellChildren as React.ReactElement<{ children?: React.ReactNode }>
                       if (cellChildrenElement.props?.children) {
                         cellContent = String(cellChildrenElement.props.children)
                       }
                     } else if (Array.isArray(cellChildren)) {
                       // If it's an array, extract text from each child
                       cellContent = cellChildren.map(child => {
                         if (typeof child === 'string') {
                           return child
                         } else if (React.isValidElement(child)) {
                           const childElement = child as React.ReactElement<{ children?: React.ReactNode }>
                           return String(childElement.props?.children || '')
                         }
                         return ''
                       }).join('')
                     }
                    
                    logger.debug("Header cell content:", cellContent)
                    headers.push(cellContent)
                  }
                })
             }
           })
         }
        
        // Look for tbody to get data rows
        const tbodyElement = content.find(node => 
          React.isValidElement(node) && node.type === 'tbody'
        )
        
        if (tbodyElement && React.isValidElement(tbodyElement)) {
          logger.debug("Found tbody element")
          const tbodyChildren = (tbodyElement as React.ReactElement<{ children?: React.ReactNode }>).props?.children
          logger.debug("Tbody children:", tbodyChildren)
          
          if (Array.isArray(tbodyChildren)) {
            // Extract rows from tbody
            tbodyChildren.forEach((tbodyChild) => {
              if (React.isValidElement(tbodyChild) && tbodyChild.type === 'tr') {
                logger.debug("Processing tbody tr:", tbodyChild)
                const rowData: string[] = []
                const cells = (tbodyChild as React.ReactElement<{ children?: React.ReactNode }>).props?.children
                logger.debug("Row cells:", cells)
                
                                 if (Array.isArray(cells)) {
                   cells.forEach((cell: React.ReactNode) => {
                     if (React.isValidElement(cell) && cell.type === 'td') {
                       const cellElement = cell as React.ReactElement<{ children?: React.ReactNode }>
                       const cellContent = String(cellElement.props?.children || '')
                       logger.debug("Cell content:", cellContent)
                       rowData.push(cellContent)
                     }
                   })
                 }
                if (rowData.length > 0) {
                  logger.debug("Row data:", rowData)
                  rows.push(rowData)
                }
              }
            })
          }
        }
        
        logger.debug("Final headers from thead/tbody:", headers)
        logger.debug("Final rows from thead/tbody:", rows)
        
        if (headers.length > 0) {
          return { headers, rows }
        }
      }
      
      // If it's not thead/tbody structure, try the old logic for direct tr elements
      logger.debug("Not thead/tbody structure, trying direct tr elements")
      const headers: string[] = []
      const rows: string[][] = []
      
      // Find the first row to extract headers
      const firstRow = content.find(node => 
        React.isValidElement(node) && node.type === 'tr'
      )
      
      logger.debug("First row found:", firstRow)
      
      if (firstRow && React.isValidElement(firstRow)) {
        // Extract headers from the first row
        const headerCells = (firstRow as React.ReactElement<{ children?: React.ReactNode }>).props?.children
        logger.debug("Header cells:", headerCells)
        
        if (Array.isArray(headerCells)) {
          headerCells.forEach((cell: React.ReactNode, cellIndex: number) => {
            logger.debug(`Header cell ${cellIndex}:`, cell)
            if (React.isValidElement(cell) && cell.type === 'th') {
              const cellElement = cell as React.ReactElement<{ children?: React.ReactNode }>
              const cellContent = String(cellElement.props?.children || '')
              logger.debug(`Header cell ${cellIndex} content:`, cellContent)
              headers.push(cellContent)
            }
          })
        }
      }
      
      logger.debug("Extracted headers:", headers)
      
      // Extract data rows
      content.forEach((node, index) => {
        if (React.isValidElement(node) && node.type === 'tr' && index > 0) {
          logger.debug(`Processing data row ${index}:`, node)
          const rowData: string[] = []
          const cells = (node as React.ReactElement<{ children?: React.ReactNode }>).props?.children
          logger.debug(`Row ${index} cells:`, cells)
          
          if (Array.isArray(cells)) {
            cells.forEach((cell: React.ReactNode, cellIndex: number) => {
              if (React.isValidElement(cell) && cell.type === 'td') {
                const cellElement = cell as React.ReactElement<{ children?: React.ReactNode }>
                const cellContent = String(cellElement.props?.children || '')
                logger.debug(`Row ${index}, Cell ${cellIndex} content:`, cellContent)
                rowData.push(cellContent)
              }
            })
          }
          if (rowData.length > 0) {
            logger.debug(`Row ${index} data:`, rowData)
            rows.push(rowData)
          }
        }
      })
      
      logger.debug("Final headers:", headers)
      logger.debug("Final rows:", rows)
      
      if (headers.length > 0) {
        return { headers, rows }
      }
    }
    
    // If content is a single React element (table), extract from its children
    if (React.isValidElement(content) && content.type === 'table') {
      const tableChildren = (content as React.ReactElement<{ children?: React.ReactNode }>).props?.children
      if (Array.isArray(tableChildren)) {
        return extractTableFromReactNodes(tableChildren)
      }
    }
    
    // If content is a tbody, extract from its children
    if (React.isValidElement(content) && content.type === 'tbody') {
      const tbodyChildren = (content as React.ReactElement<{ children?: React.ReactNode }>).props?.children
      if (Array.isArray(tbodyChildren)) {
        return extractTableFromReactNodes(tbodyChildren)
      }
    }
    
    // If content is a thead, extract from its children
    if (React.isValidElement(content) && content.type === 'thead') {
      const theadChildren = (content as React.ReactElement<{ children?: React.ReactNode }>).props?.children
      if (Array.isArray(theadChildren)) {
        return extractTableFromReactNodes(theadChildren)
      }
    }
    

    
    // Try to find any tr elements recursively
    function findTableRows(node: React.ReactNode): { headers: string[], rows: string[][] } | null {
      if (!React.isValidElement(node)) return null
      
      const children = (node as React.ReactElement<{ children?: React.ReactNode }>).props?.children
      if (!children) return null
      
      if (Array.isArray(children)) {
        const headers: string[] = []
        const rows: string[][] = []
        
        children.forEach((child, index) => {
          if (React.isValidElement(child) && child.type === 'tr') {
            const cells = (child as React.ReactElement<{ children?: React.ReactNode }>).props?.children
            if (Array.isArray(cells)) {
              const rowData: string[] = []
              cells.forEach((cell: React.ReactNode) => {
                if (React.isValidElement(cell)) {
                  const cellContent = (cell as React.ReactElement<{ children?: React.ReactNode }>).props?.children
                  if (cellContent !== undefined) {
                    rowData.push(String(cellContent))
                  }
                }
              })
              if (rowData.length > 0) {
                if (index === 0) {
                  headers.push(...rowData)
                } else {
                  rows.push(rowData)
                }
              }
            }
          } else {
            // Recursively search in this child
            const result = findTableRows(child)
            if (result) {
              if (result.headers.length > 0 && headers.length === 0) {
                headers.push(...result.headers)
              }
              if (result.rows.length > 0) {
                rows.push(...result.rows)
              }
            }
          }
        })
        
        if (headers.length > 0) {
          return { headers, rows }
        }
      }
      
      return null
    }
    
    const result = findTableRows(content)
    if (result) {
      return result
    }
    
    return null
  } catch (error) {
    logger.error("Failed to extract table from React nodes:", error)
    return null
  }
}

export interface TableData {
  headers: string[]
  rows: string[][]
}

interface UnifiedTableRendererProps {
  content: string | React.ReactNode
  className?: string
  showSorting?: boolean
  tableTitle?: string
}

type SortConfig = {
  key: number
  direction: 'asc' | 'desc'
}

const UnifiedTableRenderer: React.FC<UnifiedTableRendererProps> = ({
  content,
  className = '',
  showSorting = true,
  tableTitle
}) => {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null)

  // Parse the table content (either markdown or React table nodes)
  const tableData = useMemo(() => {
    try {
      // Enhanced debugging for project analysis page
      logger.debug("=== TABLE RENDERING DEBUG ===")
      logger.debug("Content type:", typeof content)
      logger.debug("Content:", content)
      
      // If content is a string, try to parse it as markdown
      if (typeof content === 'string') {
        logger.debug("Parsing as markdown string:", content)
        const result = parseMarkdownTable(content)
        logger.debug("Markdown parsing result:", result)
        return result
      }
      
      // If content is React nodes (table), extract the data directly
      if (React.isValidElement(content) || Array.isArray(content)) {
        logger.debug("=== REACT NODE PARSING ===")
        logger.debug("Is React element:", React.isValidElement(content))
        
        if (React.isValidElement(content)) {
          logger.debug("Element type:", content.type)
          logger.debug("Element props:", content.props)
          logger.debug("Element children:", (content as React.ReactElement<{ children?: React.ReactNode }>).props?.children)
          
          // Log the full element structure
          logger.debug("Full element:", JSON.stringify(content, (key, value) => {
            if (key === 'type' || key === 'props') return value
            if (typeof value === 'function') return '[Function]'
            if (typeof value === 'object' && value !== null) return '[Object]'
            return value
          }, 2))
        }
        
        if (Array.isArray(content)) {
          logger.debug("Content is array with length:", content.length)
          content.forEach((item, index) => {
            logger.debug(`Array item ${index}:`, {
              type: typeof item,
              isElement: React.isValidElement(item),
              elementType: React.isValidElement(item) ? item.type : 'N/A'
            })
          })
        }
        
        const result = extractTableFromReactNodes(content)
        logger.debug("=== EXTRACTION RESULT ===")
        logger.debug("Extracted table data:", result)
        logger.debug("Headers found:", result?.headers?.length || 0)
        logger.debug("Rows found:", result?.rows?.length || 0)
        
        return result
      }
      
      logger.debug("Content is neither string nor React node")
      return null
    } catch (error) {
      logger.error("=== TABLE PARSING ERROR ===")
      logger.error("Error details:", error)
      logger.error("Failed to parse table data:", error)
      return null
    }
  }, [content])

  const sortedData = useMemo(() => {
    if (!tableData || !sortConfig) return tableData

    const sortedRows = [...tableData.rows].sort((a, b) => {
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
      headers: tableData.headers,
      rows: sortedRows
    }
  }, [tableData, sortConfig])

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

  if (!tableData || !tableData.headers || tableData.headers.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 border border-gray-200 rounded-lg">
        Invalid table data
      </div>
    )
  }

  const dataToRender = sortedData || tableData

  return (
    <div className={`my-6 ${className}`}>
      {tableTitle && (
        <div className="text-lg font-semibold text-center text-gray-800 mb-4">
          {tableTitle}
        </div>
      )}
      
      <div className="w-full overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              {dataToRender.headers.map((header, index) => (
                <TableHead key={index}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-muted-foreground">{header}</span>
                    {showSorting && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => requestSort(index)}
                        className="h-6 w-6 p-0 hover:bg-muted ml-2"
                      >
                        {getSortIcon(index)}
                      </Button>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {dataToRender.rows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {dataToRender.headers.map((_, colIndex) => (
                  <TableCell key={colIndex}>
                    {row[colIndex] || ''}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default UnifiedTableRenderer
