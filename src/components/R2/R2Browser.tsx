import { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { apiClient } from '../../lib/api';
import { FileText, Download, Search } from 'lucide-react';

interface R2Object {
  key: string;
  size: number;
  uploaded: string;
  etag: string;
}

interface R2BrowserProps {
  onFileSelect: (key: string) => void;
  onFileDownload: (key: string) => void;
}

export function R2Browser({ onFileSelect, onFileDownload }: R2BrowserProps) {
  const [objects, setObjects] = useState<R2Object[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [cursor, setCursor] = useState<string>();
  const [hasMore, setHasMore] = useState(false);

  const loadObjects = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const response = await apiClient.listContent(
        'content/',
        reset ? undefined : cursor,
        50
      );

      if (response.success && response.data) {
        const data = response.data;
        if (reset) {
          setObjects(data.objects || []);
        } else {
          setObjects(prev => [...prev, ...(data.objects || [])]);
        }
        setCursor(data.cursor);
        setHasMore(!!data.cursor);
      }
    } catch (error) {
      console.error('Failed to load objects:', error);
    } finally {
      setLoading(false);
    }
  }, [cursor]);

  useEffect(() => {
    loadObjects(true);
  }, [loadObjects]);

  const filteredObjects = objects.filter(obj =>
    obj.key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Content Browser
        </CardTitle>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={() => loadObjects(true)} disabled={loading}>
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {filteredObjects.map((obj) => (
            <div
              key={obj.key}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
              onClick={() => onFileSelect(obj.key)}
            >
              <div className="flex-1">
                <div className="font-medium truncate">{obj.key.replace('content/', '')}</div>
                <div className="text-sm text-muted-foreground">
                  {formatFileSize(obj.size)} • {formatDate(obj.uploaded)}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFileDownload(obj.key);
                  }}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {filteredObjects.length === 0 && !loading && (
            <div className="text-center text-muted-foreground py-8">
              No files found
            </div>
          )}
          {hasMore && (
            <Button
              variant="outline"
              onClick={() => loadObjects()}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Loading...' : 'Load More'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
