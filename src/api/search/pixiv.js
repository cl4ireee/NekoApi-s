const crypto = require("crypto");
const axios = require("axios");

function generateHash(input) {
    return crypto.createHash("sha1").update(input).digest("hex");
}

async function pixivNet(query) {
    try {
        let hash = await generateHash(query);
        let { data: pixiv } = await axios.get(`https://pixiv.net/touch/ajax/tag_portal?word=${query}&lang=id&version=${hash}`);
        return pixiv.body;
    } catch (error) {
        console.error("Error fetching Pixiv data:", error.message);
        return null;
    }
}

// Ekspor fungsi untuk digunakan dengan `app.get`
module.exports = function (app) {
    // Route untuk mencari data di Pixiv
    app.get("/search/pixiv", async (req, res) => {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({ status: false, error: "Query parameter (q) is required" });
        }

        try {
            const results = await pixivNet(q);
            res.status(200).json({ status: true, results });
        } catch (error) {
            console.error("Error searching Pixiv:", error.message);
            res.status(500).json({ status: false, error: "Failed to search Pixiv" });
        }
    });
};
