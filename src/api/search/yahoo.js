const axios = require("axios");

module.exports = function (app) {
    app.get('/search/yahoo', async (req, res) => {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({ status: false, error: "Parameter query diperlukan" });
        }

        try {
            const { data } = await axios.get(`https://archive-ui.tanakadomp.biz.id/search/yahoosearch?q=${encodeURIComponent(q)}`);

            if (!data || !data.result) {
                return res.status(500).json({ status: false, error: "Gagal mengambil data dari API" });
            }

            const results = data.result.map(item => ({
                title: item.title,
                link: item.link,
                snippet: item.snippet
            }));

            res.status(200).json({
                status: true,
                result: results
            });

        } catch (error) {
            console.error('Error fetching data from API:', error);
            res.status(500).json({ status: false, error: error.message });
        }
    });
};
