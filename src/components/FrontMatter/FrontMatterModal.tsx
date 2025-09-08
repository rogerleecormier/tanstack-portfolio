import { useEffect, useState, useRef } from 'react'
import { Dialog, DialogContent, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { FileText, Sparkles, AlertCircle } from 'lucide-react'
import type { Frontmatter } from '@/schemas/frontmatter'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  value: Record<string, unknown>
  onCancel: () => void
  onSave: (frontmatter: Record<string, unknown>) => void
  // Returns generated frontmatter to be applied locally in the modal
  onGenerate: () => Promise<Record<string, unknown> | void>
}

export function FrontMatterModal({ open, onOpenChange, value, onCancel, onSave, onGenerate }: Props) {
  const [fm, setFm] = useState<Partial<Frontmatter>>({})
  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    setFm(value as Partial<Frontmatter>)
  }, [value, open])

  const update = (key: keyof Frontmatter, v: unknown) => {
    setFm((prev) => ({ ...prev, [key]: v }))
  }

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
      <DialogContent className="max-w-2xl bg-gradient-to-br from-slate-50 via-teal-50 to-blue-50 dark:from-slate-950 dark:via-teal-950 dark:to-blue-950">
        {/* Enhanced Header with Brand Theme */}
        <div className="relative border-b border-teal-200 dark:border-teal-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-t-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-600/5 via-blue-600/5 to-teal-600/5 dark:from-teal-400/10 dark:via-blue-400/10 dark:to-teal-400/10 rounded-t-lg"></div>
          <div className="relative p-6 flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-teal-600 to-blue-600 rounded-xl shadow-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white" style={{fontWeight: 700}}>
                Edit Front Matter
              </DialogTitle>
              <div className="h-1 w-32 bg-gradient-to-r from-orange-500 via-teal-600 to-blue-600 rounded-full mt-1"></div>
            </div>
          </div>
          <DialogDescription className="sr-only">
            Generate fills the fields in this dialog. Press Update to apply them to the document.
          </DialogDescription>
        </div>

        {/* Form Content Area */}
        <div className="p-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={fm.title || ''} onChange={(e) => update('title', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={fm.description || ''} onChange={(e) => update('description', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Published Date</Label>
                <Input id="date" type="date" value={fm.date || ''} onChange={(e) => update('date', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="author">Author</Label>
                <Input id="author" value={fm.author || ''} onChange={(e) => update('author', e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {(fm.tags || []).map((t) => (
                  <Badge key={t} variant="secondary">
                    {t}
                    <button className="ml-1 text-xs" onClick={() => update('tags', (fm.tags || []).filter((x) => x !== t))}>×</button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <Input placeholder="Add tag" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const val = tagInput.trim()
                    if (val) {
                      update('tags', Array.from(new Set([...(fm.tags || []), val])))
                      setTagInput('')
                    }
                  }
                }} />
                <Button type="button" variant="outline" onClick={() => {
                  const val = tagInput.trim()
                  if (val) {
                    update('tags', Array.from(new Set([...(fm.tags || []), val])))
                    setTagInput('')
                  }
                }}>Add</Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input id="draft" type="checkbox" checked={!!fm.draft} onChange={(e) => update('draft', e.target.checked)} />
              <Label htmlFor="draft">Draft</Label>
            </div>
          </div>
        </div>

        {/* AI Usage Note */}
        <div className="px-6 pb-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg">
            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <strong>AI-Generated Content:</strong> Front matter fields can be auto-generated using AI. Review and edit generated content before saving.
            </p>
          </div>
        </div>

        {/* Enhanced Footer with Brand Theme */}
        <div className="relative border-t border-teal-200 dark:border-teal-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-b-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-600/5 via-blue-600/5 to-teal-600/5 dark:from-teal-400/10 dark:via-blue-400/10 dark:to-teal-400/10 rounded-b-lg"></div>
          <DialogFooter className="relative p-6 flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-slate-600 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200"
            >
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  const generated = await onGenerate();
                  if (generated && typeof generated === 'object') {
                    setFm(generated as Partial<Frontmatter>);
                  }
                }}
                className="border-teal-600 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950 transition-all duration-200"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generate with AI
              </Button>
              <Button
                type="button"
                onClick={() => onSave(fm as Record<string, unknown>)}
                className="bg-teal-600 hover:bg-teal-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Update Front Matter
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
