const axios = require('axios');
const cheerio = require('cheerio');

module.exports = function (app) {
    app.get('/news/anime-news', async (req, res) => {
        const url = 'https://www.kaorinusantara.or.id/rubrik/aktual/anime';

        try {
            const { data } = await axios.get(url, {
                headers: {
                    'User -Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
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
            console.error('Error fetching anime news:', error.message);
            res.status(500).json({ error: 'Failed to fetch anime news' });
        }
    });
};
