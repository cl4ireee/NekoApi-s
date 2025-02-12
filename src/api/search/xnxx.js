const axios = require('axios');

module.exports = function(app) {
    async function fetchContent(query) {
        try {
            const response = await axios.get(`https://archive-ui.tanakadomp.biz.id/search/xnxx?q=${encodeURIComponent(query)}`);
            console.log('Respons API:', response.data);
            return response.data;
        } catch (error) {
            console.error("Kesalahan saat mengambil konten dari API TanakaDomp:", error.message);
            if (error.response) {
                console.error("Respons kesalahan dari API:", error.response.data);
            } else if (error.request) {
                console.error("Tidak ada respons yang diterima:", error.request);
            } else {
                console.error("Kesalahan", error.message);
            }
            throw error;
        }
    }

    app.get('/search/xnxxsearch', async (req, res) => {
        try {
            const { q } = req.query; // Mengambil parameter query 'q'
            if (!q) {
                return res.status(400).json({ status: false, error: 'Parameter query diperlukan' });
            }

            const apiResponse = await fetchContent(q);
            const { status, result } = apiResponse; // Mengambil status dan hasil dari respons API

            // Memeriksa apakah ada hasil
            if (!result || result.length === 0) {
                return res.status(404).json({ status: false, error: 'Tidak ada hasil yang ditemukan.' });
            }

            // Mengembalikan respons yang terstruktur
            res.status(200).json({
                status,
                results: result.map(item => ({
                    title: item.title,
                    info: item.info,
                    link: item.link
                }))
            });
        } catch (error) {
            console.error("Kesalahan saat memproses permintaan:", error.message);
            res.status(500).json({ status: false, error: 'Terjadi kesalahan saat memproses permintaan.' });
        }
    });
};
