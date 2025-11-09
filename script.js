const textInput = document.getElementById('textInput');
const voiceSelect = document.getElementById('voiceSelect');
const generateBtn = document.getElementById('generateBtn');
const audioElement = document.getElementById('audioElement');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const audioPlayer = document.getElementById('audioPlayer');

generateBtn.addEventListener('click', async () => {
    const text = textInput.value.trim();
    const voiceId = voiceSelect.value;

    if (!text) {
        alert('Please enter some text!');
        return;
    }

    progressContainer.style.display = 'block';
    progressFill.style.width = '0%';
    progressText.innerText = 'Generating Voice: 0%';
    audioPlayer.style.display = 'none';

    try {
        const response = await fetch('http://localhost:3000/api/tts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: text,
                voiceId: voiceId
            })
        });

        if (!response.ok) throw new Error('Failed to generate voice');

        const blob = await response.blob();

        // Show audio
        const url = URL.createObjectURL(blob);
        audioElement.src = url;
        audioPlayer.style.display = 'block';

        // Progress simulation
        let progress = 0;
        const interval = setInterval(() => {
            if (progress >= 100) {
                clearInterval(interval);
                progressText.innerText = 'Voice Generated!';
            } else {
                progress += 5;
                progressFill.style.width = progress + '%';
                progressText.innerText = 'Generating Voice: ' + progress + '%';
            }
        }, 50);

    } catch (error) {
        alert(error.message);
        progressContainer.style.display = 'none';
    }
});
