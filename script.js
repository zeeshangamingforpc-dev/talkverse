// ========================================
// TalkVerse - Complete JavaScript (FIXED)
// Version: 2.0.0
// Direct ElevenLabs API Integration
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
    history: [],
    settings: {
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
        // Load from localStorage
        const savedHistory = localStorage.getItem('ttsHistory');
        const savedSettings = localStorage.getItem('ttsSettings');
        
        if (savedHistory) {
            try {
                state.history = JSON.parse(savedHistory);
            } catch (e) {
                console.error('Error loading history:', e);
                state.history = [];
            }
        }
        
        if (savedSettings) {
            try {
                state.settings = { ...state.settings, ...JSON.parse(savedSettings) };
            } catch (e) {
                console.error('Error loading settings:', e);
            }
        }
        
        loadSettings();
        setupEventListeners();
        updateHistory();
        updateStats();
        loadVoiceLibrary();
        
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
    const textInput = document.getElementById('textInput');
    if (textInput) {
        textInput.addEventListener('input', updateCharCount);
        textInput.addEventListener('paste', () => {
            setTimeout(updateCharCount, 100);
        });
    }

    setupRangeControls();
    document.addEventListener('keydown', handleKeyboardShortcuts);

    const audioElement = document.getElementById('audioElement');
    if (audioElement) {
        audioElement.addEventListener('loadedmetadata', updateAudioDuration);
    }
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

function handleKeyboardShortcuts(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        convertText();
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        clearText();
    }
}

// ========================================
// Tab Management
// ========================================
function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    if (event && event.target) {
        const clickedTab = event.target.closest('.tab');
        if (clickedTab) {
            clickedTab.classList.add('active');
        }
    }
    
    const tabContent = document.getElementById(tabName);
    if (tabContent) {
        tabContent.classList.add('active');
    }
    
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
// Text to Speech Conversion (FIXED)
// ========================================
async function convertText() {
    const textInput = document.getElementById('textInput');
    const text = textInput ? textInput.value.trim() : '';
    
    if (!text) {
        showToast('Please enter some text to convert!', 'error');
        return;
    }
    
    if (text.length > CONFIG.MAX_CHARS) {
        showToast(`Text exceeds maximum length of ${CONFIG.MAX_CHARS} characters!`, 'error');
        return;
    }
    
    const voiceId = document.getElementById('voiceSelect')?.value || CONFIG.DEFAULT_VOICE_ID;
    const stability = parseFloat(document.getElementById('stabilityControl')?.value || 0.5);
    const similarity = parseFloat(document.getElementById('similarityControl')?.value || 0.75);
    const style = parseFloat(document.getElementById('styleControl')?.value || 0);
    
    showLoading();
    showProgress(0, 'Preparing conversion...');
    
    try {
        const apiKey = state.settings.apiKey || CONFIG.API_KEY;
        const url = `${CONFIG.API_ENDPOINT}/${voiceId}`;
        
        console.log('🎤 Converting text to speech...');
        console.log('API URL:', url);
        showProgress(30, 'Connecting to ElevenLabs AI...');
        
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
            let errorMessage = `API Error: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.detail?.message || errorMessage;
            } catch (e) {
                errorMessage = await response.text() || errorMessage;
            }
            throw new Error(errorMessage);
        }
        
        const audioBlob = await response.blob();
        showProgress(90, 'Finalizing...');
        
        console.log('✅ Audio generated:', audioBlob.size, 'bytes');
        
        if (state.currentAudioUrl) {
            URL.revokeObjectURL(state.currentAudioUrl);
        }
        
        state.currentAudioBlob = audioBlob;
        state.currentAudioUrl = URL.createObjectURL(audioBlob);
        
        const audioElement = document.getElementById('audioElement');
        if (audioElement) {
            audioElement.src = state.currentAudioUrl;
        }
        
        showProgress(100, 'Complete!');
        
        setTimeout(() => {
            hideLoading();
            hideProgress();
            showAudioPlayer();
            
            if (state.settings.autoPlay && audioElement) {
                audioElement.play().catch(err => {
                    console.log('Autoplay blocked by browser');
                });
            }
            
            if (state.settings.autoDownload) {
                downloadAudio();
            }
        }, 500);
        
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
        if (error.message.includes('401')) {
            errorMessage += 'Invalid API key. Please check your settings.';
        } else if (error.message.includes('429')) {
            errorMessage += 'Rate limit exceeded. Please wait and try again.';
        } else if (error.message.includes('quota')) {
            errorMessage += 'API quota exceeded. Please try again later or use your own API key.';
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
    if (container) container.style.display = 'none';
}

// ========================================
// Audio Player Management
// ========================================
function showAudioPlayer() {
    const player = document.getElementById('audioPlayer');
    if (player) player.style.display = 'block';
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
    } catch (error) {
        console.error('Download error:', error);
        showToast('Download failed', 'error');
    }
}

function shareAudio() {
    const text = document.getElementById('textInput')?.value || '';
    
    if (navigator.share) {
        navigator.share({
            title: 'TalkVerse Audio',
            text: `Listen to this: ${text.substring(0, 100)}...`,
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
        showToast('Text copied! 📋', 'success');
    }).catch(() => {
        showToast('Failed to copy', 'error');
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
}

function selectVoice(voiceId) {
    const voiceSelect = document.getElementById('voiceSelect');
    if (voiceSelect) voiceSelect.value = voiceId;
    
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
    
    if (state.history.length > 50) {
        state.history = state.history.slice(0, 50);
    }
    
    try {
        localStorage.setItem('ttsHistory', JSON.stringify(state.history));
    } catch (error) {
        console.error('Error saving history:', error);
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
                <strong>🗣️ ${escapeHtml(entry.voiceName)}</strong>
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
                <span>🎚️ ${entry.stability}</span>
                <span>🎨 ${entry.similarity}</span>
            </div>
        </div>
    `).join('');
}

