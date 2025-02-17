const axios = require("axios");

module.exports = function (app) {
    // Endpoint untuk mendapatkan berita JKT48
    app.get("/news/jkt48", async (req, res) => {
        try {
            // Mengambil data dari API berita JKT48
            const response = await axios.get("https://api.siputzx.my.id/api/berita/jkt48");
            const result = response.data; // Mengambil data dari respons

            // Mengembalikan hasil
            res.status(200).json({ status: true, data: result.data });
        } catch (error) {
            console.error("Error fetching JKT48 news:", error.message);
            res.status(500).json({ status: false, error: "Failed to fetch JKT48 news" });
        }
    });
};
