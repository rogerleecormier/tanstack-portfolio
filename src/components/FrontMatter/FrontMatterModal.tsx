import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import type { Frontmatter } from '@/schemas/frontmatter'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  value: Record<string, unknown>
  onCancel: () => void
  onSave: (frontmatter: Record<string, unknown>) => void
  onGenerate: () => Promise<void>
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Front Matter</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
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
              <Input id="date" type="date" value={(fm as any).date || ''} onChange={(e) => update('date', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="author">Author</Label>
              <Input id="author" value={(fm as any).author || ''} onChange={(e) => update('author' as any, e.target.value)} />
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

        <DialogFooter className="flex items-center justify-between gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={async () => { await onGenerate(); }}>Generate</Button>
            <Button type="button" onClick={() => onSave(fm as Record<string, unknown>)}>Update</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
