const speakBtn = document.getElementById('speak-btn');
const downloadBtn = document.getElementById('download-btn');
const textInput = document.getElementById('text-input');
const audio = document.getElementById('audio');
const progress = document.getElementById('progress');

speakBtn.addEventListener('click', async () => {
  const text = textInput.value.trim();

  if (!text) {
    alert("Please enter text!");
    return;
  }

  progress.style.display = "block";
  progress.innerHTML = '<span></span>';
  downloadBtn.style.display = "none";

  try {
    const response = await fetch('/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    audio.src = url;
    downloadBtn.href = url;
    downloadBtn.download = 'speech.mp3';
    downloadBtn.style.display = "inline-block";
    progress.style.display = "none";
  } catch (err) {
    console.error(err);
    progress.style.display = "none";
    alert("Error generating speech.");
  }
});
