const textInput = document.getElementById("textInput");
const voiceSelect = document.getElementById("voiceSelect");
const speed = document.getElementById("speed");
const pitch = document.getElementById("pitch");
const speedValue = document.getElementById("speedValue");
const pitchValue = document.getElementById("pitchValue");
const generateBtn = document.getElementById("generateBtn");
const downloadBtn = document.getElementById("downloadBtn");
const audioPlayer = document.getElementById("audioPlayer");
let audioBlob = null;

// Update slider display
speed.addEventListener("input", () => speedValue.textContent = speed.value + "x");
pitch.addEventListener("input", () => pitchValue.textContent = pitch.value + "x");

// Generate TTS
async function generateSpeech() {
    const text = textInput.value.trim();
    const voice = voiceSelect.value;
    if (!text) { alert("Please enter text!"); return; }

    try {
        const response = await fetch("http://localhost:3000/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                text,
                voice,
                speed: speed.value,
                pitch: pitch.value
            })
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        audioBlob = await response.blob();
        const url = URL.createObjectURL(audioBlob);
        audioPlayer.src = url;
        audioPlayer.play();
    } catch (err) {
        console.error(err);
        alert("Error generating speech! Check console for details.");
    }
}

// Download audio
downloadBtn.addEventListener("click", () => {
    if (!audioBlob) { alert("Generate audio first!"); return; }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(audioBlob);
    a.download = "TalkVerse_Audio.mp3";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});

generateBtn.addEventListener("click", generateSpeech);
