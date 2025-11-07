const textInput = document.getElementById("textInput");
const voiceSelect = document.getElementById("voiceSelect");
const speedRange = document.getElementById("speed");
const pitchRange = document.getElementById("pitch");
const generateBtn = document.getElementById("generateBtn");
const downloadBtn = document.getElementById("downloadBtn");
const audioPlayer = document.getElementById("audioPlayer");

let audioBlob = null;

generateBtn.addEventListener("click", async () => {
    const text = textInput.value.trim();

    if (!text) {
        alert("Please enter text!");
        return;
    }

    generateBtn.disabled = true;
    generateBtn.innerText = "Generating...";

    try {
        const response = await fetch("http://localhost:3000/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                text,
                voice: voiceSelect.value,
                speed: speedRange.value,
                pitch: pitchRange.value
            })
        });

        if (!response.ok) throw new Error("TTS failed");

        const arrayBuffer = await response.arrayBuffer();
        audioBlob = new Blob([arrayBuffer], { type: "audio/mpeg" });

        const audioURL = URL.createObjectURL(audioBlob);
        audioPlayer.src = audioURL;
        audioPlayer.style.display = "block";
        audioPlayer.play();

    } catch (error) {
        console.error(error);
        alert("Error generating voice!");
    }

    generateBtn.disabled = false;
    generateBtn.innerText = "🎤 Generate Voice";
});

downloadBtn.addEventListener("click", () => {
    if (!audioBlob) {
        alert("Generate audio first!");
        return;
    }

    const a = document.createElement("a");
    a.href = URL.createObjectURL(audioBlob);
    a.download = "talkverse_voice.mp3";
    a.click();
});
