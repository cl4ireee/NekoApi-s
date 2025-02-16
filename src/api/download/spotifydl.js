const fetch = require("node-fetch");

module.exports = function (app) {
    app.get("/download/spotify-download", async (req, res) => {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({ status: false, error: "Query parameter (url) is required" });
        }

        try {
            const response = await fetch(`https://spotifydown.app/api/download?link=${url}`, {
                headers: { Referer: "https://spotifydown.app/" },
            });
            const results = await response.json();
            res.status(200).json({ status: true, results });
        } catch (error) {
            console.error("Error downloading from Spotify:", error.message);
            res.status(500).json({ status: false, error: "Failed to download from Spotify" });
        }
    });
};
