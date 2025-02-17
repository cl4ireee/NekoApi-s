const axios = require('axios');
const cheerio = require('cheerio');

module.exports = function (app) {
    app.get('/search/kwai', async (req, res) => {
        const q = req.query.q;

        if (!q) {
            return res.status(400).json({ error: 'Query parameter "q" is required' });
        }

        try {
            const url = `https://www.kwai.com/discover/${encodeURIComponent(q)}`;
            const { data } = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });

            const $ = cheerio.load(data);
            const title = $('title').text();
            const description = $('meta[name="description"]').attr('content') || "No description available";

            // Menyiapkan hasil dalam format yang diinginkan
            const result = {
                status: true,
                results: [
                    {
                        title: title,
                        description: description
                    }
                ]
            };

            res.json(result);  // Mengirim hasil sebagai JSON
        } catch (error) {
            console.error("Error scraping Kwai:", error);
            res.status(500).json({ error: 'Error fetching data from Kwai' });
        }
    });
};
