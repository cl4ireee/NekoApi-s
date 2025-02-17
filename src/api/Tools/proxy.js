const axios = require('axios');
const cheerio = require('cheerio');

async function extractData(data) {
    const $ = cheerio.load(data);
    const items = [];

    $('tbody tr').each((index, element) => {
        const dat = {};
        dat.ip = $(element).find('td:eq(0)').text().trim();
        dat.port = $(element).find('td:eq(1)').text().trim();
        dat.code = $(element).find('td:eq(2)').text().trim();
        dat.country = $(element).find('td:eq(3)').text().trim();
        dat.anonymity = $(element).find('td:eq(4)').text().trim();
        dat.google = $(element).find('td:eq(5)').text().trim();
        dat.https = $(element).find('td:eq(6)').text().trim();
        dat.last = $(element).find('td:eq(7)').text().trim();
        items.push(dat);
    });
    
    return items;
}

module.exports = function (app) {
    // Endpoint untuk mendapatkan daftar proxy
    app.get('/tools/proxy-list', async (req, res) => {
        try {
            const response = await axios.get('http://free-proxy-list.net/', {
                headers: {
                    'User -Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Connection': 'keep-alive',
                    'Cache-Control': 'no-cache',
                }
            });
            const items = await extractData(response.data);
            res.status(200).json({ status: true, result: items });
        } catch (error) {
            console.error('Error fetching proxy list:', error.message);
            res.status(500).json({ status: false, error: 'Failed to fetch proxy list' });
        }
    });
};
