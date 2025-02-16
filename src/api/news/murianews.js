const axios = require("axios");
const cheerio = require("cheerio");

const NOW_URL = "https://murianews.com/";
const SEARCH_URL = "https://murianews.com/search?keyword=";
const CEKFAKTA_URL = "https://berita.murianews.com/cek-fakta";
const NASIONAL_URL = "https://berita.murianews.com/nasional";
const SPORT_URL = "https://sport.murianews.com/";

const murianews = {
   now: async () => {
      try {
         let { data } = await axios.get(NOW_URL);
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
   
   search: async (query) => {
      try {
         let { data } = await axios.get(SEARCH_URL + encodeURIComponent(query));
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
   
   cekFakta: async () => {
      try {
         let { data } = await axios.get(CEKFAKTA_URL);
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
   
   nasional: async () => {
      try {
         let { data } = await axios.get(NASIONAL_URL);
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
   
   sport: async () => {
      try {
         let { data } = await axios.get(SPORT_URL);
         let $ = cheerio.load(data);
         
         let sportNews = [];

         $(".card-box").each((_, el) => {
            let title = $(el).find("h3.title, h5.title").text().trim();
            let link = $(el).find("a").attr("href");
            let image = $(el).find("img").attr("src") || $(el).find(".img-card").css("background-image");

            if (image && image.startsWith('url(')) {
               image = image.replace(/^url\(['"]?|['"]?\)$/g, '');
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

// Fungsi untuk mendaftarkan endpoint API
const registerMurianewsAPI = (app) => {
   app.get("/news/muria-now", async (req, res) => {
      try {
         const news = await murianews.now();
         res.json(news);
      } catch (error) {
         res.status(500).json({ error: "Gagal mengambil berita terbaru" });
      }
   });

   app.get("/news/muria-search", async (req, res) => {
      try {
         const { q } = req.query;

         if (!q) {
            return res.status(400).json({ error: "Parameter 'q' diperlukan" });
         }

         const results = await murianews.search(q);
         res.json(results);
      } catch (error) {
         res.status(500).json({ error: "Gagal mencari berita" });
      }
   });

   app.get("/news/muria-cek-fakta", async (req, res) => {
      try {
         const cekFaktaNews = await murianews.cekFakta();
         res.json(cekFaktaNews);
      } catch (error) {
         res.status(500).json({ error: "Gagal mengambil data Cek Fakta" });
      }
   });

   app.get("/news/muria-nasional", async (req, res) => {
      try {
         const nasionalNews = await murianews.nasional();
         res.json(nasionalNews);
      } catch (error) {
         res.status(500).json({ error: "Gagal mengambil data Nasional" });
      }
   });

   app.get("/sport", async (req, res) => {
      try {
         const sportNews = await murianews.sport();
         res.json(sportNews);
      } catch (error) {
         res.status(500).json({ error: "Gagal mengambil data Sport" });
      }
   });
};
