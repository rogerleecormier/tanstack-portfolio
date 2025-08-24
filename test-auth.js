// Simple test script for authentication endpoints
// Run with: node test-auth.js

const API_BASE = 'http://localhost:3001/api';

async function testAuth() {
  console.log('🧪 Testing Authentication Endpoints...\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.status);
    console.log('');

    // Test 2: Login with valid credentials
    console.log('2️⃣ Testing login with valid credentials...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'dev@rcormier.dev',
        password: 'password'
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Login successful:', loginData.message);
      console.log('👤 User:', loginData.user.name);
      console.log('🔑 Token received:', loginData.token ? 'Yes' : 'No');
      console.log('');
      
      const token = loginData.token;
      
      // Test 3: Verify token
      console.log('3️⃣ Testing token verification...');
      const verifyResponse = await fetch(`${API_BASE}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      
      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json();
        console.log('✅ Token verification successful:', verifyData.message);
        console.log('');
        
        // Test 4: Get current user
        console.log('4️⃣ Testing get current user...');
        const meResponse = await fetch(`${API_BASE}/auth/me`, {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (meResponse.ok) {
          const meData = await meResponse.json();
          console.log('✅ Get user successful:', meData.user.name);
          console.log('');
          
          // Test 5: Access protected endpoint
          console.log('5️⃣ Testing protected endpoint...');
          const protectedResponse = await fetch(`${API_BASE}/protected/test`, {
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (protectedResponse.ok) {
            const protectedData = await protectedResponse.json();
            console.log('✅ Protected endpoint access successful:', protectedData.message);
            console.log('');
          } else {
            console.log('❌ Protected endpoint failed:', protectedResponse.status);
          }
          
          // Test 6: Logout
          console.log('6️⃣ Testing logout...');
          const logoutResponse = await fetch(`${API_BASE}/auth/logout`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (logoutResponse.ok) {
            const logoutData = await logoutResponse.json();
            console.log('✅ Logout successful:', logoutData.message);
            console.log('');
          } else {
            console.log('❌ Logout failed:', logoutResponse.status);
          }
          
        } else {
          console.log('❌ Get user failed:', meResponse.status);
        }
        
      } else {
        console.log('❌ Token verification failed:', verifyResponse.status);
      }
      
    } else {
      const errorData = await loginResponse.json();
      console.log('❌ Login failed:', errorData.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.log('\n💡 Make sure the server is running on port 3001');
    console.log('   Run: npm run dev:backend');
  }
  
  console.log('🏁 Authentication tests completed!');
}

// Run the tests
testAuth();
