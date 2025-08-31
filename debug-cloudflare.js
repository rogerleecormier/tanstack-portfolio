#!/usr/bin/env node

const https = require('https');
const http = require('http');

// Get the URL from command line argument or use default
const url = process.argv[2] || 'http://localhost:5174';

console.log('🔍 Testing Cloudflare Access for:', url);
console.log('=====================================\n');

// Test functions
async function testEndpoint(baseUrl, path, description) {
  return new Promise((resolve) => {
    const fullUrl = `${baseUrl}${path}`;
    const client = baseUrl.startsWith('https') ? https : http;
    
    console.log(`Testing: ${description}`);
    console.log(`URL: ${fullUrl}`);
    
    const req = client.get(fullUrl, (res) => {
      console.log(`Status: ${res.statusCode} ${res.statusMessage}`);
      console.log(`Headers:`, res.headers);
      console.log('---');
      resolve({ status: res.statusCode, headers: res.headers });
    });
    
    req.on('error', (err) => {
      console.log(`Error: ${err.message}`);
      console.log('---');
      resolve({ error: err.message });
    });
    
    req.setTimeout(5000, () => {
      console.log('Timeout after 5 seconds');
      req.destroy();
      resolve({ error: 'Timeout' });
    });
  });
}

async function runTests() {
  const tests = [
    { path: '/', description: 'Home page' },
    { path: '/protected', description: 'Protected route' },
    { path: '/cdn-cgi/access/get-identity', description: 'Cloudflare Access identity endpoint' },
    { path: '/cloudflare-debug', description: 'Debug page' }
  ];
  
  for (const test of tests) {
    await testEndpoint(url, test.path, test.description);
  }
  
  console.log('\n✅ Testing complete!');
  console.log('\nNext steps:');
  console.log('1. Check if your branch is deployed to Cloudflare Pages');
  console.log('2. Add your branch URL to Cloudflare Access applications');
  console.log('3. Configure the same authentication policies as your main site');
  console.log('4. Test the protected route on your branch deployment');
}

runTests().catch(console.error);
