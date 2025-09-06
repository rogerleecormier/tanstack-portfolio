import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Frontmatter } from '../../schemas/frontmatter';
import { extractFrontMatter } from '../../lib/markdown';
import { apiClient } from '../../lib/api';

interface FrontMatterPanelProps {
  markdown: string;
  onFrontMatterChange: (frontmatter: Record<string, unknown>) => void;
}

interface GeneratedFrontmatter {
  title?: string;
  description?: string;
  tags?: string[];
}

export function FrontMatterPanel({ markdown, onFrontMatterChange }: FrontMatterPanelProps) {
  const [frontmatter, setFrontmatter] = useState<Partial<Frontmatter>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [generatedSuggestions, setGeneratedSuggestions] = useState<GeneratedFrontmatter>({});

  useEffect(() => {
    const extracted = extractFrontMatter(markdown);
    setFrontmatter(extracted.attributes as Partial<Frontmatter>);
  }, [markdown]);

  const handleFieldChange = (field: keyof Frontmatter, value: unknown) => {
    const updated = { ...frontmatter, [field]: value };
    setFrontmatter(updated);
    onFrontMatterChange(updated);
  };

  const handleGenerate = async () => {
    const response = await apiClient.generateFrontmatter(markdown);
    if (response.success && response.data) {
      setGeneratedSuggestions(response.data.frontmatter);
      setShowDiff(true);
    }
  };

  const handleApplyGenerated = () => {
    const merged = { ...frontmatter, ...generatedSuggestions };
    setFrontmatter(merged);
    onFrontMatterChange(merged);
    setShowDiff(false);
    setGeneratedSuggestions({});
  };

  const handleAddTag = (tag: string) => {
    const currentTags = frontmatter.tags || [];
    if (!currentTags.includes(tag)) {
      handleFieldChange('tags', [...currentTags, tag]);
    }
  };

  const handleRemoveTag = (tag: string) => {
    const currentTags = frontmatter.tags || [];
    handleFieldChange('tags', currentTags.filter(t => t !== tag));
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Front Matter</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleGenerate}>
            Generate
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? 'View' : 'Edit'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showDiff && (
          <div className="border rounded p-3 bg-muted">
            <h4 className="font-medium mb-2">Suggested Changes:</h4>
            <div className="text-sm space-y-1">
              {Object.entries(generatedSuggestions).map(([key, value]) => (
                <div key={key}>
                  <strong>{key}:</strong> {JSON.stringify(value)}
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={handleApplyGenerated}>
                Apply
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowDiff(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="grid gap-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={frontmatter.title || ''}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              disabled={!isEditing}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={frontmatter.description || ''}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              disabled={!isEditing}
            />
          </div>

          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={frontmatter.date || ''}
              onChange={(e) => handleFieldChange('date', e.target.value)}
              disabled={!isEditing}
            />
          </div>

          <div>
            <Label htmlFor="layout">Layout</Label>
            <Select
              value={frontmatter.layout || ''}
              onValueChange={(value) => handleFieldChange('layout', value)}
              disabled={!isEditing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select layout" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="post">Post</SelectItem>
                <SelectItem value="page">Page</SelectItem>
                <SelectItem value="doc">Doc</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {frontmatter.tags?.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                  {isEditing && (
                    <button
                      className="ml-1 text-xs hover:text-destructive"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      ×
                    </button>
                  )}
                </Badge>
              ))}
            </div>
            {isEditing && (
              <Input
                placeholder="Add tag"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const value = (e.target as HTMLInputElement).value.trim();
                    if (value) {
                      handleAddTag(value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
                className="mt-2"
              />
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="draft"
              checked={frontmatter.draft || false}
              onChange={(e) => handleFieldChange('draft', e.target.checked)}
              disabled={!isEditing}
            />
            <Label htmlFor="draft">Draft</Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
