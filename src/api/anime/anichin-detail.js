const axios = require("axios");

module.exports = (app) => {
    // Endpoint untuk mendapatkan detail anime
    app.get("/anime/anichin-detail", async (req, res) => {
        const { url } = req.query; // Mengambil parameter 'url' dari query string

        if (!url) {
            return res.status(400).json({ status: false, error: "Query parameter 'url' is required" });
        }

        try {
            // Mengambil data dari API Anichin
            const response = await axios.get(`https://api.siputzx.my.id/api/anime/anichin-detail?url=${encodeURIComponent(url)}`);
            const result = response.data; // Mengambil data dari respons

            // Menghapus bagian creator jika ada
            const { creator, ...filteredData } = result;

            res.status(200).json({ status: true, data: filteredData.data }); // Mengembalikan hasil tanpa creator
        } catch (error) {
            console.error("Error fetching anime details:", error.message);
            res.status(500).json({ status: false, error: "Failed to fetch anime details" });
        }
    });
};
