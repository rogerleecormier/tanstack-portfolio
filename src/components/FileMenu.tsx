import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  FolderOpen,
  Save,
  FileDown,
  Download,
  FileText,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FileMenuProps {
  fileName: string | null;
  isDirty: boolean;
  hasUnsavedChanges: boolean;
  lastSaved: Date | null;
  onOpenFile: () => void;
  onSaveFile: () => void;
  onSaveAsFile: () => void;
  onExportHTML: () => void;
  onResetFile: () => void;
}

const FileMenu: React.FC<FileMenuProps> = ({
  fileName,
  isDirty,
  hasUnsavedChanges,
  lastSaved,
  onOpenFile,
  onSaveFile,
  onSaveAsFile,
  onExportHTML,
  onResetFile,
}) => {
  const formatLastSaved = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex items-center space-x-2">
      {/* File status indicator */}
      <div className="flex items-center space-x-2">
        {hasUnsavedChanges ? (
          <Badge variant="destructive" className="text-xs">
            <AlertCircle className="w-3 h-3 mr-1" />
            Unsaved
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-xs">
            <CheckCircle className="w-3 h-3 mr-1" />
            Saved
          </Badge>
        )}

        {lastSaved && (
          <span className="text-xs text-muted-foreground">
            {formatLastSaved(lastSaved)}
          </span>
        )}
      </div>

      {/* File menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            {fileName || 'Untitled'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuItem onClick={onOpenFile}>
            <FolderOpen className="w-4 h-4 mr-2" />
            Open File
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={onSaveFile} disabled={!isDirty}>
            <Save className="w-4 h-4 mr-2" />
            Save
            {fileName && (
              <span className="ml-auto text-xs text-muted-foreground">
                Ctrl+S
              </span>
            )}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={onSaveAsFile}>
            <FileDown className="w-4 h-4 mr-2" />
            Save As...
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={onExportHTML}>
            <Download className="w-4 h-4 mr-2" />
            Export HTML
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={onResetFile}>
            <FileText className="w-4 h-4 mr-2" />
            New Document
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default FileMenu;
