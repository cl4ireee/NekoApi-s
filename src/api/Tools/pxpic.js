const axios = require('axios');

module.exports = function (app) {
    const tools = ['removebg', 'enhance', 'upscale', 'restore', 'colorize'];

    // Fungsi untuk memproses gambar dengan AI menggunakan URL
    async function processImage(url, tool) {
        try {
            if (!tools.includes(tool)) {
                throw new Error(`Pilih salah satu dari tools ini: ${tools.join(', ')}`);
            }

            // Menggunakan URLSearchParams sebagai pengganti qs.stringify
            let data = new URLSearchParams({
                'imageUrl': url,
                'targetFormat': 'png',
                'needCompress': 'no',
                'imageQuality': '100',
                'compressLevel': '6',
                'fileOriginalExtension': 'png',
                'aiFunction': tool,
                'upscalingLevel': ''
            });

            const response = await axios.post('https://pxpic.com/callAiFunction', data.toString(), {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Android 10; Mobile; rv:131.0) Gecko/131.0 Firefox/131.0',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/png,image/svg+xml,*/*;q=0.8',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'accept-language': 'id-ID'
                }
            });

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

            // Cek apakah API PxPic memberikan URL gambar
            if (result && result.processedImageUrl) {
                // Redirect langsung ke gambar hasil
                return res.redirect(result.processedImageUrl);
            }

            res.status(500).json({ status: false, error: "Gagal mendapatkan gambar hasil." });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    });
};
