function updateTextBox() {
    const URL = localStorage.getItem('url');
    const URLString = document.getElementById('recentdetectionsURL');
    if (URL) {
        URLString.innerText = URL;
    } else {
        URLString.innerText = "No Recent Scans";
    }

    const TotalScans = localStorage.getItem('totalScans');
    const TotalScansString = document.getElementById('totalScans');
    if (TotalScans) {
        TotalScansString.innerText = TotalScans;
    } else {
        TotalScansString.innerText = "0";
    }

    const ReputationScore = localStorage.getItem('reputationScore');
    const ReputationScoreString = document.getElementById('reputation');
    if (ReputationScore) {
        ReputationScoreString.innerText = `Reputation Score: ${ReputationScore}`;
    } else {
        ReputationScoreString.innerText = "";
    }

    const MaliciousScans = localStorage.getItem('maliciousScans');
    const MaliciousScansString = document.getElementById('maliciousScans');
    if (MaliciousScans) {
        MaliciousScansString.innerText = MaliciousScans;
    } else {
        MaliciousScansString.innerText = "0";
    }
}

updateTextBox();

setInterval(updateTextBox, 5000);

