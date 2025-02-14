
import axios from 'axios';
import * as cheerio from 'cheerio';
/**
 * Format URL untuk pos Threads.
 * @param {string} url - URL pos Threads.
 * @returns {string} - URL yang diformat untuk diambil.
 */
const formatUrl = (url) => {
    let clean = url.split("?")[0];
    if (clean.endsWith("/")) clean = clean.slice(0, -1);
    return `${clean}/embed/`;
};

/**
 * Mengambil media dari pos Threads.
 * @param {Object} $ - Cheerio instance.
 * @returns {Array<string>} - Daftar URL media.
 */
const getMedia = ($) => {
    const mediaList = [];

    // Mengambil video jika ada
    const vid = $(".SingleInnerMediaContainerVideo source").attr("src");
    if (vid) mediaList.push(vid.replace(/&amp;/g, "&"));

    // Mengambil gambar dari kontainer media utama
    $(".SingleInnerMediaContainer img").each((i, el) => {
        mediaList.push($(el).attr("src").replace(/&amp;/g, "&"));
    });

    // Mengambil semua gambar dari kontainer media scroll
    $(".MediaScrollImageContainer img").each((i, el) => {
        mediaList.push($(el).attr("src").replace(/&amp;/g, "&"));
    });

    return mediaList;
};

/**
 * Mengambil media dan caption dari pos Threads.
 * @param {string} url - URL pos Threads.
 * @returns {Promise<{ media: Array<string>, caption: string|null }>} - Media URLs dan caption.
 * @throws {Error} - Throws an error if fetching fails.
 */
const threads = async (url) => {
    try {
        const $ = cheerio.load(
            await axios.get(formatUrl(url)).then((res) => res.data),
        );

        return {
            media: getMedia($),
            caption: $(".BodyTextContainer").text().trim() || null,
        };
    } catch (err) {
        throw new Error("Error:", err.message);
    }
};

// Endpoint untuk mengunduh media dan caption dari pos Threads
app.get('/download/threads', async (req, res) => {
    try {
        const { url } = req.query; // Mengambil parameter query 'url'
        if (!url) {
            return res.status(400).json({ status: false, error: 'URL pos Threads is required' });
        }
        const post = await threads(url);
        
        // Mengembalikan respons yang terstruktur
        res.status(200).json({
            status: true,
            media: post.media,
            caption: post.caption
        });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
});

// Anda dapat menambahkan app.listen di sini jika ingin menjalankan server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`Server berjalan di http://localhost:${PORT}`);
// });
