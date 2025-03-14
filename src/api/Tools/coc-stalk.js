const axios = require("axios");
const cheerio = require("cheerio");

module.exports = function(app) {
    app.get('/tools/stalk-coc', async (req, res) => {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({ status: false, error: 'Player tag (q) is required' });
        }

        try {
            // Menambahkan header User-Agent untuk menghindari pemblokiran
            const response = await axios.get(`https://brawlace.com/coc/players/%23${q}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            const $ = cheerio.load(response.data);

            let result = {
                metadata: {},
            };

            const getText = (selector, regex) => 
                $(selector).filter((_, el) => $(el).text().includes(regex.split(" ")[0]))
                    .text().match(new RegExp(regex))?.[1] || "Tidak ditemukan";

            result.metadata.name = $('h2.pt-3').text().trim() || "Tidak ditemukan";
            result.metadata.clan = $('h3.pb-2 a').text().trim() || "Tidak ada clan";
            result.metadata.level = getText('div.card-body', "Level (\\d+)");
            result.metadata.trophies = getText('div.card-body', "Trophies (\\d+)");
            result.metadata.bestTrophy = $('div.card-body').filter((_, el) => $(el).text().includes("Best Season")).text().match(/Trophies (\d+)/)?.[1] || "Tidak ditemukan";
            result.metadata.townHall = getText('div.card-body', "Town Hall Level (\\d+)");
            result.metadata.warStars = getText('div.card-body', "War Stars (\\d+)");
            result.metadata.attackWins = getText('div.card-body', "Attack Wins (\\d+)");
            result.metadata.defenseWins = getText('div.card-body', "Defense Wins (\\d+)");
            result.metadata.legendRank = getText('div.card-body', "Current Season.*?Rank (\\d+)");
            result.metadata.profileUrl = `https://brawlace.com/coc/players/%23${q}`;

            res.status(200).json({
                status: true,
                result
            });
        } catch (error) {
            console.error('Error fetching player details:', error.message);
            res.status(500).json({ status: false, error: 'Failed to fetch player details' });
        }
    });
}
