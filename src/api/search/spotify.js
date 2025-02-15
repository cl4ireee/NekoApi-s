const fetch = require("node-fetch");

const Spotify = {
    async search(q) {
        const response = await fetch(`https://spotifydown.app/api/metadata?link=${q}`, { method: "POST" });
        return response.json();
    },
    async details(url) {
        const response = await fetch(`https://spotifydown.app/api/metadata?link=${url}`, { method: "POST" });
        return response.json();
    },
    async download(url) {
        const response = await fetch(`https://spotifydown.app/api/download?link=${url}`, {
            headers: { Referer: "https://spotifydown.app/" },
        });
        return response.json();
    },
};

// Ekspor fungsi untuk digunakan dengan `app.get`
module.exports = function (app) {
    // Route untuk mencari lagu
    app.get("/search/spotify-search", async (req, res) => {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({ status: false, error: "Query parameter (q) is required" });
        }

        try {
            const results = await Spotify.search(q);
            res.status(200).json({ status: true, results });
        } catch (error) {
            console.error("Error searching Spotify:", error.message);
            res.status(500).json({ status: false, error: "Failed to search Spotify" });
        }
    });

    // Route untuk mendapatkan detail lagu
    app.get("/search/spotify-details", async (req, res) => {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({ status: false, error: "Query parameter (url) is required" });
        }

        try {
            const results = await Spotify.details(url);
            res.status(200).json({ status: true, results });
        } catch (error) {
            console.error("Error fetching Spotify details:", error.message);
            res.status(500).json({ status: false, error: "Failed to fetch Spotify details" });
        }
    });

    // Route untuk mengunduh lagu
    app.get("/download/spotify-download", async (req, res) => {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({ status: false, error: "Query parameter (url) is required" });
        }

        try {
            const results = await Spotify.download(url);
            res.status(200).json({ status: true, results });
        } catch (error) {
            console.error("Error downloading from Spotify:", error.message);
            res.status(500).json({ status: false, error: "Failed to download from Spotify" });
        }
    });
};
