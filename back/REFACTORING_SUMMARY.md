# DocPower Refactoring Summary

## Overview

The DocPower backend has been refactored to implement a clean, layered architecture for document ingestion, chunking, indexing, and multi-mode search with optional GPU acceleration.

## What Was Changed

### ✅ New Backend Files Created

#### Utilities
- `src/utils/textNormalizer.ts` - Persian/Arabic text normalization and paragraph splitting
- `src/utils/chunker.ts` - Multi-layer chunking engine (paragraph, retrieval, RAG chunks)
- `src/utils/docxExtractor.ts` - Word document text extraction using mammoth
- `src/types/express.d.ts` - TypeScript type extensions for multer

#### Models
- `src/models/Chunk.ts` - Chunk data model interface

#### Services
- `src/services/documentIngestion.service.ts` - Document ingestion pipeline orchestrator
- `src/services/pythonSearch.service.ts` - HTTP client for Python GPU API with fallback
- `src/services/simpleSearch.service.ts` - Simple text search on paragraph chunks
- `src/services/irSearch.service.ts` - IR search with BM25/TF-IDF (GPU or local)
- `src/services/ragSearch.service.ts` - RAG vector search (GPU or local fallback)

#### Controllers & Routes
- `src/controllers/unifiedSearch.controller.ts` - Unified search controller supporting 3 modes
- `src/routes/unifiedSearch.routes.ts` - Route definitions for unified search

### ✅ Modified Backend Files

#### Database
- `src/services/mock-prisma.ts` - Added Chunk interface and CRUD operations

#### Document Management
- `src/controllers/document.controller.ts` - Added uploadDocument handler with multer, integrated ingestion pipeline, cleanup on delete
- `src/routes/document.routes.ts` - Added `/upload` route with file upload middleware

#### Application
- `src/app.ts` - Added unified search route `/api/search`
- `package.json` - Added dependencies: axios, mammoth, multer, @types/multer
- `tsconfig.json` - Added typeRoots for custom type definitions

#### Bug Fixes
- `src/controllers/auth.controller.ts` - Fixed imports and error handling
- `src/routes/auth.routes.ts` - Removed missing validation middleware
- `src/services/irSearch.service.ts` - Fixed TypeScript type inference

### ✅ Frontend Changes

#### Search Page
- `my-app/src/app/user/search/page.tsx` - Complete rewrite with:
  - Search mode selector (Simple, IR, RAG)
  - Real-time API integration
  - Loading states and error handling
  - Result display with scores
  - Mode descriptions

## Architecture Highlights

### Multi-Layer Chunking System

Each document is split into three types of chunks:

1. **Paragraph Chunks** (1:1 mapping)
   - Purpose: Simple search and display
   - No overlap
   - Used by: Simple search mode

2. **Retrieval Chunks** (300-1500 chars)
   - Purpose: Classical IR ranking
   - 1-paragraph overlap
   - Used by: IR search mode

3. **RAG Chunks** (800-2500 chars)
   - Purpose: Vector search and LLM context
   - 1-paragraph overlap
   - Used by: RAG search mode

### Search Mode Flow

```
User Query → Normalize Text → Select Chunk Type → Search Strategy → Rank Results
```

**Simple Mode**:
```
Query → Paragraph Chunks → Local Text Match → Snippet Extraction → Results
```

**IR Mode**:
```
Query → Retrieval Chunks → Python API (BM25) OR Local Fallback → Ranked Results
```

**RAG Mode**:
```
Query → RAG Chunks → Python API (Vector Search) OR Local Fallback → Top-K Results
```

### Python GPU Service Integration

- **Purpose**: Offload compute-intensive IR and vector search to GPU-enabled Python service
- **Protocol**: REST API over HTTP
- **Fallback**: Automatic local fallback if API unavailable
- **Configuration**: Environment variables control enable/disable

## API Endpoints

### New Endpoints

#### Unified Search
```
GET /api/search?q={query}&mode={mode}

Modes: simple, ir, rag

Response:
{
  "success": true,
  "searchType": "Information Retrieval (BM25/TF-IDF)",
  "mode": "ir",
  "query": "مدیریت دانش",
  "count": 5,
  "results": [
    {
      "chunkId": "chunk-123",
      "documentId": "doc-456",
      "fileName": "دستورالعمل مدیریت دانش",
      "text": "...",
      "snippet": "...مدیریت دانش...",
      "score": 0.87
    }
  ]
}
```

#### Document Upload
```
POST /api/documents/upload
Content-Type: multipart/form-data

Fields:
  - file: .docx file
  - title: string
  - doc_code: string
  - issue_date: string (Jalali)

Response:
{
  "success": true,
  "message": "Document uploaded and processed successfully",
  "data": {
    "document": { "id": "...", ... },
    "ingestion": {
      "paragraphCount": 42,
      "chunkCount": 126,
      "chunksByType": {
        "paragraph": 42,
        "retrieval": 45,
        "rag": 39
      }
    }
  }
}
```

