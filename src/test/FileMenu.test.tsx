import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FileMenu from '../components/FileMenu';

describe('FileMenu', () => {
  const mockProps = {
    fileName: 'test.md',
    isDirty: false,
    hasUnsavedChanges: false,
    lastSaved: new Date('2024-01-01T12:00:00Z'),
    onOpenFile: vi.fn(),
    onSaveFile: vi.fn(),
    onSaveAsFile: vi.fn(),
    onExportHTML: vi.fn(),
    onResetFile: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render file menu with file name', () => {
    render(<FileMenu {...mockProps} />);

    expect(screen.getByText('test.md')).toBeInTheDocument();
    expect(screen.getByText('Saved')).toBeInTheDocument();
  });

  it('should show unsaved indicator when hasUnsavedChanges is true', () => {
    render(<FileMenu {...mockProps} hasUnsavedChanges={true} />);

    expect(screen.getByText('Unsaved')).toBeInTheDocument();
  });

  it('should show "Untitled" when fileName is null', () => {
    render(<FileMenu {...mockProps} fileName={null} />);

    expect(screen.getByText('Untitled')).toBeInTheDocument();
  });

  it('should format last saved time correctly', () => {
    const recentDate = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
    render(<FileMenu {...mockProps} lastSaved={recentDate} />);

    expect(screen.getByText('5m ago')).toBeInTheDocument();
  });

  it('should show "Never" when lastSaved is null', () => {
    render(<FileMenu {...mockProps} lastSaved={null} />);

    expect(screen.getByText('Never')).toBeInTheDocument();
  });

  it('should open dropdown menu when clicked', () => {
    render(<FileMenu {...mockProps} />);

    const menu = screen.getByLabelText('test-filemenu');
    expect(menu).toBeInTheDocument();
    expect(screen.getByText('Open File')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Save As...')).toBeInTheDocument();
    expect(screen.getByText('Export HTML')).toBeInTheDocument();
    expect(screen.getByText('New Document')).toBeInTheDocument();
  });

  it('should call onOpenFile when Open File is clicked', () => {
    render(<FileMenu {...mockProps} />);

    const openFileItem = screen.getByText('Open File');
    fireEvent.click(openFileItem);

    expect(mockProps.onOpenFile).toHaveBeenCalledTimes(1);
  });

  it('should call onSaveFile when Save is clicked', () => {
    render(<FileMenu {...mockProps} isDirty={true} />);

    const saveItem = screen.getByText('Save');
    fireEvent.click(saveItem);

    expect(mockProps.onSaveFile).toHaveBeenCalledTimes(1);
  });

  it('should disable Save when not dirty', () => {
    render(<FileMenu {...mockProps} isDirty={false} />);

    const saveItem = screen.getByText('Save');
    expect(saveItem).toBeDisabled();
  });

  it('should call onSaveAsFile when Save As is clicked', () => {
    render(<FileMenu {...mockProps} />);

    const saveAsItem = screen.getByText('Save As...');
    fireEvent.click(saveAsItem);

    expect(mockProps.onSaveAsFile).toHaveBeenCalledTimes(1);
  });

  it('should call onExportHTML when Export HTML is clicked', () => {
    render(<FileMenu {...mockProps} />);

    const exportItem = screen.getByText('Export HTML');
    fireEvent.click(exportItem);

    expect(mockProps.onExportHTML).toHaveBeenCalledTimes(1);
  });

  it('should call onResetFile when New Document is clicked', () => {
    render(<FileMenu {...mockProps} />);

    const newDocItem = screen.getByText('New Document');
    fireEvent.click(newDocItem);

    expect(mockProps.onResetFile).toHaveBeenCalledTimes(1);
  });

  it('should show keyboard shortcut for Save when fileName exists', () => {
    render(<FileMenu {...mockProps} fileName="test.md" />);

    expect(screen.getByText('Ctrl+S')).toBeInTheDocument();
  });

  it('should not show keyboard shortcut for Save when fileName is null', () => {
    render(<FileMenu {...mockProps} fileName={null} />);

    const trigger = screen.getByText('Untitled');
    fireEvent.click(trigger);

    expect(screen.queryByText('Ctrl+S')).not.toBeInTheDocument();
  });
});
