import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  description,
  align = 'center',
  className = '',
}) => {
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div className={`section-header-strategy ${alignmentClasses[align]} ${className}`}>
      {subtitle && (
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-emerald-400">
          {subtitle}
        </p>
      )}
      <h2 className="section-title-strategy">{title}</h2>
      {description && (
        <p className="section-subtitle-strategy mx-auto mt-4 max-w-3xl">
          {description}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;
