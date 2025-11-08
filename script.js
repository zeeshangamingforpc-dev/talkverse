// ========================================
// TalkVerse Script
// ========================================

// Elements
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');
const textInput = document.getElementById('textInput');
const charCount = document.getElementById('charCount');
const languageSelect = document.getElementById('languageSelect');
const stabilityControl = document.getElementById('stabilityControl');
const similarityControl = document.getElementById('similarityControl');
const styleControl = document.getElementById('styleControl');
const stabilityValue = document.getElementById('stabilityValue');
const similarityValue = document.getElementById('similarityValue');
const styleValue = document.getElementById('styleValue');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const audioPlayer = document.getElementById('audioPlayer');
const audioElement = document.getElementById('audioElement');
const toast = document.getElementById('toast');
const voiceGrid = document.getElementById('voiceGrid');
const historyContainer = document.getElementById('historyContainer');
const apiKeyInput = document.getElementById('apiKeyInput');

// Settings
let settings = {
    theme: 'purple',
    textSize: 'medium',
    autoPlay: true,
    saveHistory: true,
    autoDownload: false,
    apiKey: ''
};

// Voices
const voices = [
    {id: "1", name: "Olivia", lang: "en"},
    {id: "2", name: "Aarav", lang: "hi"},
    {id: "3", name: "Carlos", lang: "es"},
    {id: "4", name: "Zara", lang: "ur"}
];

let selectedVoice = voices[0];

// History
let history = [];

// ========================================
// Tab Switching
// ========================================
function switchTab(tabId) {
    tabs.forEach(t => t.classList.remove('active'));
    tabContents.forEach(tc => tc.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    tabs.forEach(t => {
        if (t.textContent.toLowerCase().includes(tabId)) t.classList.add('active');
    });
}

// ========================================
// Character Count
// ========================================
textInput.addEventListener('input', () => {
    charCount.textContent = textInput.value.length;
});

// ========================================
// Range Sliders
// ========================================
stabilityControl.addEventListener('input', () => { stabilityValue.textContent = stabilityControl.value; });
similarityControl.addEventListener('input', () => { similarityValue.textContent = similarityControl.value; });
styleControl.addEventListener('input', () => { styleValue.textContent = styleControl.value; });

// ========================================
// Voice Grid
// ========================================
function renderVoiceGrid() {
    voiceGrid.innerHTML = '';
    voices.forEach(v => {
        const card = document.createElement('div');
        card.className = 'voice-card';
        if (v.id === selectedVoice.id) card.classList.add('selected');
        card.innerHTML = `
            <div class="voice-header">
                <div class="voice-avatar">${v.name.charAt(0)}</div>
                <div class="voice-name">${v.name}</div>
            </div>
            <div class="voice-meta">
                <span class="voice-tag">${v.lang.toUpperCase()}</span>
            </div>
        `;
        card.addEventListener('click', () => { 
            selectedVoice = v; 
            renderVoiceGrid(); 
            showToast(`Selected voice: ${v.name}`); 
        });
        voiceGrid.appendChild(card);
    });
}
renderVoiceGrid();

// ========================================
// Toast Notification
// ========================================
function showToast(message, type='success') {
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 3000);
}

// ========================================
// Loading Overlay
// ========================================
function showLoading(show=true) {
    const overlay = document.getElementById('loadingOverlay');
    overlay.style.display = show ? 'flex' : 'none';
}

// ========================================
// Convert Text to Speech
// ========================================
async function convertText() {
    const text = textInput.value.trim();
    if (!text) {
        showToast('Please enter text to convert!', 'error');
        return;
    }
    if (!settings.apiKey) {
        showToast('Please enter your ElevenLabs API key!', 'error');
        return;
    }

    progressContainer.style.display = 'block';
    progressFill.style.width = '0%';
    progressText.textContent = 'Starting...';

    try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': settings.apiKey
            },
            body: JSON.stringify({
                text: text,
                voice_settings: {
                    stability: parseFloat(stabilityControl.value),
                    similarity_boost: parseFloat(similarityControl.value),
                    style: parseFloat(styleControl.value)
                },
                lang: languageSelect.value
            })
        });

        if (!response.ok) throw new Error('API request failed');

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        audioElement.src = url;
        audioPlayer.style.display = 'block';

        if (settings.autoPlay) audioElement.play();
        if (settings.autoDownload) downloadAudio();

        progressFill.style.width = '100%';
        progressText.textContent = 'Completed!';

        // Save history
        if (settings.saveHistory) {
            const entry = {text, voice: selectedVoice.name, lang: languageSelect.value, timestamp: new Date().toLocaleString()};
            history.push(entry);
            renderHistory();
        }

        showToast('Audio generated successfully!');
    } catch (err) {
        console.error(err);
        showToast('Error generating audio.', 'error');
    } finally {
        setTimeout(() => { progressContainer.style.display = 'none'; }, 2000);
    }
}

// ========================================
// Download Audio
// ========================================
function downloadAudio() {
    const a = document.createElement('a');
    a.href = audioElement.src;
    a.download = `TalkVerse_${Date.now()}.mp3`;
    a.click();
}

// ========================================
// Clear Text
// ========================================
function clearText() {
    textInput.value = '';
    charCount.textContent = '0';
}

// ========================================
// Render History
// ========================================
function renderHistory() {
    historyContainer.innerHTML = '';
    history.forEach(entry => {
        const div = document.createElement('div');
        div.className = 'history-
