import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import '../assets/styles/index.css';
import Chat from '../components/Chat/Chat';
import Settings from '../components/Settings/Settings';

const Popup = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    // 检查是否已配置 API key
    chrome.storage.local.get(['apiKey', 'selectedModel'], (result) => {
      setIsConfigured(!!result.apiKey && !!result.selectedModel);
    });
  }, []);

  return (
    <div className="w-96 h-[600px] bg-white dark:bg-gray-800">
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-xl font-bold">Feynman Learning Assistant</h1>
      </header>

      <nav className="bg-gray-100 dark:bg-gray-700 p-2">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded ${
              activeTab === 'chat'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-600'
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-600'
            }`}
          >
            Settings
          </button>
        </div>
      </nav>

      <main className="p-4">
        {!isConfigured && activeTab === 'chat' ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Please configure your API settings first
            </p>
            <button
              onClick={() => setActiveTab('settings')}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Go to Settings
            </button>
          </div>
        ) : (
          <>
            {activeTab === 'chat' && <Chat />}
            {activeTab === 'settings' && <Settings />}
          </>
        )}
      </main>
    </div>
  );
};

const root = createRoot(document.getElementById('root'));
root.render(<Popup />);
