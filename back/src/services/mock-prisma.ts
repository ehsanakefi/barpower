// Mock Prisma Client for development/testing
// This will be replaced with actual Prisma client once database is set up

export interface Document {
  id: string;
  title: string;
  doc_code: string;
  issue_date: string;
  file_url: string;
  created_at?: Date;
  updated_at?: Date;
  sections?: DocumentSection[];
}

export interface DocumentSection {
  id: string;
  document_id: string;
  title: string;
  section_type?: string;
  order_index?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface Chunk {
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
  embedding?: number[];
  createdAt?: Date;
}

export interface User {
  id: number;
  username: string;
  password: string;
  role: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// In-memory mock data store
let documents: Document[] = [
  {
    id: '1',
    title: 'دستورالعمل مدیریت دانش سازمانی',
    doc_code: 'TAV112-02/00',
    issue_date: '1400/01/28',
    file_url: '/files/document1.pdf',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '2', 
    title: 'راهنمای استانداردهای کیفیت',
    doc_code: '386056',
    issue_date: '1401/05/15',
    file_url: '/files/document2.pdf',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '3',
    title: 'دستورالعمل ایمنی و بهداشت کار',
    doc_code: 'HSE-001/03',
    issue_date: '1402/02/10',
    file_url: '/files/document3.pdf',
    created_at: new Date(),
    updated_at: new Date()
  }
];

let documentSections: DocumentSection[] = [
  // Document 1 sections
  {
    id: 'sec-1-1',
    document_id: '1',
    title: 'مقدمه و تعاریف',
    section_type: 'article',
    order_index: 1,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 'sec-1-2',
    document_id: '1',
    title: 'فرآیند مدیریت دانش',
    section_type: 'article',
    order_index: 2,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 'sec-1-3',
    document_id: '1',
    title: 'پیوست الف - فرم‌های ارزیابی',
    section_type: 'appendix',
    order_index: 3,
    created_at: new Date(),
    updated_at: new Date()
  },
  // Document 2 sections
  {
    id: 'sec-2-1',
    document_id: '2',
    title: 'استاندارد ISO 9001',
    section_type: 'article',
    order_index: 1,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 'sec-2-2',
    document_id: '2',
    title: 'جدول 1 - معیارهای کیفیت',
    section_type: 'table',
    order_index: 2,
    created_at: new Date(),
    updated_at: new Date()
  },
  // Document 3 sections
  {
    id: 'sec-3-1',
    document_id: '3',
    title: 'ماده 5 - تجهیزات ایمنی',
    section_type: 'article',
    order_index: 1,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 'sec-3-2',
    document_id: '3',
    title: 'پیوست ب - لیست تجهیزات',
    section_type: 'appendix',
    order_index: 2,
    created_at: new Date(),
    updated_at: new Date()
  }
];

let chunks: Chunk[] = [];

let users: User[] = [
  {
    id: 1,
    username: 'admin',
    password: '$2b$10$X7EXAMPLE', // This would be a hashed password
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Mock Prisma Client
export class MockPrismaClient {
  document = {
    create: async ({ data, include }: { data: Omit<Document, 'id' | 'created_at' | 'updated_at'>, include?: any }) => {
      const newDocument: Document = {
        id: (documents.length + 1).toString(),
        ...data,
        created_at: new Date(),
        updated_at: new Date()
      };
      documents.push(newDocument);
      
      // If sections are provided, create them
      if (data.sections && Array.isArray(data.sections)) {
        for (let i = 0; i < data.sections.length; i++) {
          const sectionData = data.sections[i];
          const newSection: DocumentSection = {
            id: `sec-${newDocument.id}-${documentSections.length + i + 1}`,
            document_id: newDocument.id,
            title: sectionData.title,
            section_type: sectionData.section_type,
            order_index: sectionData.order_index || i + 1,
            created_at: new Date(),
            updated_at: new Date()
          };
          documentSections.push(newSection);
        }
      }
      
      if (include?.sections) {
        newDocument.sections = documentSections.filter(s => s.document_id === newDocument.id);
      }
      
      return newDocument;
    },

    findMany: async ({ where = {}, select = {}, orderBy = {}, include = {} }: any = {}) => {
      let results = [...documents];

      // Apply where filters
      if (where.title?.contains) {
        const searchTerm = where.title.contains.toLowerCase();
        results = results.filter(doc => 
          doc.title.toLowerCase().includes(searchTerm)
        );
      }

      if (where.doc_code?.contains) {
        const searchTerm = where.doc_code.contains.toLowerCase();
        results = results.filter(doc => 
          doc.doc_code.toLowerCase().includes(searchTerm)
        );
      }

      if (where.issue_date?.gte) {
        results = results.filter(doc => doc.issue_date >= where.issue_date.gte);
      }

      if (where.issue_date?.lte) {
        results = results.filter(doc => doc.issue_date <= where.issue_date.lte);
      }

      // Handle OR conditions for combined search
      if (where.OR) {
        const orResults = new Set<Document>();
        
        for (const condition of where.OR) {
          // Document title search
          if (condition.title?.contains) {
            const searchTerm = condition.title.contains.toLowerCase();
            const titleMatches = documents.filter(doc => 
              doc.title.toLowerCase().includes(searchTerm)
            );
            titleMatches.forEach(doc => orResults.add(doc));
          }
          
          // Section title search
          if (condition.sections?.some?.title?.contains) {
            const searchTerm = condition.sections.some.title.contains.toLowerCase();
            const sectionMatches = documentSections.filter(section =>
              section.title.toLowerCase().includes(searchTerm)
            );
            
            const parentDocs = sectionMatches.map(section => 
              documents.find(doc => doc.id === section.document_id)
            ).filter(Boolean) as Document[];
            
            parentDocs.forEach(doc => orResults.add(doc));
          }
        }
        
        results = Array.from(orResults);
      }

      // Apply sorting
      if (orderBy.issue_date === 'desc') {
        results.sort((a, b) => b.issue_date.localeCompare(a.issue_date));
      }

      // Include sections if requested
      if (include?.sections) {
        results = results.map(doc => ({
          ...doc,
          sections: documentSections.filter(s => s.document_id === doc.id)
        }));
      }

      return results;
    },

    findUnique: async ({ where, include }: { where: { id: string }, include?: any }) => {
      const doc = documents.find(doc => doc.id === where.id);
      if (!doc) return null;
      
      if (include?.sections) {
        return {
          ...doc,
          sections: documentSections.filter(s => s.document_id === doc.id)
        };
      }
      
      return doc;
    },

    update: async ({ where, data, include }: { where: { id: string }, data: Partial<Document>, include?: any }) => {
      const index = documents.findIndex(doc => doc.id === where.id);
      if (index === -1) throw new Error('Document not found');
      
      documents[index] = {
        ...documents[index],
        ...data,
        updated_at: new Date()
      };
      
      if (include?.sections) {
        documents[index].sections = documentSections.filter(s => s.document_id === documents[index].id);
      }
      
      return documents[index];
    },

    delete: async ({ where }: { where: { id: string } }) => {
      const index = documents.findIndex(doc => doc.id === where.id);
      if (index === -1) throw new Error('Document not found');
      
      // Delete associated sections
      documentSections = documentSections.filter(s => s.document_id !== where.id);
      
      const deleted = documents.splice(index, 1)[0];
      return deleted;
    }
  };

  documentSection = {
    create: async ({ data }: { data: Omit<DocumentSection, 'id' | 'created_at' | 'updated_at'> }) => {
      const newSection: DocumentSection = {
        id: `sec-${data.document_id}-${documentSections.length + 1}`,
        ...data,
        created_at: new Date(),
        updated_at: new Date()
      };
      documentSections.push(newSection);
      return newSection;
    },

    createMany: async ({ data }: { data: Omit<DocumentSection, 'id' | 'created_at' | 'updated_at'>[] }) => {
      const newSections = data.map((sectionData, index) => ({
        id: `sec-${sectionData.document_id}-${documentSections.length + index + 1}`,
        ...sectionData,
        created_at: new Date(),
        updated_at: new Date()
      }));
      
      documentSections.push(...newSections);
      return { count: newSections.length };
    },

    findMany: async ({ where = {} }: any = {}) => {
      let results = [...documentSections];
      
      if (where.document_id) {
        results = results.filter(section => section.document_id === where.document_id);
      }
      
      if (where.title?.contains) {
        const searchTerm = where.title.contains.toLowerCase();
        results = results.filter(section => 
          section.title.toLowerCase().includes(searchTerm)
        );
      }
      
      return results;
    },

    delete: async ({ where }: { where: { id: string } }) => {
      const index = documentSections.findIndex(section => section.id === where.id);
      if (index === -1) throw new Error('Section not found');
      
      return documentSections.splice(index, 1)[0];
    },

    deleteMany: async ({ where }: { where: { document_id: string } }) => {
      const initialLength = documentSections.length;
      documentSections = documentSections.filter(section => section.document_id !== where.document_id);
      return { count: initialLength - documentSections.length };
    }
  };

  chunk = {
    create: async ({ data }: { data: Omit<Chunk, 'id' | 'createdAt'> }) => {
      const newChunk: Chunk = {
        id: `chunk-${chunks.length + 1}`,
        ...data,
        createdAt: new Date(),
      };
      chunks.push(newChunk);
      return newChunk;
    },

    createMany: async ({ data }: { data: Omit<Chunk, 'id' | 'createdAt'>[] }) => {
      const newChunks = data.map((chunkData, index) => ({
        id: `chunk-${chunks.length + index + 1}`,
        ...chunkData,
        createdAt: new Date(),
      }));
      
      chunks.push(...newChunks);
      return { count: newChunks.length };
    },

    findMany: async ({ where = {} }: any = {}) => {
      let results = [...chunks];
      
      if (where.documentId) {
        results = results.filter(chunk => chunk.documentId === where.documentId);
      }
      
      if (where.type) {
        results = results.filter(chunk => chunk.type === where.type);
      }

      if (where.normalizedText?.contains) {
        const searchTerm = where.normalizedText.contains.toLowerCase();
        results = results.filter(chunk => 
          chunk.normalizedText.toLowerCase().includes(searchTerm)
        );
      }
      
      return results;
    },

    deleteMany: async ({ where }: { where: { documentId: string } }) => {
      const initialLength = chunks.length;
      chunks = chunks.filter(chunk => chunk.documentId !== where.documentId);
      return { count: initialLength - chunks.length };
    },
  };

  async $connect() {
    console.log('Mock Prisma Client connected');
  }

  user = {
    create: async (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newUser: User = {
        id: users.length + 1,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      users.push(newUser);
      return newUser;
    },

    findByUsername: async (username: string) => {
      return users.find(u => u.username === username) || null;
    },

    findById: async (id: number) => {
      return users.find(u => u.id === id) || null;
    },

    findMany: async () => {
      return users;
    },

    update: async (id: number, data: Partial<User>) => {
      const index = users.findIndex(u => u.id === id);
      if (index === -1) throw new Error('User not found');
      
      users[index] = {
        ...users[index],
        ...data,
        updatedAt: new Date()
      };
      return users[index];
    },

    delete: async (id: number) => {
      const index = users.findIndex(u => u.id === id);
      if (index === -1) throw new Error('User not found');
      return users.splice(index, 1)[0];
    }
  };
}

export const PrismaClient = MockPrismaClient;
