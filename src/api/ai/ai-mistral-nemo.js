const axios = require('axios');

module.exports = function(app) {
    async function fetchContent(content) {
        try {
            // Menggunakan API baru dengan metode GET
            const response = await axios.get(`https://api.rynn-archive.biz.id/ai/mistral-nemo?text=${encodeURIComponent(content)}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching content from Rynn Archive:", error);
            throw error;
        }
    }

    app.get('/ai/mistral-nemo', async (req, res) => {
        try {
            const { text } = req.query;
            if (!text) {
                return res.status(400).json({ status: false, error: 'Text is required' });
            }
            const apiResponse = await fetchContent(text);
            const { status, result } = apiResponse; // Mengambil status dan result dari respons API

            res.status(200).json({
                status,
                result // Mengembalikan hanya status dan result
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    });
};
