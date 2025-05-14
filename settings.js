function scanCurrentTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    //const currentUrl = tabs[0].url; // Get the current tab's URL
    const currentUrl = "http://117.206.73.36:35280/bin.sh";
    const VTapiKey = "7972d4ed633e9da46d75938a2ea97ada1bede5fb72c6e99ffde2436277f8a3d9"; 
    const encodedUrl = btoa(currentUrl).replace(/=*$/, '');
    const safeURL = currentUrl.replace(/^http/, "hxxp") // Replace http with hxxp to prevent accidental clicks
    localStorage.setItem('url', safeURL); // Store the URL in localStorage
    let TotalScans = localStorage.getItem('totalScans') // Get the total number of scans from localStorage
    if (!TotalScans) {
      TotalScans = 0;
    } else {
      TotalScans = parseInt(TotalScans);
    }
    TotalScans++; // Increment the total number of scans
    localStorage.setItem('totalScans', TotalScans);  // Store the updated total number of scans in localStorage

    // Call VirusTotal API
    fetch(`https://www.virustotal.com/api/v3/urls/${encodedUrl}`, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'x-apikey': VTapiKey
      }
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Resource not found');
      }
      return response.json();
    })
    
    .then((data) => {
      // Check if the response structure is as expected
      if (data && data.data && data.data.attributes && data.data.attributes.last_analysis_stats) {
        const reputationScore = data.data.attributes.last_analysis_stats.malicious; // Safely access reputation score
        // Check if the reputation score is greater than 0
        if (reputationScore > 0) {
          chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.tabs.remove(tabs[0].id); // Close the current tab
        });
        // Open a new tab with the redirect URL
        window.open('redirect.html', '_blank');
        window.location.href = 'redirect.html';
          let maliciousScans = localStorage.getItem('maliciousScans'); // Get the number of malicious scans from localStorage and update it
          if (!maliciousScans) {
            maliciousScans = 0;
            localStorage.setItem('maliciousScans', maliciousScans);
          } else {
            maliciousScans++
            maliciousScans = parseInt(maliciousScans);
            localStorage.setItem('maliciousScans', maliciousScans);
          }
        }
        console.log('Reputation Score:', reputationScore);
        document.getElementById('result').innerText = `Reputation Score: ${reputationScore}`;
        localStorage.setItem('reputationScore', reputationScore); // Store the reputation score
      } else {
        console.error('Unexpected response structure:', data); // Log structure for debugging
        document.getElementById('result').innerText = 'Error: Unexpected response structure';
      }
    })
    .catch((error) => { 
      document.getElementById('result').innerText = `Error: ${error.message}`;
    });    
  });
}

function scanBlockedSites() {
  fetch("http://51.21.224.130/blocked.txt")
      .then(response => response.text())
      .then(text => {
          let blockedSites = text.split("\n").map(site => site.trim().toLowerCase());
          document.getElementById('result').innerText = blockedSites.length + " blocked sites found.";

          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
              if (tabs[0]) { // Ensure a tab is present
                  let currentUrl = tabs[0].url.toLowerCase();
                  let detectedSite = null;

                  for (let i = 0; i < blockedSites.length; i++) {
                      if (currentUrl.includes(blockedSites[i])) {
                          detectedSite = blockedSites[i]; // Store the matched site
                          chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                            chrome.tabs.remove(tabs[0].id); // Close the current tab
                          });
                        // Open a new tab with the redirect URL
                          window.open('redirect.html', '_blank');
                          window.location.href = 'redirect.html';
                          console.error("malicious ",currentUrl);
                          break;
                      }
                  }
                  document.getElementById('resultPage').innerText = 
                      detectedSite ? `Blocked site detected: ${detectedSite} (URL: ${currentUrl})` : `No match found`;
              }
          });
      })
      .catch(error => console.error("Error fetching blocked sites:", error));
}

function scanWebpage() {
  const pageText = document.body.innerText;

  // Regex for URLs
  const urlRegex = /\bhttps?:\/\/[^\s/$.?#].[^\s]*/gi;
  const foundUrls = pageText.match(urlRegex) || [];
  //const foundUrls = ["http://117.206.73.36:35280/bin.sh"]

  // Regex for IP addresses
  const ipRegex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
  const foundIps = pageText.match(ipRegex) || [];
  //const foundIps = ["92.118.39.61"]

  // Scan extracted URLs and IPs using VirusTotal
  foundUrls.forEach(url => checkVirusTotal(url, "url"));
  foundIps.forEach(ip => checkVirusTotal(ip, "ip_addresse"));
}

function checkVirusTotal(value, type) {
  const VIRUSTOTAL_API_KEY = "7972d4ed633e9da46d75938a2ea97ada1bede5fb72c6e99ffde2436277f8a3d9";
  const encodedValue = type === "url" ? btoa(value) : value;

  fetch(`https://www.virustotal.com/api/v3/${type}s/${encodedValue}`, {
    method: "GET",
    headers: { "x-apikey": VIRUSTOTAL_API_KEY }
  })
  .then(response => response.json())
  .then(data => {
    
    const analysisStats = data.data.attributes.last_analysis_stats;
    const maliciousCount = analysisStats.malicious;

    if (maliciousCount > 0) {
    console.error("malicious ",value);
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.remove(tabs[0].id); // Close the current tab
    });
    // Open a new tab with the redirect URL
    window.open('redirect.html', '_blank');
    window.location.href = 'redirect.html';
    } else {
      console.error("safe ",value);
    }
  })
  .catch(error => console.error(`Error checking ${type} on VirusTotal:`, error));
}

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('scanButton').addEventListener('click', scanCurrentTab);
});

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('scanButton2').addEventListener('click', scanBlockedSites);
});

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('scanPageButton').addEventListener('click', scanWebpage);
});


// document.addEventListener('DOMContentLoaded', () => {
//   const keywords = ['decline', 'reject', 'no', 'deny', 'disagree'];

//   const DenyCookie = () => {
//     const allElements = document.querySelectorAll('button, a, div, span');
//     allElements.forEach(element => {
//       keywords.forEach(keyword => {
//         if (element.textContent.toLowerCase().includes(keyword)) {
//           element.click();
//         }
//       });
//     });
//   };

//   findAndClickButton();

//   const observer = new MutationObserver(() => {
//     findAndClickButton();
//   });
//   observer.observe(document.body, { childList: true, subtree: true, attributes: true });
// });

// function queryURL(targetUrl, queryUrl) {
//   fetch(targetUrl)
//     .then(response => {
//       if (!response.ok) {
//         throw new Error(`HTTP error! Status: ${response.status}`);
//       }
//       return response.text(); 
//     })
//     .then(data => {
//       const rows = data.split("\n");

//       rows.forEach(row => {
//         if (row.startsWith("#")) return;

//         const columns = row.split("\t");

//         if (columns[1] === queryUrl) {
//           document.getElementById('result2').innerText = 
//             `Match found:\nID: ${columns[0]}\nURL: ${columns[1]}\nThreat: ${columns[2]}\nTags: ${columns[3]}`;
//         }
//       });
//     })
//     .catch(error => {
//       console.error('Error fetching data:', error);
//     });
// }

// const datasetUrl = "http://13.53.125.170/csv.txt";
// const targetQueryUrl = "http://117.206.73.36:35280/bin.sh";