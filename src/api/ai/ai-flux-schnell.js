const axios = require('axios');

module.exports = function(app) {
    app.get('/ai/flux-schnell', async (req, res) => {
        try {
            const { text } = req.query; // Mengambil parameter 'text' dari query

            if (!text) {
                return res.status(400).json({ status: false, error: 'Text is required' });
            }

            // Mengakses API eksternal dengan parameter 'text'
            const response = await axios.get(`https://api.rynn-archive.biz.id/ai/flux-schnell?text=${encodeURIComponent(text)}`, {
                responseType: 'arraybuffer' // Mengambil respons sebagai array buffer
            });

            // Mengatur header untuk mengembalikan gambar
            res.set('Content-Type', 'image/png');
            res.set('Content-Length', response.data.length);
            res.send(response.data); // Mengirimkan data gambar sebagai respons
        } catch (error) {
            console.error('Error fetching data from external API:', error.message);
            res.status(500).json({ status: false, error: 'Error fetching data from external API' });
        }
    });
};
