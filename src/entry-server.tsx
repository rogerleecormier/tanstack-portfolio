import { createStartHandler, defaultStreamHandler } from '@tanstack/react-start/server';
import { createRouter } from './router';

const router = createRouter();

export default createStartHandler({
  createRouter,
  getHeaders: () => ({
    'Cache-Control': 'public, max-age=60',
  }),
})(defaultStreamHandler);
