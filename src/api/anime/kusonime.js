const axios = require('axios');
const cheerio = require('cheerio');

const kusonime = {
    search: async function(q) {
        try {
            const { data } = await axios.get(`https://kusonime.com/?s=${encodeURIComponent(q)}&post_type=post`);
            const $ = cheerio.load(data);
            
            const result = $('.kover').map((_, element) => {
                const $element = $(element);
                return {
                    title: $element.find('.episodeye a').text().trim(),
                    link: $element.find('.episodeye a').attr('href'),
                    thumbnail: $element.find('.thumbz img').attr('src'),
                    postedBy: $element.find('.fa-user').parent().text().replace('Posted by', '').trim(),
                    releaseTime: $element.find('.fa-clock-o').parent().text().replace('Released on', '').trim(),
                    genres: $element.find('.fa-tag').parent().find('a').map((_, genre) => $(genre).text().trim()).get()
                };
            }).get();
            return {
                data: result
            };
        } catch (error) {
            return {
                data: []
            };
        }
    },
    
    detail: async function(url) {
        try {
            const { data } = await axios.get(url);
            const $ = cheerio.load(data);
            const info = {};
            $('.info p').each((_, element) => {
                const text = $(element).text().trim();
                if (text.includes(':')) {
                    const [key, value] = text.split(':').map(item => item.trim());
                    info[key] = value;
                }
            });
            const synopsis = $('.lexot p').map((_, element) => {
                const text = $(element).text().trim();
                return (!text.includes('Released on') && !text.includes('Credit') && text.length > 0 && !text.includes(':')) ? text : null;
            }).get().filter(Boolean);
            const dlink = {};
            $('.smokeurlrh').each((_, element) => {
                const $element = $(element);
                const quality = $element.find('strong').text().trim();
                const links = {};
                $element.find('a').each((_, link) => {
                    const $link = $(link);
                    links[$link.text().trim()] = $link.attr('href');
                });
                dlink[quality] = links;
            });
            return {
                data: {
                    title: $('.jdlz').text().trim(),
                    thumbnail: $('.post-thumb img').attr('src'),
                    views: $('.viewoy').text().trim(),
                    info,
                    synopsis,
                    dlink
                }
            };
        } catch (error) {
            return {
                data: null
            };
        }
    }
};

// Mengatur rute API
module.exports = function(app) {
    app.get('/anime/kusonime-search', async (req, res) => {
        const { q } = req.query; // Mengambil q dari parameter
        if (!q) {
            return res.status(400).json({ status: false, message: 'Query harus diisi.' });
        }

        const result = await kusonime.search(q);
        return res.json({ status: true, result: result.data });
    });

    app.get('/api/kusonime/detail', async (req, res) => {
        const { url } = req.query; // Mengambil URL dari parameter
        if (!url) {
            return res.status(400).json({ status: false, message: 'URL harus diisi.' });
        }

        const result = await kusonime.detail(url);
        return res.json({ status: true, result: result.data });
    });
};
