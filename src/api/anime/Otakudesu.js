const axios = require("axios");

module.exports = function (app) {
    // Endpoint untuk pencarian Otakudesu
    app.get("/anime/otakudesu-search", async (req, res) => {
        const { q } = req.query; // Mengambil parameter 'q' dari query string

        if (!q) {
            return res.status(400).json({ status: false, error: "Query parameter 'q' is required" });
        }

        try {
            // Mengambil data dari API Otakudesu
            const response = await axios.get(`https://api.rynn-archive.biz.id/search/otakudesu?q=${encodeURIComponent(q)}`);
            const result = response.data; // Mengambil data dari respons

            // Menghapus bagian creator dari hasil
            const { creator, ...filteredResult } = result;

            res.status(200).json({ status: true, result: filteredResult }); // Mengembalikan hasil tanpa creator
        } catch (error) {
            console.error("Error fetching Otakudesu search results:", error.message);
            res.status(500).json({ status: false, error: "Failed to fetch Otakudesu search results" });
        }
    });
};
