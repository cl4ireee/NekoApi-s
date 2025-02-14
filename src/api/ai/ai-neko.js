const axios = require("axios");

module.exports = function (app) {
    const LLAMA_API_URL = "https://api.siputzx.my.id/api/ai/llama33";

    let chatHistory = [
        { role: "system", content: "Kamu adalah Neko, AI yang pintar dan ramah. Kamu dibuat dan dikembangkan oleh Claire." }
    ];

    async function fetchContent(text) {
        try {
            if (chatHistory.length > 20) {
                chatHistory.splice(1, chatHistory.length - 10); // Menyimpan 10 pesan terakhir
            }

            chatHistory.push({ role: "user", content: text });

            const response = await axios.post(LLAMA_API_URL, {
                prompt: chatHistory.map(entry => `${entry.role}: ${entry.content}`).join('\n'),
                text: text
            }, { timeout: 10000 }); // Timeout 10 detik

            const reply = response.data.data;

            chatHistory.push({ role: "assistant", content: reply });

            return { status: true, result: reply };
        } catch (error) {
            console.error("Error fetching content from Llama API:", error.message);
            return { status: false, error: "Terjadi kesalahan pada server AI." }; // Menghapus creator
        }
    }

    app.get("/ai/neko", async (req, res) => {
        try {
            const { text } = req.query; // Ambil dari query parameter
            if (!text) {
                return res.status(400).json({ status: false, error: "Text diperlukan" });
            }

            const apiResponse = await fetchContent(text);
            res.status(200).json(apiResponse);
        } catch (error) {
            console.error("Error in /ai/neko route:", error.message);
            res.status(500).json({ status: false, error: "Terjadi kesalahan pada server." });
        }
    });
};
