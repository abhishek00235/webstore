const chatContainer = document.getElementById('chatContainer');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const toggleSidebarIcon = document.getElementById('toggleSidebar');

// Function to update the UI based on sidebar state
function updateUIForSidebar(isSidebarEnabled) {
    if (isSidebarEnabled) {
        document.body.classList.add('sidebar-enabled');
    } else {
        document.body.classList.remove('sidebar-enabled');
    }
}

// Function to handle the icon click event
function handleSidebarToggle() {
    chrome.storage.local.get('isSidebarEnabled', (result) => {
        const isSidebarEnabled = !(result.isSidebarEnabled || false);
        chrome.storage.local.set({ isSidebarEnabled }); // Save state in local storage
        updateUIForSidebar(isSidebarEnabled);
    });
}

// Event listener for the icon click event
toggleSidebarIcon.addEventListener('click', handleSidebarToggle);

// Function to initialize the UI based on stored state
function initializeUI() {
    chrome.storage.local.get({ isSidebarEnabled: false }, (result) => {
        const isSidebarEnabled = result.isSidebarEnabled;
        updateUIForSidebar(isSidebarEnabled);
    });
}


// Call initializeUI when the popup is loaded
initializeUI();

// Event listener for sending a message
sendButton.addEventListener('click', sendMessage);

// Event listener for Enter key on userInput
userInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Function to append a message to the chat container
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

// Function to check if the response is a code block
function isCodeResponse(text) {
    return text.startsWith('function') || text.includes('{') || text.includes(';');
}

// Function to send a message to the background script
function sendMessage() {
    const message = userInput.value;
    userInput.value = '';

    if (message.trim()) {
        appendMessage(message, 'user');
        appendMessage("AI is typing...", 'ai', true);

        chrome.runtime.sendMessage({ type: "queryAI", message: message }, response => {
            chatContainer.removeChild(chatContainer.lastChild);
            if (response.error) {
                appendMessage(`Error: ${response.error}`, 'ai');
            } else {
                appendMessage(response.data, 'ai');
            }
        });
    }
}
