const axios = require('axios');

module.exports = function (app) {
    // Endpoint untuk melakukan IP Lookup
    app.get('/tools/iplookup', async (req, res) => {
        const { q } = req.query; // Mengambil parameter 'q' dari query string

        if (!q) {
            return res.status(400).json({ status: false, error: "Query parameter 'q' is required" });
        }

        try {
            // Memanggil API untuk melakukan IP Lookup
            const response = await axios.get(`https://fastrestapis.fasturl.cloud/tool/iplookup?query=${encodeURIComponent(q)}`, {
                headers: {
                    'accept': 'application/json' // Mengatur header untuk menerima JSON
                }
            });

            // Mengembalikan hasil dari API
            res.status(response.status).json(response.data);
        } catch (error) {
            console.error('Error fetching IP lookup data:', error.response ? error.response.data : error.message);
            res.status(500).json({ status: false, error: 'Failed to fetch IP lookup data', details: error.response ? error.response.data : error.message });
        }
    });
};
