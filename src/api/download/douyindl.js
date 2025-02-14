const axios = require('axios');

// Fungsi untuk mengunduh video Douyin
async function douyin(url) {
    const api = "https://lovetik.app/api/ajaxSearch";
    const payload = { q: url, lang: "en" };

    try {
        const { data } = await axios.post(api, payload, {
            headers: {
                accept: "*/*",
                "accept-language": "en-US,en;q=0.9",
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                origin: "https://lovetik.app",
                priority: "u=1, i",
                referer: "https://lovetik.app/en",
                "sec-ch-ua":
                    '"Not A(Brand";v="8", "Chromium";v="132", "Microsoft Edge";v="132"',
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": '"Windows"',
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "user-agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 Edg/132.0.0.0",
                "x-requested-with": "XMLHttpRequest",
            },
            transformRequest: [
                (data) =>
                    Object.keys(data)
                        .map(
                            (key) =>
                                `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`,
                        )
                        .join("&"),
            ],
        });

        const extractData = data.data;
        const downloadUrls =
            extractData.match(
                /https:\/\/(dl\.snapcdn\.app|v\d+-cold\.douyinvod\.com)\/get\?token=[^"]+/g,
            ) || [];

        return {
            downloadUrls,
        };
    } catch {
        return { error: "Gagal mengambil video, coba lagi nanti." };
    }
}

// Endpoint untuk menangani permintaan unduhan video Douyin
module.exports = function(app) {
    app.get('/download/douyin', async (req, res) => {
        const { url } = req.query; // Mengambil parameter query 'url'

        // Memastikan URL disediakan
        if (!url) {
            return res.status(400).json({ status: false, error: 'URL video Douyin diperlukan.' });
        }

        try {
            const result = await douyin(url);
            if (result.error) {
                return res.status(500).json({ status: false, error: result.error });
            }

            const { downloadUrls } = result;
            if (!downloadUrls.length) {
                return res.status(404).json({ status: false, error: 'Gagal mengambil video.' });
            }

            // Mengembalikan URL unduhan pertama
            res.status(200).json({ status: true, downloadUrl: downloadUrls[0] });
        } catch (error) {
            console.error("Kesalahan saat memproses permintaan:", error);
            res.status(500).json({ status: false, error: 'Terjadi kesalahan saat memproses permintaan.' });
        }
    });
};
