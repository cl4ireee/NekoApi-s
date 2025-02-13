const axios = require('axios');
const FormData = require('form-data');

module.exports = function(app) {
    async function traceMoe(imageUrl, limit = 5, minSimilarity = 0.7) {
        const form = new FormData();
        form.append('url', imageUrl);

        try {
            const response = await axios.post('https://api.trace.moe/search', form, {
                headers: form.getHeaders(),
                params: {
                    anilistInfo: true,
                    cutBorders: false
                }
            });

            // Filter hasil
            const filteredResults = response.data.result
                .filter(item => item.similarity >= minSimilarity)
                .slice(0, limit);

            return filteredResults;
        } catch (error) {
            console.error('Error fetching from Trace Moe:', error.message);
            throw error;
        }
    }

    app.get('/ai/tracemoe', async (req, res) => {
        const { imageUrl, limit, minSimilarity } = req.query;

        if (!imageUrl) {
            return res.status(400).json({ status: false, error: 'Image URL is required' });
        }

        try {
            const results = await traceMoe(imageUrl, limit || 5, minSimilarity || 0.7);
            res.status(200).json({
                status: true,
                results
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    });
};
