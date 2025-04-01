let pausedDownloadId = null;

chrome.downloads.onCreated.addListener((downloadItem) => {
  chrome.downloads.pause(downloadItem.id, () => {
    console.log(`Download paused: ${downloadItem.url}`);
    pausedDownloadId = downloadItem.id;

    chrome.windows.create({
      url: chrome.runtime.getURL("popup.html"),
      type: "popup",
      width: 400,
      height: 300
    });
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "confirmDownload" && pausedDownloadId !== null) {
    if (message.confirm) {
      chrome.downloads.resume(pausedDownloadId, () => {
        console.log(`Download resumed: ID ${pausedDownloadId}`);
      });
    } else {
      chrome.downloads.cancel(pausedDownloadId, () => {
        console.log(`Download canceled: ID ${pausedDownloadId}`);
      });
    }
    pausedDownloadId = null;
  }
});
