const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const OPENAI_API_KEY = "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"; // Ganti dengan API key yang didapat

app.post("/ai/neko", async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ status: false, error: "Text diperlukan" });
        }

        // Kirim request ke OpenAI GPT-4o
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4o",
                messages: [{ role: "system", content: "Kamu adalah Neko, AI yang pintar dan ramah. Kamu dibuat dan dikembangkan oleh Claire." }, { role: "user", content: text }],
                temperature: 0.7
            },
            {
                headers: {
                    "Authorization": `Bearer ${OPENAI_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const reply = response.data.choices[0].message.content;
        res.json({ status: true, result: reply });

    } catch (error) {
        console.error("Error:", error.response ? error.response.data : error.message);
        res.status(500).json({ status: false, error: "Terjadi kesalahan pada server AI." });
    }
});
