// ========================================
// TalkVerse - Complete JavaScript
// Version: 2.0.0
// ElevenLabs API Integration
// ========================================

// ========================================
// Global Configuration
// ========================================
const CONFIG = {
    API_KEY: 'caa2a3dbd47191bb239ca76b11412c740ba9db14ee90ad2963a2b38d8a61e295',
    DEFAULT_VOICE_ID: 'gP8LZQ3GGokV0MP5JYjg',
    API_ENDPOINT: 'https://api.elevenlabs.io/v1/text-to-speech',
    MAX_CHARS: 5000,
    VERSION: '2.0.0'
};

// ========================================
// Global State Management
// ========================================
let state = {
    currentAudioBlob: null,
    currentAudioUrl: null,
    history: JSON.parse(localStorage.getItem('ttsHistory')) || [],
    settings: JSON.parse(localStorage.getItem('ttsSettings')) || {
        theme: 'purple',
        textSize: 'medium',
        autoPlay: false,
        saveHistory: true,
        autoDownload: false,
        apiKey: CONFIG.API_KEY
    }
};

// ========================================
// Voice Library Data
// ========================================
const VOICE_LIBRARY = [
    {
        id: 'gP8LZQ3GGokV0MP5JYjg',
        name: 'Rachel',
        gender: 'Female',
        accent: 'American',
        description: 'Calm and professional voice, perfect for narration'
    },
    {
        id: '21m00Tcm4TlvDq8ikWAM',
        name: 'Antoni',
        gender: 'Male',
        accent: 'American',
        description: 'Well-rounded and versatile, great for storytelling'
    },
    {
        id: 'AZnzlk1XvdvUeBnXmlld',
        name: 'Domi',
        gender: 'Female',
        accent: 'American',
        description: 'Strong and confident, ideal for presentations'
    },
    {
        id: 'EXAVITQu4vr4xnSDxMaL',
        name: 'Bella',
        gender: 'Female',
        accent: 'American',
        description: 'Soft and gentle, perfect for relaxing content'
    },
    {
        id: 'ErXwobaYiN019PkySvjV',
        name: 'Josh',
        gender: 'Male',
        accent: 'American',
        description: 'Deep and authoritative, great for documentaries'
    },
    {
        id: 'MF3mGyEYCl7XYWbV9V6O',
        name: 'Elli',
        gender: 'Female',
        accent: 'American',
        description: 'Young and energetic, perfect for upbeat content'
    },
    {
        id: 'TxGEqnHWrfWFTfGW9XjX',
        name: 'Sam',
        gender: 'Male',
        accent: 'American',
        description: 'Dynamic and youthful, great for engaging stories'
    },
    {
        id: 'VR6AewLTigWG4xSOukaG',
        name: 'Arnold',
        gender: 'Male',
        accent: 'American',
        description: 'Crisp and clear, ideal for instructions'
    },
    {
        id: 'pNInz6obpgDQGcFmaJgB',
        name: 'Adam',
        gender: 'Male',
        accent: 'American',
        description: 'Deep and resonant, perfect for dramatic readings'
    },
    {
        id: 'yoZ06aMxZJJ28mfd3POQ',
        name: 'Dave',
        gender: 'Male',
        accent: 'British',
        description: 'Smooth and engaging, great for educational content'
    }
];

// ========================================
// Initialization
// ========================================
window.addEventListener('DOMContentLoaded', () => {
    console.log('🎙️ TalkVerse v' + CONFIG.VERSION + ' Initializing...');
    initializeApp();
});

function initializeApp() {
    try {
        loadSettings();
        setupEventListeners();
        updateHistory();
        updateStats();
        loadVoiceLibrary();
        
        // Show welcome message
        setTimeout(() => {
            showToast('Welcome to TalkVerse! 🎙️', 'success');
        }, 500);
        
        console.log('✅ TalkVerse initialized successfully!');
    } catch (error) {
        console.error('❌ Initialization error:', error);
        showToast('Error initializing app. Please refresh the page.', 'error');
    }
}

