// 会话管理服务
class ChatSession {
  constructor(id) {
    this.id = id;
    this.messages = [];
    this.createdAt = Date.now();
    this.updatedAt = Date.now();
  }

  addMessage(role, content) {
    const message = {
      role,
      content,
      timestamp: Date.now()
    };
    this.messages.push(message);
    this.updatedAt = Date.now();
    return message;
  }

  getRecentMessages(count = 5) {
    return this.messages.slice(-count);
  }

  clear() {
    this.messages = [];
    this.updatedAt = Date.now();
  }
}

class SessionManager {
  constructor() {
    this.currentSession = null;
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;

    // 尝试恢复最近的会话
    const { currentSessionId } = await chrome.storage.local.get('currentSessionId');
    if (currentSessionId) {
      await this.loadSession(currentSessionId);
    } else {
      await this.createNewSession();
    }

    this.initialized = true;
  }

  async createNewSession() {
    const sessionId = `session_${Date.now()}`;
    this.currentSession = new ChatSession(sessionId);
    await this.saveCurrentSession();
    await chrome.storage.local.set({ currentSessionId: sessionId });
    return this.currentSession;
  }

  async loadSession(sessionId) {
    const result = await chrome.storage.local.get(sessionId);
    if (result[sessionId]) {
      const sessionData = result[sessionId];
      this.currentSession = new ChatSession(sessionId);
      this.currentSession.messages = sessionData.messages;
      this.currentSession.createdAt = sessionData.createdAt;
      this.currentSession.updatedAt = sessionData.updatedAt;
    } else {
      await this.createNewSession();
    }
    return this.currentSession;
  }

  async saveCurrentSession() {
    if (!this.currentSession) return;
    await chrome.storage.local.set({
      [this.currentSession.id]: {
        messages: this.currentSession.messages,
        createdAt: this.currentSession.createdAt,
        updatedAt: this.currentSession.updatedAt
      }
    });
  }

  async addMessage(role, content) {
    if (!this.currentSession) {
      await this.createNewSession();
    }
    const message = this.currentSession.addMessage(role, content);
    await this.saveCurrentSession();
    return message;
  }

  async getRecentMessages(count = 5) {
    if (!this.currentSession) {
      await this.createNewSession();
    }
    return this.currentSession.getRecentMessages(count);
  }

  async clearCurrentSession() {
    if (this.currentSession) {
      this.currentSession.clear();
      await this.saveCurrentSession();
    }
  }

  async listSessions() {
    const result = await chrome.storage.local.get(null);
    return Object.entries(result)
      .filter(([key]) => key.startsWith('session_'))
      .map(([id, data]) => ({
        id,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        messageCount: data.messages.length
      }))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async deleteSession(sessionId) {
    await chrome.storage.local.remove(sessionId);
    if (this.currentSession && this.currentSession.id === sessionId) {
      await this.createNewSession();
    }
  }
}

export const sessionManager = new SessionManager();
