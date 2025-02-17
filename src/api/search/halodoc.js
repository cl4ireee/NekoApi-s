const axios = require("axios");
const cheerio = require("cheerio");

module.exports = function setupHalooDocccAPI(app) {
    async function HalooDoccc(q) {
        const { data } = await axios.get(`https://www.halodoc.com/obat-dan-vitamin/search/${q}`);
        const $ = cheerio.load(data);
        const obatList = [];

        // Parsing data obat dari halaman
        $('li.custom-container__list__container').each((index, element) => {
            const title = $(element).find('.hd-base-product-search-card__title').text().trim();
            const subtitle = $(element).find('.hd-base-product-search-card__subtitle').text().trim();
            const price = $(element).find('.hd-base-product-search-card__price').text().trim();
            const image = $(element).find('.hd-base-image-mapper__img').attr('src');
            const link = $(element).find('.hd-base-product-search-card__content a').attr('href');

            // Menyusun objek hasil pencarian obat
            obatList.push({
                title,
                subtitle,
                price,
                image,
                link: `https://www.halodoc.com${link}`,
            });
        });

        return obatList;
    }

    // Route API untuk pencarian obat
    app.get('/search/halodoc-search', async (req, res) => {
        const { q } = req.query; // Mengambil query parameter `q`

        // Validasi: Pastikan query parameter `q` ada
        if (!q) {
            return res.status(400).json({ 
                status: false, 
                error: "Query parameter (q) is required" 
            });
        }

        try {
            const results = await HalooDoccc(q); // Panggil fungsi dengan parameter `q`
            res.status(200).json({ 
                status: true, 
                results 
            });
        } catch (error) {
            res.status(500).json({ 
                status: false, 
                error: "Internal Server Error" 
            });
        }
    });
};
