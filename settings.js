function scanCurrentTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentUrl = tabs[0].url; // Get the current tab's URL
    //const currentUrl = "http://117.206.73.36:35280/bin.sh"; // Get the current tab's URL
    const apiKey = "";
    const encodedUrl = btoa(currentUrl).replace(/=*$/, ''); // Encode URL in Base64 without padding
    const safeURL = currentUrl.replace(/^http/, "hxxp") // Replace http with hxxp to prevent accidental clicks

    localStorage.setItem('url', safeURL); // Store the URL in localStorage for later use
    
    let TotalScans = localStorage.getItem('totalScans')
    if (!TotalScans) {
      TotalScans = 0;
    } else {
      TotalScans = parseInt(TotalScans);
    }
    TotalScans++; // Increment the total number of scans
    localStorage.setItem('totalScans', TotalScans); // Store the total number of scans in localStorage

    // Call VirusTotal API
    fetch(`https://www.virustotal.com/api/v3/urls/${encodedUrl}`, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'x-apikey': apiKey
      }
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Resource not found');
      }
      return response.json();
    })
    .then((data) => {
      if (data && data.data && data.data.attributes && data.data.attributes.last_analysis_stats) {
        const reputationScore = data.data.attributes.last_analysis_stats.malicious; // Safely access reputation score
        if (reputationScore > 0) {
          chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.tabs.remove(tabs[0].id);
        });
        window.open('redirect.html', '_blank');
        window.location.href = 'redirect.html';
          let maliciousScans = localStorage.getItem('maliciousScans');
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

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('scanButton').addEventListener('click', scanCurrentTab);
});


function queryURL(targetUrl, queryUrl) {
  fetch(targetUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.text(); 
    })
    .then(data => {
      const rows = data.split("\n");

      rows.forEach(row => {
        if (row.startsWith("#")) return;

        const columns = row.split("\t");

        if (columns[1] === queryUrl) {
          document.getElementById('result2').innerText = 
            `Match found:\nID: ${columns[0]}\nURL: ${columns[1]}\nThreat: ${columns[2]}\nTags: ${columns[3]}`;
        }
      });
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
}

const datasetUrl = "http://13.53.125.170/csv.txt"; // Replace with your dataset URL
const targetQueryUrl = "http://117.206.73.36:35280/bin.sh"; // Replace with your query URL

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('scanButton2').addEventListener('click', queryURL);
});