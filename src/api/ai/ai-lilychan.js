const axios = require('axios');

module.exports = function(app) {
    async function fetchLilychanData(text) {
        try {
            const response = await axios.get(`https://archive-ui.tanakadomp.biz.id/ai/lilychan?text=${encodeURIComponent(text)}`);
            return response.data; // Mengembalikan data dari respons
        } catch (error) {
            console.error("Error fetching content from Lilychan API:", error.message);
            throw error;
        }
    }

    app.get('/ai/lilychan', async (req, res) => {
        try {
            const { text } = req.query; // Mengambil parameter query 'text'
            if (!text) {
                return res.status(400).json({ status: false, error: 'Text is required' });
            }
            const apiResponse = await fetchLilychanData(text); // Mengambil respons dari API
            
            // Memeriksa apakah respons memiliki status true
            if (apiResponse && apiResponse.status) {
                res.status(200).json({
                    status: true,
                    result: {
                        image: apiResponse.result.image, // Menggunakan URL gambar dari respons API
                        message: apiResponse.result.message // Menggunakan pesan dari respons API
                    }
                });
            } else {
                res.status(500).json({ status: false, error: 'Failed to fetch data' });
            }
        } catch (error) {
            console.error("Error in /ai/lilychan:", error); // Log error
            res.status(500).json({ status: false, error: error.message });
        }
    });
};
