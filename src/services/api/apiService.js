// API endpoints
const API_ENDPOINTS = {
  openai: 'https://api.openai.com/v1/chat/completions',
  deepseek: 'https://api.deepseek.com/v1/chat/completions',
  qwen: 'https://api.qwen.ai/v1/chat/completions'
};

// 模型配置
const MODEL_CONFIGS = {
  openai: {
    model: 'gpt-4',
    temperature: 0.7,
    max_tokens: 2000
  },
  deepseek: {
    model: 'deepseek-chat',
    temperature: 0.7,
    max_tokens: 2000
  },
  qwen: {
    model: 'qwen-max',
    temperature: 0.7,
    max_tokens: 2000
  }
};

import { sessionManager } from '../chat/sessionManager';

export const sendMessage = async ({
  message,
  role,
  promptTemplate,
  apiKey,
  model
}) => {
  const config = MODEL_CONFIGS[model];
  const endpoint = API_ENDPOINTS[model];

  if (!config || !endpoint) {
    throw new Error('Invalid model selected');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  };

  // 确保会话管理器已初始化
  await sessionManager.init();

  // 获取最近的对话历史
  const recentMessages = await sessionManager.getRecentMessages();

  // 构建完整的系统提示词
  const systemPrompt = promptTemplate.replace('{message}', message);

  // 构建消息列表，确保系统提示词在最前面
  const messages = [
    {
      role: 'system',
      content: systemPrompt
    }
  ];

  // 添加历史消息，但跳过系统消息
  recentMessages
    .filter(msg => msg.role !== 'system')
    .forEach(msg => messages.push(msg));

  // 添加当前用户消息
  messages.push({
    role: 'user',
    content: message
  });

  const body = {
    ...config,
    messages: messages
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    // 保存用户消息和助手回复到会话历史
    await sessionManager.addMessage('user', message);
    await sessionManager.addMessage('assistant', assistantMessage);

    return assistantMessage;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
