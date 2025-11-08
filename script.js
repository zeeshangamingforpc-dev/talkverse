// ========================================
// TalkVerse - Main JavaScript
// ========================================

// Global Configuration
const CONFIG = {
    API_KEY: 'caa2a3dbd47191bb239ca76b11412c740ba9db14ee90ad2963a2b38d8a61e295',
    DEFAULT_VOICE_ID: 'gP8LZQ3GGokV0MP5JYjg',
    API_ENDPOINT: 'https://api.elevenlabs.io/v1/text-to-speech',
    MAX_CHARS: 5000,
    LANGUAGES: [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Spanish' },
        { code: 'hi', name: 'Hindi' },
        { code: 'ur', name: 'Urdu' }
    ]
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
        language: 'en',
        apiKey: CONFIG.API_KEY
    }
};

// Voice Library
const VOICE_LIBRARY = [
    { id: 'gP8LZQ3GGokV0MP5JYjg', name: 'Rachel', gender: 'Female', accent: 'American', description: 'Calm and professional voice' },
    { id: '21m00Tcm4TlvDq8ikWAM', name: 'Antoni', gender: 'Male', accent: 'American', description: 'Well-rounded and versatile' },
    { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', gender: 'Female', accent: 'American', description: 'Strong and confident' },
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', gender: 'Female', accent: 'American', description: 'Soft and gentle' },
    { id: 'ErXwobaYiN019PkySvjV', name: 'Josh', gender: 'Male', accent: 'American', description: 'Deep and authoritative' }
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
    populateLanguageSelect();
    loadVoiceLibrary();
    updateHistory();
    updateStats();

    setTimeout(() => showToast('Welcome to TalkVerse! 🎙️', 'success'), 500);
}

// ========================================
// Event Listeners
// ========================================
function setupEventListeners() {
    document.getElementById('textInput').addEventListener('input', updateCharCount);
    ['stability', 'similarity', 'style'].forEach(ctrl => {
        document.getElementById(`${ctrl}Control`).addEventListener('input', () => {
            document.getElementById(`${ctrl}Value`).textContent = document.getElementById(`${ctrl}Control`).value;
        });
    });
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

function handleKeyboardShortcuts(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); convertText(); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); clearText(); }
}

// ========================================
// Language Selection
// ========================================
function populateLanguageSelect() {
    const select = document.getElementById('languageSelect');
    select.innerHTML = CONFIG.LANGUAGES.map(lang => `<option value="${lang.code}">${lang.name}</option>`).join('');
    select.value = state.settings.language;
    select.addEventListener('change', () => {
        state.settings.language = select.value;
        saveSettings();
    });
}

// ========================================
// Tabs
// ========================================
function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    event.target.closest('.tab').classList.add('active');
    document.getElementById(tabName).classList.add('active');

    if (tabName === 'voices') loadVoiceLibrary();
    if (tabName === 'history') { updateHistory(); updateStats(); }
}

// ========================================
// Text Input
// ========================================
function updateCharCount() {
    const text = document.getElementById('textInput').value;
    document.getElementById('charCount').textContent = text.length;
    const charEl = document.querySelector('.char-count');
    charEl.style.color = text.length > CONFIG.MAX_CHARS * 0.9 ? '#ff6b6b' : '#999';
    if (text.length > CONFIG.MAX_CHARS) {
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
    if (!text) { showToast('Please enter text!', 'error'); return; }

    const voiceId = document.getElementById('voiceSelect').value;
    const stability = parseFloat(document.getElementById('stabilityControl').value);
    const similarity = parseFloat(document.getElementById('similarityControl').value);
    const style = parseFloat(document.getElementById('styleControl').value);
    const lang = state.settings.language;

    showLoading();
    showProgress(10, 'Preparing request...');

    try {
        const response = await fetch(`${CONFIG.API_ENDPOINT}/${voiceId}`, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': state.settings.apiKey
            },
            body: JSON.stringify({
                text: text,
                model_id: 'eleven_monolingual_v1',
                voice_settings: { stability, similarity_boost: similarity, style, use_speaker_boost: true },
                language: lang
            })
        });

        showProgress(70, 'Processing audio...');

        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        const audioBlob = await response.blob();

        if (state.currentAudioUrl) URL.revokeObjectURL(state.currentAudioUrl);
        state.currentAudioBlob = audioBlob;
        state.currentAudioUrl = URL.createObjectURL(audioBlob);

        const audioEl = document.getElementById('audioElement');
        audioEl.src = state.currentAudioUrl;

        showProgress(100, 'Complete!');
        setTimeout(() => {
            hideLoading();
            hideProgress();
            showAudioPlayer();
            if (state.settings.autoPlay) audioEl.play();
            if (state.settings.autoDownload) downloadAudio();
        }, 500);

        if (state.settings.saveHistory) saveToHistory({
            text, voiceId, voiceName: VOICE_LIBRARY.find(v => v.id === voiceId)?.name || 'Unknown',
            stability, similarity, style, charCount: text.length, timestamp: new Date().toISOString()
        });

        showToast('Conversion successful! 🎉', 'success');
    } catch (error) {
        console.error(error);
        hideLoading();
        hideProgress();
        showToast(`Conversion failed: ${error.message}`, 'error');
    }
}

