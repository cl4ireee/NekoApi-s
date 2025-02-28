const axios = require("axios");

module.exports = function(app) {
    app.get("/ai/nsfwgenerator", async (req, res) => {
        let text = req.query.text; // Menggunakan 'text' sebagai parameter
        if (!text) return res.status(400).json({ error: "Parameter 'text' diperlukan!" });

        try {
            let { data: nsfw } = await axios.get(`https://1yjs1yldj7.execute-api.us-east-1.amazonaws.com/default/ai_image?prompt=${text}&aspect_ratio=Select Aspect Ratio&link=writecream.com`);
            
            res.json({
                done: true,
                linkImage: nsfw.image_link,
                base64: nsfw.base64_output
            });
        } catch (error) {
            res.status(500).json({ error: "Gagal mengambil gambar NSFW", details: error.message });
        }
    });
};
