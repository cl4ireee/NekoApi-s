const axios = require("axios");

module.exports = function (app) {
    // Endpoint untuk pencarian Otakudesu
    app.get("/anime/otakudesu", async (req, res) => {
        const { q } = req.query; // Mengambil parameter 'q' dari query string

        if (!q) {
            return res.status(400).json({ status: false, error: "Query parameter 'q' is required" });
        }

        try {
            // Mengambil data dari API Otakudesu
            const response = await axios.get(`https://api.rynn-archive.biz.id/search/otakudesu?q=${encodeURIComponent(q)}`);
            const { creator, ...result } = response.data; // Mengambil data dan menghapus creator

            // Mengembalikan hasil tanpa creator
            res.status(200).json({ status: true, result: result.result }); // Mengembalikan hanya array hasil
        } catch (error) {
            console.error("Error fetching Otakudesu search results:", error.message);
            res.status(500).json({ status: false, error: "Failed to fetch Otakudesu search results" });
        }
    });
};
