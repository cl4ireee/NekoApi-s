const axios = require('axios');
const cheerio = require('cheerio');

module.exports = function(app) {
    // Endpoint untuk mengambil berita Mobile Legends
    app.get('/news/mobile-legends', async (req, res) => {
        const url = 'https://www.oneesports.gg/mobile-legends/';

        try {
            const { data } = await axios.get(url);
            const $ = cheerio.load(data);
            let articles = [];

            $('.row.tab-box').each((index, element) => {
                let category = $(element).find('.cat-name').text().trim();
                let title = $(element).find('h2 a').text().trim();
                let link = $(element).find('h2 a').attr('href');
                let description = $(element).find('h3 p').text().trim();
                let author = $(element).find('.author').text().trim();
                let authorLink = $(element).find('.author').attr('href');
                let publishTime = $(element).find('span[data-publish-time]').text().trim();
                let image = $(element).find('img').attr('data-src');

                articles.push({
                    category,
                    title,
                    link,
                    description,
                    author,
                    authorLink,
                    publishTime,
                    image
                });
            });

            // Mengembalikan hasil scraping
            res.status(200).json({
                status: true,
                result: articles
            });
        } catch (error) {
            console.error('Error fetching data:', error);
            res.status(500).json({ status: false, error: 'Error fetching data' });
        }
    });
};
