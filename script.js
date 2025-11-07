const speakBtn = document.getElementById('speak-btn');
const textInput = document.getElementById('text-input');
const audio = document.getElementById('audio');
const progress = document.getElementById('progress');

speakBtn.addEventListener('click', async () => {
  const text = textInput.value.trim();

  if (!text) {
    alert("Please enter text!");
    return;
  }

  progress.innerText = "Generating speech...";
  
  try {
    const response = await fetch('/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    const blob = await response.blob();
    audio.src = URL.createObjectURL(blob);
    progress.innerText = "Done!";
  } catch (err) {
    console.error(err);
    progress.innerText = "Error generating speech.";
  }
});
