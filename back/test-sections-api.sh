#!/bin/bash

# Test the updated API with sections support

BASE_URL="http://192.168.80.30:3001"

echo "🚀 Testing Updated DocPower API with Internal Section Search"
echo "=========================================================="

echo ""
echo "🧪 Test 1: Combined Search - Document and Section Titles"
echo "Searching for 'مدیریت' (should match document title and sections)"
curl -s "$BASE_URL/api/documents/search?title=مدیریت" | jq '.' || curl -s "$BASE_URL/api/documents/search?title=مدیریت"

echo ""
echo "---"
echo ""
echo "🧪 Test 2: Section-Only Match"
echo "Searching for 'ماده' (should match section title only)"
curl -s "$BASE_URL/api/documents/search?title=ماده" | jq '.' || curl -s "$BASE_URL/api/documents/search?title=ماده"

echo ""
echo "---"
echo ""
echo "🧪 Test 3: Add Document with Sections"
echo "Adding new document with multiple sections"
NEW_DOC_WITH_SECTIONS='{
  "title": "قوانین منابع انسانی",
  "doc_code": "HR-2024/01",
  "issue_date": "1402/12/15",
  "file_url": "/files/hr-regulations.pdf",
  "sections": [
    {
      "title": "فصل اول - استخدام",
      "section_type": "article",
      "order_index": 1
    },
    {
      "title": "ماده 10 - شرایط احراز",
      "section_type": "article", 
      "order_index": 2
    },
    {
      "title": "پیوست 1 - فرم درخواست",
      "section_type": "appendix",
      "order_index": 3
    },
    {
      "title": "جدول 2 - سطوح حقوق",
      "section_type": "table",
      "order_index": 4
    }
  ]
}'

curl -s -X POST "$BASE_URL/api/admin/documents" \
  -H "Content-Type: application/json" \
  -d "$NEW_DOC_WITH_SECTIONS" | jq '.' || curl -s -X POST "$BASE_URL/api/admin/documents" \
  -H "Content-Type: application/json" \
  -d "$NEW_DOC_WITH_SECTIONS"

echo ""
echo "---"
echo ""
echo "🧪 Test 4: Search New Document by Section Title"
echo "Searching for 'استخدام' (should find the new document by section title)"
curl -s "$BASE_URL/api/documents/search?title=استخدام" | jq '.' || curl -s "$BASE_URL/api/documents/search?title=استخدام"

echo ""
echo "---"
echo ""
echo "🧪 Test 5: Search by Table Reference"
echo "Searching for 'جدول' (should find documents containing tables)"
curl -s "$BASE_URL/api/documents/search?title=جدول" | jq '.' || curl -s "$BASE_URL/api/documents/search?title=جدول"

echo ""
echo "---"
echo ""
echo "🧪 Test 6: Search by Appendix"
echo "Searching for 'پیوست' (should find documents with appendices)"
curl -s "$BASE_URL/api/documents/search?title=پیوست" | jq '.' || curl -s "$BASE_URL/api/documents/search?title=پیوست"

echo ""
echo "---"
echo ""
echo "🧪 Test 7: Get All Documents (now with sections)"
curl -s "$BASE_URL/api/documents" | jq '.' || curl -s "$BASE_URL/api/documents"

echo ""
echo "---"
echo ""
echo "✅ All tests completed!"
echo ""
echo "📋 New Features Demonstrated:"
echo "   ✓ Combined search in document and section titles"
echo "   ✓ Persian text normalization for both document and section titles"
echo "   ✓ Relevance ranking (document title matches rank higher)"
echo "   ✓ Admin interface for adding documents with sections"
echo "   ✓ Section metadata (type, order) support"
echo "   ✓ Multiple section types (article, table, appendix)"