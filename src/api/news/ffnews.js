const axios = require('axios');
const cheerio = require('cheerio');

module.exports = function(app) {
    // Endpoint untuk mengambil berita Free Fire
    app.get('/news/free-fire', async (req, res) => {
        const url = 'https://ff.garena.com/id/news/'; // URL berita Free Fire

        try {
            const { data } = await axios.get(url);
            const $ = cheerio.load(data);
            let articles = [];

            $('.news-item').each((index, element) => {
                let title = $(element).find('.news-title').text().trim() || 'Tidak ada judul';
                let link = $(element).find('.news-link').attr('href');
                if (link && !link.startsWith('http')) {
                    link = new URL(link, url).href; // Menggabungkan dengan domain utama
                }
                let description = $(element).find('.news-description').text().trim() || 'Tidak ada deskripsi';
                let date = $(element).find('.news-time').text().trim() || 'Tidak ada waktu publikasi';
                let image = $(element).find('.news-cover img').attr('data-src') || '';

                articles.push({
                    title,
                    link,
                    description,
                    date,
                    image
                });
            });

            // Mengembalikan hasil scraping
            res.status(200).json({
                status: true,
                result: articles
            });
        } catch (error) {
            console.error('Error fetching data:', error.message);
            res.status(500).json({ status: false, error: 'Error fetching data' });
        }
    });
};
