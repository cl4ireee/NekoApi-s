const axios = require('axios');
const cheerio = require('cheerio');

// URL untuk masing-masing kategori
const NOW_URL = "https://www.murianews.com/";
const SEARCH_URL = "https://www.murianews.com/search?keyword=";
const CEKFAKTA_URL = "https://www.murianews.com/tag/cek-fakta";
const NASIONAL_URL = "https://www.murianews.com/kanal/nasional";
const SPORT_URL = "https://www.murianews.com/kanal/sport";

// Konfigurasi axios
const axiosConfig = {
    timeout: 30000, // Timeout 30 detik
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
    },
    validateStatus: function (status) {
        return status >= 200 && status < 500;
    }
};

// Helper function untuk extract data
const extractNewsData = ($, el) => {
    try {
        const title = $(el).find("h2, h3, h4, h5, .title").first().text().trim();
        const link = $(el).find("a").first().attr("href");
        const image = $(el).find("img").attr("src") || 
                     $(el).find("[style*='background-image']").attr("style")?.match(/url\(['"]?(.*?)['"]?\)/)?.[1] || 
                     null;
        const date = $(el).find("time, .date, span:contains(WIB)").first().text().trim();
        const description = $(el).find("p, .excerpt, .description").first().text().trim();

        if (title && link) {
            return { title, link, image, date, description };
        }
        return null;
    } catch (err) {
        console.error("Error extracting news data:", err);
        return null;
    }
};

// Fungsi utama untuk mengambil berita
const murianews = {
    // Ambil berita terkini
    now: async () => {
        try {
            const response = await axios.get(NOW_URL, axiosConfig);
            if (response.status !== 200) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const $ = cheerio.load(response.data);
            const news = [];

            $("article, .latest__item, .news-item, .card-box").each((_, el) => {
                const newsItem = extractNewsData($, el);
                if (newsItem) news.push(newsItem);
            });

            return news;
        } catch (error) {
            console.error("Error fetching latest news:", error);
            throw error;
        }
    },

    // Pencarian berita
    search: async (query) => {
        if (!query) throw new Error("Search query is required");
        
        try {
            const response = await axios.get(`${SEARCH_URL}${encodeURIComponent(query)}`, axiosConfig);
            if (response.status !== 200) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const $ = cheerio.load(response.data);
            const results = [];

            $("article, .search-item, .news-item, .card-box").each((_, el) => {
                const newsItem = extractNewsData($, el);
                if (newsItem) results.push(newsItem);
            });

            return results;
        } catch (error) {
            console.error("Error searching news:", error);
            throw error;
        }
    },

    // Berita Cek Fakta
    cekFakta: async () => {
        try {
            const response = await axios.get(CEKFAKTA_URL, axiosConfig);
            if (response.status !== 200) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const $ = cheerio.load(response.data);
            const factChecks = [];

            $("article, .fact-check-item, .news-item, .card-box").each((_, el) => {
                const newsItem = extractNewsData($, el);
                if (newsItem) factChecks.push(newsItem);
            });

            return factChecks;
        } catch (error) {
            console.error("Error fetching fact checks:", error);
            throw error;
        }
    },

    // Berita Nasional
    nasional: async () => {
        try {
            const response = await axios.get(NASIONAL_URL, axiosConfig);
            if (response.status !== 200) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const $ = cheerio.load(response.data);
            const nationalNews = [];

            $("article, .national-item, .news-item, .card-box").each((_, el) => {
                const newsItem = extractNewsData($, el);
                if (newsItem) nationalNews.push(newsItem);
            });

            return nationalNews;
        } catch (error) {
            console.error("Error fetching national news:", error);
            throw error;
        }
    },

    // Berita Olahraga
    sport: async () => {
        try {
            const response = await axios.get(SPORT_URL, axiosConfig);
            if (response.status !== 200) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const $ = cheerio.load(response.data);
            const sportsNews = [];

            $("article, .sport-item, .news-item, .card-box").each((_, el) => {
                const newsItem = extractNewsData($, el);
                if (newsItem) sportsNews.push(newsItem);
            });

            return sportsNews;
        } catch (error) {
            console.error("Error fetching sports news:", error);
            throw error;
        }
    }
};

// Express routes
module.exports = function(app) {
    // Middleware untuk menangani errors
    const asyncHandler = (fn) => (req, res, next) => {
        return Promise.resolve(fn(req, res, next)).catch(next);
    };

    // Response helper
    const sendResponse = (res, data) => {
        if (!data || (Array.isArray(data) && data.length === 0)) {
            return res.status(404).json({
                status: false,
                message: 'Tidak ada data yang ditemukan'
            });
        }
        
        res.json({
            status: true,
            count: Array.isArray(data) ? data.length : 1,
            data: data
        });
    };

    // Routes
    app.get('/news/muria-now', asyncHandler(async (req, res) => {
        const news = await murianews.now();
        sendResponse(res, news);
    }));

    app.get('/news/muria-search', asyncHandler(async (req, res) => {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({
                status: false,
                message: 'Parameter pencarian (q) diperlukan'
            });
        }
        const results = await murianews.search(q);
        sendResponse(res, results);
    }));

    app.get('/news/muria-cek-fakta', asyncHandler(async (req, res) => {
        const news = await murianews.cekFakta();
        sendResponse(res, news);
    }));

    app.get('/news/muria-nasional', asyncHandler(async (req, res) => {
        const news = await murianews.nasional();
        sendResponse(res, news);
    }));

    app.get('/news/muria-sport', asyncHandler(async (req, res) => {
        const news = await murianews.sport();
        sendResponse(res, news);
    }));

    // Error handler middleware
    app.use((error, req, res, next) => {
        console.error('Error:', error);
        res.status(error.status || 500).json({
            status: false,
            message: error.message || 'Terjadi kesalahan pada server',
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    });
};