### Preserved Endpoints

All existing endpoints remain functional:
- `POST /api/auth/login` - Authentication
- `POST /api/auth/register` - User registration
- `GET /api/documents` - List documents
- `GET /api/documents/:id` - Get document by ID
- `POST /api/documents` - Create document (legacy, without ingestion)
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document (now also deletes chunks)
- `GET /api/documents/search` - Legacy search (title-based)

## Text Normalization

Persian/Arabic text normalization includes:

1. **Character Unification**
   - `ي` (Arabic) → `ی` (Persian)
   - `ك` (Arabic) → `ک` (Persian)
   - `ؤ` → `و`
   - `إ`, `أ` → `ا`
   - `ة` → `ه`

2. **Diacritic Removal**
   - Remove all tashkeel marks (U+064B to U+065F, U+0670)

3. **Whitespace Normalization**
   - ZWNJ (half-space, U+200C) → regular space
   - Multiple spaces → single space
   - Trim leading/trailing whitespace

## Environment Variables

Add to `.env`:

```env
# Python GPU API Configuration
PYTHON_API_ENABLED=true
PYTHON_API_URL=http://localhost:8000
PYTHON_API_TIMEOUT=30000

# Existing variables
DATABASE_URL=postgresql://...
JWT_SECRET=...
PORT=3001
NODE_ENV=development
```

## Installation & Setup

### Backend

```bash
cd docpower-backend
npm install
npm run dev
```

### Frontend

Add to `my-app/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

```bash
cd my-app
npm install
npm run dev
```

## Testing

### Upload a Document

```bash
curl -X POST http://localhost:3001/api/documents/upload \
  -F "file=@document.docx" \
  -F "title=دستورالعمل مدیریت دانش" \
  -F "doc_code=TAV112-02/00" \
  -F "issue_date=1402/11/15"
```

### Search Examples

```bash
# Simple search
curl "http://localhost:3001/api/search?q=مدیریت&mode=simple"

# IR search
curl "http://localhost:3001/api/search?q=مدیریت&mode=ir"

# RAG search
curl "http://localhost:3001/api/search?q=مدیریت&mode=rag"
```

## Python GPU Service (Separate Implementation Required)

The backend expects a Python service with this interface:

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class SearchRequest(BaseModel):
    query: str
    mode: str  # 'ir' or 'rag'
    chunks: list[dict]

class SearchResponse(BaseModel):
    results: list[dict]  # [{"chunkId": "...", "score": 0.87}, ...]

@app.post("/search")
async def search(request: SearchRequest) -> SearchResponse:
    if request.mode == "ir":
        # Implement BM25/TF-IDF ranking
        pass
    elif request.mode == "rag":
        # Implement vector search with embeddings
        pass
    return SearchResponse(results=[...])
```

## What Was NOT Changed

- Database schema (still using mock Prisma client)
- Authentication logic
- User management
- Frontend UI components (except search page)
- Admin dashboard
- Legacy search functionality

## Benefits of This Architecture

1. **Separation of Concerns**: Clear layering (controllers → services → utils)
2. **Modularity**: Each search mode is an independent service
3. **Flexibility**: Easy to add new search modes or chunk types
4. **Scalability**: GPU offloading for compute-intensive operations
5. **Resilience**: Automatic fallback when external services unavailable
6. **Maintainability**: Clean interfaces, reusable utilities
7. **Type Safety**: Full TypeScript coverage with proper interfaces

## Future Enhancements

1. Replace mock-prisma with real Prisma + PostgreSQL
2. Add pgvector for local vector search
3. Store embeddings in database
4. Implement streaming responses
5. Add background job queue for large uploads
6. Support more document formats (PDF, TXT)
7. Add caching layer for frequent queries
8. Implement incremental chunking updates
9. Add search analytics and logging
10. Multi-language support beyond Persian

## Migration Notes

When moving from mock database to real PostgreSQL:

1. Run Prisma migrations to create `chunks` table
2. Add indexes on `document_id`, `type`, `normalized_text`
3. Consider adding `embedding` column with pgvector type
4. Update mock-prisma imports to real PrismaClient
5. Test ingestion pipeline with real .docx files
6. Verify chunk counts and sizes match expectations

## Conclusion

This refactoring provides a solid foundation for building a sophisticated document search platform with multiple retrieval strategies, Persian text support, and optional GPU acceleration. The architecture is clean, maintainable, and ready for production deployment after replacing the mock database with a real PostgreSQL instance.
