/**
 * Web Worker for Compilation
 * Handles Markdown/HTML conversion in background thread
 */

// TODO: Implement web worker for compilation tasks
// Move both mdToHtml and htmlToMd conversions to this worker
// Handle debounced inputs and batch state updates

self.onmessage = (event) => {
  const { type, data } = event.data;

  switch (type) {
    case 'mdToHtml':
      // TODO: Implement markdown to HTML conversion
      console.log('Worker: Converting markdown to HTML', data);
      self.postMessage({ type: 'mdToHtml', result: 'Conversion coming soon' });
      break;
    case 'htmlToMd':
      // TODO: Implement HTML to markdown conversion
      console.log('Worker: Converting HTML to markdown', data);
      self.postMessage({ type: 'htmlToMd', result: 'Conversion coming soon' });
      break;
    default:
      self.postMessage({ type: 'error', message: 'Unknown message type' });
  }
};
