const axios = require('axios');
const cheerio = require('cheerio');

const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    "Referer": "https://getindevice.com/facebook-video-downloader/",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36"
};

/**
 * Get Token from the website
 * @param {String} url 
 * @returns {String}
 */
async function getToken(url) {
    let { data } = await axios.get(url, { headers });
    const $ = cheerio.load(data);
    return $('input#token').attr('value');
}

/**
 * AIO Function to download content
 * @param {String} url 
 * @returns {Array}
 */
async function aio(url) {
    let token = await getToken('https://getindevice.com/facebook-video-downloader/');
    let formData = new FormData();
    formData.append('url', url);
    formData.append('token', token);
    let { data } = await axios.post('https://getindevice.com/wp-json/aio-dl/video-data/', formData, {
        headers
    });
    return data;
}

/**
 * Export the function to create the API endpoint
 * @param {Object} app - Express app object
 */
module.exports = function (app) {
    app.get('/download/aio', async (req, res) => {
        try {
            // Ambil URL dari query parameter
            const { url } = req.query;

            if (!url) {
                return res.status(400).json({ error: 'Parameter `url` is required' });
            }

            // Proses URL menggunakan fungsi aio
            const result = await aio(url);

            // Kirim respons JSON
            res.json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
};
