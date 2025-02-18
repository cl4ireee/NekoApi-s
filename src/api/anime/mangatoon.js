const fetch = require('node-fetch');

/**
 * Fungsi untuk mengatur API pencarian manga
 * @param {Object} app - Objek aplikasi
 */
module.exports = function (app) {
    // Endpoint untuk mencari manga
    app.get('/search/mangatoon', async (req, res) => {
        try {
            const q = req.query.q; // Mengambil parameter 'q' dari query string
            if (!q) {
                return res.status(400).json({ status: false, message: "Query parameter 'q' is required" });
            }

            const response = await fetch(`https://api.siputzx.my.id/api/s/mangatoon?query=${encodeURIComponent(q)}`);
            const data = await response.json();

            // Mengubah 'data' menjadi 'results'
            return res.json({
                status: data.status,
                results: {
                    internet: data.data.internet,
                    komik: data.data.komik,
                    novel: data.data.novel
                }
            });
        } catch (error) {
            return res.status(500).json({ status: false, message: "Internal Server Error", error: error.message });
        }
    });
};
