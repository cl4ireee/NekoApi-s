const axios = require("axios");

module.exports = function(app) {
    app.get('/anime/nekopoiupdt', async (req, res) => {
        const { query } = req.query; // Mengambil parameter query dari URL
        if (!query) {
            return res.status(400).json({ status: false, error: 'Query parameter is required' });
        }

        try {
            const response = await axios.get("https://archive-ui.tanakadomp.biz.id/asupan/nekopoi");
            const data = response.data;

            // Memastikan data yang diterima sesuai dengan struktur yang diharapkan
            if (data.status) {
                const nekopoiList = data.result.filter(item => 
                    item.title.toLowerCase().includes(query.toLowerCase())
                ).map(item => ({
                    title: item.title,
                    upload: item.upload,
                    url: item.URL
                }));

                // Mengembalikan respons dengan status dan hasil
                res.status(200).json({
                    status: true,
                    results: nekopoiList // Mengembalikan daftar dari Nekopoi yang sesuai dengan query
                });
            } else {
                res.status(500).json({ status: false, error: 'Failed to fetch data from Nekopoi' });
            }
        } catch (error) {
            console.error('Error fetching Nekopoi data:', error.message);
            res.status(500).json({ status: false, error: `Terjadi kesalahan: ${error.message}` });
        }
    });
}
