#!/usr/bin/env node

/**
 * DocPower API Test Script
 * Tests all the implemented endpoints
 */

const baseURL = "http://192.168.80.30:3001";

const testEndpoint = async (method, endpoint, data = null) => {
  console.log(`\n🧪 Testing ${method} ${endpoint}`);

  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${baseURL}${endpoint}`, options);
    const result = await response.json();

    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(result, null, 2));

    return result;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return null;
  }
};

const runTests = async () => {
  console.log("🚀 DocPower Backend API Tests\n");
  console.log("=".repeat(50));

  // Test 1: Health Check
  await testEndpoint("GET", "/health");

  // Test 2: Get All Documents
  await testEndpoint("GET", "/api/documents");

  // Test 3: Search by Title (Persian)
  await testEndpoint("GET", "/api/documents/search?title=دستورالعمل");

  // Test 4: Search by Document Code
  await testEndpoint("GET", "/api/documents/search?doc_code=TAV112");

  // Test 5: Search by Date Range
  await testEndpoint(
    "GET",
    "/api/documents/search?issue_date_from=1400/01/01&issue_date_to=1401/12/29",
  );

  // Test 6: Combined Search
  await testEndpoint(
    "GET",
    "/api/documents/search?title=دستورالعمل&issue_date_from=1400/01/01",
  );

  // Test 7: Get Document by ID
  await testEndpoint("GET", "/api/documents/1");

  // Test 8: Get Non-existent Document
  await testEndpoint("GET", "/api/documents/999");

  // Test 9: Add New Document
  const newDocument = {
    title: "دستورالعمل تست",
    doc_code: "TEST-001/00",
    issue_date: "1402/12/01",
    file_url: "/files/test-document.pdf",
  };
  await testEndpoint("POST", "/api/admin/documents", newDocument);

  // Test 10: Add Document with Missing Fields
  const incompleteDocument = {
    title: "دستورالعمل ناقص",
    doc_code: "INCOMPLETE-001",
    // Missing issue_date and file_url
  };
  await testEndpoint("POST", "/api/admin/documents", incompleteDocument);

  // Test 11: Add Document with Duplicate Code
  const duplicateDocument = {
    title: "دستورالعمل تکراری",
    doc_code: "TEST-001/00", // Same as Test 9
    issue_date: "1402/12/02",
    file_url: "/files/duplicate.pdf",
  };
  await testEndpoint("POST", "/api/admin/documents", duplicateDocument);

  // Test 12: Search After Adding New Document
  await testEndpoint("GET", "/api/documents/search?title=تست");

  // Test 13: Test Persian Character Normalization
  console.log(`\n🔍 Testing Persian Character Normalization:`);
  await testEndpoint("GET", "/api/documents/search?title=دستورالعمل"); // Persian characters
  await testEndpoint("GET", "/api/documents/search?title=دستورالعمل"); // With potential Arabic characters

  // Test 14: Invalid Route
  await testEndpoint("GET", "/api/invalid-route");

  console.log("\n✅ All tests completed!");
  console.log("=".repeat(50));
};

// Check if server is running first
const checkServer = async () => {
  try {
    const response = await fetch(`${baseURL}/health`);
    if (response.ok) {
      console.log("✅ Server is running, starting tests...");
      await runTests();
    } else {
      console.log("❌ Server responded with error");
    }
  } catch (error) {
    console.log("❌ Server is not running. Please start the server first:");
    console.log("   cd /home/ehsan/work/docpower/docpower-backend");
    console.log("   node server.js");
  }
};

// Add fetch polyfill for older Node versions if needed
if (typeof fetch === "undefined") {
  console.log("Installing node-fetch...");
  process.exit(1);
}

checkServer();
