const axios = require('axios');

module.exports = function (app) {
    // Endpoint untuk melakukan IP Lookup
    app.get('/tools/ip-lookup', async (req, res) => {
        const { q } = req.query; // Mengambil parameter 'q' dari query string

        if (!q) {
            return res.status(400).json({ status: false, error: "Query parameter 'q' is required" });
        }

        try {
            const response = await axios.get(`https://whoisjson.com/api/v1/whois?domain=${q}`, {
                headers: {
                    'Authorization': 'Token=4d0b7541d8d3a6e9b4daeb0c2a2497b9602cac13d62b9d4a84e94f5869a0d4da' // Ganti dengan token Anda
                }
            });

            res.status(200).json({ status: true, data: response.data });
        } catch (error) {
            console.error('Error fetching IP lookup data:', error.message);
            res.status(500).json({ status: false, error: 'Failed to fetch IP lookup data' });
        }
    });
};
