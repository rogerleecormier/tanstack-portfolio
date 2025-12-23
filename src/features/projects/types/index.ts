/**
 * Shared type definitions for projects feature.
 */

// Base project metadata
export interface ProjectMetadata {
  id: string;
  title: string;
  description: string;
  lastUpdated: string;
  version?: string;
}

// Common chart/table data types
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface TableColumn<T = unknown> {
  key: keyof T;
  header: string;
  sortable?: boolean;
  width?: string;
}

// Common export options
export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'image';
  filename: string;
  includeMetadata?: boolean;
}