// ========================================
// Progress
// ========================================
function showProgress(percent = 0, message = 'Processing...') {
    const container = document.getElementById('progressContainer');
    const fill = document.getElementById('progressFill');
    const text = document.getElementById('progressText');
    container.style.display = 'block';
    fill.style.width = percent + '%';
    text.textContent = `${message} ${Math.round(percent)}%`;
}
function hideProgress() { document.getElementById('progressContainer').style.display = 'none'; }

// ========================================
// Audio Player
// ========================================
function showAudioPlayer() {
    const player = document.getElementById('audioPlayer');
    player.style.display = 'block';
    const audioEl = document.getElementById('audioElement');
    audioEl.addEventListener('loadedmetadata', () => {
        document.getElementById('audioDuration').textContent = formatDuration(audioEl.duration);
    });
}
function hideAudioPlayer() { document.getElementById('audioPlayer').style.display = 'none'; }
function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60), secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ========================================
// Audio Actions
// ========================================
function downloadAudio() {
    if (!state.currentAudioBlob) { showToast('No audio to download!', 'error'); return; }
    const link = document.createElement('a');
    link.href = state.currentAudioUrl;
    link.download = `talkverse-${Date.now()}.mp3`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    showToast('Audio downloaded! 💾', 'success');
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
// History
// ========================================
function saveToHistory(entry) {
    entry.id = Date.now();
    state.history.unshift(entry);
    if (state.history.length > 50) state.history = state.history.slice(0,50);
    localStorage.setItem('ttsHistory', JSON.stringify(state.history));
    updateHistory(); updateStats();
}

function updateHistory() {
    const container = document.getElementById('historyContainer');
    if (state.history.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-icon">📭</div><h3>No history yet!</h3><p>Your converted texts will appear here</p></div>`;
        return;
    }
    container.innerHTML = state.history.map(e => `
        <div class="history-item">
            <div class="history-header">
                <strong>🗣️ ${e.voiceName}</strong>
                <div class="history-actions">
                    <button class="btn-secondary btn-small" onclick="replayHistory(${e.id})">🔄 Replay</button>
                    <button class="btn-secondary btn-small" onclick="deleteHistoryItem(${e.id})">🗑️ Delete</button>
                </div>
            </div>
            <div class="history-text">${e.text}</div>
            <div class="history-meta">
                <span>📅 ${new Date(e.timestamp).toLocaleString()}</span>
                <span>📊 ${e.charCount} chars</span>
                <span>🎚️ Stability: ${e.stability}</span>
                <span>🎨 Similarity: ${e.similarity}</span>
            </div>
        </div>
    `).join('');
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
    showToast('History loaded! Click convert to replay.', 'success');
}

function deleteHistoryItem(id) {
    state.history = state.history.filter(h => h.id !== id);
    localStorage.setItem('ttsHistory', JSON.stringify(state.history));
    updateHistory(); updateStats();
    showToast('History item deleted', 'success');
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
    if (state.settings.apiKey && state.settings.apiKey !== CONFIG.API_KEY)
        document.getElementById('apiKeyInput').value = state.settings.apiKey;
}

function saveSettings() {
    state.settings = {
        theme: document.getElementById('themeSelect').value,
        textSize: document.getElementById('textSizeSelect').value,
        autoPlay: document.getElementById('autoPlaySelect').value === 'true',
        saveHistory: document.getElementById('saveHistorySelect').value === 'true',
        autoDownload: document.getElementById('autoDownloadSelect').value === 'true',
        language: document.getElementById('languageSelect').value,
        apiKey: document.getElementById('apiKeyInput').value || CONFIG.API_KEY
    };
    localStorage.setItem('ttsSettings', JSON.stringify(state.settings));
    loadSettings();
    showToast('Settings saved successfully!', 'success');
}

// ========================================
// UI Helpers
// ========================================
function showToast(msg, type='info') {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.className = `toast ${type}`;
    toast.style.display = 'block';
    setTimeout(() => toast.style.display = 'none', 3000);
}

function showLoading() { document.getElementById('loadingOverlay').style.display = 'flex'; }
function hideLoading() { document.getElementById('loadingOverlay').style.display = 'none'; }

// ========================================
// Cleanup
// ========================================
window.addEventListener('beforeunload', () => {
    if (state.currentAudioUrl) URL.revokeObjectURL(state.currentAudioUrl);
});
