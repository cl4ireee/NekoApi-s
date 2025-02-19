const axios = require("axios");
const cheerio = require("cheerio");

async function fetchFileData(url) {
    return new Promise(async (resolve, reject) => {
        try {
            let { data } = await axios.get(url, {
                headers: {
                    "User -Agent": "Posify/1.0.0",
                    "Referer": url,
                    "Accept": "*/*"
                },
            });

            let $ = cheerio.load(data);
            let result = {
                metadata: {},
                downloadUrl: null
            };

            // Ambil nama file dari halaman
            result.metadata.filename = $("title").text().trim(); // Mengambil judul halaman sebagai nama file

            // Ambil thumbnail jika ada
            const thumbnail = $("meta[property='og:image']").attr("content");
            result.metadata.thumbnail = thumbnail ? thumbnail : "N/A";

            // Ambil URL unduhan (misalnya, jika ada tag <video> atau <img>)
            if ($("video").length) {
                result.downloadUrl = $("video source").attr("src");
            } else if ($("img").length) {
                result.downloadUrl = $("img").attr("src");
            } else {
                result.downloadUrl = url; // Jika tidak ada tag khusus, gunakan URL yang diberikan
            }

            resolve(result);
        } catch (error) {
            reject(error);
        }
    });
}

// Fungsi untuk mengatur rute API
module.exports = function setupFetchFileRoute(app) {
    app.get('/tools/krakenfiles', async (req, res) => {
        const { url } = req.query; // Mengambil URL dari parameter query
        if (!url) {
            return res.status(400).json({ status: false, message: 'URL harus disediakan.' });
        }

        try {
            const result = await fetchFileData(url);
            res.json({ status: true, result }); // Mengembalikan hasil dalam format JSON
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    });
};
