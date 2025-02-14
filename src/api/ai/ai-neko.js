const axios = require('axios');
const NodeCache = require('node-cache');

// Inisialisasi cache dengan waktu TTL 5 menit
const cache = new NodeCache({ stdTTL: 60 * 5 });

module.exports = function(app) {
    // Fungsi untuk mengambil konten dari API
    async function fetchContent(content) {
        try {
            const API_URL = "https://api.siputzx.my.id/api/ai/llama33";

            // Cek apakah jawaban sudah ada di cache
            const cachedResponse = cache.get(content);
            if (cachedResponse) {
                return { Neko: cachedResponse };
            }

            // Jika tidak ada di cache, request ke API AI
            const response = await axios.get(API_URL, {
                params: { prompt: "Be a helpful assistant", text: content }
            });

            const reply = response.data.data;

            // Simpan ke cache sebelum dikirim
            cache.set(content, reply);

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
