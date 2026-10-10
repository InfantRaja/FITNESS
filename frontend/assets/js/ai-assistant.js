/**
 * FitTrack - AI Fitness & Nutrition Assistant (ai-assistant.js)
 */

let isAwaitingResponse = false;

document.addEventListener('DOMContentLoaded', () => {
  loadChatHistory();
  setupChatHandlers();
  setupPromptChips();
});

// Load previous chat history from backend
async function loadChatHistory() {
  const container = document.getElementById('chatMessages');
  if (!container) return;

  try {
    const res = await apiRequest('/ai/history');
    const messages = res.data || [];

    if (messages.length > 0) {
      container.innerHTML = '';
      messages.forEach((msg) => {
        appendMessage(msg.role, msg.content, false);
      });
      scrollToBottom();
    } else {
      // Show default welcome message
      renderDefaultWelcome();
    }
  } catch (err) {
    console.warn('Could not load history:', err.message);
    renderDefaultWelcome();
  }
}

function renderDefaultWelcome() {
  const container = document.getElementById('chatMessages');
  if (!container) return;

  container.innerHTML = `
    <div class="chat-bubble-wrap assistant">
      <div class="chat-avatar">🤖</div>
      <div class="chat-bubble">
        <div class="chat-header-name">FitTrack AI Coach</div>
        <div class="chat-text">
          Hello! I'm your personal <strong>FitTrack Fitness & Nutrition Assistant</strong>. 
          <br><br>
          I have access to your daily targets and fitness profile. You can ask me about:
          <ul>
            <li>Personalized meal planning (including South Indian & Tamil Nadu foods like Idli, Dosa, Sambar, Sundal, Eggs, etc.)</li>
            <li>Calorie calculations & protein optimization</li>
            <li>Customized beginner workout routines & exercise form</li>
            <li>Pre- and post-workout nutrition, recovery, and hydration</li>
          </ul>
          Click any of the suggested questions below or type your question to get started!
        </div>
        <div class="chat-time">Just now</div>
      </div>
    </div>
  `;
}

// Setup input submission & keyboard Enter
function setupChatHandlers() {
  const form = document.getElementById('chatInputForm');
  const input = document.getElementById('chatInput');
  const clearBtn = document.getElementById('clearChatBtn');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleSendMessage();
    });
  }

  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', async () => {
      if (!confirm('Clear all conversation history?')) return;
      try {
        await apiRequest('/ai/history', { method: 'DELETE' });
        showToast('Chat history cleared.', 'success');
        renderDefaultWelcome();
      } catch (err) {
        showToast('Failed to clear history.', 'error');
      }
    });
  }
}

// Handle sending message to backend
async function handleSendMessage(presetText = null) {
  if (isAwaitingResponse) return;

  const input = document.getElementById('chatInput');
  const messageText = presetText || (input ? input.value.trim() : '');

  if (!messageText) return;

  if (input && !presetText) input.value = '';

  // Append user message to UI
  appendMessage('user', messageText);
  scrollToBottom();

  // Show typing indicator
  showTypingIndicator();
  isAwaitingResponse = true;

  try {
    const res = await apiRequest('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message: messageText }),
    });

    removeTypingIndicator();
    isAwaitingResponse = false;

    if (res && res.reply) {
      appendMessage('assistant', res.reply);
    } else {
      appendMessage('assistant', 'I apologize, I could not generate a response right now. Please try again.');
    }
  } catch (err) {
    removeTypingIndicator();
    isAwaitingResponse = false;
    appendMessage(
      'assistant',
      `⚠️ Could not reach the AI service: ${err.message || 'Please check your connection and try again.'}`
    );
  } finally {
    scrollToBottom();
  }
}

// Append message bubble to chat container
function appendMessage(role, content, shouldAnimate = true) {
  const container = document.getElementById('chatMessages');
  if (!container) return;

  const isUser = role === 'user';
  const bubbleWrap = document.createElement('div');
  bubbleWrap.className = `chat-bubble-wrap ${isUser ? 'user' : 'assistant'}`;

  const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const formattedContent = formatMarkdown(content);

  bubbleWrap.innerHTML = `
    <div class="chat-avatar">${isUser ? '👤' : '🤖'}</div>
    <div class="chat-bubble">
      <div class="chat-header-name">${isUser ? 'You' : 'FitTrack AI Coach'}</div>
      <div class="chat-text">${formattedContent}</div>
      <div class="chat-time">${timeStr}</div>
    </div>
  `;

  container.appendChild(bubbleWrap);
}

// Typing Indicator
function showTypingIndicator() {
  const container = document.getElementById('chatMessages');
  if (!container) return;

  const indicator = document.createElement('div');
  indicator.id = 'typingIndicator';
  indicator.className = 'chat-bubble-wrap assistant';
  indicator.innerHTML = `
    <div class="chat-avatar">🤖</div>
    <div class="chat-bubble" style="padding: 0.85rem 1.25rem;">
      <div class="typing-dots">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;

  container.appendChild(indicator);
  scrollToBottom();
}

function removeTypingIndicator() {
  const indicator = document.getElementById('typingIndicator');
  if (indicator) indicator.remove();
}

// Scroll chat container to bottom
function scrollToBottom() {
  const container = document.getElementById('chatMessages');
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}

// Simple Markdown Formatter (Bold, Headings, Lists, Line breaks)
function formatMarkdown(text) {
  if (!text) return '';

  let html = text
    .replace(/^### (.*$)/gim, '<h4 style="color:var(--primary); margin:0.5rem 0 0.25rem; font-size:1.05rem;">$1</h4>')
    .replace(/^## (.*$)/gim, '<h3 style="color:var(--text-main); margin:0.6rem 0 0.25rem; font-size:1.15rem;">$1</h3>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/^\s*-\s+(.*$)/gim, '<li style="margin-left:1.25rem; margin-bottom:0.25rem;">$1</li>')
    .replace(/^\s*\d+\.\s+(.*$)/gim, '<li style="margin-left:1.25rem; margin-bottom:0.25rem;">$1</li>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');

  return html;
}

// Setup Quick Prompt Shortcut Chips
function setupPromptChips() {
  const chips = document.querySelectorAll('.prompt-chip');
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const text = chip.getAttribute('data-prompt') || chip.textContent.trim();
      handleSendMessage(text);
    });
  });
}
