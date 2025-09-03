#!/usr/bin/env node

/**
 * Test Cloudflare Access endpoints locally
 * This script helps diagnose Cloudflare Access configuration issues
 */

import https from 'https';
import http from 'http';

const DOMAIN = 'www.rcormier.dev';
const ENDPOINTS = [
  '/cdn-cgi/access/get-identity',
  '/cdn-cgi/access/login',
  '/cdn-cgi/access/logout'
];

function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const url = `https://${DOMAIN}${endpoint}`;
    console.log(`\n🔍 Testing: ${url}`);
    
    const req = https.request(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Cloudflare-Access-Test/1.0',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      timeout: 10000
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📊 Status: ${res.statusCode} ${res.statusMessage}`);
        console.log(`📋 Headers:`, res.headers);
        
        if (res.statusCode === 200) {
          try {
            const jsonData = JSON.parse(data);
            console.log(`✅ Response:`, JSON.stringify(jsonData, null, 2));
          } catch (e) {
            console.log(`📄 Raw Response:`, data);
          }
        } else {
          console.log(`❌ Error Response:`, data);
        }
        
        resolve({
          endpoint,
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ Request Error:`, error.message);
      resolve({
        endpoint,
        error: error.message
      });
    });
    
    req.on('timeout', () => {
      console.log(`⏰ Request Timeout`);
      req.destroy();
      resolve({
        endpoint,
        error: 'Request timeout'
      });
    });
    
    req.end();
  });
}

async function runTests() {
  console.log(`🚀 Testing Cloudflare Access endpoints for ${DOMAIN}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  
  const results = [];
  
  for (const endpoint of ENDPOINTS) {
    const result = await testEndpoint(endpoint);
    results.push(result);
  }
  
  console.log(`\n📋 Summary:`);
  results.forEach(result => {
    if (result.error) {
      console.log(`❌ ${result.endpoint}: ${result.error}`);
    } else {
      console.log(`✅ ${result.endpoint}: ${result.status}`);
    }
  });
  
  // Check for common issues
  console.log(`\n🔍 Common Issues Analysis:`);
  
  const has400 = results.some(r => r.status === 400);
  const has403 = results.some(r => r.status === 403);
  const has404 = results.some(r => r.status === 404);
  
  if (has400) {
    console.log(`⚠️  400 Bad Request detected - Domain may not be configured in Cloudflare Access`);
  }
  
  if (has403) {
    console.log(`⚠️  403 Forbidden detected - Domain configured but access policies may be blocking`);
  }
  
  if (has404) {
    console.log(`⚠️  404 Not Found detected - Cloudflare Access may not be enabled for this domain`);
  }
  
  if (!has400 && !has403 && !has404) {
    console.log(`✅ All endpoints responded with expected status codes`);
  }
  
  console.log(`\n💡 Next Steps:`);
  console.log(`1. Visit https://${DOMAIN}/cloudflare-debug to run browser-based tests`);
  console.log(`2. Check Cloudflare dashboard → Access → Applications`);
  console.log(`3. Verify domain is properly proxied (orange cloud icon)`);
  console.log(`4. Ensure Access policies are configured for protected routes`);
}

// Run the tests
runTests().catch(console.error);
