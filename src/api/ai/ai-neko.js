const axios = require('axios');

module.exports = function(app) {
    // Menyimpan chat history
    let chatHistory = [
        { role: "system", content: "Kamu adalah Neko, AI yang pintar dan ramah. Kamu dibuat dan dikembangkan oleh Claire. Kamu bisa membantu dengan menjawab berbagai pertanyaan." }
    ];

    // Fungsi untuk mengambil konten dari API
    async function fetchContent(content) {
        try {
            const API_URL = "https://api.siputzx.my.id/api/ai/llama33";

            // Menambahkan pesan user ke dalam chat history
            chatHistory.push({ role: "user", content });

            // Menambahkan chatHistory ke dalam permintaan API untuk menjaga konteks
            const response = await axios.get(API_URL, {
                params: { prompt: "Be a helpful assistant, especially for Neko. Respond as if you are Neko, developed by Claire.", text: content }
            });

            const reply = response.data.data;

            // Menambahkan respon AI ke dalam chat history
            chatHistory.push({ role: "assistant", content: reply });

            // Mengembalikan hasil dari API
            return { Neko: reply };

        } catch (error) {
            console.error("Error fetching content from API:", error);
            throw error;
        }
    }

    // Endpoint untuk menangani request ke /ai/neko
    app.get('/ai/neko', async (req, res) => {
        try {
            const { text } = req.query;
            if (!text) {
                return res.status(400).json({ status: false, error: 'Text is required' });
            }

            // Mengambil respons dari API
            const apiResponse = await fetchContent(text);

            // Kembalikan hasil dari API
            res.status(200).json(apiResponse);

        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    });
};
