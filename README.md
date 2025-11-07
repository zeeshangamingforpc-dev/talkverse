# TalkVerse - Text to Speech Website 🎙️

TalkVerse is a professional Text-to-Speech web app with multiple voices and adjustable speed & pitch.

Live Demo: https://zeeshangamingforpc-dev.github.io/talkverse/

---

## Features
- Choose voice (Male/Female/Custom)  
- Enter text and convert to speech  
- Adjust speed and pitch  
- Play generated audio in-browser  
- Download the generated audio as MP3  
- Buttons same size, glowing effect  
- Footer: Created By Zeeshan

---

## Setup & Testing

### Backend
1. Open terminal in `backend/`
2. Create `.env` with your API key:
\`\`\`
OPENAI_API_KEY=your-api-key-here
PORT=3000
\`\`\`
3. Run:
\`\`\`
npm install
node index.js
\`\`\`
4. Backend runs on http://localhost:3000

### Frontend
1. Open `frontend/index.html` in Chrome or via local server.
2. Enter text, select voice, adjust speed/pitch, click **Generate Voice**.
3. Click **Download Audio** to save the speech.

> ⚠️ For live deployment, update fetch URL in `script.js` to your hosted backend.

---

**Created By Zeeshan**