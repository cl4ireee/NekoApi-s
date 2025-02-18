const axios = require('axios');
const cheerio = require('cheerio');

class Animexin {
    Update = async function() {
        try {
            const { data } = await axios.get('https://animexin.dev/');
            const $ = cheerio.load(data);
            const animeList = [];

            $('.listupd .bsx').each((index, element) => {
                const title = $(element).find('h2[itemprop="headline"]').text();
                const url = $(element).find('a[itemprop="url"]').attr('href');
                const image = $(element).find('img[itemprop="image"]').attr('src');
                const episode = $(element).find('.eggepisode').text();
                const type = $(element).find('.eggtype').text();

                animeList.push({
                    title,
                    url,
                    image,
                    episode,
                    type
                });
            });

            return animeList;
        } catch (error) {
            return error.message;
        }
    }

    Detail = async function(url) {
        try {
            const { data } = await axios.get(url);
            const $ = cheerio.load(data);

            const episodeData = {
                title: $('h2[itemprop="partOfSeries"]').text(),
                episodeTitle: $('h2[itemprop="headline"]').text(),
                image: $('.thumb img[itemprop="image"]').attr('src'),
                rating: $('.rating strong').text(),
                status: $('.spe span:contains("Status:")').text().replace('Status: ', ''),
                network: $('.spe span:contains("Network:") a').text(),
                studio: $('.spe span:contains("Studio:") a').text(),
                released: $('.spe span:contains("Released:")').text().replace('Released: ', ''),
                duration: $('.spe span:contains("Duration:")').text().replace('Duration: ', ''),
                country: $('.spe span:contains("Country:") a').text(),
                type: $('.spe span:contains("Type:")').text().replace('Type: ', ''),
                episodes: $('.spe span:contains("Episodes:")').text().replace('Episodes: ', ''),
                fansub: $('.spe span:contains("Fansub:")').text().replace('Fansub: ', ''),
                genres: $('.genxed a').map((i, el) => $(el).text()).get(),
                description: $('.desc.mindes').text().trim(),
                downloadLinks: []
            };

            $('.mctnx .soraddlx').each((index, element) => {
                const subtitleType = $(element).find('.sorattlx h3').text();
                const links = $(element).find('.soraurlx a').map((i, el) => ({
                    url: $(el).attr('href')
                })).get();

                episodeData.downloadLinks.push({
                    subtitleType,
                    links
                });
            });

            return JSON.stringify(episodeData, null, 2);
        } catch (error) {
            return error.message;
        }
    }

    Search = async function(keyword) {
        try {
            const { data } = await axios.get('https://animexin.dev/?s=' + keyword);
            const $ = cheerio.load(data);

            const animeList = [];

            $('.listupd article.bs').each((index, element) => {
                const title = $(element).find('h2[itemprop="headline"]').text();
                const url = $(element).find('a[itemprop="url"]').attr('href');
                const image = $(element).find('img[itemprop="image"]').attr('src');
                const status = $(element).find('.epx').text();
                const subtitle = $(element).find('.sb').text();
                const type = $(element).find('.typez').text();

                animeList.push({
                    title,
                    url,
                    image,
                    status,
                    subtitle,
                    type
                });
            });

            return JSON.stringify(animeList, null, 2);
        } catch (error) {
            return error.message;
        }
    }
}

// Fungsi API menggunakan `app.get`
module.exports = (app) => {
    const animexin = new Animexin();

    // Endpoint untuk update daftar anime
    app.get('/anime/animexin-update', async (req, res) => {
        const result = await animexin.Update();
        res.json({ status: 'success', results: result });
    });

    // Endpoint untuk mencari anime berdasarkan keyword
    app.get('/anime/animexin-search', async (req, res) => {
        const keyword = req.query.keyword;
        if (!keyword) {
            return res.status(400).json({ status: 'error', message: 'Keyword query is required.' });
        }
        const result = await animexin.Search(keyword);
        res.json({ status: 'success', results: JSON.parse(result) });
    });

    // Endpoint untuk detail anime
    app.get('/anime/animexin-detail', async (req, res) => {
        const url = req.query.url;
        if (!url) {
            return res.status(400).json({ status: 'error', message: 'URL query is required.' });
        }
        const result = await animexin.Detail(url);
        res.json({ status: 'success', result: JSON.parse(result) });
    });
};
