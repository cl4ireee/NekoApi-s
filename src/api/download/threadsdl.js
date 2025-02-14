const axios = require('axios');
const cheerio = require('cheerio');

module.exports = function(app) {
    app.get('/download/threads', async (req, res) => {
        const { url } = req.query; // Mengambil parameter query 'url'

        // Memastikan URL disediakan
        if (!url) {
            return res.status(400).json({ status: false, error: 'Parameter URL diperlukan' });
        }

        try {
            // Mengambil data dari pos Threads
            const response = await axios.get(formatUrl(url));
            const $ = cheerio.load(response.data);
            
            // Mengambil media dan caption
            const mediaList = getMedia($);
            const caption = $(".BodyTextContainer").text().trim() || null;

            // Mengembalikan hasil
            res.status(200).json({
                status: true,
                media: mediaList,
                caption: caption
            });
        } catch (error) {
            console.error("Kesalahan saat memproses permintaan:", error.message);
            res.status(500).json({ status: false, error: 'Terjadi kesalahan saat memproses permintaan.' });
        }
    });

    // Fungsi untuk memformat URL
    const formatUrl = (url) => {
        let clean = url.split("?")[0];
        if (clean.endsWith("/")) clean = clean.slice(0, -1);
        return `${clean}/embed/`;
    };

    // Fungsi untuk mengambil media dari pos Threads
    const getMedia = ($) => {
        const mediaList = [];

        // Mengambil video jika ada
        const vid = $(".SingleInnerMediaContainerVideo source").attr("src");
        if (vid) mediaList.push(vid.replace(/&amp;/g, "&"));

        // Mengambil gambar jika ada
        const img = $(".SingleInnerMediaContainer img").attr("src");
        if (img) mediaList.push(img.replace(/&amp;/g, "&"));

        // Mengambil semua gambar dari kontainer media
        $(".MediaScrollImageContainer img").each((i, el) => {
            mediaList.push($(el).attr("src").replace(/&amp;/g, "&"));
        });

        return mediaList;
    };
};
