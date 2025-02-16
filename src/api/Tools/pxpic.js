const axios = require('axios');

module.exports = function (app) {
    const tools = ['removebg', 'enhance', 'upscale', 'restore', 'colorize'];

    // Fungsi untuk memproses gambar dengan AI menggunakan URL
    async function processImage(url, tool) {
        try {
            if (!tools.includes(tool)) {
                throw new Error(`Pilih salah satu dari tools ini: ${tools.join(', ')}`);
            }

            // Data yang akan dikirim ke API PxPic
            const data = {
                imageUrl: url,
                targetFormat: 'png',
                needCompress: 'no',
                imageQuality: '100',
                compressLevel: '6',
                fileOriginalExtension: 'png',
                aiFunction: tool,
                upscalingLevel: ''
            };

            // Request ke API PxPic
            const response = await axios.post('https://pxpic.com/callAiFunction', data, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Accept-Language': 'id-ID',
                    'Referer': 'https://pxpic.com/',
                    'Cookie': 'SESSION_ID=xxx; other_cookie=yyy' // Ganti dengan cookie dari browser jika perlu
                }
            });

            console.log("PxPic API Response:", response.data); // Debugging response

            return response.data;
        } catch (error) {
            console.error("Error processing image:", error);
            throw error;
        }
    }

    // Route untuk AI Image Processing dengan URL
    app.get("/tools/pxpic", async (req, res) => {
        try {
            const { url, tool } = req.query;

            if (!url || !tool) {
                return res.status(400).json({ status: false, error: "url dan tool diperlukan" });
            }

            const result = await processImage(url, tool);

            // Cek apakah API PxPic memberikan URL gambar hasil
            if (result && result.processedImageUrl) {
                return res.redirect(result.processedImageUrl); // Redirect langsung ke gambar hasil
            }

            res.status(500).json({ status: false, error: "Gagal mendapatkan gambar hasil." });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    });
};
