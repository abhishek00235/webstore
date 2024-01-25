chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "queryAI") {
      fetch('http://localhost:8080/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: request.message })
      })
      .then(response => response.text()) // Use response.text() for a string response
      .then(data => sendResponse({ data: data }))
      .catch(error => sendResponse({ error: error }));
    }
    return true;
  });