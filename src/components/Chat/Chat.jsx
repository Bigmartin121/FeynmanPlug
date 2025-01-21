import React, { useState, useEffect, useRef } from 'react';
import MarkdownPreview from '@uiw/react-markdown-preview';
import { decryptData } from '../../utils/encryption';
import { getPromptTemplate } from '../../services/prompts/promptManager';
import { sendMessage } from '../../services/api/apiService';
import { sessionManager } from '../../services/chat/sessionManager';

const roleLabels = {
  student: '学生',
  teacher: '教师',
  mentor: '导师'
};

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentRole, setCurrentRole] = useState('student');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 初始化会话和加载历史消息
  useEffect(() => {
    const initSession = async () => {
      await sessionManager.init();
      const history = await sessionManager.getRecentMessages(50); // 加载最近50条消息
      setMessages(history);
    };
    initSession();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '48px';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(scrollHeight, 150) + 'px';
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim()) return;

    try {
      setIsLoading(true);
      
      const settings = await chrome.storage.local.get(['apiKey', 'selectedModel']);
      const decryptedKey = decryptData(settings.apiKey);
      const promptTemplate = await getPromptTemplate(currentRole);

      // 添加用户消息到界面
      const userMessage = {
        role: 'user',
        content: input,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage]);
      setInput('');

      if (textareaRef.current) {
        textareaRef.current.style.height = '48px';
      }

      const response = await sendMessage({
        message: input,
        role: currentRole,
        promptTemplate,
        apiKey: decryptedKey,
        model: settings.selectedModel
      });

      // 添加助手回复到界面
      const aiMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      // 添加错误消息到界面
      setMessages(prev => [...prev, {
        role: 'system',
        content: '错误: ' + error.message,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = async () => {
    await sessionManager.clearCurrentSession();
    setMessages([]);
  };

  return (
    <div style={{ height: '600px', display: 'flex', flexDirection: 'column', background: 'white' }}>
      {/* 角色选择和操作栏 */}
      <div style={{ 
        padding: '8px', 
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <select
          value={currentRole}
          onChange={(e) => setCurrentRole(e.target.value)}
          style={{
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #e5e7eb',
            width: '120px'
          }}
        >
          {Object.entries(roleLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        
        <button
          onClick={handleClearChat}
          style={{
            padding: '8px 16px',
            borderRadius: '4px',
            border: 'none',
            background: '#ef4444',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          清空对话
        </button>
      </div>

      {/* 消息列表 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div
              style={{
                maxWidth: '80%',
                padding: '12px',
                borderRadius: '8px',
                background: message.role === 'user' 
                  ? '#2563eb' 
                  : message.role === 'assistant'
                  ? '#f3f4f6'
                  : '#fee2e2',
                color: message.role === 'user' ? 'white' : 'black'
              }}
            >
              {message.role === 'assistant' ? (
                <MarkdownPreview
                  source={message.content}
                  style={{ background: 'transparent' }}
                />
              ) : (
                <div style={{ fontSize: '14px' }}>{message.content}</div>
              )}
              <div style={{ 
                fontSize: '12px', 
                opacity: 0.7, 
                marginTop: '4px'
              }}>
                {new Date(message.timestamp).toLocaleTimeString('zh-CN')}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div style={{ 
        padding: '16px',
        borderTop: '1px solid #e5e7eb',
        background: 'white'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入您的问题..."
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #e5e7eb',
              resize: 'none',
              minHeight: '48px',
              maxHeight: '150px',
              overflow: 'auto'
            }}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            style={{
              padding: '0 16px',
              borderRadius: '4px',
              whiteSpace: 'nowrap',
              background: isLoading ? '#9ca3af' : '#2563eb',
              color: 'white',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? '发送中...' : '发送'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
