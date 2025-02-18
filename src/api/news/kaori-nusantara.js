const axios = require('axios');
const cheerio = require('cheerio');

module.exports = function (app) {
    // Endpoint untuk mengambil berita anime
    app.get('/news/anime-news', async (req, res) => {
        const url = 'https://www.kaorinusantara.or.id/rubrik/aktual/anime';

        try {
            const { data } = await axios.get(url);
            const $ = cheerio.load(data);
            let news = [];

            $('.td_module_10.td_module_wrap.td-animation-stack').each((index, element) => {
                const titleElement = $(element).find('.entry-title.td-module-title a');
                const title = titleElement.text().trim();
                const link = titleElement.attr('href');

                const imageElement = $(element).find('.td-module-thumb a img');
                const image = imageElement.attr('src');

                const authorElement = $(element).find('.td-post-author-name a');
                const author = authorElement.text().trim();

                const dateElement = $(element).find('.td-post-date time');
                const date = dateElement.text().trim();

                const excerptElement = $(element).find('.td-excerpt');
                const excerpt = excerptElement.text().trim();

                news.push({
                    title,
                    link,
                    image,
                    author,
                    date,
                    excerpt
                });
            });

            res.status(200).json(news);
        } catch (error) {
            console.error('Error fetching anime news:', error);
            res.status(500).json({ error: 'Failed to fetch anime news' });
        }
    });
};
