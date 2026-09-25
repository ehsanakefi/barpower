interface Message {
  role: 'user' | 'assistant';
  message: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  messages: Message[];
}

// Mock conversation storage
const conversations: Map<string, Conversation> = new Map();

class AIService {
  async processMessage(message: string, conversationId?: string): Promise<{ reply: string; conversationId: string }> {
    // Generate or use existing conversation ID
    const convId = conversationId || this.generateConversationId();
    
    // Get or create conversation
    let conversation = conversations.get(convId);
    if (!conversation) {
      conversation = { id: convId, messages: [] };
      conversations.set(convId, conversation);
    }
    
    // Add user message
    conversation.messages.push({
      role: 'user',
      message,
      timestamp: new Date().toISOString()
    });
    
    // Generate AI response (mock - in production, call actual AI service)
    const reply = await this.generateResponse(message);
    
    // Add assistant message
    conversation.messages.push({
      role: 'assistant',
      message: reply,
      timestamp: new Date().toISOString()
    });
    
    return { reply, conversationId: convId };
  }
  
  async getConversationHistory(conversationId: string): Promise<Message[]> {
    const conversation = conversations.get(conversationId);
    return conversation ? conversation.messages : [];
  }
  
  private generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private async generateResponse(message: string): Promise<string> {
    // Mock AI responses based on keywords
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('ضریب همزمانی') || lowerMessage.includes('همزمانی')) {
      return 'ضریب همزمانی (Simultaneity Factor) پارامتری است که در طراحی شبکه‌های توزیع برق استفاده می‌شود و نشان می‌دهد که چه درصدی از بارهای متصل به شبکه به طور همزمان در حداکثر ظرفیت خود کار می‌کنند. این ضریب معمولاً کمتر از 1 است و به بهینه‌سازی ظرفیت تجهیزات کمک می‌کند.';
    }
    
    if (lowerMessage.includes('توزیع گامبل') || lowerMessage.includes('gumbel')) {
      return 'توزیع گامبل (Gumbel Distribution) یک توزیع آماری است که برای مدل‌سازی مقادیر حداکثری استفاده می‌شود. در مهندسی برق، این توزیع برای تحلیل رویدادهای حدی مانند حداکثر بار شبکه یا پیک مصرف انرژی کاربرد دارد.';
    }
    
    if (lowerMessage.includes('سند') || lowerMessage.includes('document')) {
      return 'برای جستجوی اسناد فنی، می‌توانید از قسمت جستجو استفاده کنید. سیستم از سه روش جستجو پشتیبانی می‌کند: جستجوی ساده، جستجوی IR کلاسیک، و جستجوی مبتنی بر RAG. آیا می‌خواهید درباره هر کدام توضیح بیشتری بدهم؟';
    }
    
    if (lowerMessage.includes('قابلیت اطمینان') || lowerMessage.includes('reliability')) {
      return 'قابلیت اطمینان (Reliability) در سیستم‌های قدرت به توانایی شبکه برای تأمین برق مستمر و با کیفیت مناسب اشاره دارد. این شاخص شامل دو بخش اصلی است: کفایت (Adequacy) و امنیت (Security). برای بهبود قابلیت اطمینان، استانداردها و دستورالعمل‌های مختلفی توسط توانیر تدوین شده است.';
    }
    
    // Default response
    return 'سوال شما دریافت شد. این یک پاسخ نمونه از سیستم است. در نسخه واقعی، این پاسخ از مدل زبانی پیشرفته تولید می‌شود و بر اساس اسناد فنی موجود در پایگاه داده پاسخ داده می‌شود. آیا می‌توانید سوال خود را با جزئیات بیشتری مطرح کنید؟';
  }
}

export const aiService = new AIService();
