const axios = require('axios');

module.exports = function(app) {
    app.get('/search/googleimg', async (req, res) => {
        const { q } = req.query; // Mengambil parameter query 'q'
        if (!q) {
            return res.status(400).json({ status: false, error: 'Query parameter is required' });
        }

        try {
            // Mengambil data dari API dengan query pencarian
            const response = await axios.get(`https://archive-ui.tanakadomp.biz.id/search/googleimg?q=${encodeURIComponent(q)}`);
            const { status, result } = response.data; // Mengambil status dan result dari respons API

            if (!status) {
                return res.status(404).json({ status: false, error: 'No results found' });
            }

            // Mengembalikan respons yang terstruktur tanpa creator
            res.status(200).json({
                status,
                results: result // Mengembalikan hasil pencarian
            });
        } catch (error) {
            console.error("Error fetching images from Google Image API:", error.message);
            res.status(500).json({ status: false, error: error.message });
        }
    });
};
