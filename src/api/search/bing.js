const axios = require("axios");

module.exports = function(app) {
    // Endpoint untuk pencarian dengan menggunakan API SuraWeb
    app.get('/search/bing', async (req, res) => {
        const query = req.query.q;

        if (!query) {
            return res.status(400).json({ status: false, error: 'Query parameter "q" is required' });
        }

        try {
            // Mengambil data dari API SuraWeb dengan query yang diberikan
            const response = await axios.get(`https://api.suraweb.online/search/bing?q=${encodeURIComponent(query)}`);
            const data = response.data;

            if (data.status === true && data.result && data.result.length > 0) {
                const results = data.result.map(item => ({
                    title: item.title,
                    description: item.description,
                    link: item.link
                }));

                // Mengembalikan hasil pencarian ke pengguna
                res.status(200).json({
                    status: true,
                    creator: data.creator,
                    result: results
                });
            } else {
                res.status(404).json({ status: false, error: 'No results found' });
            }
        } catch (error) {
            console.error('Error fetching data from SuraWeb:', error.message);
            res.status(500).json({ status: false, error: `Terjadi kesalahan: ${error.message}` });
        }
    });
}
