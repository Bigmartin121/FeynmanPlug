// 监听插件安装事件
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // 初始化存储默认设置
    chrome.storage.local.set({
      theme: 'light',
      language: 'en',
      selectedModel: 'openai',
      customPrompts: {}
    });
  }
});

// 监听来自 content script 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_SETTINGS') {
    chrome.storage.local.get(null, (settings) => {
      sendResponse({ settings });
    });
    return true; // 保持消息通道开放
  }
});
