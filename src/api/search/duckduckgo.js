const axios = require("axios");

module.exports = function (app) {
    // Endpoint untuk mendapatkan informasi dari API DuckDuckGo
    app.get("/search/duckduckgo", async (req, res) => {
        const { q } = req.query; // Mengambil parameter 'q' dari query string

        if (!q) {
            return res.status(400).json({ status: false, error: "Query parameter 'q' is required" });
        }

        try {
            // Mengambil data dari API DuckDuckGo
            const response = await axios.get(`https://api.siputzx.my.id/api/s/duckduckgo?query=${encodeURIComponent(q)}`);
            const result = response.data; // Mengambil data dari respons

            // Mengubah format respons sesuai dengan yang diinginkan
            const formattedResponse = {
                status: result.status,
                data: {
                    meta: {
                        query: result.data.meta.query,
                        timestamp: result.data.meta.timestamp,
                        executionTime: result.data.meta.executionTime,
                        parameters: result.data.meta.parameters
                    },
                    stats: {
                        totalResults: result.data.stats.totalResults,
                        averageRelevance: result.data.stats.averageRelevance,
                        averageConfidence: result.data.stats.averageConfidence,
                        secureResults: result.data.stats.secureResults,
                        uniqueDomains: result.data.stats.uniqueDomains,
                        resultsByType: result.data.stats.resultsByType
                    }
                }
            };

            // Mengembalikan hasil
            res.status(200).json(formattedResponse);
        } catch (error) {
            console.error("Error fetching DuckDuckGo data:", error.message);
            res.status(500).json({ status: false, error: "Failed to fetch DuckDuckGo data" });
        }
    });
};
