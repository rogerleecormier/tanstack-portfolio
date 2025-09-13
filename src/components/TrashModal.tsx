import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { apiClient } from '@/lib/api';
import { useEffect, useState } from 'react';
import { ConfirmDialog } from './ConfirmDialog';
import { SaveAsModal } from './SaveAsModal';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRestored?: () => void;
}

interface Item {
  key: string;
  size: number;
  uploaded: string;
  etag: string;
}

export function TrashModal({ open, onOpenChange, onRestored }: Props) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState<{
    open: boolean;
    message: string;
    onConfirm?: () => void;
  }>({ open: false, message: '' });
  const [restoreAsKey, setRestoreAsKey] = useState<string | null>(null);
  const [restoreAsOpen, setRestoreAsOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await apiClient.listContent('trash/', undefined, 200);
    if (res.success && res.data) {
      const data = res.data as { objects?: unknown[] };
      setItems((data.objects ?? []) as Item[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open) void load();
  }, [open]);

  const restore = async (trashKey: string) => {
    const r = await apiClient.restoreContent(trashKey);
    if (r.success) {
      await load();
      onRestored?.();
    } else if (r.error?.code === 'HTTP_409') {
      const code = (r.error.details as { code?: string })?.code;
      if (code === 'exists') {
        setConfirm({
          open: true,
          message: `A file already exists at ${toOriginal(trashKey)}. Overwrite?`,
          onConfirm: () => {
            void (async () => {
              setConfirm({ open: false, message: '' });
              const r2 = await apiClient.restoreContent(trashKey, true);
              if (r2.success) {
                await load();
                onRestored?.();
              }
            })();
          },
        });
      }
    }
  };

  const toOriginal = (trashKey: string) =>
    trashKey.split('/').slice(2).join('/');
  const splitDir = (key: string) =>
    (key.split('/')[0] ?? 'blog') as 'blog' | 'portfolio' | 'projects';
  const baseName = (key: string) =>
    (key.split('/').pop() ?? '').replace(/\.md$/, '');

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Trash</DialogTitle>
          </DialogHeader>
          <div className='max-h-[60vh] space-y-2 overflow-y-auto'>
            {loading && (
              <div className='text-sm text-muted-foreground'>Loading…</div>
            )}
            {!loading && items.length === 0 && (
              <div className='text-sm text-muted-foreground'>
                No trashed items
              </div>
            )}
            {items.map(it => (
              <div
                key={it.key}
                className='flex items-center justify-between rounded border p-2'
              >
                <div className='text-sm'>
                  <div className='font-mono'>{it.key}</div>
                  <div className='text-xs text-muted-foreground'>
                    Original: {toOriginal(it.key)}
                  </div>
                </div>
                <div className='flex gap-2'>
                  <Button size='sm' onClick={() => void restore(it.key)}>
                    Restore
                  </Button>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => {
                      setRestoreAsKey(it.key);
                      setRestoreAsOpen(true);
                    }}
                  >
                    Restore As…
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      <SaveAsModal
        open={restoreAsOpen}
        onOpenChange={setRestoreAsOpen}
        initialDir={restoreAsKey ? splitDir(toOriginal(restoreAsKey)) : 'blog'}
        initialName={restoreAsKey ? baseName(toOriginal(restoreAsKey)) : ''}
        onConfirm={key => {
          void (async () => {
            if (!restoreAsKey) return;
            const r = await apiClient.restoreContent(restoreAsKey, false, key);
            if (r.success) {
              setRestoreAsOpen(false);
              setRestoreAsKey(null);
              await load();
              onRestored?.();
            }
          })();
        }}
      />
      <ConfirmDialog
        open={confirm.open}
        message={confirm.message}
        onCancel={() => setConfirm({ open: false, message: '' })}
        onConfirm={() => confirm.onConfirm?.()}
      />
    </>
  );
}
