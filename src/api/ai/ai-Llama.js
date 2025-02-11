const axios = require('axios');

module.exports = function(app) {
    async function fetchLlamaData(prompt, text) {
        try {
            const response = await axios.get(`https://api.siputzx.my.id/api/ai/llama33?prompt=${encodeURIComponent(prompt)}&text=${encodeURIComponent(text)}`);
            return response.data; // Mengembalikan data dari respons
        } catch (error) {
            console.error("Error fetching content from Llama33 API:", error.message);
            throw error;
        }
    }

    app.get('/ai/Llama', async (req, res) => {
        try {
            const { prompt, text } = req.query; // Mengambil parameter query 'prompt' dan 'text'
            if (!prompt || !text) {
                return res.status(400).json({ status: false, error: 'Prompt and text are required' });
            }
            const apiResponse = await fetchLlamaData(prompt, text); // Mengambil respons dari API
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
