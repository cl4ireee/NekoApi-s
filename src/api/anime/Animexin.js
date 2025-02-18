const axios = require('axios');
const cheerio = require('cheerio');

// Animexin Scraper Class
class Animexin {
    // Update - Mengambil list anime terbaru
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

            return { status: true, result: animeList };
        } catch (error) {
            return { status: false, result: error.message };
        }
    }

    // Detail - Mendapatkan detail episode berdasarkan URL
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

            return { status: true, result: episodeData };
        } catch (error) {
            return { status: false, result: error.message };
        }
    }

    // Search - Mencari anime berdasarkan query
    Search = async function(query) {
        try {
            const { data } = await axios.get('https://animexin.dev/?s=' + query);
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

            return { status: true, result: animeList };
        } catch (error) {
            return { status: false, result: error.message };
        }
    }
}

// Menyusun API menggunakan `app.get` tanpa mengimpor Express secara langsung
const AnimexinAPI = (app) => {
    // Endpoint untuk mendapatkan update anime
    app.get('/anime/animexin-update', async (req, res) => {
        const animexin = new Animexin();
        const updateData = await animexin.Update();
        res.json(updateData);
    });

    // Endpoint untuk mencari anime berdasarkan query
    app.get('/anime/animexin-search', async (req, res) => {
        const { q } = req.query; // Mengambil query parameter q
        const animexin = new Animexin();
        const searchData = await animexin.Search(q);
        res.json(searchData);
    });

    // Endpoint untuk mendapatkan detail anime berdasarkan URL
    app.get('/anime/animexin-detail', async (req, res) => {
        const { url } = req.query; // Mengambil query parameter url
        const animexin = new Animexin();
        const detailData = await animexin.Detail(url);
        res.json(detailData);
    });
}

module.exports = AnimexinAPI;
