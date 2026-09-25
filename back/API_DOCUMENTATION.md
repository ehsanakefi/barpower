# DocPower Backend API Documentation

## Title-Based Document Search System

This backend implements a high-performance search system focusing on document titles with Persian text support.

### Base URL
```
http://localhost:3001
```

## API Endpoints

### 1. Health Check
**GET** `/health`

Returns the server status.

**Response:**
```json
{
  "success": true,
  "message": "DocPower Backend API is running!",
  "timestamp": "2026-02-23T01:45:12.345Z"
}
```

---

### 2. Get All Documents
**GET** `/api/documents`

Retrieves all documents in the system.

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": "1",
      "title": "دستورالعمل مدیریت دانش سازمانی",
      "doc_code": "TAV112-02/00",
      "issue_date": "1400/01/28",
      "file_url": "/files/document1.pdf"
    },
    {
      "id": "2",
      "title": "راهنمای استانداردهای کیفیت",
      "doc_code": "386056",
      "issue_date": "1401/05/15",
      "file_url": "/files/document2.pdf"
    },
    {
      "id": "3",
      "title": "دستورالعمل ایمنی و بهداشت کار",
      "doc_code": "HSE-001/03",
      "issue_date": "1402/02/10",
      "file_url": "/files/document3.pdf"
    }
  ]
}
```

---

### 3. Search Documents
**GET** `/api/documents/search`

Advanced search with multiple filters and Persian text normalization.

#### Query Parameters:
- `title` (optional): Search in document titles (Persian-aware)
- `doc_code` (optional): Search by document code
- `issue_date_from` (optional): Start date for date range (Jalali format: YYYY/MM/DD)
- `issue_date_to` (optional): End date for date range (Jalali format: YYYY/MM/DD)

#### Persian Text Features:
- Normalizes Arabic ی to Persian ی
- Normalizes Arabic ک to Persian ک  
- Handles half-spaces (ZWNJ) properly
- Case-insensitive search

#### Examples:

**Title Search:**
```
GET /api/documents/search?title=دستورالعمل
```

**Document Code Search:**
```
GET /api/documents/search?doc_code=TAV112
```

**Date Range Search:**
```
GET /api/documents/search?issue_date_from=1400/01/01&issue_date_to=1401/12/29
```

**Combined Search:**
```
GET /api/documents/search?title=دستورالعمل&doc_code=TAV&issue_date_from=1400/01/01
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "3",
      "title": "دستورالعمل ایمنی و بهداشت کار",
      "doc_code": "HSE-001/03",
      "issue_date": "1402/02/10",
      "file_url": "/files/document3.pdf"
    },
    {
      "id": "1",
      "title": "دستورالعمل مدیریت دانش سازمانی",
      "doc_code": "TAV112-02/00",
      "issue_date": "1400/01/28",
      "file_url": "/files/document1.pdf"
    }
  ],
  "filters": {
    "title": "دستورالعمل",
    "doc_code": null,
    "issue_date_from": null,
    "issue_date_to": null
  }
}
```

---

### 4. Get Document by ID
**GET** `/api/documents/:id`

Retrieves a specific document by its ID.

**Example:**
```
GET /api/documents/1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "title": "دستورالعمل مدیریت دانش سازمانی",
    "doc_code": "TAV112-02/00",
    "issue_date": "1400/01/28",
    "file_url": "/files/document1.pdf"
  }
}
```

---

### 5. Add Document (Admin)
**POST** `/api/admin/documents`

Adds a new document to the system. All fields are required.

**Request Body:**
```json
{
  "title": "دستورالعمل جدید",
  "doc_code": "NEW-001/01",
  "issue_date": "1402/03/15",
  "file_url": "/files/new-document.pdf"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Document added successfully",
  "data": {
    "id": "4",
    "title": "دستورالعمل جدید",
    "doc_code": "NEW-001/01",
    "issue_date": "1402/03/15",
    "file_url": "/files/new-document.pdf"
  }
}
```

**Response (Validation Error):**
```json
{
  "success": false,
  "message": "All fields are required: title, doc_code, issue_date, file_url"
}
```

**Response (Duplicate Code):**
```json
{
  "success": false,
  "message": "Document with this code already exists"
}
```

---

## Data Model

### Document Schema
```json
{
  "id": "string (UUID)",
  "title": "string (Persian text supported)",
  "doc_code": "string (unique identifier)",
  "issue_date": "string (Jalali date format: YYYY/MM/DD)",
  "file_url": "string (path to PDF file)"
}
```

---

## Error Handling

### Standard Error Response Format:
```json
{
  "success": false,
  "message": "Error description"
}
```

### Common HTTP Status Codes:
- `200` - Success
- `201` - Created (for POST requests)
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `409` - Conflict (duplicate document code)
- `500` - Internal Server Error

---

## Sample Data

The system comes with sample Persian documents for testing:

1. **دستورالعمل مدیریت دانش سازمانی** (TAV112-02/00)
2. **راهنمای استانداردهای کیفیت** (386056)
3. **دستورالعمل ایمنی و بهداشت کار** (HSE-001/03)

---

## Usage Notes

1. **Persian Text**: The search is fully Persian-aware and handles different character variations
2. **Date Format**: All dates use Jalali calendar in YYYY/MM/DD format
3. **Sorting**: Search results are sorted by issue_date in descending order (newest first)
4. **Case Sensitivity**: All text searches are case-insensitive
5. **Partial Matching**: Both title and doc_code searches support partial matching

---

## Next Steps

To integrate with a real database:

1. Set up PostgreSQL database
2. Configure Prisma with proper connection string
3. Replace the mock data with actual Prisma client
4. Add authentication middleware for admin endpoints
5. Implement file upload functionality for PDFs
6. Add full-text search capabilities for document content