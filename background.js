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


// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//   if (changeInfo.status === "complete") {

//     chrome.tabs.sendMessage(tabId, { action: "runScan" }, (response) => {
//       if (chrome.runtime.lastError) {
//         console.error("❌ Message sending error:", chrome.runtime.lastError.message);
//       } else {
//         console.log("✅ Response from settings.js:", response.status);
//       }
//     });
//   }
// });



// chrome.tabs.onUpdated.addListener(() => {
//   scanCurrentTab();
//   scanBlockedSites();
//   console.error("scan run")
// });

// chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//   chrome.tabs.sendMessage(tabs[0].id, { action: "scanCurrentTab" }, (response) => {
//       console.error("Done"); // Output: "Function executed!"
//   });
// });
