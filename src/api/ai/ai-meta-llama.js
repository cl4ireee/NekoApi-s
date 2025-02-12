const axios = require('axios');

module.exports = function(app) {
    async function fetchContent(content) {
        try {
            const response = await axios.get(`https://api.siputzx.my.id/api/ai/meta-llama-33-70B-instruct-turbo?content=${encodeURIComponent(content)}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching content from Meta Llama API:", error.message);
            throw error;
        }
    }

    app.get('/ai/meta-llama', async (req, res) => {
        try {
            const { content } = req.query;
            if (!content) {
                return res.status(400).json({ status: false, error: 'Content is required' });
            }

            const apiResponse = await fetchContent(content);
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
