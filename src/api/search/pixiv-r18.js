const axios = require("axios");

const fetchPixivR18 = async (query) => {
    try {
        const URI = `https://api.rynn-archive.biz.id/search/pixiv-r18?q=${encodeURIComponent(query)}`;
        const { data } = await axios.get(URI);

        // Pastikan response memiliki struktur yang diharapkan
        if (data && data.status === true && Array.isArray(data.result)) {
            return { status: true, results: data.result };
        } else {
            return { status: false, error: "Invalid response format from API" };
        }
    } catch (error) {
        console.error("Error fetching Pixiv R-18 data:", error.message);
        return { status: false, error: "Failed to fetch Pixiv R-18 data" };
    }
};

module.exports = function (app) {
    app.get("/search/pixiv-r18", async (req, res) => {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({ status: false, error: "Query parameter (q) is required" });
        }

        const response = await fetchPixivR18(q);

        if (!response.status) {
            return res.status(500).json(response);
        }

        res.status(200).json(response);
    });
};
