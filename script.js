const textInput = document.getElementById("textInput");
const voiceSelect = document.getElementById("voiceSelect");
const speed = document.getElementById("speed");
const pitch = document.getElementById("pitch");
const speedValue = document.getElementById("speedValue");
const pitchValue = document.getElementById("pitchValue");
const speakBtn = document.getElementById("speakBtn");
const downloadBtn = document.getElementById("downloadBtn");
const audioPlayer = document.getElementById("audioPlayer");

speed.addEventListener("input", () => speedValue.textContent = speed.value + "x");
pitch.addEventListener("input", () => pitchValue.textContent = pitch.value + "x");

speakBtn.addEventListener("click", async () => {
    const text = textInput.value;
    const voice = voiceSelect.value;

    if (!text) return alert("Please enter text!");

    try {
        const response = await fetch("http://localhost:3000/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, voice })
        });

        if (!response.ok) throw new Error("Network response not ok");
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        audioPlayer.src = url;
    } catch (err) {
        console.error(err);
        alert("Error generating speech! Check console.");
    }
});

downloadBtn.addEventListener("click", () => {
    const link = document.createElement("a");
    link.href = audioPlayer.src;
    link.download = "voice.mp3";
    link.click();
});
