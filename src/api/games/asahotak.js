const axios = require('axios');

module.exports = function (app) {
    // Endpoint untuk mengambil data soal Asahotak
    app.get('/games/asahotak', async (req, res) => {
        try {
            // Memanggil API untuk mendapatkan data soal
            const response = await axios.get('https://api.siputzx.my.id/api/games/asahotak', {
                headers: {
                    'accept': 'application/json' // Mengatur header untuk menerima JSON
                }
            });

            // Mengembalikan hasil dari API dengan mengganti 'data' menjadi 'result'
            res.status(response.status).json({
                status: response.data.status,
                result: response.data.data // Mengganti 'data' menjadi 'result'
            });
        } catch (error) {
            console.error('Error fetching Asahotak data:', error.response ? error.response.data : error.message);
            res.status(500).json({ status: false, error: 'Failed to fetch Asahotak data', details: error.response ? error.response.data : error.message });
        }
    });
};
