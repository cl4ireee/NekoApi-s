const axios = require('axios');

module.exports = function(app) {
    async function fetchContent(query) {
        try {
            const response = await axios.get(`https://api.suraweb.online/search/bing?q=${encodeURIComponent(query)}`);
            console.log('API Response:', response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching content from SuraWeb API:", error.message);
            if (error.response) {
                console.error("Error response from API:", error.response.data);
            } else if (error.request) {
                console.error("No response received:", error.request);
            } else {
                console.error("Error", error.message);
            }
            throw error;
        }
    }

    app.get('/search/bing', async (req, res) => {
        try {
            const { q } = req.query;
            if (!q) {
                return res.status(400).json({ status: false, error: 'Query parameter is required' });
            }

            const apiResponse = await fetchContent(q);
            
            // Memeriksa apakah apiResponse memiliki struktur yang benar
            if (!apiResponse || typeof apiResponse !== 'object') {
                return res.status(500).json({ status: false, error: 'Invalid API response' });
            }

            const { status, result } = apiResponse;

            // Memeriksa apakah ada hasil
            if (!result || result.length === 0) {
                return res.status(404).json({ status: false, error: 'Tidak ada hasil yang ditemukan.' });
            }

            // Mengembalikan respons yang terstruktur
            res.status(200).json({
                status,
                results: result.map(item => ({
                    title: item.title,
                    description: item.description,
                    link: item.link
                }))
            });
        } catch (error) {
            console.error("Error processing the request:", error.message);
            res.status(500).json({ status: false, error: 'Terjadi kesalahan dalam memproses permintaan.' });
        }
    });
};
