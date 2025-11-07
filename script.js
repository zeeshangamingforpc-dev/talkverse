const textInput = document.getElementById("textInput");
const voiceSelect = document.getElementById("voiceSelect");
const speedSlider = document.getElementById("speed");
const pitchSlider = document.getElementById("pitch");
const speedValue = document.getElementById("speedValue");
const pitchValue = document.getElementById("pitchValue");
const generateBtn = document.getElementById("generateBtn");
const downloadBtn = document.getElementById("downloadBtn");
const audioPlayer = document.getElementById("audioPlayer");

let audioBlob = null;

speedSlider.addEventListener("input", () => speedValue.textContent = speedSlider.value + "x");
pitchSlider.addEventListener("input", () => pitchValue.textContent = pitchSlider.value + "x");

async function generateSpeech() {
    const text = textInput.value.trim();
    const voice = voiceSelect.value;
    const speed = parseFloat(speedSlider.value);
    const pitch = parseFloat(pitchSlider.value);

    if (!text) { alert("Please enter some text!"); return; }

    try {
        const response = await fetch("http://localhost:3000/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, voice, speed, pitch })
        });

        if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }

        audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        audioPlayer.src = audioUrl;
        audioPlayer.play();

    } catch (err) {
        console.error(err);
        alert("Error generating speech! Check console for details.");
    }
}

function downloadAudio() {
    if (!audioBlob) { alert("Generate audio first!"); return; }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(audioBlob);
    a.download = "TalkVerse_Audio.mp3";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

generateBtn.addEventListener("click", generateSpeech);
downloadBtn.addEventListener("click", downloadAudio);