function updateStats() {
    document.getElementById('totalConversions').textContent = state.history.length;
    
    const totalChars = state.history.reduce((sum, entry) => sum + entry.charCount, 0);
    document.getElementById('totalChars').textContent = totalChars.toLocaleString();
    
    const voiceCounts = {};
    state.history.forEach(entry => {
        voiceCounts[entry.voiceName] = (voiceCounts[entry.voiceName] || 0) + 1;
    });
    
    const mostUsedVoice = Object.keys(voiceCounts).length > 0
        ? Object.keys(voiceCounts).reduce((a, b) => voiceCounts[a] > voiceCounts[b] ? a : b)
        : '-';
    
    document.getElementById('favoriteVoice').textContent = mostUsedVoice;
    
    const estimatedSeconds = Math.round(totalChars / 5 / 150 * 60);
    const minutes = Math.floor(estimatedSeconds / 60);
    const seconds = estimatedSeconds % 60;
    document.getElementById('totalTime').textContent = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

function replayHistory(id) {
    const entry = state.history.find(h => h.id === id);
    if (!entry) return;
    
    document.getElementById('textInput').value = entry.text;
    document.getElementById('voiceSelect').value = entry.voiceId;
    document.getElementById('stabilityControl').value = entry.stability;
    document.getElementById('similarityControl').value = entry.similarity;
    document.getElementById('styleControl').value = entry.style || 0;
    
    updateCharCount();
    document.getElementById('stabilityValue').textContent = entry.stability;
    document.getElementById('similarityValue').textContent = entry.similarity;
    document.getElementById('styleValue').textContent = entry.style || 0;
    
    switchTab('convert');
    showToast('History loaded!', 'success');
}

function deleteHistoryItem(id) {
    state.history = state.history.filter(h => h.id !== id);
    localStorage.setItem('ttsHistory', JSON.stringify(state.history));
    updateHistory();
    updateStats();
    showToast('Deleted', 'success');
}

function clearHistory() {
    if (!confirm('Clear all history?')) return;
    
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
        
        showToast('Exported!', 'success');
    } catch (error) {
        showToast('Export failed', 'error');
    }
}

// ========================================
// Settings
// ========================================
function loadSettings() {
    document.body.className = `theme-${state.settings.theme} text-${state.settings.textSize}`;
    
    document.getElementById('themeSelect').value = state.settings.theme;
    document.getElementById('textSizeSelect').value = state.settings.textSize;
    document.getElementById('autoPlaySelect').value = state.settings.autoPlay.toString();
    document.getElementById('saveHistorySelect').value = state.settings.saveHistory.toString();
    document.getElementById('autoDownloadSelect').value = state.settings.autoDownload.toString();
    
    const apiKeyInput = document.getElementById('apiKeyInput');
    if (apiKeyInput && state.settings.apiKey !== CONFIG.API_KEY) {
        apiKeyInput.value = state.settings.apiKey;
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
    
    try {
        localStorage.setItem('ttsSettings', JSON.stringify(state.settings));
        loadSettings();
        showToast('Settings saved!', 'success');
    } catch (error) {
        showToast('Failed to save settings', 'error');
    }
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
    if (overlay) overlay.style.display = 'flex';
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'none';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(isoString) {
    try {
        return new Date(isoString).toLocaleString();
    } catch (error) {
        return 'Invalid date';
    }
}

// ========================================
// Cleanup
// ========================================
window.addEventListener('beforeunload', () => {
    if (state.currentAudioUrl) {
        URL.revokeObjectURL(state.currentAudioUrl);
    }
});

console.log('✅ TalkVerse script loaded successfully!');
