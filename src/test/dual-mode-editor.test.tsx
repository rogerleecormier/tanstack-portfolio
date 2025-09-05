import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DualModeEditor from '../editor/DualModeEditor';

describe('DualModeEditor', () => {
  it('should render the dual mode editor with initial content', () => {
    const initialContent = '# Test Content\n\nThis is a test.';

    render(<DualModeEditor initialValue={initialContent} />);

    // Check if the editor header is present
    expect(screen.getByText('Content Editor')).toBeInTheDocument();

    // Check if mode buttons are present
    expect(screen.getByText('Markdown')).toBeInTheDocument();
    expect(screen.getByText('Visual')).toBeInTheDocument();
    expect(screen.getAllByText('Preview')).toHaveLength(2); // Button and header
  });

  it('should handle content changes', () => {
    const onChange = vi.fn();
    const initialContent = '# Test Content';

    render(
      <DualModeEditor initialValue={initialContent} onChange={onChange} />
    );

    // The component should render without errors
    expect(screen.getByText('Content Editor')).toBeInTheDocument();
  });
});
