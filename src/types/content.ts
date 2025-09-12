export interface ContentItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  category?: string;
  url: string;
  keywords?: string[];
  confidence?: number;
  contentType: 'blog' | 'portfolio' | 'project' | 'page';
  frontMatter?: Record<string, unknown>;
  headings?: string[];
  lastModified?: string;
  displayContent?: string;
}

export interface ContentRecommendationsRequest {
  content: string;
  title: string;
  tags?: string[];
  contentType?: 'blog' | 'portfolio' | 'project';
}

export interface ContentRecommendationsResponse {
  success: boolean;
  recommendations: ContentItem[];
  error?: string;
  timestamp: string;
}
