const axios = require('axios');

module.exports = function(app) {
    app.get('/ai/simsimi', async (req, res) => {
        const { text, languageCode } = req.query; // Mengambil parameter query 'text' dan 'languageCode'

        if (!text) {
            return res.status(400).json({ status: false, error: 'Text is required' });
        }

        const url = 'https://api.simsimi.vn/v1/simtalk';
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User -Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        };

        const data = new URLSearchParams();
        data.append('text', text);
        data.append('lc', languageCode || 'id');

        try {
            const response = await axios.post(url, data.toString(), { headers });
            console.log('API Response:', response.data); // Log respons dari API

            res.status(200).json({
                status: true,
                result: response.data.message // Mengembalikan pesan dari SimSimi
            });
        } catch (error) {
            console.error('Error asking SimSimi:', error.message);
            res.status(500).json({ status: false, error: 'Failed to get response from SimSimi' });
        }
    });
};
