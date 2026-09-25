type LogType = 'info' | 'success' | 'warning' | 'error';

interface LogEntry {
  id: string;
  type: LogType;
  message: string;
  user: string;
  timestamp: string;
  details?: string;
}

// Mock logs data
let mockLogs: LogEntry[] = [
  {
    id: '1',
    type: 'success',
    message: 'سند جدید با موفقیت بارگذاری شد',
    user: 'احمد محمدی',
    timestamp: '1403/11/19 - 14:32',
    details: 'کد سند: TAV112-02/00',
  },
  {
    id: '2',
    type: 'info',
    message: 'کاربر جدید به سیستم اضافه شد',
    user: 'مدیر سیستم',
    timestamp: '1403/11/19 - 13:15',
    details: 'نام کاربری: m.rezaei',
  },
  {
    id: '3',
    type: 'warning',
    message: 'تلاش ناموفق برای دسترسی به سند محرمانه',
    user: 'علی کریمی',
    timestamp: '1403/11/19 - 12:45',
    details: 'کد سند: TAV125-06/01',
  },
  {
    id: '4',
    type: 'success',
    message: 'بک‌آپ خودکار با موفقیت انجام شد',
    user: 'سیستم',
    timestamp: '1403/11/19 - 02:00',
    details: 'حجم: 2.3 GB',
  },
  {
    id: '5',
    type: 'error',
    message: 'خطا در پردازش OCR',
    user: 'سیستم',
    timestamp: '1403/11/18 - 16:22',
    details: 'فایل: document_scan_054.pdf',
  },
  {
    id: '6',
    type: 'info',
    message: 'سند ویرایش شد',
    user: 'سارا احمدی',
    timestamp: '1403/11/18 - 15:10',
    details: 'کد سند: TAV118-08/02',
  },
  {
    id: '7',
    type: 'success',
    message: 'Embeddings جدید تولید شد',
    user: 'سیستم',
    timestamp: '1403/11/18 - 14:55',
    details: 'تعداد: 15 سند',
  },
  {
    id: '8',
    type: 'warning',
    message: 'فضای ذخیره‌سازی به 80% رسید',
    user: 'سیستم',
    timestamp: '1403/11/18 - 10:30',
    details: 'باقیمانده: 200 GB',
  },
  {
    id: '9',
    type: 'info',
    message: 'کاربر از سیستم خارج شد',
    user: 'مهدی رضایی',
    timestamp: '1403/11/18 - 09:15',
  },
  {
    id: '10',
    type: 'success',
    message: 'سند منتشر شد',
    user: 'احمد محمدی',
    timestamp: '1403/11/17 - 16:40',
    details: 'کد سند: TAV120-03/00',
  },
];

class LogsService {
  async getLogs(type?: string, limit?: number): Promise<LogEntry[]> {
    let logs = mockLogs;
    
    if (type && type !== 'all') {
      logs = logs.filter(log => log.type === type);
    }
    
    if (limit) {
      logs = logs.slice(0, limit);
    }
    
    return logs;
  }

  async getLogStats() {
    const totalEvents = mockLogs.length;
    const todayEvents = mockLogs.filter(log => log.timestamp.includes('1403/11/19')).length;
    const warnings = mockLogs.filter(log => log.type === 'warning').length;
    const errors = mockLogs.filter(log => log.type === 'error').length;

    return {
      totalEvents: totalEvents + 1224, // Add some extra for realistic count
      todayEvents: todayEvents + 35,
      warnings: warnings + 10,
      errors: errors + 2
    };
  }

  async createLog(data: { type: LogType; message: string; user: string; details?: string }): Promise<LogEntry> {
    const newLog: LogEntry = {
      id: String(mockLogs.length + 1),
      type: data.type,
      message: data.message,
      user: data.user,
      timestamp: new Date().toLocaleDateString('fa-IR') + ' - ' + new Date().toLocaleTimeString('fa-IR'),
      details: data.details
    };
    
    mockLogs.unshift(newLog); // Add to beginning
    return newLog;
  }
}

export const logsService = new LogsService();
