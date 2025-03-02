const axios = require('axios');
const cheerio = require('cheerio');
const FormData = require('form-data'); // Tambahkan package form-data

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
    try {
        let { data } = await axios.get(url, { headers });
        const $ = cheerio.load(data);
        const token = $('input#token').attr('value');

        if (!token) {
            throw new Error('Token tidak ditemukan. Struktur halaman mungkin berubah.');
        }

        return token;
    } catch (error) {
        console.error('Error di getToken:', error.message);
        throw new Error('Gagal mengambil token. Silakan coba lagi.');
    }
}

/**
 * AIO Function to download content
 * @param {String} url 
 * @returns {Array}
 */
async function aio(url) {
    try {
        let token = await getToken('https://getindevice.com/facebook-video-downloader/');
        let formData = new FormData();
        formData.append('url', url);
        formData.append('token', token);

        let { data } = await axios.post('https://getindevice.com/wp-json/aio-dl/video-data/', formData, {
            headers: {
                ...headers,
                ...formData.getHeaders() // Tambahkan headers dari FormData
            }
        });

        return data;
    } catch (error) {
        console.error('Error di aio:', error.message);
        throw new Error('Gagal mengambil data video. Silakan coba lagi.');
    }
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
            console.error('Error di endpoint /tools/aio-downloader:', error.message);
            res.status(500).json({ error: error.message || 'Internal Server Error' });
        }
    });
};
