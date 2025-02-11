const axios = require('axios');

module.exports = function(app) {
    async function fetchContent(text) {
        try {
            // Menggunakan API baru dengan metode GET
            const response = await axios.get(`https://archive-ui.tanakadomp.biz.id/ai/deepseek?text=${encodeURIComponent(text)}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching content from NekoApi:", error.message); // Mengganti nama di sini
            throw error;
        }
    }

    app.get('/ai/deepseek', async (req, res) => {
        try {
            const { text } = req.query; // Mengambil parameter query 'text'
            if (!text) {
                return res.status(400).json({ status: false, error: 'Text is required' });
            }
            const apiResponse = await fetchContent(text);
            const { status, result } = apiResponse; // Mengambil status dan result dari respons API

            // Mengembalikan respons yang terstruktur
            res.status(200).json({
                status,
                result // Mengembalikan hanya status dan result
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    });
};
