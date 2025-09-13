import { Button } from '../ui/button';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Link,
  List,
  ListOrdered,
} from 'lucide-react';

interface ToolbarProps {
  onBold?: () => void;
  onItalic?: () => void;
  onStrike?: () => void;
  onCode?: () => void;
  onLink?: () => void;
  onList?: () => void;
  onOrderedList?: () => void;
}

export function Toolbar({
  onBold,
  onItalic,
  onStrike,
  onCode,
  onLink,
  onList,
  onOrderedList,
}: ToolbarProps) {
  return (
    <div className='flex items-center gap-1 border-b p-2'>
      <Button variant='ghost' size='sm' onClick={onBold}>
        <Bold className='size-4' />
      </Button>
      <Button variant='ghost' size='sm' onClick={onItalic}>
        <Italic className='size-4' />
      </Button>
      <Button variant='ghost' size='sm' onClick={onStrike}>
        <Strikethrough className='size-4' />
      </Button>
      <Button variant='ghost' size='sm' onClick={onCode}>
        <Code className='size-4' />
      </Button>
      <Button variant='ghost' size='sm' onClick={onLink}>
        <Link className='size-4' />
      </Button>
      <Button variant='ghost' size='sm' onClick={onList}>
        <List className='size-4' />
      </Button>
      <Button variant='ghost' size='sm' onClick={onOrderedList}>
        <ListOrdered className='size-4' />
      </Button>
    </div>
  );
}
