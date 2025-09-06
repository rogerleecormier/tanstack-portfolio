/**
 * Web Worker for Compilation
 * Handles Markdown/HTML conversion in background thread with performance metrics
 */

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import rehypeParse from 'rehype-parse';
import rehypeRemark from 'rehype-remark';
import remarkStringify from 'remark-stringify';

// Import block processors (these will need to be available in worker context)
// Note: In a real implementation, these would need to be bundled with the worker
import { remarkShadcnBlocks } from '../blocks/remark-shadcn-blocks';
import { rehypePlaceholders } from '../blocks/rehype-placeholders';
import { rehypeToRemark } from '../blocks/rehype-to-remark';

// Sanitization schema - allow only required tags/attrs
const sanitizeSchema = {
  tagNames: [
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'p',
    'br',
    'hr',
    'strong',
    'em',
    'code',
    'pre',
    'ul',
    'ol',
    'li',
    'blockquote',
    'a',
    'img',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
    'div',
    'span',
  ],
  attributes: {
    '*': ['data-block-type', 'data-json', 'contenteditable', 'class'],
    div: ['data-block-type', 'data-json', 'contenteditable', 'class'],
    a: ['href', 'title'],
    img: ['src', 'alt', 'title', 'width', 'height'],
    th: ['scope'],
    td: ['colspan', 'rowspan'],
  },
};

// Performance metrics tracking
interface CompileMetrics {
  p50: number;
  p95: number;
  count: number;
  totalTime: number;
  times: number[];
}

const metrics: CompileMetrics = {
  p50: 0,
  p95: 0,
  count: 0,
  totalTime: 0,
  times: [],
};

function updateMetrics(duration: number) {
  metrics.count++;
  metrics.totalTime += duration;
  metrics.times.push(duration);

  // Keep only last 100 measurements for rolling average
  if (metrics.times.length > 100) {
    metrics.times.shift();
  }

  // Calculate percentiles
  const sortedTimes = [...metrics.times].sort((a, b) => a - b);
  const p50Index = Math.floor(sortedTimes.length * 0.5);
  const p95Index = Math.floor(sortedTimes.length * 0.95);

  metrics.p50 = sortedTimes[p50Index] || 0;
  metrics.p95 = sortedTimes[p95Index] || 0;
}

function mdToHtml(markdown: string): string {
  const startTime = performance.now();

  try {
    const processor = unified()
      .use(remarkParse)
      .use(remarkShadcnBlocks)
      .use(remarkGfm)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypePlaceholders)
      .use(rehypeSanitize, sanitizeSchema)
      .use(rehypeStringify);

    const result = processor.processSync(markdown);
    const duration = performance.now() - startTime;
    updateMetrics(duration);

    return String(result);
  } catch (error) {
    const duration = performance.now() - startTime;
    updateMetrics(duration);
    console.error('Worker: Error converting Markdown to HTML:', error);
    return `<p>Error converting Markdown to HTML</p>`;
  }
}

function htmlToMd(html: string): string {
  const startTime = performance.now();

  try {
    const processor = unified()
      .use(rehypeParse, { fragment: true })
      .use(rehypeToRemark)
      .use(rehypeRemark)
      .use(remarkStringify, { fences: true });

    const result = processor.processSync(html);
    const duration = performance.now() - startTime;
    updateMetrics(duration);

    return String(result);
  } catch (error) {
    const duration = performance.now() - startTime;
    updateMetrics(duration);
    console.error('Worker: Error converting HTML to Markdown:', error);
    return 'Error converting HTML to Markdown';
  }
}

self.onmessage = (event) => {
  const { type, data, id } = event.data;

  switch (type) {
    case 'mdToHtml': {
      const result = mdToHtml(data);
      self.postMessage({
        type: 'mdToHtml',
        result,
        id,
        metrics: {
          p50: metrics.p50,
          p95: metrics.p95,
          count: metrics.count,
          average: metrics.count > 0 ? metrics.totalTime / metrics.count : 0,
        },
      });
      break;
    }
    case 'htmlToMd': {
      const result = htmlToMd(data);
      self.postMessage({
        type: 'htmlToMd',
        result,
        id,
        metrics: {
          p50: metrics.p50,
          p95: metrics.p95,
          count: metrics.count,
          average: metrics.count > 0 ? metrics.totalTime / metrics.count : 0,
        },
      });
      break;
    }
    case 'getMetrics': {
      self.postMessage({
        type: 'metrics',
        metrics: {
          p50: metrics.p50,
          p95: metrics.p95,
          count: metrics.count,
          average: metrics.count > 0 ? metrics.totalTime / metrics.count : 0,
        },
      });
      break;
    }
    default:
      self.postMessage({ type: 'error', message: 'Unknown message type', id });
  }
};
