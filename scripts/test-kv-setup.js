// Test script to verify KV setup
console.log('🔍 Testing KV setup...');

async function testKvSetup() {
  try {
    console.log('📡 Testing KV cache endpoint...');

    const response = await fetch('https://tanstack-portfolio.pages.dev/api/content/cache-get');

    console.log(`📊 Response status: ${response.status}`);
    console.log(`📄 Content-Type: ${response.headers.get('content-type')}`);

    const responseText = await response.text();
    console.log(`📝 Response preview: ${responseText.substring(0, 200)}...`);

    if (response.ok) {
      try {
        const data = JSON.parse(responseText);
        console.log('✅ KV endpoint accessible and returning JSON');
        console.log(`📊 Cache contains ${data.all?.length || 0} items`);
        console.log(`🕒 Last updated: ${data.metadata?.lastUpdated || 'Unknown'}`);
      } catch (parseError) {
        console.log('⚠️ Response is not JSON, but endpoint is accessible');
        console.log('💡 This suggests functions may not be deployed');
      }
    } else {
      console.error('❌ KV endpoint not accessible');
      console.error(`   Status: ${response.status}`);

      if (response.status === 404) {
        console.log('💡 Function endpoint not found - redeploy needed');
      } else if (response.status === 500) {
        console.log('💡 KV namespace likely not configured properly');
      } else if (responseText.includes('<!doctype')) {
        console.log('💡 Getting HTML response - functions may not be deployed');
      }
    }
  } catch (error) {
    console.error('❌ Error testing KV setup:', error.message);
    console.log('💡 Check your internet connection and KV configuration');
  }
}

testKvSetup();
