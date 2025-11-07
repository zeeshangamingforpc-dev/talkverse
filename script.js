const speakBtn = document.getElementById('speak-btn');
const downloadBtn = document.getElementById('download-btn');
const textInput = document.getElementById('text-input');
const voiceSelect = document.getElementById('voice');
const speedSlider = document.getElementById('speed');
const speedValue = document.getElementById('speed-value');
const pitchSlider = document.getElementById('pitch');
const pitchValue = document.getElementById('pitch-value');
const audio = document.getElementById('audio');
const progress = document.getElementById('progress');

speedSlider.addEventListener('input', () => speedValue.innerText = speedSlider.value + "x");
pitchSlider.addEventListener('input', () => pitchValue.innerText = pitchSlider.value + "x");

speakBtn.addEventListener('click', async () => {
  const text = textInput.value.trim();
  const voice = voiceSelect.value;
  const speed = parseFloat(speedSlider.value);
  const pitch = parseFloat(pitchSlider.value);

  if(!text) return alert("Enter text!");

  progress.style.display = "block";
  audio.src = "";
  downloadBtn.style.display = "none";

  try {
    const response = await fetch('/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice, speed, pitch })
    });

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    audio.src = url;
    downloadBtn.href = url;
    downloadBtn.style.display = "inline-flex";
    progress.style.display = "none";
  } catch (err) {
    console.error(err);
    alert("Error generating voice");
    progress.style.display = "none";
  }
});
