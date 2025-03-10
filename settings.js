function scanCurrentTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentUrl = tabs[0].url; // Get the current tab's URL
    const apiKey = "7972d4ed633e9da46d75938a2ea97ada1bede5fb72c6e99ffde2436277f8a3d9";
    const encodedUrl = btoa(currentUrl).replace(/=*$/, ''); // Encode URL in Base64 without padding

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
        console.log('Scan Results:', data); // Process the API response
        document.getElementById('result').innerText = JSON.stringify(data, null, 2); // Display results
      })
      .catch((error) => {
        console.error('Error:', error);
        document.getElementById('result').innerText = `Error: ${error.message}`; // Display error
      });
  });
}

// Example: Call this function when your button is clicked
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('scanButton').addEventListener('click', scanCurrentTab);
});