// ========================================
// Event Listeners Setup
// ========================================
function setupEventListeners() {
    // Text input events
    const textInput = document.getElementById('textInput');
    if (textInput) {
        textInput.addEventListener('input', updateCharCount);
        textInput.addEventListener('paste', handlePaste);
    }

    // Range control events
    setupRangeControls();

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);

    // Audio element events
    const audioElement = document.getElementById('audioElement');
    if (audioElement) {
        audioElement.addEventListener('loadedmetadata', updateAudioDuration);
        audioElement.addEventListener('ended', handleAudioEnded);
    }

    console.log('✅ Event listeners setup complete');
}

function setupRangeControls() {
    const controls = ['stability', 'similarity', 'style'];
    
    controls.forEach(control => {
        const element = document.getElementById(`${control}Control`);
        const valueDisplay = document.getElementById(`${control}Value`);
        
        if (element && valueDisplay) {
            element.addEventListener('input', () => {
                valueDisplay.textContent = element.value;
            });
        }
    });
}

function handlePaste(e) {
    setTimeout(() => {
        updateCharCount();
        showToast('Text pasted! Ready to convert.', 'success');
    }, 100);
}

function handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + Enter: Convert
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        convertText();
    }
    
    // Ctrl/Cmd + K: Clear
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        clearText();
    }

    // Escape: Close/Stop
    if (e.key === 'Escape') {
        hideAudioPlayer();
    }
}

// ========================================
// Tab Management
// ========================================
function switchTab(tabName) {
    // Remove active class from all tabs and contents
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Add active class to selected tab and content
    const clickedTab = event.target.closest('.tab');
    if (clickedTab) {
        clickedTab.classList.add('active');
    }
    
    const tabContent = document.getElementById(tabName);
    if (tabContent) {
        tabContent.classList.add('active');
    }
    
    // Load specific content if needed
    if (tabName === 'voices') {
        loadVoiceLibrary();
    } else if (tabName === 'history') {
        updateHistory();
        updateStats();
    }
}

// ========================================
// Text Input Management
// ========================================
function updateCharCount() {
    const textInput = document.getElementById('textInput');
    const charCountElement = document.getElementById('charCount');
    
    if (!textInput || !charCountElement) return;
    
    const text = textInput.value;
    const count = text.length;
    charCountElement.textContent = count;
    
    // Change color if approaching limit
    const charCountContainer = document.querySelector('.char-count');
    if (charCountContainer) {
        if (count > CONFIG.MAX_CHARS * 0.9) {
            charCountContainer.style.color = '#ff6b6b';
        } else if (count > CONFIG.MAX_CHARS * 0.7) {
            charCountContainer.style.color = '#ffc107';
        } else {
            charCountContainer.style.color = '#999';
        }
    }
    
    // Limit text if exceeds max
    if (count > CONFIG.MAX_CHARS) {
        textInput.value = text.substring(0, CONFIG.MAX_CHARS);
        showToast(`Maximum ${CONFIG.MAX_CHARS} characters allowed!`, 'error');
    }
}

function clearText() {
    const textInput = document.getElementById('textInput');
    if (textInput) {
        textInput.value = '';
        updateCharCount();
    }
    hideAudioPlayer();
    showToast('Text cleared!', 'success');
}

