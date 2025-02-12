const axios = require('axios');

module.exports = function(app) {
    // Endpoint untuk mengambil data dari Videy
    app.get('/download/videy', async (req, res) => {
        const url = 'https://archive-ui.tanakadomp.biz.id/download/videy?url=https%3A%2F%2Fvidey.co%2Fv%3Fid%3DDOPLRxJP1';

        try {
            const { data } = await axios.get(url);
            // Mengembalikan hasil dari API
            res.status(200).json({
                status: data.status,
                result: data.result
            });
        } catch (error) {
            console.error('Error fetching data from Videy:', error.message);
            res.status(500).json({ status: false, error: 'Error fetching data' });
        }
    });
};
