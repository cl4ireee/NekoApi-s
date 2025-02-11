const axios = require('axios');

module.exports = function(app) {
    async function fetchAnimeImages() {
        try {
            const { data } = await axios.get('https://archive-ui.tanakadomp.biz.id/asupan/anime');
            return data.result; // Mengembalikan hasil dari API
        } catch (error) {
            throw error;
        }
    }

    app.get('/random/anime', async (req, res) => {
        try {
            const results = await fetchAnimeImages();
            const randomImage = results[Math.floor(Math.random() * results.length)]; // Mengambil gambar acak

            // Mengambil URL gambar
            const imageUrl = randomImage.image; 
            const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });

            res.writeHead(200, {
                'Content-Type': 'image/png', // Mengatur Content-Type ke image/png
                'Content-Length': imageResponse.data.length,
            });
            res.end(imageResponse.data);
        } catch (error) {
            res.status(500).send(`Error: ${error.message}`);
        }
    });
};
