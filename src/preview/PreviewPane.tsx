import React from 'react';

interface PreviewPaneProps {
  html: string;
  className?: string;
}

/**
 * Preview Pane Component
 * Shows real-time HTML preview of the content
 */
const PreviewPane: React.FC<PreviewPaneProps> = ({ html, className = '' }) => {
  return (
    <div className={`preview-pane h-full overflow-auto ${className}`}>
      <div
        className="prose prose-sm max-w-none p-6"
        dangerouslySetInnerHTML={{ __html: html }}
        style={{
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          lineHeight: '1.6',
        }}
      />
    </div>
  );
};

export default PreviewPane;
