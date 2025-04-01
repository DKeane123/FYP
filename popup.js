document.getElementById('confirm').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: "confirmDownload", confirm: true });
    window.close();
  });
  
  document.getElementById('cancel').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: "confirmDownload", confirm: false });
    window.close();
  });