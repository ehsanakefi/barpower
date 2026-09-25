# DocPower Backend Architecture

## Overview

This document describes the refactored backend architecture supporting multi-mode document search with chunking and optional GPU-accelerated retrieval.

## Document Ingestion Pipeline

### Flow
1. **Upload**: User uploads `.docx` file via `POST /api/documents/upload`
2. **Text Extraction**: `mammoth` extracts raw text from Word document
3. **Normalization**: Persian text normalized (Arabic→Persian chars, remove diacritics, ZWNJ handling)
4. **Paragraph Splitting**: Document split into paragraph units
5. **Multi-Layer Chunking**: Three chunk types created:
   - **Paragraph chunks**: 1:1 mapping, for simple search and display
   - **Retrieval chunks**: 300-1500 chars, 1-paragraph overlap, for classical IR
   - **RAG chunks**: 800-2500 chars, 1-paragraph overlap, for vector search
6. **Storage**: All chunks stored in database with metadata

### Chunk Data Model

```typescript
interface Chunk {
  id: string;
  documentId: string;
  chunkIndex: number;
  type: 'paragraph' | 'retrieval' | 'rag';
  text: string;
  normalizedText: string;
  paragraphStart: number;
  paragraphEnd: number;
  charLength: number;
  metadata: {
    fileName: string;
    uploadDate: string;
  };
  embedding?: number[];  // Future: vector embeddings
}
```

## Search Modes

### Unified Search Endpoint

`GET /api/search?q=QUERY&mode=MODE`

Modes: `simple`, `ir`, `rag`

### Mode: Simple

- **Chunks Used**: Paragraph chunks
- **Strategy**: Exact/regex text search on normalized text
- **Implementation**: Local database query (no external API)
- **Use Case**: Quick exact-match search, snippet highlighting

### Mode: IR (Information Retrieval)

- **Chunks Used**: Retrieval chunks
- **Strategy**: Classical IR (BM25 / TF-IDF)
- **Implementation**: 
  - Primary: Python GPU API (if configured)
  - Fallback: Local simplified BM25-like scoring
- **Use Case**: Ranked retrieval without deep semantic understanding

### Mode: RAG (Retrieval-Augmented Generation)

- **Chunks Used**: RAG chunks
- **Strategy**: Vector search with embeddings
- **Implementation**:
  - Primary: Python GPU API (embedding + vector search)
  - Fallback: Local text-based search
- **Use Case**: Semantic search, context for LLM prompts

## Python GPU Service Integration

### Configuration

Environment variables:
```
PYTHON_API_ENABLED=true
PYTHON_API_URL=http://localhost:8000
PYTHON_API_TIMEOUT=30000
```

### API Contract

**Request**:
```json
POST /search
{
  "query": "نرمال‌شده متن",
  "mode": "ir" | "rag",
  "chunks": [
    {
      "id": "chunk-123",
      "text": "...",
      "normalizedText": "..."
    }
  ]
}
```

**Response**:
```json
{
  "results": [
    {
      "chunkId": "chunk-123",
      "score": 0.87
    }
  ]
}
```

### Fallback Behavior

- Connection failure → local fallback
- Timeout → local fallback
- API disabled → local fallback only

## Service Layer Architecture

### Core Services

- **DocumentIngestionService**: Orchestrates ingestion pipeline
- **SimpleSearchService**: Paragraph-level text search
- **IRSearchService**: BM25/TF-IDF retrieval with GPU fallback
- **RAGSearchService**: Vector search with GPU fallback
- **PythonSearchService**: HTTP client for GPU API

### Utilities

- **textNormalizer**: Persian/Arabic normalization, paragraph splitting
- **chunker**: Multi-layer chunking engine
- **docxExtractor**: Word document text extraction

## File Upload

### Endpoint

`POST /api/documents/upload`

Content-Type: `multipart/form-data`

Fields:
- `file`: .docx file (max 50MB)
- `title`: Document title
- `doc_code`: Document code
- `issue_date`: Jalali date string

### Response

```json
{
  "success": true,
  "message": "Document uploaded and processed successfully",
  "data": {
    "document": { "id": "...", "title": "...", ... },
    "ingestion": {
      "documentId": "...",
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

## Existing Functionality Preserved

- Legacy search endpoint: `/api/documents/search` (title-based search)
- Document CRUD: `/api/documents` (GET, POST, PUT, DELETE)
- Section-based search still functional via legacy endpoint
- Authentication routes unchanged

## Database Schema

### New Table: Chunks

```sql
CREATE TABLE chunks (
  id UUID PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index INTEGER,
  type VARCHAR(20),  -- 'paragraph', 'retrieval', 'rag'
  text TEXT,
  normalized_text TEXT,
  paragraph_start INTEGER,
  paragraph_end INTEGER,
  char_length INTEGER,
  metadata JSONB,
  embedding VECTOR(1536),  -- Optional: for future vector search
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_chunks_document ON chunks(document_id);
CREATE INDEX idx_chunks_type ON chunks(type);
CREATE INDEX idx_chunks_normalized ON chunks USING gin(to_tsvector('persian', normalized_text));
```

## Future Enhancements

1. Store embeddings in `chunks.embedding` field
2. Local vector search with pgvector
3. Streaming responses for large result sets
4. Background job queue for ingestion
5. Incremental re-chunking on document updates
6. Multi-language support beyond Persian/Arabic

## Testing

Run type check:
```bash
npm run build
```

Start backend (requires dependencies installed):
```bash
npm install
npm run dev
```

Test search modes:
```bash
# Simple search
curl "http://localhost:3001/api/search?q=مدیریت&mode=simple"

# IR search
curl "http://localhost:3001/api/search?q=مدیریت&mode=ir"

# RAG search
curl "http://localhost:3001/api/search?q=مدیریت&mode=rag"
```
