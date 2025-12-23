import { Button } from '@/components/ui/button';
import {
  UnifiedTable,
  UnifiedTableBody,
  UnifiedTableCell,
  UnifiedTableHead,
  UnifiedTableHeader,
  UnifiedTableRow,
} from '@/components/ui/table';
import { logger } from '@/utils/logger';
import { parseMarkdownTable } from '@/utils/tableParser';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import React, { useMemo, useState } from 'react';

// Helper function to safely extract children from React elements
function getElementChildren(element: React.ReactElement): React.ReactNode {
  return (element.props as { children?: React.ReactNode })?.children;
}

// Helper function to extract table data from React table nodes
function extractTableFromReactNodes(
  content: React.ReactNode
): TableData | null {
  try {
    logger.debug('=== EXTRACTING TABLE FROM REACT NODES ===');

    // If content is an array with thead/tbody structure, handle it specially FIRST
    if (Array.isArray(content)) {
      logger.debug('Processing array content with length:', content.length);

      // Check if this is a thead/tbody structure
      const hasTheadTbody = content.some(
        (node: React.ReactNode) =>
          React.isValidElement(node) &&
          (node.type === 'thead' || node.type === 'tbody')
      );

      if (hasTheadTbody) {
        logger.debug('Detected thead/tbody structure');
        const headers: string[] = [];
        const rows: string[][] = [];

        // Look for thead first to get headers
        const theadElement = content.find(
          (node: React.ReactNode) =>
            React.isValidElement(node) && node.type === 'thead'
        ) as React.ReactElement | undefined;

        if (theadElement && React.isValidElement(theadElement)) {
          logger.debug('Found thead element');
          const theadChildren = getElementChildren(theadElement);
          logger.debug('Thead children:', theadChildren);

          // Handle both array and single element cases
          const theadRows = Array.isArray(theadChildren)
            ? theadChildren
            : [theadChildren];

          theadRows.forEach((theadChild: React.ReactNode) => {
            if (React.isValidElement(theadChild) && theadChild.type === 'tr') {
              logger.debug('Processing thead tr:', theadChild);
              const headerCells = (
                theadChild as React.ReactElement<{ children?: React.ReactNode }>
              ).props?.children;
              logger.debug('Header cells:', headerCells);

              // Handle both array and single element cases for header cells
              const cells = Array.isArray(headerCells)
                ? headerCells
                : [headerCells];

              cells.forEach((cell: React.ReactNode) => {
                if (React.isValidElement(cell) && cell.type === 'th') {
                  const cellElement = cell as React.ReactElement<{
                    children?: React.ReactNode;
                  }>;
                  const cellChildren = cellElement.props?.children;
                  logger.debug('Header cell children:', cellChildren);

                  // Extract text content from the cell children
                  let cellContent = '';
                  if (typeof cellChildren === 'string') {
                    cellContent = cellChildren;
                  } else if (React.isValidElement(cellChildren)) {
                    // If it's a React element, try to get its text content
                    const cellChildrenElement =
                      cellChildren as React.ReactElement<{
                        children?: React.ReactNode;
                      }>;
                    if (cellChildrenElement.props?.children) {
                      cellContent =
                        typeof cellChildrenElement.props.children === 'string'
                          ? cellChildrenElement.props.children
                          : '';
                    }
                  } else if (Array.isArray(cellChildren)) {
                    // If it's an array, extract text from each child
                    cellContent = cellChildren
                      .map((child: React.ReactNode) => {
                        if (typeof child === 'string') {
                          return child;
                        } else if (React.isValidElement(child)) {
                          const childElement = child as React.ReactElement<{
                            children?: React.ReactNode;
                          }>;
                          return typeof childElement.props?.children ===
                            'string'
                            ? childElement.props.children
                            : '';
                        }
                        return '';
                      })
                      .join('');
                  }

                  logger.debug('Header cell content:', cellContent);
                  headers.push(cellContent);
                }
              });
            }
          });
        }

        // Look for tbody to get data rows
        const tbodyElement = content.find(
          (node: React.ReactNode) =>
            React.isValidElement(node) && node.type === 'tbody'
        ) as React.ReactElement | undefined;

        if (tbodyElement && React.isValidElement(tbodyElement)) {
          logger.debug('Found tbody element');
          const tbodyChildren = (
            tbodyElement as React.ReactElement<{ children?: React.ReactNode }>
          ).props?.children;
          logger.debug('Tbody children:', tbodyChildren);

          if (Array.isArray(tbodyChildren)) {
            // Extract rows from tbody
            tbodyChildren.forEach((tbodyChild: React.ReactNode) => {
              if (
                React.isValidElement(tbodyChild) &&
                tbodyChild.type === 'tr'
              ) {
                logger.debug('Processing tbody tr:', tbodyChild);
                const rowData: string[] = [];
                const cells = (
                  tbodyChild as React.ReactElement<{
                    children?: React.ReactNode;
                  }>
                ).props?.children;
                logger.debug('Row cells:', cells);

                if (Array.isArray(cells)) {
                  cells.forEach((cell: React.ReactNode) => {
                    if (React.isValidElement(cell) && cell.type === 'td') {
                      const cellElement = cell as React.ReactElement<{
                        children?: React.ReactNode;
                      }>;
                      const cellContent =
                        typeof cellElement.props?.children === 'string'
                          ? cellElement.props.children
                          : '';
                      logger.debug('Cell content:', cellContent);
                      rowData.push(cellContent);
                    }
                  });
                }
                if (rowData.length > 0) {
                  logger.debug('Row data:', rowData);
                  rows.push(rowData);
                }
              }
            });
          }
        }

        logger.debug('Final headers from thead/tbody:', headers);
        logger.debug('Final rows from thead/tbody:', rows);

        if (headers.length > 0) {
          return { headers, rows };
        }
      }

      // If it's not thead/tbody structure, try the old logic for direct tr elements
      logger.debug('Not thead/tbody structure, trying direct tr elements');
      const headers: string[] = [];
      const rows: string[][] = [];

      // Find the first row to extract headers
      const firstRow = content.find(
        (node: React.ReactNode) =>
          React.isValidElement(node) && node.type === 'tr'
      ) as React.ReactElement | undefined;

      logger.debug('First row found:', firstRow);

      if (firstRow && React.isValidElement(firstRow)) {
        // Extract headers from the first row
        const headerCells = (
          firstRow as React.ReactElement<{ children?: React.ReactNode }>
        ).props?.children;
        logger.debug('Header cells:', headerCells);

        if (Array.isArray(headerCells)) {
          headerCells.forEach((cell: React.ReactNode, cellIndex: number) => {
            logger.debug(`Header cell ${cellIndex}:`, cell);
            if (React.isValidElement(cell) && cell.type === 'th') {
              const cellElement = cell as React.ReactElement<{
                children?: React.ReactNode;
              }>;
              const cellContent =
                typeof cellElement.props?.children === 'string'
                  ? cellElement.props.children
                  : '';
              logger.debug(`Header cell ${cellIndex} content:`, cellContent);
              headers.push(cellContent);
            }
          });
        }
      }

      logger.debug('Extracted headers:', headers);

      // Extract data rows
      content.forEach((node: React.ReactNode, index) => {
        if (React.isValidElement(node) && node.type === 'tr' && index > 0) {
          logger.debug(`Processing data row ${index}:`, node);
          const rowData: string[] = [];
          const cells = (
            node as React.ReactElement<{ children?: React.ReactNode }>
          ).props?.children;
          logger.debug(`Row ${index} cells:`, cells);

          if (Array.isArray(cells)) {
            cells.forEach((cell: React.ReactNode, cellIndex: number) => {
              if (React.isValidElement(cell) && cell.type === 'td') {
                const cellElement = cell as React.ReactElement<{
                  children?: React.ReactNode;
                }>;
                const cellContent =
                  typeof cellElement.props?.children === 'string'
                    ? cellElement.props.children
                    : '';
                logger.debug(
                  `Row ${index}, Cell ${cellIndex} content:`,
                  cellContent
                );
                rowData.push(cellContent);
              }
            });
          }
          if (rowData.length > 0) {
            logger.debug(`Row ${index} data:`, rowData);
            rows.push(rowData);
          }
        }
      });

      logger.debug('Final headers:', headers);
      logger.debug('Final rows:', rows);

      if (headers.length > 0) {
        return { headers, rows };
      }
    }

    // If content is a single React element (table), extract from its children
    if (React.isValidElement(content) && content.type === 'table') {
      const tableChildren = (
        content as React.ReactElement<{ children?: React.ReactNode }>
      ).props?.children;
      if (Array.isArray(tableChildren)) {
        return extractTableFromReactNodes(tableChildren);
      }
    }

    // If content is a tbody, extract from its children
    if (React.isValidElement(content) && content.type === 'tbody') {
      const tbodyChildren = (
        content as React.ReactElement<{ children?: React.ReactNode }>
      ).props?.children;
      if (Array.isArray(tbodyChildren)) {
        return extractTableFromReactNodes(tbodyChildren);
      }
    }

    // If content is a thead, extract from its children
    if (React.isValidElement(content) && content.type === 'thead') {
      const theadChildren = (
        content as React.ReactElement<{ children?: React.ReactNode }>
      ).props?.children;
      if (Array.isArray(theadChildren)) {
        return extractTableFromReactNodes(theadChildren);
      }
    }

    // Try to find any tr elements recursively
    function findTableRows(
      node: React.ReactNode
    ): { headers: string[]; rows: string[][] } | null {
      if (!React.isValidElement(node)) return null;

      const children = (
        node as React.ReactElement<{ children?: React.ReactNode }>
      ).props?.children;
      if (!children) return null;

      if (Array.isArray(children)) {
        const headers: string[] = [];
        const rows: string[][] = [];

        children.forEach((child: React.ReactNode, index) => {
          if (React.isValidElement(child) && child.type === 'tr') {
            const cells = (
              child as React.ReactElement<{ children?: React.ReactNode }>
            ).props?.children;
            if (Array.isArray(cells)) {
              const rowData: string[] = [];
              cells.forEach((cell: React.ReactNode) => {
                if (React.isValidElement(cell)) {
                  const cellContent = (
                    cell as React.ReactElement<{ children?: React.ReactNode }>
                  ).props?.children;
                  if (cellContent !== undefined) {
                    rowData.push(
                      typeof cellContent === 'string' ? cellContent : ''
                    );
                  }
                }
              });
              if (rowData.length > 0) {
                if (index === 0) {
                  headers.push(...rowData);
                } else {
                  rows.push(rowData);
                }
              }
            }
          } else {
            // Recursively search in this child
            const result = findTableRows(child);
            if (result) {
              if (result.headers.length > 0 && headers.length === 0) {
                headers.push(...result.headers);
              }
              if (result.rows.length > 0) {
                rows.push(...result.rows);
              }
            }
          }
        });

        if (headers.length > 0) {
          return { headers, rows };
        }
      }

      return null;
    }

    const result = findTableRows(content);
    if (result) {
      return result;
    }

    return null;
  } catch (error) {
    logger.error('Failed to extract table from React nodes:', error);
    return null;
  }
}

