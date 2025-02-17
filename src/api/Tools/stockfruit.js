const axios = require('axios');

module.exports = function (app) {
    // Endpoint untuk mengambil data stok buah
    app.get('/info/stockfruit', async (req, res) => {
        try {
            // Memanggil API untuk mendapatkan data stok buah
            const response = await axios.get('https://api.suraweb.online/info/stockfruit', {
                headers: {
                    'accept': 'application/json' // Mengatur header untuk menerima JSON
                }
            });

            // Mengembalikan hasil dari API
            res.status(response.status).json({
                status: response.data.status,
                data: response.data.data // Mengembalikan data tanpa bagian creator
            });
        } catch (error) {
            console.error('Error fetching stock fruit data:', error.response ? error.response.data : error.message);
            res.status(500).json({ status: false, error: 'Failed to fetch stock fruit data', details: error.response ? error.response.data : error.message });
        }
    });
};
