const axios = require('axios');

module.exports = function(app) {
    async function fetchLlamaData(prompt, text) {
        try {
            const url = `https://api.siputzx.my.id/api/ai/llama33?prompt=${encodeURIComponent(prompt)}&text=${encodeURIComponent(text)}`;
            console.log("Fetching data from URL:", url); // Log URL
            const response = await axios.get(url);
            return response.data; // Mengembalikan data dari respons
        } catch (error) {
            console.error("Error fetching content from Llama33 API:", error.message);
            throw error; // Pastikan untuk melempar error agar bisa ditangkap di catch block
        }
    }

    app.get('/ai/Llama', async (req, res) => {
        try {
            const { prompt, text } = req.query; // Mengambil parameter query 'prompt' dan 'text'
            if (!prompt || !text) {
                return res.status(400).json({ status: false, error: 'Prompt and text are required' });
            }
            const apiResponse = await fetchLlamaData(prompt, text); // Mengambil respons dari API
            
            // Memeriksa apakah respons memiliki status true
            if (apiResponse && apiResponse.status) {
                res.status(200).json({
                    status: true,
                    result: apiResponse.data // Menggunakan data dari respons API
                });
            } else {
                res.status(500).json({ status: false, error: 'Failed to fetch data' });
            }
        } catch (error) {
            console.error("Error in /ai/Llama:", error); // Log error
            res.status(500).json({ status: false, error: 'Terjadi kesalahan di server. Silakan coba lagi nanti.' });
        }
    });
};
