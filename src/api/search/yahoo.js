const axios = require("axios");
const cheerio = require("cheerio");

module.exports = function(app) {
    app.get('/search/yahoo', async (req, res) => {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({ status: false, error: "Parameter query diperlukan" });
        }

        try {
            const { data: html } = await axios.get(
                `https://search.yahoo.com/search?p=${encodeURIComponent(q)}&fr=yfp-hrmob&fr2=p%3Afp%2Cm%3Asb&.tsrc=yfp-hrmob&ei=UTF-8&fp=1&toggle=1&cop=mss`
            );

            const $ = cheerio.load(html);
            const results = [];

            $('li.s-card').each((i, el) => {
                const title = $(el).find('.s-card-hl').text().trim();
                let url = $(el).find('a.s-card-wrapAnchor').attr('href');
                const snippet = $(el).find('.s-desc').text().trim(); // Pastikan elemen ini benar

                if (url && !url.startsWith('http')) {
                    url = `https://search.yahoo.com${url}`;
                }

                results.push({
                    title,
                    link: url,
                    snippet
                });
            });

            res.status(200).json({
                status: true,
                result: results
            });

        } catch (error) {
            console.error('Error fetching or parsing data:', error);
            res.status(500).json({ status: false, error: error.message });
        }
    });
};
