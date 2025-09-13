import { logger } from './logger';
import {
  cachedContentService,
  type CachedContentItem,
} from '@/api/cachedContentService';

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  category: string;
  url: string;
  keywords: string[];
  content: string;
  date?: string;
  fileName: string;
  frontmatter: Record<string, unknown>;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  category: string;
  url: string;
  keywords: string[];
  content: string;
  date?: string;
  fileName: string;
  frontmatter: Record<string, unknown>;
}

export interface BlogItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  category: string;
  url: string;
  keywords: string[];
  content: string;
  date?: string;
  fileName: string;
  frontmatter: Record<string, unknown>;
}

// Load all portfolio items from KV cache
export async function loadPortfolioItems(): Promise<PortfolioItem[]> {
  try {
    logger.info('🔄 Loading portfolio items from KV cache...');

    // Use KV cache service
    const cachedItems =
      await cachedContentService.getContentByType('portfolio');
    logger.info(`📁 Found ${cachedItems.length} portfolio items from KV cache`);

    // Convert cached items to PortfolioItem format
    const items: PortfolioItem[] = cachedItems.map(
      (item: CachedContentItem) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        tags: item.tags,
        category: item.category,
        url: item.url,
        keywords: item.keywords,
        content: item.content,
        date: item.date,
        fileName: item.fileName,
        frontmatter: {},
      })
    );

    // Sort by title
    const sortedItems = items.sort((a, b) => a.title.localeCompare(b.title));

    logger.info(
      `✅ Successfully loaded ${sortedItems.length} portfolio items from KV cache`
    );
    return sortedItems;
  } catch (error) {
    logger.error('❌ Failed to load portfolio items from KV cache:', error);
    throw error;
  }
}

// Get a specific portfolio item by ID from KV cache
export async function getPortfolioItem(
  id: string
): Promise<PortfolioItem | null> {
  try {
    logger.info(`🔄 Loading portfolio item: ${id}`);

    // Use KV cache service
    const cachedItems =
      await cachedContentService.getContentByType('portfolio');
    const cachedItem = cachedItems.find(
      (item: CachedContentItem) => item.id === id
    );

    if (cachedItem) {
      // Convert cached item to PortfolioItem format
      const portfolioItem: PortfolioItem = {
        id: cachedItem.id,
        title: cachedItem.title,
        description: cachedItem.description,
        tags: cachedItem.tags,
        category: cachedItem.category,
        url: cachedItem.url,
        keywords: cachedItem.keywords,
        content: cachedItem.content,
        date: cachedItem.date,
        fileName: cachedItem.fileName,
        frontmatter: {}, // Will be populated if needed
      };

      logger.info(
        `✅ Successfully loaded portfolio item: ${portfolioItem.title}`
      );
      return portfolioItem;
    }

    logger.warn(`⚠️ Portfolio item not found: ${id}`);
    return null;
  } catch (error) {
    logger.error(`❌ Error loading portfolio item ${id} from KV cache:`, error);
    return null;
  }
}

// Load all project items from KV cache
export async function loadProjectItems(): Promise<ProjectItem[]> {
  try {
    logger.info('🔄 Loading project items from KV cache...');

    // Use KV cache service
    const cachedItems = await cachedContentService.getContentByType('project');
    logger.info(`📁 Found ${cachedItems.length} project items from KV cache`);

    // Convert cached items to ProjectItem format
    const items: ProjectItem[] = cachedItems.map((item: CachedContentItem) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      tags: item.tags,
      category: item.category,
      url: item.url,
      keywords: item.keywords,
      content: item.content,
      date: item.date,
      fileName: item.fileName,
      frontmatter: {},
    }));

    // Sort by title
    const sortedItems = items.sort((a, b) => a.title.localeCompare(b.title));

    logger.info(
      `✅ Successfully loaded ${sortedItems.length} project items from KV cache`
    );
    return sortedItems;
  } catch (error) {
    logger.error('❌ Failed to load project items from KV cache:', error);
    throw error;
  }
}

// Get a specific project item by ID from KV cache
export async function getProjectItem(id: string): Promise<ProjectItem | null> {
  try {
    logger.info(`🔄 Loading project item: ${id}`);

    // Use KV cache service
    const cachedItems = await cachedContentService.getContentByType('project');
    const cachedItem = cachedItems.find(
      (item: CachedContentItem) => item.id === id
    );

    if (cachedItem) {
      // Convert cached item to ProjectItem format
      const projectItem: ProjectItem = {
        id: cachedItem.id,
        title: cachedItem.title,
        description: cachedItem.description,
        tags: cachedItem.tags,
        category: cachedItem.category,
        url: cachedItem.url,
        keywords: cachedItem.keywords,
        content: cachedItem.content,
        date: cachedItem.date,
        fileName: cachedItem.fileName,
        frontmatter: {}, // Will be populated if needed
      };

      logger.info(`✅ Successfully loaded project item: ${projectItem.title}`);
      return projectItem;
    }

    logger.warn(`⚠️ Project item not found: ${id}`);
    return null;
  } catch (error) {
    logger.error(`❌ Error loading project item ${id} from KV cache:`, error);
    return null;
  }
}

// Load all blog items from KV cache
export async function loadBlogItems(): Promise<BlogItem[]> {
  try {
    logger.info('🔄 Loading blog items from KV cache...');

    // Use KV cache service
    const cachedItems = await cachedContentService.getBlogPosts();
    logger.info(`📚 Found ${cachedItems.length} blog items from KV cache`);

    // Convert cached items to BlogItem format
    const items: BlogItem[] = cachedItems.map((item: CachedContentItem) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      tags: item.tags,
      category: item.category,
      url: item.url,
      keywords: item.keywords,
      content: item.content,
      date: item.date,
      fileName: item.fileName,
      frontmatter: {},
    }));

    // Sort by date (most recent first)
    const sortedItems = items.sort(
      (a, b) =>
        new Date(b.date || '').getTime() - new Date(a.date || '').getTime()
    );

    logger.info(
      `✅ Successfully loaded ${sortedItems.length} blog items from KV cache`
    );
    return sortedItems;
  } catch (error) {
    logger.error('❌ Failed to load blog items from KV cache:', error);
    throw error;
  }
}

// Get a specific blog item by ID from KV cache
export async function getBlogItem(id: string): Promise<BlogItem | null> {
  try {
    logger.info(`🔄 Loading blog item: ${id}`);

    // Use KV cache service
    const cachedItems = await cachedContentService.getBlogPosts();
    const cachedItem = cachedItems.find(
      (item: CachedContentItem) => item.id === id
    );

    if (cachedItem) {
      // Convert cached item to BlogItem format
      const blogItem: BlogItem = {
        id: cachedItem.id,
        title: cachedItem.title,
        description: cachedItem.description,
        tags: cachedItem.tags,
        category: cachedItem.category,
        url: cachedItem.url,
        keywords: cachedItem.keywords,
        content: cachedItem.content,
        date: cachedItem.date,
        fileName: cachedItem.fileName,
        frontmatter: {}, // Will be populated if needed
      };

      logger.info(`✅ Successfully loaded blog item: ${blogItem.title}`);
      return blogItem;
    }

    logger.warn(`⚠️ Blog item not found: ${id}`);
    return null;
  } catch (error) {
    logger.error(`❌ Error loading blog item ${id} from KV cache:`, error);
    return null;
  }
}
