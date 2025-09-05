import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import {
  validateBlockData,
  getBlockSchema,
  type BlockSchema,
} from '../blocks/schemas';

interface BlockEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (blockType: string, data: Record<string, unknown>) => void;
  blockType: string;
  initialData: Record<string, unknown>;
}

interface FormField {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required: boolean;
  enum?: string[];
  minLength?: number;
  minimum?: number;
  maximum?: number;
  pattern?: string;
  format?: string;
  items?: FormField;
  properties?: Record<string, FormField>;
}

const BlockEditorModal: React.FC<BlockEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  blockType,
  initialData,
}) => {
  const [formData, setFormData] =
    useState<Record<string, unknown>>(initialData);
  const [errors, setErrors] = useState<string[]>([]);
  const [schema, setSchema] = useState<BlockSchema | null>(null);

  useEffect(() => {
    const blockSchema = getBlockSchema(blockType);
    setSchema(blockSchema);
    setFormData(initialData);
    setErrors([]);
  }, [blockType, initialData, isOpen]);

  const handleSave = () => {
    const validation = validateBlockData(blockType, formData);
    if (validation.valid) {
      onSave(blockType, formData);
      onClose();
    } else {
      setErrors(validation.errors || []);
    }
  };

  const handleCancel = () => {
    setFormData(initialData);
    setErrors([]);
    onClose();
  };

  const updateField = (path: string, value: unknown) => {
    const keys = path.split('.');
    const newData = { ...formData };

    let current = newData;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]] as Record<string, unknown>;
    }

    current[keys[keys.length - 1]] = value;
    setFormData(newData);

    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const addArrayItem = (path: string) => {
    const keys = path.split('.');
    const newData = { ...formData };

    let current = newData;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]] as Record<string, unknown>;
    }

    const arrayPath = keys[keys.length - 1];
    const currentArray = (current[arrayPath] as unknown[]) || [];
    current[arrayPath] = [...currentArray, {}];
    setFormData(newData);
  };

  const removeArrayItem = (path: string, index: number) => {
    const keys = path.split('.');
    const newData = { ...formData };

    let current = newData;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]] as Record<string, unknown>;
    }

    const arrayPath = keys[keys.length - 1];
    const currentArray = (current[arrayPath] as unknown[]) || [];
    current[arrayPath] = currentArray.filter((_, i) => i !== index);
    setFormData(newData);
  };

  const renderField = (field: FormField, path: string, value: unknown) => {
    const fieldPath = path ? `${path}.${field.key}` : field.key;
    const fieldValue =
      value ||
      (field.type === 'array' ? [] : field.type === 'object' ? {} : '');

    switch (field.type) {
      case 'string':
        if (field.enum) {
          return (
            <Select
              value={fieldValue as string}
              onValueChange={(val) => updateField(fieldPath, val)}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Select ${field.label}`} />
              </SelectTrigger>
              <SelectContent>
                {field.enum.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        }

        if (field.format === 'uri') {
          return (
            <Input
              type="url"
              value={fieldValue as string}
              onChange={(e) => updateField(fieldPath, e.target.value)}
              placeholder={`Enter ${field.label}`}
            />
          );
        }

        if (field.key === 'content' || field.key === 'message') {
          return (
            <Textarea
              value={fieldValue as string}
              onChange={(e) => updateField(fieldPath, e.target.value)}
              placeholder={`Enter ${field.label}`}
              rows={3}
            />
          );
        }

        return (
          <Input
            type="text"
            value={fieldValue as string}
            onChange={(e) => updateField(fieldPath, e.target.value)}
            placeholder={`Enter ${field.label}`}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={fieldValue as number}
            onChange={(e) =>
              updateField(fieldPath, parseFloat(e.target.value) || 0)
            }
            placeholder={`Enter ${field.label}`}
            min={field.minimum}
            max={field.maximum}
          />
        );

      case 'boolean':
        return (
          <Switch
            checked={fieldValue as boolean}
            onCheckedChange={(checked) => updateField(fieldPath, checked)}
          />
        );

      case 'array': {
        const arrayValue = fieldValue as unknown[];
        return (
          <div className="space-y-2">
            {arrayValue.map((item, index) => (
              <Card key={index} className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">
                    {field.label} {index + 1}
                  </Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeArrayItem(fieldPath, index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                {field.items &&
                  field.items.type === 'object' &&
                  field.items.properties && (
                    <div className="space-y-2">
                      {Object.entries(field.items.properties).map(
                        ([key, subField]) => (
                          <div key={key} className="space-y-1">
                            <Label htmlFor={`${fieldPath}.${index}.${key}`}>
                              {subField.label}
                              {subField.required && (
                                <span className="text-red-500 ml-1">*</span>
                              )}
                            </Label>
                            {renderField(
                              subField,
                              `${fieldPath}.${index}`,
                              (item as Record<string, unknown>)[key]
                            )}
                          </div>
                        )
                      )}
                    </div>
                  )}
              </Card>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addArrayItem(fieldPath)}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add {field.label}
            </Button>
          </div>
        );
      }

      case 'object': {
        const objectValue = fieldValue as Record<string, unknown>;
        return (
          <Card className="p-3">
            <div className="space-y-2">
              {field.properties &&
                Object.entries(field.properties).map(([key, subField]) => (
                  <div key={key} className="space-y-1">
                    <Label htmlFor={`${fieldPath}.${key}`}>
                      {subField.label}
                      {subField.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </Label>
                    {renderField(subField, fieldPath, objectValue[key])}
                  </div>
                ))}
            </div>
          </Card>
        );
      }

      default:
        return <div>Unsupported field type: {field.type}</div>;
    }
  };

  const getFormFields = (): FormField[] => {
    if (!schema) return [];

    return Object.entries(schema.properties).map(([key, property]) => {
      const prop = property as Record<string, unknown>;
      const required = schema.required.includes(key);

      return {
        key,
        label: key.charAt(0).toUpperCase() + key.slice(1),
        type: prop.type as FormField['type'],
        required,
        enum: prop.enum as string[],
        minLength: prop.minLength as number,
        minimum: prop.minimum as number,
        maximum: prop.maximum as number,
        pattern: prop.pattern as string,
        format: prop.format as string,
        items: prop.items
          ? {
              key: 'item',
              label: 'Item',
              type: (prop.items as Record<string, unknown>)
                .type as FormField['type'],
              required: false,
              properties: (prop.items as Record<string, unknown>)
                .properties as Record<string, FormField>,
            }
          : undefined,
        properties: prop.properties as Record<string, FormField>,
      };
    });
  };

  if (!schema) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unknown Block Type</DialogTitle>
          </DialogHeader>
          <p>Unknown block type: {blockType}</p>
          <DialogFooter>
            <Button onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Edit {blockType.charAt(0).toUpperCase() + blockType.slice(1)} Block
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {getFormFields().map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {renderField(field, '', formData[field.key])}
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BlockEditorModal;