export interface TableData {
  headers: string[];
  rows: string[][];
}

interface UnifiedTableRendererProps {
  content: string | React.ReactNode;
  className?: string;
  showSorting?: boolean;
  tableTitle?: string;
}

type SortConfig = {
  key: number;
  direction: 'asc' | 'desc';
};

const UnifiedTableRenderer: React.FC<UnifiedTableRendererProps> = ({
  content,
  className = '',
  showSorting = true,
  tableTitle,
}) => {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  // Parse the table content (either markdown or React table nodes)
  const tableData = useMemo(() => {
    try {
      // Enhanced debugging for project analysis page
      logger.debug('=== TABLE RENDERING DEBUG ===');
      logger.debug('Content type:', typeof content);
      logger.debug('Content:', content);

      // If content is a string, try to parse it as markdown
      if (typeof content === 'string') {
        logger.debug('Parsing as markdown string:', content);
        const result = parseMarkdownTable(content);
        logger.debug('Markdown parsing result:', result);
        return result;
      }

      // If content is React nodes (table), extract the data directly
      if (React.isValidElement(content) || Array.isArray(content)) {
        logger.debug('=== REACT NODE PARSING ===');
        logger.debug('Is React element:', React.isValidElement(content));

        if (React.isValidElement(content)) {
          logger.debug('Element type:', content.type);
          logger.debug('Element props:', content.props);
          logger.debug(
            'Element children:',
            (content as React.ReactElement<{ children?: React.ReactNode }>)
              .props?.children
          );

          // Log the full element structure
          logger.debug(
            'Full element:',
            JSON.stringify(
              content,
              (key: string, value: unknown): unknown => {
                if (key === 'type' || key === 'props') return value;
                if (typeof value === 'function') return '[Function]';
                if (typeof value === 'object' && value !== null)
                  return '[Object]';
                return value;
              },
              2
            )
          );
        }

        if (Array.isArray(content)) {
          logger.debug('Content is array with length:', content.length);
          content.forEach((item: React.ReactNode, index) => {
            logger.debug(`Array item ${index}:`, {
              type: typeof item,
              isElement: React.isValidElement(item),
              elementType: React.isValidElement(item)
                ? (item as React.ReactElement).type
                : 'N/A',
            });
          });
        }

        const result = extractTableFromReactNodes(content);
        logger.debug('=== EXTRACTION RESULT ===');
        logger.debug('Extracted table data:', result);
        logger.debug('Headers found:', result?.headers?.length ?? 0);
        logger.debug('Rows found:', result?.rows?.length ?? 0);

        return result;
      }

      logger.debug('Content is neither string nor React node');
      return null;
    } catch (error) {
      logger.error('=== TABLE PARSING ERROR ===');
      logger.error('Error details:', error);
      logger.error('Failed to parse table data:', error);
      return null;
    }
  }, [content]);

  const sortedData = useMemo(() => {
    if (!tableData || !sortConfig) return tableData;

    const sortedRows = [...tableData.rows].sort((a, b) => {
      const aValue = a[sortConfig.key] ?? '';
      const bValue = b[sortConfig.key] ?? '';

      // Try to convert to numbers for numeric sorting
      const aNum = parseFloat(aValue);
      const bNum = parseFloat(bValue);

      if (!isNaN(aNum) && !isNaN(bNum)) {
        // Numeric comparison
        if (sortConfig.direction === 'asc') {
          return aNum - bNum;
        } else {
          return bNum - aNum;
        }
      } else {
        // String comparison
        if (sortConfig.direction === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      }
    });

    return {
      headers: tableData.headers,
      rows: sortedRows,
    };
  }, [tableData, sortConfig]);

  const requestSort = (key: number) => {
    let direction: 'asc' | 'desc' = 'asc';

    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'asc'
    ) {
      direction = 'desc';
    }

    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: number) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className='size-4' />;
    }

    if (sortConfig.direction === 'asc') {
      return <ArrowUp className='size-4' />;
    } else {
      return <ArrowDown className='size-4' />;
    }
  };

  if (!tableData?.headers || tableData.headers.length === 0) {
    return (
      <div className='rounded-lg border border-strategy-gold/20 bg-slate-900/40 p-4 text-center text-slate-400'>
        Invalid table data
      </div>
    );
  }

  const dataToRender = sortedData ?? tableData;

  return (
    <div className={`my-6 ${className}`}>
      {tableTitle && (
        <div className='mb-4 text-center text-lg font-semibold text-white'>
          {tableTitle}
        </div>
      )}

      <UnifiedTable>
        <UnifiedTableHeader>
          <UnifiedTableRow>
            {dataToRender.headers.map((header, index) => (
              <UnifiedTableHead
                key={index}
                className='h-14 border-r border-strategy-gold/20 bg-slate-800/50 px-5 text-left align-middle text-sm font-semibold tracking-wide text-white last:border-r-0'
              >
                <div className='flex items-center justify-between'>
                  <span>{header}</span>
                  {showSorting && (
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => requestSort(index)}
                      className='ml-2 size-6 p-0 hover:bg-slate-700'
                    >
                      {getSortIcon(index)}
                    </Button>
                  )}
                </div>
              </UnifiedTableHead>
            ))}
          </UnifiedTableRow>
        </UnifiedTableHeader>
        <UnifiedTableBody>
          {dataToRender.rows.map((row, rowIndex) => (
            <UnifiedTableRow
              key={rowIndex}
              className={`border-b border-strategy-gold/20 transition-all duration-200 ease-in-out last:border-b-0 hover:bg-slate-700/50 hover:shadow-sm ${
                rowIndex % 2 === 0 ? 'bg-slate-900/40' : 'bg-slate-800/30'
              }`}
            >
              {dataToRender.headers.map((_, colIndex) => (
                <UnifiedTableCell
                  key={colIndex}
                  className='min-w-[120px] border-r border-strategy-gold/20 px-5 py-4 align-middle text-sm leading-relaxed text-slate-300 last:border-r-0'
                >
                  {row[colIndex] ?? ''}
                </UnifiedTableCell>
              ))}
            </UnifiedTableRow>
          ))}
        </UnifiedTableBody>
      </UnifiedTable>
    </div>
  );
};

export default UnifiedTableRenderer;
