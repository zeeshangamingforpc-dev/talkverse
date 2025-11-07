const textInput = document.getElementById('textInput');
const voiceSelect = document.getElementById('voiceSelect');
const speed = document.getElementById('speed');
const pitch = document.getElementById('pitch');
const generateBtn = document.getElementById('generateBtn');
const downloadBtn = document.getElementById('downloadBtn');
const audioPlayer = document.getElementById('audioPlayer');
let audioBlob = null;

async function generateSpeech() {
    const text = textInput.value.trim();
    const voice = voiceSelect.value;

    if (!text) { alert("Please enter some text!"); return; }
    if (!voice) { alert("Please select a voice!"); return; }

    try {
        const response = await fetch("http://localhost:3000/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, voice })
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

generateBtn.addEventListener("click", generateSpeech);

downloadBtn.addEventListener("click", () => {
    if (!audioBlob) { alert("Please generate audio first!"); return; }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(audioBlob);
    a.download = "TalkVerse_Audio.mp3";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});
