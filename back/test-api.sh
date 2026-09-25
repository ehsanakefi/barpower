#!/bin/bash

# DocPower API Test Script
# Tests all the implemented endpoints using curl

BASE_URL="http://192.168.80.30:3001"

echo "🚀 DocPower Backend API Tests"
echo "=================================================="

# Function to test an endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo ""
    echo "🧪 Testing: $description"
    echo "   $method $endpoint"
    
    if [ "$method" = "GET" ]; then
        curl -s -X GET "$BASE_URL$endpoint" -H "Content-Type: application/json" | jq '.' 2>/dev/null || curl -s -X GET "$BASE_URL$endpoint"
    elif [ "$method" = "POST" ]; then
        curl -s -X POST "$BASE_URL$endpoint" -H "Content-Type: application/json" -d "$data" | jq '.' 2>/dev/null || curl -s -X POST "$BASE_URL$endpoint" -H "Content-Type: application/json" -d "$data"
    fi
    
    echo ""
    echo "---"
}

# Check if server is running
echo "🔍 Checking server status..."
if curl -s "$BASE_URL/health" > /dev/null 2>&1; then
    echo "✅ Server is running!"
else
    echo "❌ Server is not running. Please start it first:"
    echo "   cd /home/ehsan/work/docpower/docpower-backend"
    echo "   node server.js"
    exit 1
fi

# Test 1: Health Check
test_endpoint "GET" "/health" "" "Health Check"

# Test 2: Get All Documents
test_endpoint "GET" "/api/documents" "" "Get All Documents"

# Test 3: Search by Title (Persian)
test_endpoint "GET" "/api/documents/search?title=دستورالعمل" "" "Search by Title (Persian)"

# Test 4: Search by Document Code
test_endpoint "GET" "/api/documents/search?doc_code=TAV112" "" "Search by Document Code"

# Test 5: Search by Date Range
test_endpoint "GET" "/api/documents/search?issue_date_from=1400/01/01&issue_date_to=1401/12/29" "" "Search by Date Range"

# Test 6: Combined Search
test_endpoint "GET" "/api/documents/search?title=دستورالعمل&issue_date_from=1400/01/01" "" "Combined Search"

# Test 7: Get Document by ID
test_endpoint "GET" "/api/documents/1" "" "Get Document by ID"

# Test 8: Get Non-existent Document
test_endpoint "GET" "/api/documents/999" "" "Get Non-existent Document (should return 404)"

# Test 9: Add New Document
NEW_DOC='{"title":"دستورالعمل تست","doc_code":"TEST-001/00","issue_date":"1402/12/01","file_url":"/files/test-document.pdf"}'
test_endpoint "POST" "/api/admin/documents" "$NEW_DOC" "Add New Document"

# Test 10: Add Document with Missing Fields
INCOMPLETE_DOC='{"title":"دستورالعمل ناقص","doc_code":"INCOMPLETE-001"}'
test_endpoint "POST" "/api/admin/documents" "$INCOMPLETE_DOC" "Add Incomplete Document (should fail)"

# Test 11: Add Document with Duplicate Code
DUPLICATE_DOC='{"title":"دستورالعمل تکراری","doc_code":"TEST-001/00","issue_date":"1402/12/02","file_url":"/files/duplicate.pdf"}'
test_endpoint "POST" "/api/admin/documents" "$DUPLICATE_DOC" "Add Duplicate Document (should fail)"

# Test 12: Search After Adding New Document
test_endpoint "GET" "/api/documents/search?title=تست" "" "Search for New Document"

# Test 13: Invalid Route
test_endpoint "GET" "/api/invalid-route" "" "Test Invalid Route (should return 404)"

echo ""
echo "✅ All tests completed!"
echo "=================================================="

# Summary
echo ""
echo "📋 API Summary:"
echo "   Health Check: $BASE_URL/health"
echo "   Get All Documents: $BASE_URL/api/documents"
echo "   Search Documents: $BASE_URL/api/documents/search"
echo "   Add Document: $BASE_URL/api/admin/documents"
echo ""
echo "📖 For full documentation, see: API_DOCUMENTATION.md"