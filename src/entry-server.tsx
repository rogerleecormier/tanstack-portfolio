import {
  createStartHandler,
  defaultStreamHandler,
} from '@tanstack/react-start/server';

export default createStartHandler(async ctx => {
  const response = await defaultStreamHandler(ctx);
  response.headers.set('Cache-Control', 'public, max-age=60');
  return response;
});
