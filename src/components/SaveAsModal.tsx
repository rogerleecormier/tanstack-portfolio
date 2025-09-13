import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { buildKey, isAllowedDir } from '@/utils/filename';
import { apiClient } from '@/lib/api';

type AllowedDir = 'blog' | 'portfolio' | 'projects';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDir?: AllowedDir;
  initialName?: string;
  onConfirm: (key: string) => void;
}

export function SaveAsModal({
  open,
  onOpenChange,
  initialDir = 'blog',
  initialName = '',
  onConfirm,
}: Props) {
  const [dir, setDir] = useState<AllowedDir>(initialDir);
  const [name, setName] = useState(initialName);
  const [exists, setExists] = useState(false);
  const [checking, setChecking] = useState(false);
  const [allowOverwrite, setAllowOverwrite] = useState(false);

  useEffect(() => {
    if (open) {
      setDir(initialDir);
      setName(initialName);
    }
  }, [open, initialDir, initialName]);

  const key = useMemo(() => buildKey(dir, name || ''), [dir, name]);
  const error = useMemo(() => {
    if (!isAllowedDir(dir)) return 'Invalid directory';
    if (!name) return 'Enter a filename';
    const candidate = name.endsWith('.md') ? name : `${name}.md`;
    const ok = /^[a-zA-Z0-9-_]{3,64}\.md$/.test(candidate);
    return ok ? '' : 'Use 3–64 letters, numbers, dash or underscore; .md only';
  }, [dir, name]);

  // Check if target key exists (debounced)
  useEffect(() => {
    let cancelled = false;
    if (!open || !key || error) {
      setExists(false);
      setAllowOverwrite(false);
      return;
    }
    setChecking(true);
    const t = setTimeout(() => {
      void (async () => {
        const res = await apiClient.existsContent(key);
        if (!cancelled) {
          setExists(!!(res.success && res.data?.exists));
          setAllowOverwrite(false);
          setChecking(false);
        }
      })();
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [open, key, error]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save As</DialogTitle>
        </DialogHeader>
        <div className='grid gap-4 py-2'>
          <div className='grid grid-cols-2 gap-3'>
            <div>
              <Label>Directory</Label>
              <Select value={dir} onValueChange={v => setDir(v as AllowedDir)}>
                <SelectTrigger>
                  <SelectValue placeholder='Select directory' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='blog'>blog</SelectItem>
                  <SelectItem value='portfolio'>portfolio</SelectItem>
                  <SelectItem value='projects'>projects</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Filename</Label>
              <Input
                placeholder='my-post'
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
          </div>
          <div className='text-xs text-muted-foreground'>
            Key preview: {key ?? '—'}
          </div>
          {error && <div className='text-xs text-destructive'>{error}</div>}
        </div>
        <DialogFooter className='flex flex-col items-stretch gap-2'>
          {exists && !checking && (
            <div className='text-xs text-amber-600'>
              A file with this name already exists.
            </div>
          )}
          {exists && (
            <label className='flex items-center gap-2 text-sm'>
              <input
                type='checkbox'
                checked={allowOverwrite}
                onChange={e => setAllowOverwrite(e.target.checked)}
              />
              Overwrite existing file
            </label>
          )}
          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              disabled={
                !key || !!error || (exists && !allowOverwrite) || checking
              }
              onClick={() => key && onConfirm(key)}
            >
              {exists ? 'Overwrite' : 'Save'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
