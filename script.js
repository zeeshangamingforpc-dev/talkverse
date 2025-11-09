const backendURL = "https://your-backend-hosted-url.com/api/tts"; // Replace with hosted backend URL

async function generateVoice(text, voiceId) {
    const response = await fetch(backendURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            text: text,
            voice: voiceId
        })
    });

    const data = await response.json();
    return data.audioUrl; // or whatever your backend returns
}
