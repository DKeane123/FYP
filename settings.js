document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('scanButton').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentUrl = tabs[0].url;
      chrome.runtime.sendMessage({
        action: 'scanUrl',
        url: currentUrl
      }, (response) => {
        document.getElementById('result').innerText = JSON.stringify(response, null, 2);
      });
    });
  });
});
