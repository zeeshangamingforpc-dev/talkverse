const textInput = document.getElementById("textInput");
const voiceSelect = document.getElementById("voiceSelect");
const generateBtn = document.getElementById("generateBtn");
const downloadBtn = document.getElementById("downloadBtn");
const audioPlayer = document.getElementById("audioPlayer");

const speedSlider = document.getElementById("speed");
const pitchSlider = document.getElementById("pitch");
const speedVal = document.getElementById("speedVal");
const pitchVal = document.getElementById("pitchVal");

speedSlider.addEventListener("input", () => speedVal.textContent = speedSlider.value + "x");
pitchSlider.addEventListener("input", () => pitchVal.textContent = pitchSlider.value + "x");

generateBtn.addEventListener("click", async () => {
const text = textInput.value.trim();
const voice = voiceSelect.value;
const speed = parseFloat(speedSlider.value);
const pitch = parseFloat(pitchSlider.value);

if (!text) return alert("Please enter some text!");

try {
generateBtn.disabled = true;
generateBtn.textContent = "Generating...";

const response = await fetch("http://localhost:3000/tts", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ text, voice, speed, pitch })
});

if (!response.ok) throw new Error("Failed to generate voice");

const blob = await response.blob();
audioPlayer.src = URL.createObjectURL(blob);
audioPlayer.play();

downloadBtn.onclick = () => {
const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = "voice.mp3";
a.click();
};

} catch (err) {
console.error(err);
alert("Error generating voice! Check console for details.");
} finally {
generateBtn.disabled = false;
generateBtn.textContent = "🎤 Generate Voice";
}
});
