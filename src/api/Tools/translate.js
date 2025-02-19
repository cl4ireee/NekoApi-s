const axios = require('axios');

// Fungsi untuk menerjemahkan teks
async function translate(query = "", language) {
    if (!query.trim()) return "";
    const url = new URL("https://translate.googleapis.com/translate_a/single");
    url.searchParams.append("client", "gtx");
    url.searchParams.append("sl", "auto");
    url.searchParams.append("dt", "t");
    url.searchParams.append("tl", language); // Mengganti 'lang' dengan 'language'
    url.searchParams.append("q", query);

    try {
        const response = await axios.get(url.href);
        const data = response.data;
        if (data) {
            return [data[0]].map(([[a]]) => a).join(" ");
        } else {
            return "";
        }
    } catch (err) {
        throw err;
    }
}

// Fungsi untuk mengatur rute API
module.exports = function setupTranslateRoute(app) {
    app.get('/tools/translate', async (req, res) => {
        const { q, language } = req.query; // Mengambil query dan bahasa dari parameter
        if (!q || !language) {
            return res.status(400).json({ status: false, message: 'Query dan bahasa harus diisi.' });
        }

        try {
            const translation = await translate(q, language);
            return res.json({ status: true, result: translation });
        } catch (error) {
            return res.status(500).json({ status: false, message: 'Terjadi kesalahan saat menerjemahkan.' });
        }
    });
};
