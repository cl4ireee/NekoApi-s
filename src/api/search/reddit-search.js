const { default: axios } = require("axios");

module.exports = (app) => {
    app.get("/search/reddit-search", async (req, res) => {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({ status: false, error: "Query diperlukan" });
        }

        try {
            const { data } = await axios.get(`https://www.reddit.com/search.json?q=${q}`, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
                }
            });
            res.json({ status: true, result: data });
        } catch (error) {
            console.error("Error fetching Reddit search:", error.message);
            res.status(500).json({ status: false, error: error.message });
        }
    });
};
