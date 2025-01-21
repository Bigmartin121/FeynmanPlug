// 监听来自插件的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_PAGE_CONTENT') {
    // 获取当前页面内容
    const pageContent = document.body.innerText;
    sendResponse({ content: pageContent });
  }
  return true;
});