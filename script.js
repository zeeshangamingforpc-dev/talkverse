// ================================
// TalkVerse JS - script.js
// ================================

// Tabs
function switchTab(tabId) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelector(`.tab[onclick*="${tabId}"]`).classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

// Character count
const textInput = document.getElementById('textInput');
const charCount = document.getElementById('charCount');
textInput?.addEventListener('input', () => {
    charCount.textContent = textInput.value.length;
});

// Range controls
const stabilityControl = document.getElementById('stabilityControl');
const similarityControl = document.getElementById('similarityControl');
const styleControl = document.getElementById('styleControl');
const stabilityValue = document.getElementById('stabilityValue');
const similarityValue = document.getElementById('similarityValue');
const styleValue = document.getElementById('styleValue');

stabilityControl?.addEventListener('input', () => stabilityValue.textContent = stabilityControl.value);
similarityControl?.addEventListener('input', () => similarityValue.textContent = similarityControl.value);
styleControl?.addEventListener('input', () => styleValue.textContent = styleControl.value);

// Placeholder TTS functions
function convertText() {
    showToast("Converting text...");
    document.getElementById('progressContainer').style.display = "block";
    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        document.getElementById('progressFill').style.width = progress + "%";
        document.getElementById('progressText').textContent = progress + "%";
        if(progress >= 100) {
            clearInterval(interval);
            document.getElementById('audioPlayer').style.display = "block";
            showToast("Conversion completed!", "success");
        }
    }, 200);
}

function clearText() {
    textInput.value = "";
    charCount.textContent = "0";
}

function downloadAudio() {
    showToast("Downloading audio...", "success");
}

function shareAudio() {
    showToast("Share link copied!", "success");
}

// Toast Notification
function showToast(message, type="error") {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.style.display = "block";
    setTimeout(() => toast.style.display = "none", 3000);
}

// Settings
function changeTheme() {
    const theme = document.getElementById('themeSelect').value;
    document.body.className = `theme-${theme}`;
}

function changeTextSize() {
    const size = document.getElementById('textSizeSelect').value;
    document.body.classList.remove('text-small', 'text-medium', 'text-large', 'text-xlarge');
    document.body.classList.add(`text-${size}`);
}

function saveSettings() {
    showToast("Settings saved!", "success");
}

// History
function clearHistory() {
    document.getElementById('historyContainer').innerHTML = "";
    showToast("History cleared!", "success");
}

function exportHistory() {
    showToast("History exported!", "success");
}

// Initialize voice grid with dummy data
const voices = [
    {name:"Alice", description:"Friendly voice"},
    {name:"Bob", description:"Deep voice"},
    {name:"Charlie", description:"Calm voice"},
];

const voiceGrid = document.getElementById('voiceGrid');
voices.forEach(v => {
    const card = document.createElement('div');
    card.className = "voice-card";
    card.innerHTML = `<div class="voice-header">
        <div class="voice-avatar">${v.name[0]}</div>
        <div class="voice-name">${v.name}</div>
    </div>
    <div class="voice-description">${v.description}</div>`;
    card.addEventListener('click', () => {
        document.querySelectorAll('.voice-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
    });
    voiceGrid.appendChild(card);
});
