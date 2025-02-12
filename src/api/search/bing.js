const axios = require('axios');

module.exports = function(app) {
    // Fungsi untuk mengambil data dari API SuraWeb
    async function fetchContent(query) {
        try {
            const response = await axios.get(`https://api.suraweb.online/search/bing?q=${encodeURIComponent(query)}`);
            // Pastikan status API adalah 200 dan data tersedia
            if (response.status !== 200 || !response.data.result) {
                throw new Error('API response is not valid or no results found');
            }
            return response.data;  // Mengembalikan data respons API
        } catch (error) {
            console.error("Error fetching content from SuraWeb API:", error.message);
            // Menambahkan log lebih rinci untuk debugging
            if (error.response) {
                console.error("API response error:", error.response.data);
                console.error("API status error:", error.response.status);
            } else if (error.request) {
                console.error("No response received from API:", error.request);
            }
            throw error;
        }
    }

    // Endpoint pencarian berdasarkan query 'q'
    app.get('/search/bing', async (req, res) => {
        try {
            const { q } = req.query; // Mengambil parameter query 'q'
            if (!q) {
                return res.status(400).json({ status: false, error: 'Query parameter is required' });
            }

            // Mengambil data dari API SuraWeb
            const apiResponse = await fetchContent(q);
            const { status, result } = apiResponse; // Mengambil status dan result dari respons API

            // Memeriksa apakah ada hasil
            if (!result || result.length === 0) {
                return res.status(404).json({ status: false, error: 'No results found for your query.' });
            }

            // Mengembalikan respons yang terstruktur dengan hasil pencarian
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
            res.status(500).json({ status: false, error: error.message });
        }
    });
};