// ========================================
// Text to Speech Conversion
// ========================================
async function convertText() {
    const textInput = document.getElementById('textInput');
    const text = textInput ? textInput.value.trim() : '';
    
    // Validation
    if (!text) {
        showToast('Please enter some text to convert!', 'error');
        return;
    }
    
    if (text.length > CONFIG.MAX_CHARS) {
        showToast(`Text exceeds maximum length of ${CONFIG.MAX_CHARS} characters!`, 'error');
        return;
    }
    
    // Get settings
    const voiceId = document.getElementById('voiceSelect')?.value || CONFIG.DEFAULT_VOICE_ID;
    const stability = parseFloat(document.getElementById('stabilityControl')?.value || 0.5);
    const similarity = parseFloat(document.getElementById('similarityControl')?.value || 0.75);
    const style = parseFloat(document.getElementById('styleControl')?.value || 0);
    
    // Show loading
    showLoading();
    showProgress(0, 'Preparing conversion...');
    
    try {
        // Prepare API request
        const apiKey = state.settings.apiKey || CONFIG.API_KEY;
        const url = `${CONFIG.API_ENDPOINT}/${voiceId}`;
        
        console.log('🎤 Converting text with voice:', voiceId);
        showProgress(30, 'Sending to AI...');
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': apiKey
            },
            body: JSON.stringify({
                text: text,
                model_id: 'eleven_monolingual_v1',
                voice_settings: {
                    stability: stability,
                    similarity_boost: similarity,
                    style: style,
                    use_speaker_boost: true
                }
            })
        });
        
        showProgress(70, 'Processing audio...');
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.detail?.message || `API Error: ${response.status} - ${response.statusText}`);
        }
        
        // Get audio blob
        const audioBlob = await response.blob();
        showProgress(90, 'Finalizing...');
        
        console.log('✅ Audio generated successfully!', audioBlob.size, 'bytes');
        
        // Create audio URL
        if (state.currentAudioUrl) {
            URL.revokeObjectURL(state.currentAudioUrl);
        }
        
        state.currentAudioBlob = audioBlob;
        state.currentAudioUrl = URL.createObjectURL(audioBlob);
        
        // Display audio
        const audioElement = document.getElementById('audioElement');
        if (audioElement) {
            audioElement.src = state.currentAudioUrl;
        }
        
        showProgress(100, 'Complete!');
        
        // Show audio player
        setTimeout(() => {
            hideLoading();
            hideProgress();
            showAudioPlayer();
            
            // Auto play if enabled
            if (state.settings.autoPlay && audioElement) {
                audioElement.play().catch(err => {
                    console.log('Autoplay blocked:', err);
                });
            }
            
            // Auto download if enabled
            if (state.settings.autoDownload) {
                downloadAudio();
            }
        }, 500);
        
        // Save to history
        if (state.settings.saveHistory) {
            const voiceName = VOICE_LIBRARY.find(v => v.id === voiceId)?.name || 'Unknown';
            saveToHistory({
                text: text,
                voiceId: voiceId,
                voiceName: voiceName,
                stability: stability,
                similarity: similarity,
                style: style,
                charCount: text.length,
                timestamp: new Date().toISOString()
            });
        }
        
        showToast('Conversion successful! 🎉', 'success');
        
    } catch (error) {
        console.error('❌ Conversion error:', error);
        hideLoading();
        hideProgress();
        
        let errorMessage = 'Conversion failed: ';
        if (error.message.includes('API Error: 401')) {
            errorMessage += 'Invalid API key. Please check your settings.';
        } else if (error.message.includes('API Error: 429')) {
            errorMessage += 'Rate limit exceeded. Please wait and try again.';
        } else {
            errorMessage += error.message;
        }
        
        showToast(errorMessage, 'error');
    }
}

// ========================================
// Progress Management
// ========================================
function showProgress(percent = 0, message = 'Processing...') {
    const container = document.getElementById('progressContainer');
    const fill = document.getElementById('progressFill');
    const text = document.getElementById('progressText');
    
    if (container) container.style.display = 'block';
    if (fill) fill.style.width = percent + '%';
    if (text) text.textContent = message + ' ' + Math.round(percent) + '%';
}

function hideProgress() {
    const container = document.getElementById('progressContainer');
    if (container) {
        container.style.display = 'none';
    }
}

// ========================================
// Audio Player Management
// ========================================
function showAudioPlayer() {
    const player = document.getElementById('audioPlayer');
    if (player) {
        player.style.display = 'block';
    }
}

function hideAudioPlayer() {
    const player = document.getElementById('audioPlayer');
    const audioElement = document.getElementById('audioElement');
    
    if (player) player.style.display = 'none';
    if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
    }
}

