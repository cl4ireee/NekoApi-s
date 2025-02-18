const axios = require("axios");

module.exports = function (app) {
    // Endpoint untuk mendapatkan informasi dari API Brave
    app.get("/search/brave", async (req, res) => {
        const { q } = req.query; // Mengambil parameter 'q' dari query string

        if (!q) {
            return res.status(400).json({ status: false, error: "Query parameter 'q' is required" });
        }

        try {
            // Mengambil data dari API Brave
            const response = await axios.get(`https://api.siputzx.my.id/api/s/brave?query=${encodeURIComponent(q)}`);
            const result = response.data; // Mengambil data dari respons

            // Mengubah format respons sesuai dengan yang diinginkan
            const formattedResponse = {
                status: result.status,
                data: {
                    metadata: {
                        totalResults: result.data.metadata.totalResults,
                        searchQuery: result.data.metadata.searchQuery,
                        timestamp: result.data.metadata.timestamp
                    },
                    results: result.data.results.map(item => ({
                        title: item.title,
                        description: item.description,
                        siteName: item.siteName,
                        date: item.date
                    }))
                }
            };

            // Mengembalikan hasil
            res.status(200).json(formattedResponse);
        } catch (error) {
            console.error("Error fetching Brave data:", error.message);
            res.status(500).json({ status: false, error: "Failed to fetch Brave data" });
        }
    });
};
