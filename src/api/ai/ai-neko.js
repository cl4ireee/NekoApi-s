const axios = require("axios");

module.exports = function (app) {
    const GPT4O_API_URL = "https://vapis.my.id/api/gpt4o?q=";

    let chatHistory = [
        { role: "system", content: "Kamu adalah Neko, AI yang pintar dan ramah. Kamu dibuat dan dikembangkan oleh Claire." }
    ];

    async function fetchContent(text) {
        try {
            if (chatHistory.length > 20) {
                chatHistory.splice(1, chatHistory.length - 10); // Menyimpan 10 pesan terakhir
            }

            chatHistory.push({ role: "user", content: text });

            // 🔹 Kirim request ke API GPT-4o (GET request sesuai API yang diberikan)
            const response = await axios.get(GPT4O_API_URL + encodeURIComponent(text), { timeout: 10000 });

            console.log("API Response:", response.data); // Log respons API

            // Pastikan mengambil jawaban AI yang benar dari response
            const reply = response.data.result?.trim() || "Maaf, saya tidak bisa menjawab saat ini.";

            chatHistory.push({ role: "assistant", content: reply });

            return { status: true, result: reply }; // Mengembalikan hasil
        } catch (error) {
            console.error("Error fetching content from GPT-4o API:", error.message);
            console.error("Response data:", error.response ? error.response.data : "No response data"); // Log data respons kesalahan
            return { status: false, error: "Terjadi kesalahan pada server AI." };
        }
    }

    app.get("/ai/neko", async (req, res) => {
        try {
            const { text } = req.query; // Ambil dari query parameter
            if (!text) {
                return res.status(400).json({ status: false, error: "Text diperlukan" });
            }

            const apiResponse = await fetchContent(text);
            res.status(200).json(apiResponse); // Mengembalikan respons API
        } catch (error) {
            console.error("Error in /ai/neko route:", error.message);
            res.status(500).json({ status: false, error: "Terjadi kesalahan pada server." });
        }
    });
};
