const axios = require('axios');
const cheerio = require('cheerio');

// Fungsi untuk mencari anime
async function anime9(query) {
    const { data } = await axios.get(`https://9animetv.to/search?keyword=${query}`);
    const $ = cheerio.load(data);
    const result = [];

    $('.flw-item').each((i, element) => {
        const title = $(element).find('.film-name a').attr('title');
        const url = 'https://9animetv.to' + $(element).find('.film-name a').attr('href');
        const imgSrc = $(element).find('.film-poster-img').attr('data-src');
        const quality = $(element).find('.tick-quality').text();
        const subOrDub = $(element).find('.tick-sub').text() || $(element).find('.tick-dub').text();
        const episode = $(element).find('.tick-eps').text().replace(/\s+/g, ' ').trim();

        result.push({
            title,
            url,
            imgSrc,
            quality,
            subOrDub,
            episode
        });
    });

    return result;
}

// Fungsi untuk mendapatkan detail anime
async function details(url) {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        const title = $(".film-name").text().trim();
        const image = $(".film-poster img").attr("src");
        const alias = $(".alias").text().trim();
        const description = $(".film-description p").text().trim();
        const type = $(".item-title:contains('Type:')").next().text().trim();
        const studio = $(".item-title:contains('Studios:')").next().text().trim();
        const aired = $(".item-title:contains('Date aired:')").next().text().trim();
        const status = $(".item-title:contains('Status:')").next().text().trim();
        const score = $(".item-title:contains('Scores:')").next().text().trim();
        const duration = $(".item-title:contains('Duration:')").next().text().trim();
        const quality = $(".item-title:contains('Quality:')").next().text().trim();
        const views = $(".item-title:contains('Views:')").next().text().trim();

        const genres = [];
        $(".item-title:contains('Genre:')").next().find("a").each((_, el) => genres.push($(el).text().trim()));

        return {
            title,
            image,
            alias,
            description,
            type,
            studio,
            aired,
            status,
            score,
            duration,
            quality,
            views,
            genres,
        };
    } catch (error) {
        console.error("Error fetching details:", error);
        return null;
    }
}

// Fungsi untuk mengatur rute API
module.exports = function setupAnimeRoute(app) {
    app.get('/anime/9anime-search', async (req, res) => {
        const { q } = req.query; // Mengambil parameter q dari query
        if (!q) {
            return res.status(400).json({ status: false, message: 'Query parameter q must be provided.' });
        }

        try {
            const result = await anime9(q);
            return res.json({ status: true, result });
        } catch (error) {
            return res.status(500).json({ status: false, message: 'An error occurred while fetching anime data.' });
        }
    });

    app.get('/anime/9anime-detail', async (req, res) => {
        const { url } = req.query; // Mengambil URL dari query
        if (!url) {
            return res.status(400).json({ status: false, message: 'Anime URL must be provided.' });
        }

        try {
            const result = await details(url);
            return res.json({ status: true, result });
        } catch (error) {
            return res.status(500).json({ status: false, message: 'An error occurred while fetching anime details.' });
        }
    });
};
