const textInput = document.getElementById("textInput");
const voiceSelect = document.getElementById("voiceSelect");
const generateBtn = document.getElementById("generateBtn");
const downloadBtn = document.getElementById("downloadBtn");
const audioPlayer = document.getElementById("audioPlayer");
const speedSlider = document.getElementById("speed");
const pitchSlider = document.getElementById("pitch");
const speedVal = document.getElementById("speedVal");
const pitchVal = document.getElementById("pitchVal");
const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");

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
progressFill.style.width = "0%";
progressText.textContent = "0%";

// Simulate progress
let progress = 0;
const interval = setInterval(() => {
if (progress < 90) {
progress += Math.floor(Math.random()*5)+1;
progressFill.style.width = progress + "%";
progressText.textContent = progress + "%";
}
}, 200);

const response = await fetch("http://localhost:3000/tts", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ text, voice, speed, pitch })
});

clearInterval(interval);
progressFill.style.width = "100%";
progressText.textContent = "100%";

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
