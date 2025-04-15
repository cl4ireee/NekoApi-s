const axios = require('axios');
const cheerio = require('cheerio');
const FormData = require('form-data');

module.exports = {
    name: 'Download TikTok Video',
    desc: 'Mengambil informasi dan mengunduh video TikTok tanpa watermark',
    category: 'Downloader',
    params: ['tiktokUrl'],
    async run(req, res) {
        const { tiktokUrl } = req.query;
        if (!tiktokUrl) {
            return res.status(400).json({ status: false, error: 'TikTok URL is required' });
        }

        // Regex untuk memvalidasi URL TikTok
        const regexTiktok = /https:\/\/(?:m|www|vm|vt|lite)?\.?tiktok\.com\/((?:.*\b(?:(?:usr|v|embed|user|video|photo)\/|\?shareId=|\&item_id=)(\d+))|\w+)/;

        if (!regexTiktok.test(tiktokUrl)) {
            return res.status(400).json({ status: false, error: 'Invalid TikTok URL' });
        }

        try {
            // Fungsi untuk mengambil token dari halaman utama
            const getToken = async () => {
                const { data: html } = await axios.get('https://ssstik.io');
                const tokenMatch = html.match(/s_tt\s*=\s*'([^']+)'/);
                if (tokenMatch && tokenMatch[1]) {
                    return tokenMatch[1];
                } else {
                    throw new Error('Token not found.');
                }
            };

            // Mengambil token
            const token = await getToken();

            // Membuat FormData untuk permintaan POST
            const form = new FormData();
            form.append('id', tiktokUrl);
            form.append('locale', 'en');
            form.append('tt', token);

            // Kirim permintaan POST ke ssstik.io untuk mendapatkan data
            const { data: html } = await axios.post('https://ssstik.io/abc?url=dl', form, {
                headers: {
                    ...form.getHeaders(),
                    origin: 'https://ssstik.io',
                    referer: 'https://ssstik.io/en',
                    'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                },
            });

            // Memproses data yang diterima dengan cheerio
            const $ = cheerio.load(html);
            const username = $('h2').text().trim();
            const description = $('.maintext').text().trim();
            const likeCount = $('div.trending-actions > div.justify-content-start').eq(0).text().trim();
            const commentCount = $('div.trending-actions > div.justify-content-center > div').text().trim();
            const shareCount = $('div.trending-actions > div.justify-content-end > div').text().trim();
            const avatarUrl = $('img.result_author').attr('src');
            const videoUrl = $('a.without_watermark').attr('href');
            const musicUrl = $('a.music').attr('href');
            const css = $('style').html();
            const overlayMatch = css?.match(/#mainpicture \.result_overlay\s*{\s*background-image:\s*url["']?([^"']+)["']?;\s*}/);
            const overlayUrl = overlayMatch ? overlayMatch[1] : null;

            // Menyiapkan data yang akan dikembalikan dalam respons
            return res.json({
                status: true,
                result: {
                    username,
                    description,
                    stats: {
                        likeCount,
                        commentCount,
                        shareCount,
                    },
                    downloads: {
                        avatarUrl,
                        overlayUrl,
                        videoUrl,
                        musicUrl,
                    },
                },
            });

        } catch (err) {
            // Menangani kesalahan jika terjadi error dalam proses
            return res.status(500).json({ status: false, error: err.message });
        }
    }
};
