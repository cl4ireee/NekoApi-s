const axios = require('axios');
const cheerio = require('cheerio');

// URL untuk masing-masing kategori
const NOW_URL = "https://murianews.com/";
const SEARCH_URL = "https://murianews.com/search?keyword=";
const CEKFAKTA_URL = "https://berita.murianews.com/cek-fakta";
const NASIONAL_URL = "https://berita.murianews.com/nasional";
const SPORT_URL = "https://sport.murianews.com/";

// Konfigurasi axios
const axiosConfig = {
    timeout: 10000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
    }
};

// Fungsi helper untuk scraping dengan retry logic
const fetchWithRetry = async (url, retries = 3) => {
    let lastError;
    for (let i = 0; i < retries; i++) {
        try {
            const response = await axios.get(url, axiosConfig);
            return response.data;
        } catch (error) {
            console.error(`Attempt ${i + 1} failed for ${url}:`, error.message);
            lastError = error;
            if (i < retries - 1) await new Promise(r => setTimeout(r, 1000 * (i + 1)));
        }
    }
    throw lastError;
};

// Fungsi utama untuk mengambil berita dari berbagai kategori
const murianews = {
    // Ambil berita dari halaman utama
    now: async () => {
        try {
            const data = await fetchWithRetry(NOW_URL);
            const $ = cheerio.load(data);
            const news = [];

            $(".blockbox .card-box").each((_, el) => {
                try {
                    const title = $(el).find("h3.title").text().trim();
                    const link = $(el).find("a").attr("href");
                    const image = $(el).find("img").attr("src");
                    const category = $(el).find("h6.title a").text().trim();
                    const date = $(el).find("h6.title span").text().trim();
                    const description = $(el).find("p.line2").text().trim();

                    if (title && link) {
                        news.push({ title, link, image, category, date, description });
                    }
                } catch (err) {
                    console.error("Error scraping individual item:", err.message);
                }
            });

            return news;
        } catch (error) {
            console.error("Gagal mengambil data now:", error.message);
            return [];
        }
    },

    // Cari berita berdasarkan query
    search: async (q) => {
        try {
            const data = await fetchWithRetry(SEARCH_URL + encodeURIComponent(q));
            const $ = cheerio.load(data);
            const results = [];

            $(".blockbox .card-box").each((_, el) => {
                try {
                    const title = $(el).find("h3.title").text().trim();
                    const link = $(el).find("a").attr("href");
                    const image = $(el).find("img").attr("src");
                    const category = $(el).find("h6.title span").first().text().trim();
                    const date = $(el).find("h6.title span").last().text().trim();
                    const description = $(el).find("p.line2").text().trim();

                    if (title && link) {
                        results.push({ title, link, image, category, date, description });
                    }
                } catch (err) {
                    console.error("Error scraping search item:", err.message);
                }
            });

            return results;
        } catch (error) {
            console.error("Gagal mencari berita:", error.message);
            return [];
        }
    },

    // Ambil berita Cek Fakta
    cekFakta: async () => {
        try {
            const data = await fetchWithRetry(CEKFAKTA_URL);
            const $ = cheerio.load(data);
            const cekFaktaNews = [];

            $(".blockbox .card-box").each((_, el) => {
                try {
                    const title = $(el).find("h3.title").text().trim();
                    const link = $(el).find("a").attr("href");
                    const image = $(el).find("img").attr("src");
                    const date = $(el).find("h6.title span").last().text().trim();
                    const description = $(el).find("p.line2").text().trim();

                    if (title && link) {
                        cekFaktaNews.push({ title, link, image, date, description });
                    }
                } catch (err) {
                    console.error("Error scraping cek fakta item:", err.message);
                }
            });

            return cekFaktaNews;
        } catch (error) {
            console.error("Gagal mengambil data Cek Fakta:", error.message);
            return [];
        }
    },

    // Ambil berita Nasional
    nasional: async () => {
        try {
            const data = await fetchWithRetry(NASIONAL_URL);
            const $ = cheerio.load(data);
            const nasionalNews = [];

            $(".blockbox .card-box").each((_, el) => {
                try {
                    const title = $(el).find("h3.title").text().trim();
                    const link = $(el).find("a").attr("href");
                    const image = $(el).find("img").attr("src");
                    const date = $(el).find("h6.title span").last().text().trim();
                    const description = $(el).find("p.line2").text().trim();

                    if (title && link) {
                        nasionalNews.push({ title, link, image, date, description });
                    }
                } catch (err) {
                    console.error("Error scraping nasional item:", err.message);
                }
            });

            return nasionalNews;
        } catch (error) {
            console.error("Gagal mengambil data Nasional:", error.message);
            return [];
        }
    },

    // Ambil berita Sport
    sport: async () => {
        try {
            const data = await fetchWithRetry(SPORT_URL);
            const $ = cheerio.load(data);
            const sportNews = [];

            $(".card-box").each((_, el) => {
                try {
                    const title = $(el).find("h3.title, h5.title").text().trim();
                    const link = $(el).find("a").attr("href");
                    let image = $(el).find("img").attr("src") || $(el).find(".img-card").css("background-image");

                    if (image && image.startsWith('url(')) {
                        image = image.replace(/^url\(['"]?|['"]?\)$/g, '');
                    }

                    if (title && link) {
                        sportNews.push({ title, link, image });
                    }
                } catch (err) {
                    console.error("Error scraping sport item:", err.message);
                }
            });

            return sportNews;
        } catch (error) {
            console.error("Gagal mengambil data Sport:", error.message);
            return [];
        }
    }
};

// Express routes
module.exports = function(app) {
    app.get('/news/muria-now', async (req, res) => {
        try {
            const news = await murianews.now();
            if (!news.length) {
                return res.status(404).json({ 
                    status: false, 
                    message: 'Tidak ada berita yang ditemukan' 
                });
            }
            res.json({ status: true, data: news });
        } catch (error) {
            res.status(500).json({ 
                status: false, 
                message: 'Gagal mengambil berita terkini' 
            });
        }
    });

    app.get('/news/muria-search', async (req, res) => {
        try {
            const q = req.query.q;
            if (!q) {
                return res.status(400).json({ 
                    status: false, 
                    message: 'Parameter pencarian (q) diperlukan' 
                });
            }
            const results = await murianews.search(q);
            if (!results.length) {
                return res.status(404).json({ 
                    status: false, 
                    message: 'Tidak ada hasil pencarian' 
                });
            }
            res.json({ status: true, data: results });
        } catch (error) {
            res.status(500).json({ 
                status: false, 
                message: 'Gagal melakukan pencarian' 
            });
        }
    });

    app.get('/news/muria-cek-fakta', async (req, res) => {
        try {
            const news = await murianews.cekFakta();
            if (!news.length) {
                return res.status(404).json({ 
                    status: false, 
                    message: 'Tidak ada berita cek fakta' 
                });
            }
            res.json({ status: true, data: news });
        } catch (error) {
            res.status(500).json({ 
                status: false, 
                message: 'Gagal mengambil berita cek fakta' 
            });
        }
    });

    app.get('/news/muria-nasional', async (req, res) => {
        try {
            const news = await murianews.nasional();
            if (!news.length) {
                return res.status(404).json({ 
                    status: false, 
                    message: 'Tidak ada berita nasional' 
                });
            }
            res.json({ status: true, data: news });
        } catch (error) {
            res.status(500).json({ 
                status: false, 
                message: 'Gagal mengambil berita nasional' 
            });
        }
    });

    app.get('/news/muria-sport', async (req, res) => {
        try {
            const news = await murianews.sport();
            if (!news.length) {
                return res.status(404).json({ 
                    status: false, 
                    message: 'Tidak ada berita olahraga' 
                });
            }
            res.json({ status: true, data: news });
        } catch (error) {
            res.status(500).json({ 
                status: false, 
                message: 'Gagal mengambil berita olahraga' 
            });
        }
    });
};
