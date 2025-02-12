const axios = require("axios");

module.exports = function(app) {
    app.get('/search/bing', async (req, res) => {
        const query = req.query.q; // Mengambil parameter 'q' dari URL
        
        // Memastikan parameter 'q' ada
        if (!query) {
            return res.status(400).json({ status: false, error: 'Query parameter "q" is required' });
        }

        try {
            // Melakukan request ke API eksternal dengan query parameter 'q'
            const response = await axios.get(`https://api.suraweb.online/search/bing?q=${encodeURIComponent(query)}`);
            const data = response.data;

            // Memastikan data yang diterima sesuai dengan struktur yang diharapkan
            if (data && data.status === 'true') {
                const results = data.result.map(item => ({
                    title: item.title,
                    description: item.description,
                    link: item.link
                }));

                // Mengembalikan respons dengan status dan hasil pencarian
                res.status(200).json({
                    status: true,
                    creator: data.creator, // Mengambil creator dari respons
                    result: results // Mengembalikan daftar hasil pencarian
                });
            } else {
                res.status(500).json({ status: false, error: 'Failed to fetch data from SuraWeb API' });
            }
        } catch (error) {
            console.error('Error fetching SuraWeb data:', error.message);
            res.status(500).json({ status: false, error: `Terjadi kesalahan: ${error.message}` });
        }
    });
}
