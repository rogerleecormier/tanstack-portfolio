import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

interface Env {
  R2_CONTENT: R2Bucket;
}

export async function onRequest(context: { request: Request; env: Env }) {
  const { request, env } = context;

  // Only allow POST requests
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    // Get the current directory for the script
    const __filename = fileURLToPath(import.meta.url);
    const projectRoot = path.resolve(path.dirname(__filename), '../../../..');
    const scriptPath = path.join(projectRoot, 'scripts', 'build-content-index.js');

    console.log('🔄 Starting cache rebuild from API call...');

    // Execute the cache rebuild script
    const child = spawn('node', [scriptPath], {
      cwd: projectRoot,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    // Collect output
    child.stdout.on('data', (data) => {
      stdout += data.toString();
      console.log('Cache rebuild stdout:', data.toString());
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
      console.error('Cache rebuild stderr:', data.toString());
    });

    // Wait for the process to complete
    return new Promise((resolve) => {
      child.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Cache rebuild completed successfully');
          resolve(Response.json({
            success: true,
            message: 'Cache rebuilt successfully',
            output: stdout
          }));
        } else {
          console.error('❌ Cache rebuild failed with code:', code);
          resolve(Response.json({
            success: false,
            error: `Cache rebuild failed (exit code: ${code})`,
            stderr: stderr
          }, { status: 500 }));
        }
      });

      child.on('error', (error) => {
        console.error('❌ Cache rebuild process error:', error);
        resolve(Response.json({
          success: false,
          error: `Process error: ${error.message}`
        }, { status: 500 }));
      });
    });

  } catch (error) {
    console.error('❌ Cache rebuild API error:', error);
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
