const axios = require('axios');
const cheerio = require('cheerio');

// URL untuk masing-masing kategori
const NOW_URL = "https://murianews.com/";
const SEARCH_URL = "https://murianews.com/search?keyword=";
const CEKFAKTA_URL = "https://berita.murianews.com/cek-fakta";
const NASIONAL_URL = "https://berita.murianews.com/nasional";
const SPORT_URL = "https://sport.murianews.com/";

// Header yang digunakan untuk permintaan HTTP
const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
};

// Fungsi utama untuk mengambil berita dari berbagai kategori
const murianews = {
   // Ambil berita dari halaman utama
   now: async () => {
      try {
         let { data } = await axios.get(NOW_URL, { headers });
         let $ = cheerio.load(data);
         
         let news = [];

         $(".blockbox .card-box").each((_, el) => {
            let title = $(el).find("h3.title").text().trim();
            let link = $(el).find("a").attr("href");
            let image = $(el).find("img").attr("src");
            let category = $(el).find("h6.title a").text().trim();
            let date = $(el).find("h6.title span").text().trim();
            let description = $(el).find("p.line2").text().trim();

            if (title && link) {
               news.push({ title, link, image, category, date, description });
            }
         });

         return news;
      } catch (error) {
         console.error("Gagal mengambil data:", error);
         return [];
      }
   },
   
   // Cari berita berdasarkan query (menggunakan q)
   search: async (q) => { // Menggunakan q sebagai parameter query
      try {
         let { data } = await axios.get(SEARCH_URL + encodeURIComponent(q), { headers });
         let $ = cheerio.load(data);

         let results = [];

         $(".blockbox .card-box").each((_, el) => {
            let title = $(el).find("h3.title").text().trim();
            let link = $(el).find("a").attr("href");
            let image = $(el).find("img").attr("src");
            let category = $(el).find("h6.title span").first().text().trim();
            let date = $(el).find("h6.title span").last().text().trim();
            let description = $(el).find("p.line2").text().trim();

            if (title && link) {
               results.push({ title, link, image, category, date, description });
            }
         });

         return results;
      } catch (error) {
         console.error("Gagal mencari berita:", error);
         return [];
      }
   },

   // Ambil berita Cek Fakta
   cekFakta: async () => {
      try {
         let { data } = await axios.get(CEKFAKTA_URL, { headers });
         let $ = cheerio.load(data);
         
         let cekFaktaNews = [];

         $(".blockbox .card-box").each((_, el) => {
            let title = $(el).find("h3.title").text().trim();
            let link = $(el).find("a").attr("href");
            let image = $(el).find("img").attr("src");
            let date = $(el).find("h6.title span").last().text().trim();
            let description = $(el).find("p.line2").text().trim();

            if (title && link) {
               cekFaktaNews.push({ title, link, image, date, description });
            }
         });

         return cekFaktaNews;
      } catch (error) {
         console.error("Gagal mengambil data Cek Fakta:", error);
         return [];
      }
   },
   
   // Ambil berita Nasional
   nasional: async () => {
      try {
         let { data } = await axios.get(NASIONAL_URL, { headers });
         let $ = cheerio.load(data);
         
         let nasionalNews = [];

         $(".blockbox .card-box").each((_, el) => {
            let title = $(el).find("h3.title").text().trim();
            let link = $(el).find("a").attr("href");
            let image = $(el).find("img").attr("src");
            let date = $(el).find("h6.title span").last().text().trim();
            let description = $(el).find("p.line2").text().trim();

            if (title && link) {
               nasionalNews.push({ title, link, image, date, description });
            }
         });

         return nasionalNews;
      } catch (error) {
         console.error("Gagal mengambil data Nasional:", error);
         return [];
      }
   },

   // Ambil berita Sport
   sport: async () => {
      try {
         let { data } = await axios.get(SPORT_URL, { headers });
         let $ = cheerio.load(data);
         
         let sportNews = [];

         $(".card-box").each((_, el) => {
            let title = $(el).find("h3.title, h5.title").text().trim();
            let link = $(el).find("a").attr("href");
            let image = $(el).find("img").attr("src") || $(el).find(".img-card").css("background-image");

            if (image && image.startsWith('url(')) {
               image = image.replace(/^url.*$/g, '');
            }

            if (title && link) {
               sportNews.push({ title, link, image });
            }
         });

         return sportNews;
      } catch (error) {
         console.error("Gagal mengambil data Sport:", error);
         return [];
      }
   }
};

// Ekspor fungsi yang menerima `app` sebagai parameter
module.exports = function (app) {
   app.get('/news/muria-now', async (req, res) => {
      const news = await murianews.now();
      res.json(news);
   });

   app.get('/news/muria-search', async (req, res) => {
      const q = req.query.q; // Menggunakan q sebagai query parameter
      if (!q) {
         return res.status(400).json({ error: 'Query parameter "q" is required' });
      }
      const results = await murianews.search(q); // Gunakan q untuk pencarian
      res.json(results);
   });

   app.get('/news/muria-cek-fakta', async (req, res) => {
      const news = await murianews.cekFakta();
      res.json(news);
   });

   app.get('/news/muria-nasional', async (req, res) => {
      const news = await murianews.nasional();
      res.json(news);
   });

   app.get('/news/muria-sport', async (req, res) => {
      const news = await murianews.sport();
      res.json(news);
   });
};
