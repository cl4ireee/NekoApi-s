const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Get Jadwal Sholat by Kota
 * @param {String} kota 
 * @returns {Object}
 */
async function jadwalSolat(kota) {
    let { data } = await axios.get(`https://jadwal-imsakiyah.tirto.id/${kota.replace(' ', '-').replace('.', '')}`, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36"
        }
    });
    const $ = cheerio.load(data);
    let imsak = $('b.font59').eq(0).text().trim(),
        subuh = $('b.font59').eq(1).text().trim(),
        dzuhur = $('b.font59').eq(2).text().trim(),
        ashar = $('b.font59').eq(3).text().trim(),
        maghrib = $('b.font59').eq(4).text().trim(),
        isya = $('b.font59').eq(5).text().trim(),
        all = [];

    $('.table-content-sholat').each((i, e) => {
        let tanggal = $(e).find('td').eq(0).text().trim(),
            imsak = $(e).find('td').eq(1).text().trim(),
            subuh = $(e).find('td').eq(2).text().trim(),
            dzuhur = $(e).find('td').eq(3).text().trim(),
            ashar = $(e).find('td').eq(4).text().trim(),
            maghrib = $(e).find('td').eq(5).text().trim(),
            isya = $(e).find('td').eq(6).text().trim();
        all.push({
            tanggal,
            jadwal: {
                imsak,
                subuh,
                dzuhur,
                ashar,
                maghrib,
                isya
            }
        });
    });

    return {
        imsak,
        subuh,
        dzuhur,
        ashar,
        maghrib,
        isya,
        all
    };
}

/**
 * Search City by Query
 * @param {String} q 
 * @returns {Array}
 */
async function searchCity(q) {
    let { data } = await axios.get(`https://jadwal-imsakiyah.tirto.id/cities?q=${q}`, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36"
        }
    });
    return data;
}

/**
 * Export the function to create the API endpoints
 * @param {Object} app - Express app object
 */
module.exports = function (app) {
    // Endpoint untuk mendapatkan jadwal sholat berdasarkan kota
    app.get('/search/jadwal-solat', async (req, res) => {
        try {
            const { q } = req.query;

            if (!q) {
                return res.status(400).json({ error: 'Parameter `kota` is required' });
            }

            const result = await jadwalSolat(kota);
            res.json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    // Endpoint untuk mencari kota berdasarkan query
    app.get('/search-city', async (req, res) => {
        try {
            const { q } = req.query;

            if (!q) {
                return res.status(400).json({ error: 'Parameter `q` is required' });
            }

            const result = await searchCity(q);
            res.json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
};
