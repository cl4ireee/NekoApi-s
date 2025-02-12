const axios = require("axios");

module.exports = function(app) {
    app.get('/anime/nekopoiupdt', async (req, res) => {
        try {
            const response = await axios.get("https://archive-ui.tanakadomp.biz.id/asupan/nekopoi");
            const data = response.data;

            // Memastikan data yang diterima memiliki status dan hasil yang benar
            if (data && data.status) {
                const nekopoiList = data.result.map(item => ({
                    title: item.title,
                    upload: item.upload,
                    url: item.URL
                }));

                // Mengembalikan respons dengan status dan hasil
                res.status(200).json({
                    status: true,
                    results: nekopoiList // Mengembalikan daftar dari Nekopoi tanpa filter
                });
            } else {
                res.status(500).json({ status: false, error: 'Failed to fetch valid data from Nekopoi' });
            }
        } catch (error) {
            console.error('Error fetching Nekopoi data:', error.message);
            res.status(500).json({ status: false, error: `Terjadi kesalahan: ${error.message}` });
        }
    });
}
