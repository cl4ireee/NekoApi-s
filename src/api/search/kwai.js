const axios = require('axios');
const cheerio = require('cheerio');

// Fungsi scrapeKwai
const scrapeKwai = async (q) => {
    const url = `https://www.kwai.com/discover/${encodeURIComponent(q)}`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const result = {
        title: $('title').text(),
        description: $('meta[name="description"]').attr('content'),
        keywords: $('meta[name="keywords"]').attr('content'),
        videos: []
    };

    const scriptData = $('script#ItemList').html();
    if (!scriptData) throw new Error('Data video tidak ditemukan di halaman');

    const videoItems = JSON.parse(scriptData).itemListElement;

    if (!Array.isArray(videoItems)) throw new Error('Format data video tidak valid.');

    videoItems.forEach(video => {
        result.videos.push({
            url: video.url,
            name: video.name,
            description: video.description,
            thumbnailUrl: video.thumbnailUrl[0],
            uploadDate: video.uploadDate,
            contentUrl: video.contentUrl,
            commentCount: video.commentCount,
            duration: video.duration
        });
    });

    return result;
};

// Export fungsi defineKwaiAPI
module.exports = (app) => {
    app.get('/search/kwai', async (req, res) => {
        const q = req.query.q;

        if (!q) {
            return res.status(400).json({
                error: 'Query parameter "q" is required'
            });
        }

        try {
            const result = await scrapeKwai(q);
            res.json(result);
        } catch (error) {
            console.error("Error scraping Kwai:", error);
            res.status(500).json({
                error: 'Error fetching data from Kwai'
            });
        }
    });
};
