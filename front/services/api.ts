const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://192.168.80.30:3001";
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
  message?: string;
  error?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiService {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;

    // Load token from localStorage if available
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("token");
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("token", token);
      } else {
        localStorage.removeItem("token");
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP ${response.status}`,
        };
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }

  // Auth endpoints
  async login(username: string, password: string) {
    const response = await this.request<{ token: string; user: any }>(
      "/api/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ username, password }),
      },
    );

    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async register(username: string, password: string, email: string) {
    return this.request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, password, email }),
    });
  }

  logout() {
    this.setToken(null);
  }

  // Document endpoints
  async getDocuments() {
    return this.request<any[]>("/api/documents", {
      method: "GET",
    });
  }

  async getDocumentById(id: string) {
    return this.request<any>(`/api/documents/${id}`, {
      method: "GET",
    });
  }

  async deleteDocument(id: string) {
    return this.request(`/api/documents/${id}`, {
      method: "DELETE",
    });
  }

  // async uploadDocument(formData: FormData,
  //   onProgress?: (percent: number) => void
  // ) : Promise<any> {
  //   const headers: HeadersInit = {};
  //   if (this.token) {
  //     headers['Authorization'] = `Bearer ${this.token}`;
  //   }

  //   try {
  //     const response = await fetch(`${this.baseUrl}/api/documents/upload`, {
  //       method: 'POST',
  //       headers,
  //       body: formData,
  //     });

  //     return await response.json();
  //   } catch (error) {
  //     return {
  //       success: false,
  //       error: error instanceof Error ? error.message : 'Upload failed',
  //     };
  //   }
  // }

  async uploadDocument(
    formData: FormData,
    onProgress?: (percent: number) => void,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open("POST", `${this.baseUrl}/api/documents/upload`);

      if (this.token) {
        xhr.setRequestHeader("Authorization", `Bearer ${this.token}`);
      }

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };

      xhr.onload = () => {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch {
          reject({ success: false, error: "Invalid server response" });
        }
      };

      xhr.onerror = () => {
        reject({ success: false, error: "Upload failed" });
      };

      xhr.send(formData);
    });
  }

  // Search endpoints
  async search(query: string, mode: "simple" | "ir" | "rag" = "simple") {
    return this.request<any[]>(
      `/api/search?q=${encodeURIComponent(query)}&mode=${mode}`,
      { method: "GET" },
    );
  }

  async legacySearch(filters: {
    title?: string;
    doc_code?: string;
    issue_date_from?: string;
    issue_date_to?: string;
  }) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    return this.request<any[]>(`/api/documents/search?${params.toString()}`, {
      method: "GET",
    });
  }

  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  }) {
    const query = new URLSearchParams();

    if (params?.page) query.append("page", params.page.toString());

    if (params?.limit) query.append("limit", params.limit.toString());

    if (params?.search) query.append("search", params.search);

    if (params?.role) query.append("role", params.role);

    if (params?.status) query.append("status", params.status);

    return this.request<any[]>(`/api/users?${query.toString()}`) as Promise<
      PaginatedResponse<any>
    >;
  }

  async getUserById(id: string) {
    return this.request<any>(`/api/users/${id}`, {
      method: "GET",
    });
  }

  async createUser(data: {
    name: string;
    username: string;
    password: string;
    role: string;
  }) {
    return this.request("/api/users", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateUserRole(id: string, role: string) {
    return this.request(`/api/users/${id}/role`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    });
  }

  async toggleUserStatus(id: string) {
    return this.request(`/api/users/${id}/toggle-status`, {
      method: "PUT",
    });
  }

  async getUserStats() {
    return this.request<any>("/api/users/stats", {
      method: "GET",
    });
  }

  // Logs endpoints
  async getLogs(type?: string, limit?: number) {
    const params = new URLSearchParams();
    if (type) params.append("type", type);
    if (limit) params.append("limit", limit.toString());

    return this.request<any[]>(`/api/logs?${params.toString()}`, {
      method: "GET",
    });
  }

  async getLogStats() {
    return this.request<any>("/api/logs/stats", {
      method: "GET",
    });
  }

  // Notifications endpoints
  async getNotifications(userId: string, unreadOnly: boolean = false) {
    const params = new URLSearchParams();
    params.append("userId", userId);
    if (unreadOnly) params.append("unreadOnly", "true");

    return this.request<any[]>(`/api/notifications?${params.toString()}`, {
      method: "GET",
    });
  }

  async markNotificationAsRead(id: string) {
    return this.request(`/api/notifications/${id}/read`, {
      method: "PUT",
    });
  }

  async markAllNotificationsAsRead(userId: string) {
    return this.request("/api/notifications/read-all", {
      method: "PUT",
      body: JSON.stringify({ userId }),
    });
  }

  async getUnreadNotificationCount(userId: string) {
    return this.request<{ count: number }>(
      `/api/notifications/unread-count?userId=${userId}`,
      { method: "GET" },
    );
  }

  // AI Assistant endpoints
  async sendAIMessage(message: string, conversationId?: string) {
    return this.request<{ reply: string; conversationId: string }>(
      "/api/ai/chat",
      {
        method: "POST",
        body: JSON.stringify({ message, conversationId }),
      },
    );
  }

  async getConversationHistory(conversationId: string) {
    return this.request<any[]>(`/api/ai/conversations/${conversationId}`, {
      method: "GET",
    });
  }

  // Filter endpoints
  async getFilteredDocuments(filters: {
    documentCode?: string;
    approvalDate?: string;
    issuingBodies?: string[];
    technicalDomains?: string[];
    searchQuery?: string;
  }) {
    const params = new URLSearchParams();
    if (filters.documentCode)
      params.append("documentCode", filters.documentCode);
    if (filters.approvalDate)
      params.append("approvalDate", filters.approvalDate);
    if (filters.issuingBodies && filters.issuingBodies.length > 0) {
      params.append("issuingBodies", filters.issuingBodies.join(","));
    }
    if (filters.technicalDomains && filters.technicalDomains.length > 0) {
      params.append("technicalDomains", filters.technicalDomains.join(","));
    }
    if (filters.searchQuery) params.append("q", filters.searchQuery);

    return this.request<any[]>(`/api/filter/documents?${params.toString()}`, {
      method: "GET",
    });
  }

  async getFilterOptions() {
    return this.request<any>("/api/filter/options", {
      method: "GET",
    });
  }
}

export const api = new ApiService(API_BASE_URL);
export default api;
