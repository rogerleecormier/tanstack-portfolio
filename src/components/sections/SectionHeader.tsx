interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  divider?: boolean;
}

export function SectionHeader({
  title,
  subtitle,
  divider = true,
}: SectionHeaderProps) {
  return (
    <div className='mb-12'>
      <h2 className='mb-2 text-3xl font-bold text-text-foreground md:text-4xl'>
        {title}
      </h2>

      {divider && (
        <div className='my-4 h-1 w-16 rounded-full bg-gradient-to-r from-strategy-gold to-transparent' />
      )}

      {subtitle && (
        <p className='max-w-2xl text-lg text-text-secondary'>{subtitle}</p>
      )}
    </div>
  );
}
