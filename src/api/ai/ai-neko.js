const axios = require('axios');

module.exports = function(app) {
    // Fungsi untuk mengambil konten dari API
    async function fetchContent(content) {
        try {
            const API_URL = "https://api.siputzx.my.id/api/ai/llama33";

            // Request ke API AI
            const response = await axios.get(API_URL, {
                params: { prompt: "Be a helpful assistant", text: content }
            });

            const reply = response.data.data;

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
            const apiResponse = await fetchContent(text); // Ambil respons dari API

            res.status(200).json(apiResponse); // Kembalikan hasil dari API

        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    });
};
