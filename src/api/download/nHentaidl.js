const axios = require('axios');

async function nhentai(url) {
    try {
        // Ekstrak ID dari URL
        const idMatch = url.match(/\/g\/(\d+)/);
        if (!idMatch) {
            throw new Error('Invalid URL');
        }
        const id = idMatch[1];

        const html = await (await axios.get(`https://nhentai.net/g/${id}`)).data;
        const match = html.match(/JSON\.parse\((['"`])(.+?)\1\)/);

        if (match) {
            let json = match[2].replace(/\\"/g, '"').replace(/\\u([\dA-Fa-f]{4})/g, (m, g) => String.fromCharCode(parseInt(g, 16)));
            let data = JSON.parse(json);
            data.images.pages = data.images.pages.map((v, i) => `https://zorocdn.xyz/galleries/${data.media_id}/${i + 1}.jpg`);
            data.images.cover = `https://zorocdn.xyz/galleries/${data.media_id}/cover.jpg`;
            data.images.thumbnail = `https://zorocdn.xyz/galleries/${data.media_id}/thumb.jpg`;
            data.tags = data.tags.map(tags => tags.type);
            return data;
        }

    } catch (e) {
        console.log(e);
        return null; // Mengembalikan null jika terjadi kesalahan
    }
}

// Mengatur rute API
module.exports = function(app) {
    app.get('/download/nhentai-download', async (req, res) => {
        const { url } = req.query; // Mengambil URL dari parameter
        if (!url) {
            return res.status(400).json({ status: false, message: 'URL harus diisi.' });
        }

        const result = await nhentai(url);
        if (result) {
            return res.json({ status: true, result });
        } else {
            return res.status(404).json({ status: false, message: 'Data tidak ditemukan.' });
        }
    });
};
