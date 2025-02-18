const axios = require('axios');
const cheerio = require('cheerio');

const newsUrl = 'https://www.kaorinusantara.or.id/newsline';
const animeNewsUrl = 'https://www.kaorinusantara.or.id/rubrik/aktual/anime';

// Fungsi untuk mengambil semua berita (termasuk non-anime)
async function fetchNews() {
    try {
        const { data } = await axios.get(newsUrl);
        const $ = cheerio.load(data);
        let news = [];

        $('.td_module_10.td_module_wrap').each((index, element) => {
            const titleElement = $(element).find('.entry-title.td-module-title a');
            const title = titleElement.text().trim();
            const link = titleElement.attr('href');

            const categoryElement = $(element).find('.td-post-category');
            const category = categoryElement.text().trim();
            const categoryLink = categoryElement.attr('href');

            const authorElement = $(element).find('.td-post-author-name a');
            const author = authorElement.text().trim();
            const authorLink = authorElement.attr('href');

            const dateElement = $(element).find('.td-post-date time');
            const date = dateElement.text().trim();

            const imgElement = $(element).find('.td-module-thumb img');
            const imgSrc = imgElement.attr('src');

            const excerptElement = $(element).find('.td-excerpt');
            const excerpt = excerptElement.text().trim();

            news.push({
                title,
                link,
                category,
                categoryLink,
                author,
                authorLink,
                date,
                imgSrc,
                excerpt,
            });
        });

        return news;
    } catch (error) {
        console.error('Error fetching news:', error);
        return [];
    }
}

// Fungsi untuk mengambil berita anime saja
async function fetchOnlyAnimeNews() {
    try {
        const { data } = await axios.get(animeNewsUrl);
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

        return news;
    } catch (error) {
        console.error('Error fetching anime news:', error);
        return [];
    }
}

// Fungsi untuk menghubungkan ke `app`
module.exports = function(app) {
    // Endpoint untuk semua berita
    app.get('/news', async (req, res) => {
        const data = await fetchNews();
        res.json({ status: 200, total: data.length, data });
    });

    // Endpoint untuk berita anime saja
    app.get('/news/anime-news', async (req, res) => {
        const data = await fetchOnlyAnimeNews();
        res.json({ status: 200, total: data.length, data });
    });
};
