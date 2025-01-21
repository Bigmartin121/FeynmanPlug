import React, { useState, useEffect } from 'react';
import { encryptData } from '../../utils/encryption';

const Settings = () => {
  const [settings, setSettings] = useState({
    apiKey: '',
    selectedModel: 'openai',
    theme: 'light',
    language: 'en'
  });

  const [status, setStatus] = useState('');

  useEffect(() => {
    // 加载已保存的设置
    chrome.storage.local.get(['apiKey', 'selectedModel', 'theme', 'language'], (result) => {
      if (result) {
        setSettings(prev => ({
          ...prev,
          ...result
        }));
      }
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 加密 API key
      const encryptedKey = await encryptData(settings.apiKey);
      
      // 保存设置
      await chrome.storage.local.set({
        apiKey: encryptedKey,
        selectedModel: settings.selectedModel,
        theme: settings.theme,
        language: settings.language
      });

      setStatus('Settings saved successfully!');
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      setStatus('Error saving settings: ' + error.message);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Settings</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            API Key
          </label>
          <input
            type="password"
            name="apiKey"
            value={settings.apiKey}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Model
          </label>
          <select
            name="selectedModel"
            value={settings.selectedModel}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="openai">OpenAI</option>
            <option value="deepseek">Deepseek</option>
            <option value="qwen">Qwen</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Theme
          </label>
          <select
            name="theme"
            value={settings.theme}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Language
          </label>
          <select
            name="language"
            value={settings.language}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="en">English</option>
            <option value="zh">中文</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Save Settings
        </button>

        {status && (
          <div className={`mt-4 p-2 rounded ${
            status.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {status}
          </div>
        )}
      </form>
    </div>
  );
};

export default Settings;
