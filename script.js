const downloadBtn = document.getElementById('downloadBtn');
let audioBlob = null; // store the generated audio

async function generateSpeech() {
    const text = textInput.value.trim();
    if (!text) {
        alert("Please enter some text!");
        return;
    }

    try {
        const response = await fetch("https://api.openai.com/v1/audio/speech", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini-tts",
                voice: VOICE_ID,
                input: text,
                speed: parseFloat(speed.value),
                pitch: parseFloat(pitch.value)
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        audioBlob = await response.blob(); // save blob for download
        const url = URL.createObjectURL(audioBlob);
        audioPlayer.src = url;
        audioPlayer.play();
    } catch (err) {
        console.error(err);
        alert("Error generating speech! Check console for details.");
    }
}

// Download button functionality
downloadBtn.addEventListener("click", () => {
    if (!audioBlob) {
        alert("Please generate audio first!");
        return;
    }

    const a = document.createElement("a");
    a.href = URL.createObjectURL(audioBlob);
    a.download = "TalkVerse_Audio.mp3";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});

generateBtn.addEventListener("click", generateSpeech);
