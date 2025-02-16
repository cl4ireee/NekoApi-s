const axios = require("axios");
const crypto = require("crypto");

// Daftar style yang valid
const validStyles = ["Headsot", "Anime", "Tatto", "ID Photo", "Cartoon", "Fantasy 3D"];

module.exports = function (app) {
    app.get("/ai/deepimg", async (req, res) => {
        try {
            const { q, style } = req.query; // Mengambil parameter 'q' dan 'style' dari query

            // Validasi parameter
            if (!q || !style) {
                return res.status(400).json({ status: false, error: "Query (q) and Style are required" });
            }

            if (!validStyles.includes(style)) {
                return res.status(400).json({ status: false, error: `Invalid style. Valid styles are: ${validStyles.join(", ")}` });
            }

            // Membuat device_id unik untuk request
            let device_id = crypto.randomBytes(16).toString("hex");

            let data = JSON.stringify({
                "device_id": device_id,
                "prompt": `${q} -style ${style}`,
                "size": "1024x1024"
            });

            // Request ke API eksternal
            const response = await axios.post("https://api-preview.chatgot.io/api/v1/deepimg/flux-1-dev", data, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Android 10; Mobile; rv:131.0) Gecko/131.0 Firefox/131.0",
                    "Content-Type": "application/json"
                }
            });

            // Mengembalikan hasil dalam JSON
            res.json({ status: true, result: response.data });
        } catch (error) {
            console.error("Error fetching data from external API:", error.message);
            res.status(500).json({ status: false, error: "Error fetching data from external API" });
        }
    });
};
