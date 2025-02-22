const axios = require("axios");
const cheerio = require("cheerio");

async function jadwaltv(channel) {
    try {
        const url = `https://www.jadwaltv.net/channel/${channel.toLowerCase()}`;
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        let res = [];

        $('.table tbody tr').each((i, el) => {
            const jam = $(el).find('td').eq(0).text().trim();
            const acara = $(el).find('td').eq(1).text().trim();
            if (jam && acara) {
                res.push({ jam, acara });
            }
        });

        return res;
    } catch (error) {
        console.error('Error occurred:', error.response ? error.response.data : error.message);
        throw error; // Melempar error agar bisa ditangkap di level yang lebih tinggi
    }
}

module.exports = function setupJadwalTvRoute(app) {
    app.get('/info/jadwal-tv', async (req, res) => {
        const { q } = req.query; // Menggunakan parameter `q` sebagai ganti `channel`

        if (!q) {
            return res.status(400).json({ status: false, message: 'Parameter "q" harus disediakan.' });
        }

        try {
            const jadwal = await jadwaltv(q); // Menggunakan `q` sebagai input untuk fungsi `jadwaltv`
            res.json({ status: true, results: jadwal });
        } catch (error) {
            res.status(500).json({ status: false, message: 'Terjadi kesalahan saat mengambil jadwal TV.' });
        }
    });
};
