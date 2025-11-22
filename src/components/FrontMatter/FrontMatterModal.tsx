import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Frontmatter } from '@/schemas/frontmatter';
import { AlertCircle, FileText, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: Record<string, unknown>;
  onCancel: () => void;
  onSave: (frontmatter: Record<string, unknown>) => void;
  // Returns generated frontmatter to be applied locally in the modal
  onGenerate: () => Promise<Record<string, unknown> | void>;
}

export function FrontMatterModal({
  open,
  onOpenChange,
  value,
  onCancel,
  onSave,
  onGenerate,
}: Props) {
  const [fm, setFm] = useState<Partial<Frontmatter>>({});
  const [tagInput, setTagInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setFm(value as Partial<Frontmatter>);
  }, [value, open]);

  const update = (key: keyof Frontmatter, v: unknown) => {
    setFm(prev => ({ ...prev, [key]: v }));
  };

  const scrollbarWidthRef = useRef(0);

  useEffect(() => {
    if (open) {
      // Calculate scrollbar width
      const outer = document.createElement('div');
      outer.style.visibility = 'hidden';
      outer.style.overflow = 'scroll';
      outer.style.width = '100px';
      outer.style.height = '100px';
      document.body.appendChild(outer);
      const inner = document.createElement('div');
      inner.style.width = '100%';
      inner.style.height = '100%';
      outer.appendChild(inner);
      scrollbarWidthRef.current = outer.offsetWidth - inner.offsetWidth;
      outer.parentNode?.removeChild(outer);

      // Apply to html element
      document.documentElement.style.paddingRight = `${scrollbarWidthRef.current}px`;
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.documentElement.style.paddingRight = '';
      document.documentElement.style.overflow = '';
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900'>
        {/* Enhanced Header with Brand Theme */}
        <div className='relative rounded-t-lg border-b border-hunter-200 bg-slate-900/60 backdrop-blur-sm dark:border-gold-800 dark:bg-slate-900/80'>
          <div className='absolute inset-0 rounded-t-lg bg-gradient-to-r from-gold-600/5 via-slate-600/5 to-gold-600/5 dark:from-hunter-400/10 dark:via-slate-400/10 dark:to-hunter-400/10'></div>
          <div className='relative flex items-center gap-4 p-6'>
            <div className='rounded-xl bg-gradient-to-br from-gold-600 to-gold-800 p-3 shadow-lg'>
              <FileText className='size-6 text-white' />
            </div>
            <div>
              <DialogTitle
                className='text-2xl font-bold tracking-tight text-slate-100 dark:text-white'
                style={{ fontWeight: 700 }}
              >
                Edit Front Matter
              </DialogTitle>
              <div className='mt-1 h-1 w-32 rounded-full bg-gradient-to-r from-gold-500 via-gold-600 to-gold-800'></div>
            </div>
          </div>
          <DialogDescription className='sr-only'>
            Generate fills the fields in this dialog. Press Update to apply them
            to the document.
          </DialogDescription>
        </div>

        {/* Form Content Area */}
        <div className='bg-white/90 p-6 backdrop-blur-sm dark:bg-slate-900/90'>
          <div className='grid gap-4'>
            <div>
              <Label htmlFor='title'>Title</Label>
              <Input
                id='title'
                value={fm.title ?? ''}
                onChange={e => update('title', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor='description'>Description</Label>
              <Textarea
                id='description'
                value={fm.description ?? ''}
                onChange={e => update('description', e.target.value)}
              />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='date'>Published Date</Label>
                <Input
                  id='date'
                  type='date'
                  value={fm.date ?? ''}
                  onChange={e => update('date', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor='author'>Author</Label>
                <Input
                  id='author'
                  value={fm.author ?? ''}
                  onChange={e => update('author', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label>Tags</Label>
              <div className='mt-2 flex flex-wrap gap-2'>
                {(fm.tags ?? []).map(t => (
                  <Badge key={t} variant='secondary'>
                    {t}
                    <button
                      className='ml-1 text-xs'
                      onClick={() =>
                        update(
                          'tags',
                          (fm.tags ?? []).filter(x => x !== t)
                        )
                      }
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              <div className='mt-2 flex gap-2'>
                <Input
                  placeholder='Add tag'
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = tagInput.trim();
                      if (val) {
                        update(
                          'tags',
                          Array.from(new Set([...(fm.tags ?? []), val]))
                        );
                        setTagInput('');
                      }
                    }
                  }}
                />
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => {
                    const val = tagInput.trim();
                    if (val) {
                      update(
                        'tags',
                        Array.from(new Set([...(fm.tags ?? []), val]))
                      );
                      setTagInput('');
                    }
                  }}
                >
                  Add
                </Button>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <input
                id='draft'
                type='checkbox'
                checked={!!fm.draft}
                onChange={e => update('draft', e.target.checked)}
              />
              <Label htmlFor='draft'>Draft</Label>
            </div>
          </div>
        </div>

        {/* AI Usage Note */}
        <div className='bg-white/90 px-6 pb-4 backdrop-blur-sm dark:bg-slate-900/90'>
          <div className='flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/50'>
            <AlertCircle className='size-4 shrink-0 text-slate-300 dark:text-slate-400' />
            <p className='text-xs text-slate-700 dark:text-slate-300'>
              <strong>AI-Generated Content:</strong> Front matter fields can be
              auto-generated using AI. Review and edit generated content before
              saving.
            </p>
          </div>
        </div>

        {/* Enhanced Footer with Brand Theme */}
        <div className='relative rounded-b-lg border-t border-hunter-200 bg-slate-900/60 backdrop-blur-sm dark:border-gold-800 dark:bg-slate-900/80'>
          <div className='absolute inset-0 rounded-b-lg bg-gradient-to-r from-gold-600/5 via-slate-600/5 to-gold-600/5 dark:from-hunter-400/10 dark:via-slate-400/10 dark:to-hunter-400/10'></div>
          <DialogFooter className='relative flex items-center justify-between gap-2 p-6'>
            <Button
              type='button'
              variant='outline'
              onClick={onCancel}
              className='border-slate-600 text-slate-300 transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800'
            >
              Cancel
            </Button>
            <div className='flex gap-2'>
              <Button
                type='button'
                variant='outline'
                disabled={isGenerating}
                onClick={() => {
                  if (isGenerating) return;

                  const generateFrontmatter = async () => {
                    setIsGenerating(true);
                    try {
                      const generated = await onGenerate();
                      if (generated && typeof generated === 'object') {
                        setFm(generated as Partial<Frontmatter>);
                      }
                    } catch (error) {
                      console.error('AI generation failed:', error);
                    } finally {
                      setIsGenerating(false);
                    }
                  };

                  void generateFrontmatter();
                }}
                className='border-hunter-600 text-hunter-600 transition-all duration-200 hover:bg-hunter-50 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-hunter-950'
              >
                <Sparkles
                  className={`mr-2 size-4 ${isGenerating ? 'animate-spin' : ''}`}
                />
                {isGenerating ? 'Generating...' : 'Generate with AI'}
              </Button>
              <Button
                type='button'
                onClick={() => onSave(fm as Record<string, unknown>)}
                className='border-0 bg-hunter-600 text-white shadow-lg transition-all duration-200 hover:bg-hunter-700 hover:shadow-xl'
              >
                Update Front Matter
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
