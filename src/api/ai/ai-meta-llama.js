const axios = require('axios');

module.exports = function(app) {
    async function fetchContent(text) {
        try {
            const response = await axios.get(`https://api.siputzx.my.id/api/ai/meta-llama-33-70B-instruct-turbo?text=${encodeURIComponent(text)}`);
            return response.data;
        } catch (error) {
            // Menangani kesalahan dan mencetak respons dari API
            if (error.response) {
                console.error("Error fetching content from Meta Llama API:", error.response.data);
                throw new Error(`API Error: ${error.response.data.error || error.message}`);
            } else {
                console.error("Error fetching content from Meta Llama API:", error.message);
                throw new Error(error.message);
            }
        }
    }

    app.get('/ai/meta-llama', async (req, res) => {
        try {
            const { text } = req.query;
            if (!text) {
                return res.status(400).json({ status: false, error: 'Text is required' });
            }

            const apiResponse = await fetchContent(text);
            const { status, data } = apiResponse; // Mengambil status dan data dari respons API

            res.status(200).json({
                status,
                result: data // Mengembalikan hasil dari API
            });
        } catch (error) {
            res.status(500).json({ status: false, error: `Terjadi kesalahan: ${error.message}` });
        }
    });
};
