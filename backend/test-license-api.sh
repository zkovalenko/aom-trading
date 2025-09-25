#!/bin/bash

# License API Testing Script - Using user_subscriptions with API key authentication
API_KEY="test-api-key-12345"
BASE_URL="http://localhost:5001"

echo "🔑 Testing License API Endpoints (API Key Required)"
echo "==================================================="

# Test 1: Validate License Endpoint with existing user
echo ""
echo "📋 Test 1: POST /api/license/validate (Existing User)"
echo "----------------------------------------------------"
curl -X POST "$BASE_URL/api/license/validate" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{
    "email": "zhenya.minkovich@gmail.com",
    "productNumber": "LEXWRYX9E"
  }' \
  -w "\nStatus Code: %{http_code}\n" \
  -s

echo ""
echo ""

# Test 2: Release Device Endpoint  
echo "🗑️  Test 2: POST /api/license/releaseDevice"
echo "-------------------------------------------"
curl -X POST "$BASE_URL/api/license/releaseDevice" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{
    "email": "zhenya.minkovich@gmail.com",
    "productNumber": "LEXWRYX9E", 
  }' \
  -w "\nStatus Code: %{http_code}\n" \
  -s

echo ""
echo ""

# Test 3: Non-existent user (should fail)
echo "❌ Test 3: Non-existent User"
echo "----------------------------"
curl -X POST "$BASE_URL/api/license/validate" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{
    "email": "nonexistent@example.com",
    "productNumber": "LEXWRYX9E"
  }' \
  -w "\nStatus Code: %{http_code}\n" \
  -s

echo ""
echo ""

# Test 4: Invalid license number (should fail)
echo "❌ Test 4: Invalid License Number"
echo "---------------------------------"
curl -X POST "$BASE_URL/api/license/validate" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{
    "email": "zhenya.minkovich@gmail.com",
    "productNumber": "INVALID_LICENSE"
  }' \
  -w "\nStatus Code: %{http_code}\n" \
  -s

echo ""
echo "✅ Testing completed!"
echo ""
echo "📝 Notes:"
echo "1. Now using user_subscriptions table instead of software_licenses"
echo "2. productNumber should be the licenseNumber from subscription (e.g., LEXWRYX9E)"
echo "3. API key authentication required (using: test-api-key-12345)"
echo "4. Make sure backend server is running on localhost:5001"
echo ""
echo "🔐 Add test for invalid API key:"
echo "curl -X POST \"$BASE_URL/api/license/validate\" -H \"Content-Type: application/json\" -H \"x-api-key: invalid-key\" -d '{\"email\":\"zhenya.minkovich@gmail.com\",\"productNumber\":\"LEXWRYX9E\"}'"
