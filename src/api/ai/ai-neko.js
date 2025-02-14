const axios = require("axios");

module.exports = function (app) {
    const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
    const OPENAI_API_KEY = "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"; // Ganti dengan API key OpenAI-mu

    let chatHistory = [
        { role: "system", content: "Kamu adalah Neko, AI yang pintar dan ramah. Kamu dibuat dan dikembangkan oleh Claire." }
    ];

    async function fetchContent(text) {
        try {
            // Batasi history agar tidak terlalu panjang
            if (chatHistory.length > 20) {
                chatHistory.splice(1, chatHistory.length - 10);
            }

            chatHistory.push({ role: "user", content: text });

            // Kirim request ke OpenAI (GPT-4o)
            const response = await axios.post(
                OPENAI_API_URL,
                {
                    model: "gpt-4o",
                    messages: chatHistory,
                    temperature: 0.7
                },
                {
                    headers: {
                        "Authorization": `Bearer ${OPENAI_API_KEY}`,
                        "Content-Type": "application/json"
                    },
                    timeout: 10000 // Timeout 10 detik
                }
            );

            const reply = response.data.choices[0].message.content;

            chatHistory.push({ role: "assistant", content: reply });

            return { status: true, result: reply };
        } catch (error) {
            console.error("Error fetching content from OpenAI:", error.message);
            return { status: false, error: "Terjadi kesalahan pada server AI." };
        }
    }

    app.get("/ai/neko", async (req, res) => {
        try {
            const { text } = req.query;
            if (!text) {
                return res.status(400).json({ status: false, error: "Text diperlukan" });
            }

            const apiResponse = await fetchContent(text);
            res.status(200).json(apiResponse);
        } catch (error) {
            res.status(500).json({ status: false, error: "Terjadi kesalahan pada server." });
        }
    });
};
