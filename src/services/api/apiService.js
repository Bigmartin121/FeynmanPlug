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

  // 构建完整的 prompt
  const fullPrompt = promptTemplate.replace('{message}', message)
                                 .replace('{role}', role);

  const body = {
    ...config,
    messages: [
      {
        role: 'user',
        content: fullPrompt
      }
    ]
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
    return data.choices[0].message.content;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
