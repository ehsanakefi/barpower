export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'user';
}

export interface Document {
  id: string;
  title: string;
  doc_code: string;
  issue_date: Date;
  file_url: string;
}

export interface SearchQuery {
  title?: string;
  metadata?: string;
}