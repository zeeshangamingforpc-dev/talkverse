import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.ELEVEN_API_KEY;

app.post("/tts", async (req, res) => {
    try {
        const { text, voice } = req.body;

        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "xi-api-key": API_KEY
            },
            body: JSON.stringify({
                text: text,
                voice_settings: { stability: 0.5, similarity_boost: 0.75 }
            })
        });

        const buffer = await response.arrayBuffer();
        res.set("Content-Type", "audio/mpeg");
        res.send(Buffer.from(buffer));

    } catch (err) {
        console.error(err);
        res.status(500).send("Error generating speech");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
