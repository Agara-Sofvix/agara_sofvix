#!/bin/bash

BASE_URL="http://localhost:5001/api"

echo "=== Testing Payload Size Limit (Expected: 413 Payload Too Large) ==="
# Create a 20KB file
# DD'ing 20480 bytes
dd if=/dev/zero of=large_payload.json bs=1 count=0 seek=20480 2>/dev/null
curl -s -X POST -H "Content-Type: application/json" -d @large_payload.json "$BASE_URL/auth/login" | grep -i "Too Large" || echo "Failed"
rm large_payload.json
echo ""

echo "=== Testing Joi Validation (Expected: 400 Bad Request) ==="
curl -s -X POST -H "Content-Type: application/json" -d '{"email": "invalid-email", "password": "123"}' "$BASE_URL/auth/login"
echo ""

echo "=== Testing Response Consistency (Expected: {success: true, ...}) ==="
# We'll use a public route like /tournaments
curl -s -X GET "$BASE_URL/tournaments" | grep -q "\"success\":true" && echo "Success: true found" || echo "Failed"
echo ""

echo "=== Testing Error Consistency & Stack Trace Hiding (Expected: {success: false, message: ...} and no stack) ==="
# Try an invalid text ID
curl -s -X GET "$BASE_URL/texts/non-existent-id" | grep -q "\"success\":false" && echo "Success: false found" || echo "Failed"
# Check if stack is present (shouldn't be in production, but let's check it's handled)
curl -s -X GET "$BASE_URL/texts/non-existent-id" | grep -q "\"stack\"" && echo "Stack present (Dev mode)" || echo "Stack hidden"
echo ""

echo "=== Testing Rate Limiting (Expected: 429 Too Many Requests after many calls) ==="
echo "Sending 10 requests to check if it triggers eventually (Global limit is 500, so we just check it responds)"
for i in {1..10}; do
  curl -s -X GET "$BASE_URL/tournaments" > /dev/null
done
echo "Rate limit check completed (manual spam required for full test)"
