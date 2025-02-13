const axios = require('axios');
const FormData = require('form-data');

module.exports = function(app) {
    async function simSimi(text, languageCode = 'id') {
        const form = new FormData();
        form.append('text', text);
        form.append('lc', languageCode);

        try {
            const { data } = await axios.post('https://api.simsimi.vn/v1/simtalk', form, {
                headers: {
                    ...form.getHeaders(),
                }
            });
            return data;
        } catch (error) {
            console.error('Error fetching from SimSimi:', error);
            throw new Error('Failed to fetch response from SimSimi');
        }
    }

    app.get('/ai/simsimi', async (req, res) => {
        try {
            const { text, languageCode } = req.query;
            if (!text) {
                return res.status(400).json({ status: false, error: 'Text is required' });
            }
            const result = await simSimi(text, languageCode || 'id');
            res.status(200).json({
                status: true,
                result: result.message // Pastikan ini sesuai dengan struktur respons API
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    });
};