function updateAudioDuration() {
    const audioElement = document.getElementById('audioElement');
    const durationElement = document.getElementById('audioDuration');
    
    if (audioElement && durationElement && audioElement.duration) {
        const duration = formatDuration(audioElement.duration);
        durationElement.textContent = duration;
    }
}

function handleAudioEnded() {
    console.log('🎵 Audio playback ended');
}

function formatDuration(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ========================================
// Audio Actions
// ========================================
function downloadAudio() {
    if (!state.currentAudioBlob) {
        showToast('No audio to download!', 'error');
        return;
    }
    
    try {
        const link = document.createElement('a');
        link.href = state.currentAudioUrl;
        link.download = `talkverse-${Date.now()}.mp3`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast('Audio downloaded! 💾', 'success');
        console.log('✅ Audio downloaded successfully');
    } catch (error) {
        console.error('❌ Download error:', error);
        showToast('Download failed. Please try again.', 'error');
    }
}

function shareAudio() {
    const text = document.getElementById('textInput')?.value || '';
    
    if (navigator.share) {
        navigator.share({
            title: 'TalkVerse Audio',
            text: `Listen to this text: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`,
            url: window.location.href
        }).then(() => {
            showToast('Shared successfully!', 'success');
        }).catch((error) => {
            if (error.name !== 'AbortError') {
                copyToClipboard();
            }
        });
    } else {
        copyToClipboard();
    }
}

function copyToClipboard() {
    const text = document.getElementById('textInput')?.value || '';
    
    if (!text) {
        showToast('No text to copy!', 'error');
        return;
    }
    
    navigator.clipboard.writeText(text).then(() => {
        showToast('Text copied to clipboard! 📋', 'success');
    }).catch(() => {
        showToast('Failed to copy text', 'error');
    });
}

// ========================================
// Voice Library
// ========================================
function loadVoiceLibrary() {
    const grid = document.getElementById('voiceGrid');
    if (!grid) return;
    
    const selectedVoice = document.getElementById('voiceSelect')?.value || CONFIG.DEFAULT_VOICE_ID;
    
    grid.innerHTML = VOICE_LIBRARY.map(voice => `
        <div class="voice-card ${voice.id === selectedVoice ? 'selected' : ''}" onclick="selectVoice('${voice.id}')">
            <div class="voice-header">
                <div class="voice-avatar">${voice.gender === 'Male' ? '👨' : '👩'}</div>
                <div>
                    <div class="voice-name">${voice.name}</div>
                    <div class="voice-meta">
                        <span class="voice-tag">${voice.gender}</span>
                        <span class="voice-tag">${voice.accent}</span>
                    </div>
                </div>
            </div>
            <div class="voice-description">${voice.description}</div>
        </div>
    `).join('');
    
    console.log('✅ Voice library loaded:', VOICE_LIBRARY.length, 'voices');
}

function selectVoice(voiceId) {
    const voiceSelect = document.getElementById('voiceSelect');
    if (voiceSelect) {
        voiceSelect.value = voiceId;
    }
    
    loadVoiceLibrary();
    
    const voiceName = VOICE_LIBRARY.find(v => v.id === voiceId)?.name || 'Unknown';
    showToast(`Voice selected: ${voiceName}`, 'success');
}

// ========================================
// History Management
// ========================================
function saveToHistory(entry) {
    entry.id = Date.now();
    state.history.unshift(entry);
    
    // Keep only last 50 entries
    if (state.history.length > 50) {
        state.history = state.history.slice(0, 50);
    }
    
    try {
        localStorage.setItem('ttsHistory', JSON.stringify(state.history));
        console.log('✅ History saved:', state.history.length, 'entries');
    } catch (error) {
        console.error('❌ Error saving history:', error);
    }
}

function updateHistory() {
    const container = document.getElementById('historyContainer');
    if (!container) return;
    
    if (state.history.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📭</div>
                <h3>No history yet!</h3>
                <p>Your converted texts will appear here</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = state.history.map(entry => `
        <div class="history-item">
            <div class="history-header">
                <strong>🗣️ ${entry.voiceName}</strong>
                <div class="history-actions">
                    <button class="btn-secondary btn-small" onclick="replayHistory(${entry.id})">
                        🔄 Replay
                    </button>
                    <button class="btn-secondary btn-small" onclick="deleteHistoryItem(${entry.id})">
                        🗑️ Delete
                    </button>
                </div>
            </div>
            <div class="history-text">${escapeHtml(entry.text)}</div>
            <div class="history-meta">
                <span>📅 ${formatDate(entry.timestamp)}</span>
                <span>📊 ${entry.charCount} chars</span>
                <span>🎚️ Stability: ${entry.stability}</span>
                <span>🎨 Similarity: ${entry.similarity}</span>
            </div>
        </div>
    `).join('');
    
    console.log('✅ History updated:', state.history.length, 'entries');
}

function updateStats() {
    // Total conversions
    const totalConversions = document.getElementById('totalConversions');
    if (totalConversions) {
        totalConversions.textContent = state.history.length;
    }
    
    // Total characters
    const totalChars = state.history.reduce((sum, entry) => sum + entry.charCount, 0);
    const totalCharsElement = document.getElementById('totalChars');
    if (totalCharsElement) {
        totalCharsElement.textContent = totalChars.toLocaleString();
    }
    
    // Most used voice
    const voiceCounts = {};
    state.history.forEach(entry => {
        voiceCounts[entry.voiceName] = (voiceCounts[entry.voiceName] || 0) + 1;
    });
    
    const mostUsedVoice = Object.keys(voiceCounts).length > 0
        ? Object.keys(voiceCounts).reduce((a, b) => voiceCounts[a] > voiceCounts[b] ? a : b)
        : '-';
    
    const favoriteVoiceElement = document.getElementById('favoriteVoice');
    if (favoriteVoiceElement) {
        favoriteVoiceElement.textContent = mostUsedVoice;
    }
    
    // Estimate total time (assuming ~150 words per minute, ~5 chars per word)
    const estimatedSeconds = Math.round(totalChars / 5 / 150 * 60);
    const minutes = Math.floor(estimatedSeconds / 60);
    const seconds = estimatedSeconds % 60;
    const totalTimeElement = document.getElementById('totalTime');
    if (totalTimeElement) {
        totalTimeElement.textContent = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
    }
}

function replayHistory(id) {
    const entry = state.history.find(h => h.id === id);
    if (!entry) return;
    
    // Fill form with history data
    const textInput = document.getElementById('textInput');
    const voiceSelect = document.getElementById('voiceSelect');
    const stabilityControl = document.getElementById('stabilityControl');
    const similarityControl = document.getElementById('similarityControl');
    const styleControl = document.getElementById('styleControl');
    
    if (textInput) textInput.value = entry.text;
    if (voiceSelect) voiceSelect.value = entry.voiceId;
    if (stabilityControl) stabilityControl.value = entry.stability;
    if (similarityControl) similarityControl.value = entry.similarity;
    if (styleControl) styleControl.value = entry.style || 0;
    
    // Update displays
    updateCharCount();
    const stabilityValue = document.getElementById('stabilityValue');
    const similarityValue = document.getElementById('similarityValue');
    const styleValue = document.getElementById('styleValue');
    
    if (stabilityValue) stabilityValue.textContent = entry.stability;
    if (similarityValue) similarityValue.textContent = entry.similarity;
    if (styleValue) styleValue.textContent = entry.style || 0;
    
    // Switch to convert tab
    switchTab('convert');
    
    showToast('History loaded! Click convert to replay.', 'success');
}

function deleteHistoryItem(id) {
    state.history = state.history.filter(h => h.id !== id);
    localStorage.setItem('ttsHistory', JSON.stringify(state.history));
    updateHistory();
    updateStats();
    showToast('History item deleted', 'success');
}

function clearHistory() {
    if (!confirm('Are you sure you want to clear all history?')) return;
    
    state.history = [];
    localStorage.setItem('ttsHistory', JSON.stringify(state.history));
    updateHistory();
    updateStats();
    showToast('History cleared!', 'success');
}

function exportHistory() {
    if (state.history.length === 0) {
        showToast('No history to export!', 'error');
        return;
    }
    
    try {
        const dataStr = JSON.stringify(state.history, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `talkverse-history-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        showToast('History exported!', 'success');
    } catch (error) {
        console.error('❌ Export error:', error);
        showToast('Export failed. Please try again.', 'error');
    }
}

// ========================================
// Settings Management
// ========================================
function loadSettings() {
    // Apply theme
    document.body.className = `theme-${state.settings.theme} text-${state.settings.textSize}`;
    
    // Set form values
    const themeSelect = document.getElementById('themeSelect');
    const textSizeSelect = document.getElementById('textSizeSelect');
    const autoPlaySelect = document.getElementById('autoPlaySelect');
    const saveHistorySelect = document.getElementById('saveHistorySelect');
    const autoDownloadSelect = document.getElementById('autoDownloadSelect');
    const apiKeyInput = document.getElementById('apiKeyInput');
    
    if (themeSelect) themeSelect.value = state.settings.theme;
    if (textSizeSelect) textSizeSelect.value = state.settings.textSize;
    if (autoPlaySelect) autoPlaySelect.value = state.settings.autoPlay.toString();
    if (saveHistorySelect) saveHistorySelect.value = state.settings.saveHistory.toString();
    if (autoDownloadSelect) autoDownloadSelect.value = state.settings.autoDownload.toString();
    
    if (apiKeyInput && state.settings.apiKey && state.settings.apiKey !== CONFIG.API_KEY) {
        apiKeyInput.value = state.settings.apiKey;
    }
    
    console.log('✅ Settings loaded');
}

function saveSettings() {
    const themeSelect = document.getElementById('themeSelect');
    const textSizeSelect = document.getElementById('textSizeSelect');
    const autoPlaySelect = document.getElementById('autoPlaySelect');
    const saveHistorySelect = document.getElementById('saveHistorySelect');
    const autoDownloadSelect = document.getElementById('autoDownloadSelect');
    const apiKeyInput = document.getElementById('apiKeyInput');
    
    state.settings = {
        theme: themeSelect?.value || 'purple',
        textSize: textSizeSelect?.value || 'medium',
        autoPlay: autoPlaySelect?.value === 'true',
        saveHistory: saveHistorySelect?.value === 'true',
        autoDownload: autoDownloadSelect?.value === 'true',
        apiKey: apiKeyInput?.value || CONFIG.API_KEY
    };
    
    try {
        localStorage.setItem('ttsSettings', JSON.stringify(state.settings));
        loadSettings();
        showToast('Settings saved successfully!', 'success');
        console.log('✅ Settings saved');
    } catch (error) {
        console.error('❌ Error saving settings:', error);
        showToast('Failed to save settings', 'error');
    }
}

function changeTheme() {
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) {
        state.settings.theme = themeSelect.value;
        document.body.className = `theme-${state.settings.theme} text-${state.settings.textSize}`;
    }
}

function changeTextSize() {
    const textSizeSelect = document.getElementById('textSizeSelect');
    if (textSizeSelect) {
        state.settings.textSize = textSizeSelect.value;
        document.body.className = `theme-${state.settings.theme} text-${state.settings.textSize}`;
    }
}

// ========================================
// UI Helper Functions
// ========================================
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'flex';
    }
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// ========================================
// Utility Functions
// ========================================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(isoString) {
    try {
        const date = new Date(isoString);
        return date.toLocaleString();
    } catch (error) {
        return 'Invalid date';
    }
}

// ========================================
// Cleanup
// ========================================
window.addEventListener('beforeunload', () => {
    // Revoke object URLs to free memory
    if (state.currentAudioUrl
