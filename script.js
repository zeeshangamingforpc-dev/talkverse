// ========================================
// TalkVerse - Main JavaScript
// ========================================

// Global Configuration
const CONFIG = {
    API_KEY: 'caa2a3dbd47191bb239ca76b11412c740ba9db14ee90ad2963a2b38d8a61e295',
    DEFAULT_VOICE_ID: 'gP8LZQ3GGokV0MP5JYjg',
    API_ENDPOINT: 'https://api.elevenlabs.io/v1/text-to-speech',
    MAX_CHARS: 5000
};

// Global State
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

// Voice Library Data
const VOICE_LIBRARY = [
    { id: 'gP8LZQ3GGokV0MP5JYjg', name: 'Rachel', gender: 'Female', accent: 'American', description: 'Calm and professional voice' },
    { id: '21m00Tcm4TlvDq8ikWAM', name: 'Antoni', gender: 'Male', accent: 'American', description: 'Well-rounded and versatile' },
    { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', gender: 'Female', accent: 'American', description: 'Strong and confident' },
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', gender: 'Female', accent: 'American', description: 'Soft and gentle' },
    { id: 'ErXwobaYiN019PkySvjV', name: 'Josh', gender: 'Male', accent: 'American', description: 'Deep and authoritative' },
    { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', gender: 'Female', accent: 'American', description: 'Young and energetic' },
    { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Sam', gender: 'Male', accent: 'American', description: 'Dynamic and youthful' },
    { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', gender: 'Male', accent: 'American', description: 'Crisp and clear' },
    { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', gender: 'Male', accent: 'American', description: 'Deep and resonant' },
    { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Dave', gender: 'Male', accent: 'British', description: 'Smooth and engaging' }
];

// ========================================
// Initialization
// ========================================

window.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    loadSettings();
    setupEventListeners();
    updateHistory();
    updateStats();
    loadVoiceLibrary();
    
    // Show welcome message
    setTimeout(() => {
        showToast('Welcome to TalkVerse! 🎙️', 'success');
    }, 500);
}

// ========================================
// Event Listeners
// ========================================

function setupEventListeners() {
    // Text input
    const textInput = document.getElementById('textInput');
    textInput.addEventListener('input', updateCharCount);

    // Range controls
    ['stability', 'similarity', 'style'].forEach(control => {
        const element = document.getElementById(`${control}Control`);
        element.addEventListener('input', () => {
            document.getElementById(`${control}Value`).textContent = element.value;
        });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
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
}

// ========================================
// Tab Management
// ========================================

function switchTab(tabName) {
    // Remove active class from all tabs and contents
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to selected tab and content
    event.target.closest('.tab').classList.add('active');
    document.getElementById(tabName).classList.add('active');
    
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
    const text = document.getElementById('textInput').value;
    const count = text.length;
    document.getElementById('charCount').textContent = count;
    
    // Change color if approaching limit
    const charCountElement = document.querySelector('.char-count');
    if (count > CONFIG.MAX_CHARS * 0.9) {
        charCountElement.style.color = '#ff6b6b';
    } else {
        charCountElement.style.color = '#999';
    }
    
    if (count > CONFIG.MAX_CHARS) {
        document.getElementById('textInput').value = text.substring(0, CONFIG.MAX_CHARS);
        showToast(`Maximum ${CONFIG.MAX_CHARS} characters allowed!`, 'error');
    }
}

function clearText() {
    document.getElementById('textInput').value = '';
    updateCharCount();
    hideAudioPlayer();
    showToast('Text cleared!', 'success');
}

// ========================================
// Text to Speech Conversion
// ========================================

async function convertText() {
    const text = document.getElementById('textInput').value.trim();
    
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
    const voiceId = document.getElementById('voiceSelect').value;
    const stability = parseFloat(document.getElementById('stabilityControl').value);
    const similarity = parseFloat(document.getElementById('similarityControl').value);
    const style = parseFloat(document.getElementById('styleControl').value);
    
    // Show loading
    showLoading();
    showProgress(0, 'Preparing conversion...');
    
    try {
        // Prepare API request
        const apiKey = state.settings.apiKey || CONFIG.API_KEY;
        const url = `${CONFIG.API_ENDPOINT}/${voiceId}`;
        
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
            throw new Error(`API Error: ${response.status} - ${response.statusText}`);
        }
        
        // Get audio blob
        const audioBlob = await response.blob();
        showProgress(90, 'Finalizing...');
        
        // Create audio URL
        if (state.currentAudioUrl) {
            URL.revokeObjectURL(state.currentAudioUrl);
        }
        
        state.currentAudioBlob = audioBlob;
        state.currentAudioUrl = URL.createObjectURL(audioBlob);
        
        // Display audio
        const audioElement = document.getElementById('audioElement');
        audioElement.src = state.currentAudioUrl;
        
        showProgress(100, 'Complete!');
        
        // Show audio player
        setTimeout(() => {
            hideLoading();
            hideProgress();
            showAudioPlayer();
            
            // Auto play if enabled
            if (state.settings.autoPlay) {
                audioElement.play();
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
        console.error('Conversion error:', error);
        hideLoading();
        hideProgress();
        showToast(`Conversion failed: ${error.message}`, 'error');
    }
}

// ========================================
// Progress Management
// ========================================

function showProgress(percent = 0, message = 'Processing...') {
    const container = document.getElementById('progressContainer');
    const fill = document.getElementById('progressFill');
    const text = document.getElementById('progressText');
    
    container.style.display = 'block';
    fill.style.width = percent + '%';
    text.textContent = message + ' ' + Math.round(percent) + '%';
}

function hideProgress() {
    document.getElementById('progressContainer').style.display = 'none';
}

// ========================================
// Audio Player Management
// ========================================

function showAudioPlayer() {
    const player = document.getElementById('audioPlayer');
    player.style.display = 'block';
    
    // Update duration when loaded
    const audioElement = document.getElementById('audioElement');
    audioElement.addEventListener('loadedmetadata', () => {
        const duration = formatDuration(audioElement.duration);
        document.getElementById('audioDuration').textContent = duration;
    });
}

function hideAudioPlayer() {
    document.getElementById('audioPlayer').style.display = 'none';
}

function formatDuration(seconds) {
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
    
    const link = document.createElement('a');
    link.href = state.currentAudioUrl;
    link.download = `talkverse-${Date.now()}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Audio downloaded! 💾', 'success');
}

function shareAudio() {
    const text = document.getElementById('textInput').value;
    
    if (navigator.share) {
        navigator.share({
            title: 'TalkVerse Audio',
            text: `Listen to this text: ${text.substring(0, 100)}...`,
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
    const text = document.getElementById('textInput').value;
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
    const selectedVoice = document.getElementById('voiceSelect').value;
    
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
}

function selectVoice(voiceId) {
    document.getElementById('voiceSelect').value = voiceId;
    loadVoiceLibrary();
    showToast(`Voice selected: ${VOICE_LIBRARY.find(v => v.id === voiceId)?.name}`, 'success');
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
    
    localStorage.setItem('ttsHistory', JSON.stringify(state.history));
}

function updateHistory() {
    const container = document.getElementById('historyContainer');
    
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
            <div class="history-text">${entry.text}</div>
            <div class="history-meta">
                <span>📅 ${new Date(entry.timestamp).toLocaleString()}</span>
                <span>📊 ${entry.charCount} chars</span>
                <span>🎚️ Stability: ${entry.stability}</span>
                <span>🎨 Similarity: ${entry.similarity}</span>
            </div>
        </div>
    `).join('');
}

function updateStats() {
    // Total conversions
    document.getElementById('totalConversions').textContent = state.history.length;
    
    // Total characters
    const totalChars = state.history.reduce((sum, entry) => sum + entry.charCount, 0);
    document.getElementById('totalChars').textContent = totalChars.toLocaleString();
    
    // Most used voice
    const voiceCounts = {};
    state.history.forEach(entry => {
        voiceCounts[entry.voiceName] = (voiceCounts[entry.voiceName] || 0) + 1;
    });
    
    const mostUsedVoice = Object.keys(voiceCounts).length > 0
        ? Object.keys(voiceCounts).reduce((a, b) => voiceCounts[a] > voiceCounts[b] ? a : b)
        : '-';
    
    document.getElementById('favoriteVoice').textContent = mostUsedVoice;
    
    // Estimate total time (assuming ~150 words per minute, ~5 chars per word)
    const estimatedSeconds = Math.round(totalChars / 5 / 150 * 60);
    const minutes = Math.floor(estimatedSeconds / 60);
    const seconds = estimatedSeconds % 60;
    document.getElementById('totalTime').textContent = 
        minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

function replayHistory(id) {
    const entry = state.history.find(h => h.id === id);
    if (!entry) return;
    
    // Fill form with history data
    document.getElementById('textInput').value = entry.text;
    document.getElementById('voiceSelect').value = entry.voiceId;
    document.getElementById('stabilityControl').value = entry.stability;
    document.getElementById('similarityControl').value = entry.similarity;
    document.getElementById('styleControl').value = entry.style || 0;
    
    // Update displays
    updateCharCount();
    document.getElementById('stabilityValue').textContent = entry.stability;
    document.getElementById('similarityValue').textContent = entry.similarity;
    document.getElementById('styleValue').textContent = entry.style || 0;
    
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
}

// ========================================
// Settings Management
// ========================================

function loadSettings() {
    // Apply theme
    document.body.className = `theme-${state.settings.theme} text-${state.settings.textSize}`;
    
    // Set form values
    document.getElementById('themeSelect').value = state.settings.theme;
    document.getElementById('textSizeSelect').value = state.settings.textSize;
    document.getElementById('autoPlaySelect').value = state.settings.autoPlay.toString();
    document.getElementById('saveHistorySelect').value = state.settings.saveHistory.toString();
    document.getElementById('autoDownloadSelect').value = state.settings.autoDownload.toString();
    
    if (state.settings.apiKey && state.settings.apiKey !== CONFIG.API_KEY) {
        document.getElementById('apiKeyInput').value = state.settings.apiKey;
    }
}

function saveSettings() {
    state.settings = {
        theme: document.getElementById('themeSelect').value,
        textSize: document.getElementById('textSizeSelect').value,
        autoPlay: document.getElementById('autoPlaySelect').value === 'true',
        saveHistory: document.getElementById('saveHistorySelect').value === 'true',
        autoDownload: document.getElementById('autoDownloadSelect').value === 'true',
        apiKey: document.getElementById('apiKeyInput').value || CONFIG.API_KEY
    };
    
    localStorage.setItem('ttsSettings', JSON.stringify(state.settings));
    loadSettings();
    
    showToast('Settings saved successfully!', 'success');
}

function changeTheme() {
    state.settings.theme = document.getElementById('themeSelect').value;
    document.body.className = `theme-${state.settings.theme} text-${state.settings.textSize}`;
}

function changeTextSize() {
    state.settings.textSize = document.getElementById('textSizeSelect').value;
    document.body.className = `theme-${state.settings.theme} text-${state.settings.textSize}`;
}

// ========================================
// UI Helpers
// ========================================

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

function showLoading() {
    document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

// ========================================
// Cleanup
// ========================================

window.addEventListener('beforeunload', () => {
    if (state.currentAudioUrl) {
        URL.revokeObjectURL(state.currentAudioUrl);
    }
});
