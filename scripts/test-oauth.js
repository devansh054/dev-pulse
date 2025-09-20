#!/usr/bin/env node

const axios = require('axios');

async function testOAuthFlow() {
  console.log('🔍 Testing OAuth Flow...\n');
  
  // Step 1: Test backend health
  console.log('1. Testing backend health...');
  try {
    const pingResponse = await axios.get('https://dev-pulse-api.onrender.com/api/auth/ping');
    console.log('✅ Backend is healthy');
    console.log('   Environment vars configured:', {
      hasGithubClientId: pingResponse.data.environment.hasGithubClientId,
      hasGithubClientSecret: pingResponse.data.environment.hasGithubClientSecret,
      frontendUrl: pingResponse.data.environment.frontendUrl
    });
  } catch (error) {
    console.log('❌ Backend health check failed:', error.message);
    return;
  }

  // Step 2: Test debug endpoint
  console.log('\n2. Testing debug endpoint...');
  try {
    const debugResponse = await axios.get('https://dev-pulse-api.onrender.com/api/auth/debug');
    console.log('✅ Debug endpoint working');
    console.log('   OAuth config:', debugResponse.data.oauth);
  } catch (error) {
    console.log('❌ Debug endpoint failed:', error.message);
  }

  // Step 3: Test GitHub OAuth authorization URL
  console.log('\n3. Testing GitHub OAuth authorization...');
  const authUrl = 'https://github.com/login/oauth/authorize?client_id=Ov23limnrP5Vn3WaO1DL&redirect_uri=https://dev-pulse-api.onrender.com/api/auth/github/callback&scope=user:email,read:user,repo&state=test123';
  
  try {
    const authResponse = await axios.get(authUrl, { 
      maxRedirects: 0,
      validateStatus: (status) => status < 400 
    });
    console.log('✅ GitHub OAuth URL accessible');
    console.log('   Redirect status:', authResponse.status);
  } catch (error) {
    if (error.response && error.response.status === 302) {
      console.log('✅ GitHub OAuth URL working (redirects to login)');
    } else {
      console.log('❌ GitHub OAuth URL failed:', error.message);
    }
  }

  // Step 4: Test callback with invalid code (to see error handling)
  console.log('\n4. Testing callback error handling...');
  try {
    const callbackResponse = await axios.get(
      'https://dev-pulse-api.onrender.com/api/auth/github/callback?code=invalid_test_code&state=test123',
      { maxRedirects: 0, validateStatus: () => true }
    );
    console.log('✅ Callback endpoint accessible');
    console.log('   Response status:', callbackResponse.status);
    console.log('   Response headers location:', callbackResponse.headers.location);
    
    if (callbackResponse.headers.location) {
      const redirectUrl = new URL(callbackResponse.headers.location);
      console.log('   Redirect error:', redirectUrl.searchParams.get('error'));
    }
  } catch (error) {
    console.log('❌ Callback test failed:', error.message);
  }

  // Step 5: Check frontend accessibility
  console.log('\n5. Testing frontend accessibility...');
  try {
    const frontendResponse = await axios.get('https://dev-pulse.netlify.app', {
      timeout: 10000,
      validateStatus: (status) => status < 400
    });
    console.log('✅ Frontend accessible');
    console.log('   Status:', frontendResponse.status);
  } catch (error) {
    console.log('❌ Frontend not accessible:', error.message);
  }

  console.log('\n🎯 OAuth Flow Analysis Complete');
  console.log('\nNext steps:');
  console.log('1. Verify GitHub OAuth app callback URL is exactly: https://dev-pulse-api.onrender.com/api/auth/github/callback');
  console.log('2. Check if GitHub OAuth app is active and not suspended');
  console.log('3. Verify OAuth app has correct permissions');
  console.log('4. Test with a real authorization code from GitHub');
}

testOAuthFlow().catch(console.error);
