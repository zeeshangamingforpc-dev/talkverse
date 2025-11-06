const textInput = document.getElementById('textInput');
const voiceSelect = document.getElementById('voiceSelect');
const speed = document.getElementById('speed');
const pitch = document.getElementById('pitch');
const generateBtn = document.getElementById('generateBtn');
const audioPlayer = document.getElementById('audioPlayer');

// Your API key and voice ID
const API_KEY = "sk_230b4ec8f5c96c9b33e2f52b3a6c9f953e694ecb2eaa5b13";
const DEFAULT_VOICE_ID = "KH1SQLVulwP6uG4O3nmT";

async function generateSpeech() {
    const text = textInput.value.trim();
    if (!text) return alert("Please enter some text!");

    try {
        const response = await fetch('https://api.openai.com/v1/audio/speech', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini-tts",
                voice: DEFAULT_VOICE_ID,          // Use your voice ID
                input: text,
                speed: parseFloat(speed.value),
                pitch: parseFloat(pitch.value)
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        audioPlayer.src = url;
        audioPlayer.play();
    } catch (err) {
        console.error(err);
        alert("Error generating speech! Check console for details.");
    }
}

generateBtn.addEventListener('click', generateSpeech);
