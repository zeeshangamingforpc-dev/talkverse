/* ========================================
   TalkVerse - Main JS
   ======================================== */

const ELEVEN_API_KEY = "caa2a3dbd47191bb239ca76b11412c740ba9db14ee90ad2963a2b38d8a61e295";
const VOICE_ID = "gP8LZQ3GGokV0MP5JYjg"; // Eric's voice

document.addEventListener("DOMContentLoaded", () => {
  /* -------------------------------
     Tabs
  ------------------------------- */
  const tabs = document.querySelectorAll(".tab");
  const tabContents = document.querySelectorAll(".tab-content");

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tabContents.forEach(tc => tc.classList.remove("active"));
      tab.classList.add("active");
      tabContents[index].classList.add("active");
    });
  });

  /* -------------------------------
     Voice Cards Selection
  ------------------------------- */
  const voiceCards = document.querySelectorAll(".voice-card");
  let selectedVoice = VOICE_ID;

  voiceCards.forEach(card => {
    card.addEventListener("click", () => {
      voiceCards.forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      selectedVoice = card.dataset.voiceId || VOICE_ID;
    });
  });

  /* -------------------------------
     Generate TTS
  ------------------------------- */
  const generateBtn = document.querySelector("#generate-btn");
  const inputText = document.querySelector("#text-input");
  const audioContainer = document.querySelector(".audio-player");
  const audioElement = audioContainer.querySelector("audio");
  const progressContainer = document.querySelector(".progress-container");
  const progressBar = document.querySelector(".progress-fill");
  const progressText = document.querySelector(".progress-text");

  generateBtn.addEventListener("click", async () => {
    const text = inputText.value.trim();
    if (!text) return showToast("Please enter some text!", "error");

    // Show loading
    progressContainer.style.display = "block";
    progressBar.style.width = "0%";
    progressText.textContent = "Starting...";

    try {
      const audioBlob = await fetchTTS(text, selectedVoice);
      const audioUrl = URL.createObjectURL(audioBlob);
      audioElement.src = audioUrl;
      audioElement.play();
      audioContainer.style.display = "block";

      progressBar.style.width = "100%";
      progressText.textContent = "Completed!";
      showToast("Audio generated successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast("Error generating audio.", "error");
      progressText.textContent = "Failed!";
    } finally {
      setTimeout(() => {
        progressContainer.style.display = "none";
        progressBar.style.width = "0%";
      }, 3000);
    }
  });

  /* -------------------------------
     Fetch TTS from ElevenLabs
  ------------------------------- */
  async function fetchTTS(text, voiceId) {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": ELEVEN_API_KEY
      },
      body: JSON.stringify({
        text: text,
        voice_settings: { stability: 0.7, similarity_boost: 0.85 }
      })
    });

    if (!response.ok) throw new Error("Failed to generate TTS");
    const arrayBuffer = await response.arrayBuffer();
    return new Blob([arrayBuffer], { type: "audio/mpeg" });
  }

  /* -------------------------------
     Toast Notification
  ------------------------------- */
  function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.classList.add("toast", type);
    toast.textContent = message;
    document.body.appendChild(toast);
    toast.style.display = "block";

    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  }

  /* -------------------------------
     Character Count
  ------------------------------- */
  const charCount = document.querySelector(".char-count");
  if (inputText && charCount) {
    inputText.addEventListener("input", () => {
      charCount.textContent = `${inputText.value.length} characters`;
    });
  }
});
