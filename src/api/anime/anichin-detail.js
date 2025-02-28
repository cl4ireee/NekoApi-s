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

            res.status(200).json({ status: true, result: filteredData.data }); // Mengembalikan hasil tanpa creator
        } catch (error) {
            console.error("Error fetching anime details:", error.message);
            if (error.response) {
                // Jika ada respons dari server
                res.status(error.response.status).json({ status: false, error: error.response.data });
            } else {
                // Jika tidak ada respons dari server
                res.status(500).json({ status: false, error: "Failed to fetch anime details" });
            }
        }
    });

    // Endpoint untuk mendapatkan anime terbaru
    app.get("/anime/anichin-latest", async (req, res) => {
        try {
            // Mengambil data dari API terbaru
            const response = await axios.get("https://api.siputzx.my.id/api/anime/latest");
            const result = response.data; // Mengambil data dari respons

            // Mengembalikan hasil
            res.status(200).json({ status: true, result: result.data }); // Mengganti 'data' menjadi 'result'
        } catch (error) {
            console.error("Error fetching latest anime:", error.message);
            if (error.response) {
                res.status(error.response.status).json({ status: false, error: error.response.data });
            } else {
                res.status(500).json({ status: false, error: "Failed to fetch latest anime" });
            }
        }
    });

    // Endpoint untuk mendapatkan anime populer
    app.get("/anime/anichin-populer", async (req, res) => {
        try {
            // Mengambil data dari API populer
            const response = await axios.get("https://api.siputzx.my.id/api/anime/anichin-popular");
            const result = response.data; // Mengambil data dari respons

            // Mengembalikan hasil
            res.status(200).json({ status: true, result: result.data }); // Mengganti 'data' menjadi 'result'
        } catch (error) {
            console.error("Error fetching popular anime:", error.message);
            if (error.response) {
                res.status(error.response.status).json({ status: false, error: error.response.data });
            } else {
                res.status(500).json({ status: false, error: "Failed to fetch popular anime" });
            }
        }
    });

    // Endpoint untuk mencari anime
    app.get("/anime/anichin-search", async (req, res) => {
        const { q } = req.query; // Mengambil parameter 'q' dari query string

        if (!q) {
            return res.status(400).json({ status: false, error: "Query parameter 'q' is required" });
        }

        try {
            // Mengambil data dari API pencarian
            const response = await axios.get(`https://api.siputzx.my.id/api/anime/anichin-search?query=${encodeURIComponent(q)}`);
            const result = response.data; // Mengambil data dari respons

            // Mengembalikan hasil
            res.status(200).json({ status: true, result: result.data }); // Mengganti 'data' menjadi 'result'
        } catch (error) {
            console.error("Error fetching anime search results:", error.message);
            if (error.response) {
                res.status(error.response.status).json({ status: false, error: error.response.data });
            } else {
                res.status(500).json({ status: false, error: "Failed to fetch anime search results" });
            }
        }
    });
};
