/**
 * FitTrack - AI Fitness & Nutrition Assistant (ai-assistant.js)
 * Enhanced with Speech Recognition (Speech-to-Text) and Speech Synthesis (Voice responses)
 */

let isAwaitingResponse = false;
let speechRecognitionInstance = null;
let isListening = false;
let isVoiceModeEnabled = localStorage.getItem('fittrack_voice_mode') !== 'false'; // Default to true
let activeUtterance = null;
let currentSpeakingBtn = null;

document.addEventListener('DOMContentLoaded', () => {
  loadChatHistory();
  setupChatHandlers();
  setupPromptChips();
  setupVoiceRecognition();
  setupVoiceToggle();
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
          You can <strong>type or speak</strong> directly using the 🎙️ <strong>Speak</strong> button below! Ask me about:
          <ul>
            <li>Personalized meal planning (including Tamil Nadu & South Indian foods like Idli, Dosa, Sambar, Sundal, Eggs, etc.)</li>
            <li>Calorie calculations & protein optimization</li>
            <li>Customized beginner workout routines & exercise form</li>
            <li>Pre- and post-workout nutrition, recovery, and hydration</li>
          </ul>
          Click any of the suggested questions below or speak your question!
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
      stopSpeech();
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

  // If user was speaking, stop recognition
  if (isListening) stopListening();
  stopSpeech();

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
      // If voice mode is enabled, speak the answer
      if (isVoiceModeEnabled) {
        speakText(res.reply);
      }
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
  const cleanSpokenText = stripMarkdownForSpeech(content);

  // Assistant bubble includes a speaker button
  const voiceBtnHtml = !isUser
    ? `<button type="button" class="bubble-speak-btn" onclick="toggleSpeakMessage(this, decodeURIComponent('${encodeURIComponent(cleanSpokenText)}'))" title="Listen to answer">
        <span>🔊</span> Listen
       </button>`
    : '';

  bubbleWrap.innerHTML = `
    <div class="chat-avatar">${isUser ? '👤' : '🤖'}</div>
    <div class="chat-bubble">
      <div class="chat-header-name">${isUser ? 'You' : 'FitTrack AI Coach'}</div>
      <div class="chat-text">${formattedContent}</div>
      <div class="flex-between" style="margin-top:0.4rem;">
        <div>${voiceBtnHtml}</div>
        <div class="chat-time" style="margin:0;">${timeStr}</div>
      </div>
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

function scrollToBottom() {
  const container = document.getElementById('chatMessages');
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}

// Simple Markdown Formatter for visual display
function formatMarkdown(text) {
  if (!text) return '';

  return text
    .replace(/^### (.*$)/gim, '<h4 style="color:var(--primary); margin:0.5rem 0 0.25rem; font-size:1.05rem;">$1</h4>')
    .replace(/^## (.*$)/gim, '<h3 style="color:var(--text-main); margin:0.6rem 0 0.25rem; font-size:1.15rem;">$1</h3>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/^\s*-\s+(.*$)/gim, '<li style="margin-left:1.25rem; margin-bottom:0.25rem;">$1</li>')
    .replace(/^\s*\d+\.\s+(.*$)/gim, '<li style="margin-left:1.25rem; margin-bottom:0.25rem;">$1</li>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');
}

// Clean markdown for natural text-to-speech reading
function stripMarkdownForSpeech(text) {
  if (!text) return '';
  return text
    .replace(/###/g, '')
    .replace(/##/g, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/^- /gm, '')
    .replace(/^\d+\. /gm, '')
    .replace(/\[.*?\]/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/<[^>]*>/g, '')
    .trim();
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

// ============================================================================
// 🎙️ SPEECH RECOGNITION (SPEAK TO AI)
// ============================================================================
function setupVoiceRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const micBtn = document.getElementById('micBtn');
  const cancelBtn = document.getElementById('cancelVoiceBtn');

  if (!SpeechRecognition) {
    if (micBtn) {
      micBtn.title = 'Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.';
      micBtn.style.opacity = '0.6';
    }
    return;
  }

  speechRecognitionInstance = new SpeechRecognition();
  speechRecognitionInstance.continuous = false;
  speechRecognitionInstance.interimResults = true;
  speechRecognitionInstance.lang = 'en-US'; // English

  speechRecognitionInstance.onstart = () => {
    isListening = true;
    updateMicUi(true);
  };

  speechRecognitionInstance.onresult = (event) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }

    const transcriptEl = document.getElementById('voiceLiveTranscript');
    if (transcriptEl) {
      transcriptEl.textContent = `"${finalTranscript || interimTranscript}"`;
    }

    // When final speech is captured, send to AI automatically
    if (finalTranscript) {
      const input = document.getElementById('chatInput');
      if (input) input.value = finalTranscript.trim();
      stopListening();
      handleSendMessage(finalTranscript.trim());
    }
  };

  speechRecognitionInstance.onerror = (event) => {
    console.warn('Speech recognition error:', event.error);
    stopListening();
    if (event.error === 'not-allowed') {
      showToast('Microphone access denied. Please allow microphone permissions.', 'error');
    }
  };

  speechRecognitionInstance.onend = () => {
    stopListening();
  };

  if (micBtn) {
    micBtn.addEventListener('click', () => {
      if (isListening) {
        stopListening();
      } else {
        startListening();
      }
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      stopListening();
    });
  }
}

function startListening() {
  if (!speechRecognitionInstance) {
    showToast('Voice recognition is not supported in this browser.', 'error');
    return;
  }
  stopSpeech(); // Stop any audio playback while listening
  try {
    speechRecognitionInstance.start();
  } catch (err) {
    console.warn('Recognition start error:', err);
  }
}

function stopListening() {
  isListening = false;
  updateMicUi(false);
  if (speechRecognitionInstance) {
    try {
      speechRecognitionInstance.stop();
    } catch (e) {}
  }
}

function updateMicUi(listening) {
  const micBtn = document.getElementById('micBtn');
  const banner = document.getElementById('voiceListeningBanner');
  const micLabel = document.getElementById('micLabel');
  const micIcon = document.getElementById('micIcon');
  const transcriptEl = document.getElementById('voiceLiveTranscript');

  if (micBtn) {
    if (listening) {
      micBtn.classList.add('listening');
      if (micLabel) micLabel.textContent = 'Listening...';
      if (micIcon) micIcon.textContent = '🔴';
    } else {
      micBtn.classList.remove('listening');
      if (micLabel) micLabel.textContent = 'Speak';
      if (micIcon) micIcon.textContent = '🎙️';
    }
  }

  if (banner) {
    banner.style.display = listening ? 'flex' : 'none';
  }

  if (transcriptEl && !listening) {
    transcriptEl.textContent = 'Speak now';
  }
}

// ============================================================================
// 🔊 SPEECH SYNTHESIS (VOICE OUTPUT)
// ============================================================================
function setupVoiceToggle() {
  const toggleBtn = document.getElementById('voiceToggleBtn');
  const toggleText = document.getElementById('voiceToggleText');
  const toggleIcon = document.getElementById('voiceToggleIcon');

  function updateToggleUi() {
    if (toggleText) toggleText.textContent = isVoiceModeEnabled ? 'Voice: On' : 'Voice: Off';
    if (toggleIcon) toggleIcon.textContent = isVoiceModeEnabled ? '🔊' : '🔇';
    if (toggleBtn) {
      if (isVoiceModeEnabled) {
        toggleBtn.classList.remove('btn-secondary');
        toggleBtn.classList.add('btn-primary');
      } else {
        toggleBtn.classList.remove('btn-primary');
        toggleBtn.classList.add('btn-secondary');
      }
    }
  }

  updateToggleUi();

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      isVoiceModeEnabled = !isVoiceModeEnabled;
      localStorage.setItem('fittrack_voice_mode', isVoiceModeEnabled);
      updateToggleUi();
      if (!isVoiceModeEnabled) {
        stopSpeech();
      }
      showToast(isVoiceModeEnabled ? 'AI Voice responses enabled!' : 'AI Voice responses muted.', 'info');
    });
  }
}

function speakText(rawContent, buttonEl = null) {
  if (!window.speechSynthesis) return;

  stopSpeech();

  const cleanText = stripMarkdownForSpeech(rawContent);
  if (!cleanText) return;

  activeUtterance = new SpeechSynthesisUtterance(cleanText);
  activeUtterance.rate = 1.0;
  activeUtterance.pitch = 1.0;
  activeUtterance.lang = 'en-US';

  // Choose natural English voice if available
  const voices = window.speechSynthesis.getVoices();
  const englishVoice = voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
  if (englishVoice) {
    activeUtterance.voice = englishVoice;
  }

  if (buttonEl) {
    currentSpeakingBtn = buttonEl;
    buttonEl.classList.add('speaking');
    buttonEl.innerHTML = '<span>⏹️</span> Stop';
  }

  activeUtterance.onend = () => {
    resetSpeakingBtn();
    activeUtterance = null;
  };

  activeUtterance.onerror = () => {
    resetSpeakingBtn();
    activeUtterance = null;
  };

  window.speechSynthesis.speak(activeUtterance);
}

function stopSpeech() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  resetSpeakingBtn();
  activeUtterance = null;
}

function resetSpeakingBtn() {
  if (currentSpeakingBtn) {
    currentSpeakingBtn.classList.remove('speaking');
    currentSpeakingBtn.innerHTML = '<span>🔊</span> Listen';
    currentSpeakingBtn = null;
  }
}

// Toggle speak from message bubble button
window.toggleSpeakMessage = function (buttonEl, text) {
  if (activeUtterance && currentSpeakingBtn === buttonEl) {
    stopSpeech();
  } else {
    speakText(text, buttonEl);
  }
};
