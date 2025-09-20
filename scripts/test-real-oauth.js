#!/usr/bin/env node

console.log('🔍 OAuth Configuration Checker\n');

console.log('✅ Your GitHub OAuth App Details:');
console.log('   App Name: dev-pulse1');
console.log('   Client ID: Ov23lii2eBhOmjIwVGu9');
console.log('   Client Secret: 00045b24e99b21b33286ec02839ff8636e8fff77');
console.log('');

console.log('🎯 Required Configuration:');
console.log('   Homepage URL: https://dev-pulse.netlify.app');
console.log('   Authorization callback URL: https://dev-pulse-api.onrender.com/api/auth/github/callback');
console.log('');

console.log('🔗 Test OAuth Flow:');
console.log('   1. Visit: https://dev-pulse.netlify.app');
console.log('   2. Click "Sign in with GitHub"');
console.log('   3. Complete GitHub authorization');
console.log('   4. Should redirect back to app successfully');
console.log('');

console.log('📋 If still failing, verify in GitHub settings:');
console.log('   • Callback URL has NO trailing slash');
console.log('   • Uses https:// not http://');
console.log('   • Includes /api/auth/github/callback path');
console.log('   • No extra characters or spaces');
