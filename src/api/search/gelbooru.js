const axios = require('axios');
const cheerio = require('cheerio');

module.exports = function(app) {
    // Endpoint untuk mencari gambar di Gelbooru
    app.get('/search/gelbooru', async (req, res) => {
        const { q } = req.query; // Mengambil parameter q dari query
        if (!q) {
            return res.status(400).json({ status: false, error: 'Query parameter is required' });
        }

        try {
            // Melakukan pencarian di Gelbooru
            const response = await axios.get('https://gelbooru.com/index.php?page=post&s=list&tags=' + encodeURIComponent(q));
            const html = response.data;
            const $ = cheerio.load(html);
            const images = [];

            // Mengambil informasi gambar dari hasil pencarian
            $('.thumbnail-preview').each((index, element) => {
                const imageLink = $(element).find('a').attr('href');
                const imageSrc = $(element).find('img').attr('src');
                const imageTitle = $(element).find('img').attr('title');
                const imageDesc = $(element).find('img').attr('alt');

                images.push({
                    link: imageLink,
                    image: imageSrc,
                    title: imageTitle,
                    desc: imageDesc
                });
            });

            // Mengembalikan hasil pencarian
            res.status(200).json({
                status: true,
                result: images
            });
        } catch (error) {
            // Menangani kesalahan
            console.error('Error fetching images:', error);
            res.status(500).json({ status: false, error: error.message });
        }
    });
};
