const axios = require('axios');
const { URLSearchParams } = require('url');

module.exports = function(app) {
    async function simSimi(text, languageCode = 'id') {
        const url = 'https://api.simsimi.vn/v1/simtalk';
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User -Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        };

        const data = new URLSearchParams();
        data.append('text', text);
        data.append('lc', languageCode);

        try {
            const response = await axios.post(url, data.toString(), { headers });
            return response.data.message; // Mengembalikan pesan dari respons
        } catch (error) {
            console.error('Error asking SimSimi:', error.message);
            throw new Error('Gagal mendapatkan respons dari SimSimi');
        }
    }

    app.get('/ai/simsimi', async (req, res) => {
        try {
            const { text, languageCode } = req.query; // Mengambil parameter query 'text' dan 'languageCode'
            if (!text) {
                return res.status(400).json({ status: false, error: 'Text is required' });
            }
            const result = await simSimi(text, languageCode || 'id');
            res.status(200).json({
                status: true,
                result // Mengembalikan hasil dari SimSimi
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    });
};
