// tiktokDownloader.js
const fetch = require('node-fetch');

const TiktokDownloader = {
    async download(url) {
        try {
            // Cari data dari URL TikTok
            const response = await fetch('https://lovetik.com/api/ajax/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                },
                body: `query=${encodeURIComponent(url)}`
            });

            const data = await response.json();

            // Jika tidak ada data, kembalikan error
            if (!data.links || data.links.length === 0) {
                throw new Error('Tidak dapat menemukan data dari URL TikTok yang diberikan.');
            }

            // Format data video, audio, dan gambar
            const result = {
                video: [],
                audio: [],
                images: data.images || []
            };

            data.links.forEach(item => {
                if (!item.a) return; // Skip jika tidak ada link

                const formatted = {
                    format: item.t.replace(/<.*?>|♪/g, '').trim(), // Bersihkan format
                    resolution: item.s || 'Audio Only', // Resolusi atau "Audio Only"
                    link: item.a // Link unduhan
                };

                if (item.ft == 1) { // Jika ini adalah video
                    result.video.push(formatted);
                } else { // Jika ini adalah audio
                    result.audio.push(formatted);
                }
            });

            return result;
        } catch (error) {
            console.error('Error:', error);
            throw new Error('Gagal memproses URL TikTok.');
        }
    }
};

module.exports = function (app) {
    // Route untuk mengunduh video, audio, dan gambar TikTok
    app.get('/download/tiktok-download', async (req, res) => {
        try {
            const { url } = req.query; // Ambil URL TikTok dari query parameter

            if (!url) {
                return res.status(400).json({ error: 'URL TikTok diperlukan.' });
            }

            // Proses pengunduhan
            const result = await TiktokDownloader.download(url);

            // Kirim response
            res.json({
                success: true,
                message: 'Data berhasil diambil.',
                data: result
            });
        } catch (error) {
            console.error('Terjadi kesalahan:', error);
            res.status(500).json({ error: error.message || 'Internal Server Error' });
        }
    });
};
