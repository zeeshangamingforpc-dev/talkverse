const textInput = document.getElementById('textInput');
const voiceSelect = document.getElementById('voiceSelect');
const speakBtn = document.getElementById('speakBtn');
const downloadBtn = document.getElementById('downloadBtn');
const audioPlayer = document.getElementById('audioPlayer');

const API_KEY = "YOUR_API_KEY"; // Replace with your OpenAI API key
const VOICE_ID = voiceSelect.value;

async function generateSpeech(text) {
    try {
        const response = await fetch('https://api.openai.com/v1/audio/speech', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini-tts",
                voice: VOICE_ID,
                input: text
            })
        });
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        audioPlayer.src = url;
    } catch (error) {
        alert('Error generating speech. Check console.');
        console.error(error);
    }
}

speakBtn.addEventListener('click', () => {
    const text = textInput.value.trim();
    if (!text) return alert("Please enter some text!");
    generateSpeech(text);
});

downloadBtn.addEventListener('click', () => {
    const text = textInput.value.trim();
    if (!text) return alert("Please enter some text!");
    generateSpeech(text).then(() => {
        const a = document.createElement('a');
        a.href = audioPlayer.src;
        a.download = 'speech.mp3';
        a.click();
    });
});
