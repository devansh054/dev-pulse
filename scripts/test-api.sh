#!/bin/bash

# DevPulse API Test Script
echo "🧪 Testing DevPulse API endpoints..."

API_URL="http://localhost:5000"

# Test health endpoint
echo "Testing health endpoint..."
curl -s "$API_URL/health" | jq '.' || echo "❌ Health check failed"

echo ""
echo "🔧 To test authenticated endpoints, you'll need to:"
echo "1. Set up GitHub OAuth in your .env file"
echo "2. Get a JWT token by authenticating through the frontend"
echo "3. Use the token in Authorization header: 'Bearer <token>'"

echo ""
echo "Example authenticated requests:"
echo "curl -H 'Authorization: Bearer <your-jwt-token>' $API_URL/api/auth/me"
echo "curl -H 'Authorization: Bearer <your-jwt-token>' $API_URL/api/dashboard"
echo "curl -H 'Authorization: Bearer <your-jwt-token>' $API_URL/api/github/stats"
