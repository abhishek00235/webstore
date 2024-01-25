const chatContainer = document.getElementById('chatContainer');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');

function appendMessage(text, sender, isLoading = false) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender === 'user' ? 'userMessage' : 'aiMessage');

    if (isLoading) {
        messageDiv.innerHTML = `<i class="fa fa-spinner fa-spin"></i> ${text}`;
    } else if (isCodeResponse(text)) {
        const codeElement = document.createElement('pre');
        codeElement.textContent = text;
        messageDiv.appendChild(codeElement);
    } else {
        messageDiv.textContent = text;
    }
    
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function isCodeResponse(text) {
    // Simple check for code (improve this based on your use case)
    return text.startsWith('function') || text.includes('{') || text.includes(';');
}



function sendMessage() {
    const message = userInput.value;
    userInput.value = '';

    if (message.trim()) {
        appendMessage(message, 'user');
        appendMessage("AI is typing...", 'ai', true);

        chrome.runtime.sendMessage({ type: "queryAI", message: message }, response => {
            chatContainer.removeChild(chatContainer.lastChild); // remove the loading message
            if (response.error) {
                appendMessage(`Error: ${response.error}`, 'ai');
            } else {
                appendMessage(response.data, 'ai');
            }
        });
    }
}


sendButton.addEventListener('click', sendMessage);

// Event listener for Enter key on userInput
userInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) { // If Enter is pressed without Shift
        e.preventDefault(); // Prevent default action (like entering a new line)
        sendMessage(); // Send the message
    }
});
