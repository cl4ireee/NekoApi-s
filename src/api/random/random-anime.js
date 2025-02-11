const axios = require('axios');

module.exports = function(app) {
    async function fetchAnimeImages() {
        try {
            const { data } = await axios.get('https://archive-ui.tanakadomp.biz.id/asupan/anime', { timeout: 10000 }); // Timeout 10 detik
            if (!data.result || !Array.isArray(data.result)) {
                throw new Error('Invalid response structure from Anime API');
            }
            return data.result; // Mengembalikan hasil dari API
        } catch (error) {
            console.error("Error fetching content from Anime API:", error.message); // Pesan kesalahan
            throw error;
        }
    }

    app.get('/random/anime', async (req, res) => {
        try {
            const results = await fetchAnimeImages();
            if (results.length === 0) {
                return res.status(404).send('No images found');
            }
            const randomImage = results[Math.floor(Math.random() * results.length)]; // Mengambil gambar acak
            const imageUrl = randomImage.image; 
            const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });

            res.writeHead(200, {
                'Content-Type': 'image/png', // Atau 'image/jpeg' tergantung pada format gambar
                'Content-Length': imageResponse.data.length,
            });
            res.end(imageResponse.data);
        } catch (error) {
            console.error("Error in /random/anime endpoint:", error.message); // Logging kesalahan
            res.status(500).send(`Error: ${error.message}`);
        }
    });
};
