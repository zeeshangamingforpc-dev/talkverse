import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.OPENAI_API_KEY;
const PORT = process.env.PORT || 3000;

app.post("/tts", async (req, res) => {
    try {
        const { text, voice } = req.body;
        const response = await fetch("https://api.openai.com/v1/audio/speech", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini-tts",
                voice: voice,
                input: text
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

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));