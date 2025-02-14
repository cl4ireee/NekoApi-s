
const axios = require("axios");

module.exports = function (app) {
    const LLAMA_API_URL = "https://api.siputzx.my.id/api/ai/llama33";

    // 🔹 Penyimpanan history sementara
    let chatHistory = [
        { role: "system", content: "Kamu adalah Neko, AI yang pintar dan ramah. Kamu dibuat dan dikembangkan oleh Claire." }
    ];

    async function fetchContent(text) {
        try {
            // 🔹 Batasi history agar tidak terlalu panjang
            if (chatHistory.length > 20) {
                chatHistory.splice(1, chatHistory.length - 10);
            }

            // 🔹 Tambahkan pesan pengguna ke history
            chatHistory.push({ role: "user", content: text });

            // 🔹 Kirim request ke API Llama (POST, dengan timeout)
            const response = await axios.post(LLAMA_API_URL, {
                prompt: chatHistory[0].content,
                text: text
            }, { timeout: 10000 }); // Timeout 10 detik

            const reply = response.data.data;

            // 🔹 Simpan respons AI ke history
            chatHistory.push({ role: "assistant", content: reply });

            return { status: true, result: reply };
        } catch (error) {
            console.error("Error fetching content from NekoApi:", error.message);
            return { status: false, error: "Terjadi kesalahan pada server AI." };
        }
    }

    app.get("/ai/neko", async (req, res) => {
    try {
        const { text } = req.query; // Perbaikan: Ambil dari query parameter
        if (!text) {
            return res.status(400).json({ status: false, error: "Text is required" });
        }

        const apiResponse = await fetchContent(text);
        res.status(200).json(apiResponse);
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
});
