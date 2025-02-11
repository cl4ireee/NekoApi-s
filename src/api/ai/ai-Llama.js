const axios = require('axios');

module.exports = function(app) {
    async function fetchContent(content) {
        try {
            const response = await axios.post('https://luminai.my.id/', { content });
            return response.data; // Mengembalikan data dari respons
        } catch (error) {
            console.error("Error fetching content from LuminAI:", error);
            throw error;
        }
    }

    app.get('/ai/Llama', async (req, res) => {
        try {
            const { text } = req.query;
            if (!text) {
                return res.status(400).json({ status: false, error: 'Text is required' });
            }
            const apiResponse = await fetchContent(text); // Mengambil respons dari API
            if (apiResponse.status) {
                res.status(200).json({
                    status: true,
                    result: apiResponse.data // Menggunakan data dari respons API
                });
            } else {
                res.status(500).json({ status: false, error: 'Failed to fetch data' });
            }
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    });
};
