const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Scrape Lirik Lagu dari AZLyrics
 * @param {String} q - Query pencarian (judul lagu atau artis)
 * @returns {Array} - Hasil scraping (artis, judul, feat, lirik)
 */
async function decxaScrape(q) {
    const results = [];
    const searchUrl = `https://search.azlyrics.com/search.php?q=${encodeURIComponent(q)}&x=e6e7e27a25df0d8e7839d92b1f2483d28f074d11486d9ee94b749057f85df00a`;
    try {
        const { data } = await axios.get(searchUrl);
        const $ = cheerio.load(data);

        const linkElement = $('div.panel').find('a').attr('href');
        if (linkElement) {
            const result = await scrapeResult(linkElement);
            results.push(result);
        } else {
            throw new Error('Tidak ada hasil ditemukan.');
        }
    } catch (error) {
        console.error('Error saat melakukan search:', error.message);
        throw new Error('Gagal melakukan pencarian. Silakan coba lagi.');
    }
    return results;
}

/**
 * Scrape Detail Lirik Lagu dari URL
 * @param {String} linkElement - URL lirik lagu
 * @returns {Object} - Detail lirik lagu (artis, judul, feat, lirik)
 */
async function scrapeResult(linkElement) {
    try {
        const url = `${linkElement}`;
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        // Ambil artis
        const artis = $('div.col-xs-12.col-lg-8.text-center').find('b').first().text().trim();

        // Ambil judul lagu
        const judul = $('div.col-xs-12.col-lg-8.text-center').find('h1').text().trim();

        // Ambil feat (jika ada)
        const ft = $('div.col-xs-12.col-lg-8.text-center').find('span.feat').text().trim();

        // Ambil lirik lagu
        const lirikContainer = $('div.col-xs-12.col-lg-8.text-center').find('div:not(.listalbum-item):not(.noprint)');
        let lirik = lirikContainer.text().trim();

        // Bersihkan lirik dari teks yang tidak diinginkan
        const cleanedLyrics = lirik
            .split('\n')
            .map(line => line.trim())
            .filter(line => line !== '')
            .join('\n')
            .replace(/freestar\.config\.enabled_slots\.push\(.*?\);/g, '')
            .replace(/if\s*\(.*?\)\s*\{.*?\}/gs, '')
            .replace(/Submit\s*Corrections/g, '')
            .replace(/Writer\(s\):.*?\n/g, '')
            .replace(/album:.*?\n/g, '')
            .replace(/You May Also Like.*/gs, '')
            .replace(/Search/gi, '');

        return {
            Artist: artis,
            Judul: judul,
            Feat: ft,
            Lirik: cleanedLyrics
        };
    } catch (error) {
        console.error('Error saat melakukan scraping:', error.message);
        throw new Error('Gagal mengambil detail lirik. Silakan coba lagi.');
    }
}

/**
 * Export the function to create the API endpoint
 * @param {Object} app - Express app object
 */
module.exports = function (app) {
    // Endpoint untuk mencari lirik lagu
    app.get('/search/lirik', async (req, res) => {
        try {
            const { q } = req.query;

            // Cek apakah parameter `q` ada
            if (!q) {
                return res.status(400).json({ error: 'Parameter `q` is required' });
            }

            // Proses pencarian menggunakan fungsi decxaScrape
            const result = await decxaScrape(q);

            // Kirim respons JSON
            res.json(result);
        } catch (error) {
            console.error('Error di endpoint /lirik:', error.message);
            res.status(500).json({ error: error.message || 'Internal Server Error' });
        }
    });
};
