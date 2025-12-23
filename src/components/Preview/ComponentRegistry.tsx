import { ChartRenderer } from '../../lib/charts';
import { cardSchema } from '../../schemas/card';
import { chartSchema } from '../../schemas/chart';
import { Alert, AlertDescription } from '../ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface ComponentRegistryProps {
  type:
    | 'x-fenced-card'
    | 'x-fenced-chart'
    | 'x-fenced-component'
    | 'x-fenced-error';
  json?: string;
  componentType?: string;
}

export function ComponentRegistry({
  type,
  json,
  componentType,
}: ComponentRegistryProps) {
  switch (type) {
    case 'x-fenced-card':
      return <FencedCard {...(json && { json })} />;
    case 'x-fenced-chart':
      return <FencedChart {...(json && { json })} />;
    case 'x-fenced-component':
      return (
        <FencedComponent
          {...(componentType && { componentType })}
          {...(json && { json })}
        />
      );
    case 'x-fenced-error':
      return <FencedError {...(json && { json })} />;
    default:
      return <div>Unknown component type: {type}</div>;
  }
}

function FencedCard({ json }: { json?: string }) {
  if (!json) return <div>Invalid card data</div>;

  try {
    const data = JSON.parse(json) as unknown;
    const validated = cardSchema.parse(data);

    return (
      <Card
        className={`border-l-4 ${
          validated.variant === 'success'
            ? 'border-l-green-500'
            : validated.variant === 'warning'
              ? 'border-l-yellow-500'
              : 'border-l-surface-elevated0'
        }`}
      >
        <CardHeader>
          <CardTitle>{validated.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{validated.body}</p>
        </CardContent>
      </Card>
    );
  } catch (error) {
    return (
      <Alert variant='destructive'>
        <AlertDescription>
          Invalid card data:{' '}
          {error instanceof Error ? error.message : 'Unknown error'}
        </AlertDescription>
      </Alert>
    );
  }
}

function FencedChart({ json }: { json?: string }) {
  if (!json) return <div>Invalid chart data</div>;

  try {
    const data = JSON.parse(json) as unknown;
    const validated = chartSchema.parse(data);

    return <ChartRenderer data={validated} />;
  } catch (error) {
    return (
      <Alert variant='destructive'>
        <AlertDescription>
          Invalid chart data:{' '}
          {error instanceof Error ? error.message : 'Unknown error'}
        </AlertDescription>
      </Alert>
    );
  }
}

function FencedComponent({
  componentType,
  json,
}: {
  componentType?: string;
  json?: string;
}) {
  if (!componentType || !json) return <div>Invalid component data</div>;

  try {
    const data = JSON.parse(json) as unknown;

    // For now, just render a placeholder. In a real implementation,
    // you'd have a registry of component types
    return (
      <Alert>
        <AlertDescription>
          Component: {componentType} with data: {JSON.stringify(data)}
        </AlertDescription>
      </Alert>
    );
  } catch (error) {
    return (
      <Alert variant='destructive'>
        <AlertDescription>
          Invalid component data:{' '}
          {error instanceof Error ? error.message : 'Unknown error'}
        </AlertDescription>
      </Alert>
    );
  }
}

function FencedError({ json }: { json?: string }) {
  return (
    <Alert variant='destructive'>
      <AlertDescription>
        {json ?? 'Unknown error in fenced block'}
      </AlertDescription>
    </Alert>
  );
}
