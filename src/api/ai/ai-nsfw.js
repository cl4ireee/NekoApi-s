const axios = require("axios");

module.exports = function (app) {
    app.get("/ai/nsfwgenerator", async (req, res) => {
        let text = req.query.text; // Menggunakan 'text' sebagai parameter
        if (!text) return res.status(400).send("❌ Parameter 'text' diperlukan!");

        try {
            let { data: nsfw } = await axios.get(`https://1yjs1yldj7.execute-api.us-east-1.amazonaws.com/default/ai_image?prompt=${text}&aspect_ratio=Select Aspect Ratio&link=writecream.com`);

            if (!nsfw.image_link) return res.status(404).send("❌ Gambar tidak ditemukan!");

            // Redirect langsung ke URL gambar
            res.redirect(nsfw.image_link);

        } catch (error) {
            res.status(500).send(`❌ Gagal mengambil gambar NSFW: ${error.message}`);
        }
    });
};
