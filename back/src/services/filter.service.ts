interface FilterOptions {
  documentCode?: string;
  approvalDate?: string;
  issuingBodies: string[];
  technicalDomains: string[];
  searchQuery?: string;
}

class FilterService {
  async filterDocuments(filters: FilterOptions) {
    // In production, this would query the actual database
    // For now, return mock filtered results
    
    // Mock documents
    const allDocuments = [
      {
        id: '1',
        title: 'دستورالعمل مدیریت دانش فنی',
        doc_code: 'TAV112-02/00',
        issue_date: '1402/11/15',
        issuingBody: 'tavanir',
        technicalDomain: 'knowledge',
        file_url: '/uploads/doc1.docx'
      },
      {
        id: '2',
        title: 'استاندارد سیستم‌های اطلاعات جغرافیایی',
        doc_code: 'TAV125-06/01',
        issue_date: '1402/08/22',
        issuingBody: 'technical',
        technicalDomain: 'gis',
        file_url: '/uploads/doc2.docx'
      },
      {
        id: '3',
        title: 'راهنمای تخمین بار شبکه',
        doc_code: 'TAV118-08/02',
        issue_date: '1402/05/10',
        issuingBody: 'research',
        technicalDomain: 'load',
        file_url: '/uploads/doc3.docx'
      }
    ];
    
    let filtered = allDocuments;
    
    // Apply filters
    if (filters.documentCode) {
      filtered = filtered.filter(doc => 
        doc.doc_code.toLowerCase().includes(filters.documentCode!.toLowerCase())
      );
    }
    
    if (filters.approvalDate) {
      filtered = filtered.filter(doc => doc.issue_date === filters.approvalDate);
    }
    
    if (filters.issuingBodies.length > 0) {
      filtered = filtered.filter(doc => 
        filters.issuingBodies.includes(doc.issuingBody)
      );
    }
    
    if (filters.technicalDomains.length > 0) {
      filtered = filtered.filter(doc => 
        filters.technicalDomains.includes(doc.technicalDomain)
      );
    }
    
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(query) ||
        doc.doc_code.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }
  
  async getFilterOptions() {
    return {
      issuingBodies: [
        { id: 'tavanir', label: 'توانیر', labelEn: 'Tavanir' },
        { id: 'council', label: 'شورای اداری توانیر', labelEn: 'Administrative Council' },
        { id: 'technical', label: 'کمیته فنی توانیر', labelEn: 'Technical Committee' },
        { id: 'research', label: 'بخش تحقیقات توانیر', labelEn: 'Research Division' },
      ],
      technicalDomains: [
        { id: 'gis', label: 'سیستم اطلاعات جغرافیایی', labelEn: 'GIS' },
        { id: 'climate', label: 'آب و هوا', labelEn: 'Climate' },
        { id: 'load', label: 'تخمین بار', labelEn: 'Load Estimation' },
        { id: 'knowledge', label: 'مدیریت دانش', labelEn: 'Knowledge Management' },
        { id: 'reliability', label: 'قابلیت اطمینان', labelEn: 'Reliability' },
      ]
    };
  }
}

export const filterService = new FilterService();
