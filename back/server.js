#!/usr/bin/env node

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// In-memory mock data
const documents = [
  {
    id: '1',
    title: 'دستورالعمل مدیریت دانش سازمانی',
    doc_code: 'TAV112-02/00',
    issue_date: '1400/01/28',
    file_url: '/files/document1.pdf',
    sections: [
      { id: 'sec-1-1', title: 'مقدمه و تعاریف', section_type: 'article' },
      { id: 'sec-1-2', title: 'فرآیند مدیریت دانش', section_type: 'article' },
      { id: 'sec-1-3', title: 'پیوست الف - فرم‌های ارزیابی', section_type: 'appendix' }
    ]
  },
  {
    id: '2',
    title: 'راهنمای استانداردهای کیفیت',
    doc_code: '386056',
    issue_date: '1401/05/15',
    file_url: '/files/document2.pdf',
    sections: [
      { id: 'sec-2-1', title: 'استاندارد ISO 9001', section_type: 'article' },
      { id: 'sec-2-2', title: 'جدول 1 - معیارهای کیفیت', section_type: 'table' }
    ]
  },
  {
    id: '3',
    title: 'دستورالعمل ایمنی و بهداشت کار',
    doc_code: 'HSE-001/03',
    issue_date: '1402/02/10',
    file_url: '/files/document3.pdf',
    sections: [
      { id: 'sec-3-1', title: 'ماده 5 - تجهیزات ایمنی', section_type: 'article' },
      { id: 'sec-3-2', title: 'پیوست ب - لیست تجهیزات', section_type: 'appendix' }
    ]
  }
];

// Middleware
app.use(cors());
app.use(express.json());

// Persian text normalization function
const normalizePersianText = (text) => {
  return text
    .replace(/ي/g, 'ی') // Arabic ی to Persian ی
    .replace(/ك/g, 'ک') // Arabic ک to Persian ک
    .replace(/\u200C/g, ' ') // Replace ZWNJ (half-space) with regular space
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'DocPower Backend API is running!',
    timestamp: new Date().toISOString()
  });
});

// Get all documents
app.get('/api/documents', (req, res) => {
  res.json({
    success: true,
    count: documents.length,
    data: documents
  });
});

// Search documents with combined search (document + section titles)
app.get('/api/documents/search', (req, res) => {
  const { title, doc_code, issue_date_from, issue_date_to } = req.query;
  
  let results = [];
  
  // Title search with Persian normalization and combined search
  if (title) {
    const normalizedTitle = normalizePersianText(title.toLowerCase());
    
    for (const doc of documents) {
      // Check document title match
      const normalizedDocTitle = normalizePersianText(doc.title.toLowerCase());
      const docTitleMatch = normalizedDocTitle.includes(normalizedTitle);
      
      if (docTitleMatch) {
        results.push({
          ...doc,
          match_type: 'document_title',
          relevance_score: 100
        });
      }
      
      // Check section title matches
      if (doc.sections) {
        const matchingSections = [];
        
        for (const section of doc.sections) {
          const normalizedSectionTitle = normalizePersianText(section.title.toLowerCase());
          if (normalizedSectionTitle.includes(normalizedTitle)) {
            matchingSections.push({
              id: section.id,
              title: section.title,
              section_type: section.section_type
            });
          }
        }
        
        if (matchingSections.length > 0) {
          results.push({
            ...doc,
            match_type: 'section_title',
            matched_sections: matchingSections,
            relevance_score: docTitleMatch ? 90 : 50
          });
        }
      }
    }
  } else {
    results = [...documents].map(doc => ({
      ...doc,
      match_type: 'document_title',
      relevance_score: 80
    }));
  }
  
  // Apply other filters
  if (doc_code) {
    results = results.filter(doc => 
      doc.doc_code.toLowerCase().includes(doc_code.toLowerCase())
    );
  }
  
  // Date range filtering
  if (issue_date_from) {
    results = results.filter(doc => doc.issue_date >= issue_date_from);
  }
  
  if (issue_date_to) {
    results = results.filter(doc => doc.issue_date <= issue_date_to);
  }
  
  // Remove duplicates and sort by relevance score then by date
  const uniqueResults = [];
  const seen = new Set();
  
  for (const result of results) {
    const key = `${result.id}-${result.match_type}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueResults.push(result);
    }
  }
  
  uniqueResults.sort((a, b) => {
    if (a.relevance_score !== b.relevance_score) {
      return b.relevance_score - a.relevance_score;
    }
    return b.issue_date.localeCompare(a.issue_date);
  });
  
  res.json({
    success: true,
    count: uniqueResults.length,
    data: uniqueResults,
    search_type: title ? 'combined' : 'filter_only',
    filters: { title, doc_code, issue_date_from, issue_date_to }
  });
});

// Add document (Admin endpoint) - now with sections support
app.post('/api/admin/documents', (req, res) => {
  const { title, doc_code, issue_date, file_url, sections } = req.body;
  
  // Validate required fields
  if (!title || !doc_code || !issue_date || !file_url) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required: title, doc_code, issue_date, file_url'
    });
  }
  
  // Validate sections if provided
  if (sections && Array.isArray(sections)) {
    for (const section of sections) {
      if (!section.title) {
        return res.status(400).json({
          success: false,
          message: 'Each section must have a title'
        });
      }
    }
  }
  
  // Check for duplicate doc_code
  if (documents.find(doc => doc.doc_code === doc_code)) {
    return res.status(409).json({
      success: false,
      message: 'Document with this code already exists'
    });
  }
  
  const newDocument = {
    id: (documents.length + 1).toString(),
    title: title.trim(),
    doc_code: doc_code.trim(),
    issue_date: issue_date.trim(),
    file_url: file_url.trim(),
    sections: sections ? sections.map((section, index) => ({
      id: `sec-${documents.length + 1}-${index + 1}`,
      title: section.title.trim(),
      section_type: section.section_type || 'section',
      order_index: section.order_index || index + 1
    })) : []
  };
  
  documents.push(newDocument);
  
  res.status(201).json({
    success: true,
    message: 'Document added successfully',
    data: newDocument
  });
});

// Get document by ID
app.get('/api/documents/:id', (req, res) => {
  const { id } = req.params;
  const document = documents.find(doc => doc.id === id);
  
  if (!document) {
    return res.status(404).json({
      success: false,
      message: 'Document not found'
    });
  }
  
  res.json({
    success: true,
    data: document
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 DocPower Backend Server is running on http://localhost:${PORT}`);
  console.log(`📚 Document Search API: http://localhost:${PORT}/api/documents/search`);
  console.log(`🔧 Admin API: http://localhost:${PORT}/api/admin/documents`);
  console.log(`💊 Health Check: http://localhost:${PORT}/health`);
  console.log(`\n📋 Sample Search URLs:`);
  console.log(`   Title search: http://localhost:${PORT}/api/documents/search?title=دستورالعمل`);
  console.log(`   Code search: http://localhost:${PORT}/api/documents/search?doc_code=TAV112`);
  console.log(`   Date range: http://localhost:${PORT}/api/documents/search?issue_date_from=1400/01/01&issue_date_to=1401/12/29`);
});