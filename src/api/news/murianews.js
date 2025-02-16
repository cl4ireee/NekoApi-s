const axios = require('axios');
const cheerio = require('cheerio');

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
               image = image.replace(/^url\("|"\)$/g, '');
            }

            if (title && link) {
               sportNews.push({ title, link, image, });
            }
         });

         return sportNews;
      } catch (error) {
         console.error("Gagal mengambil data Sport:", error);
         return [];
      }
   }
};

function setupRoutes(app) {
   app.get('/now', async (req, res) => {
      const news = await murianews.now();
      res.json(news);
   });

   app.get('/search', async (req, res) => {
      const query = req.query.q;
      if (!query) {
         return res.status(400).json({ error: 'Query parameter "q" is required' });
      }
      const results = await murianews.search(query);
      res.json(results);
   });

   app.get('/cek-fakta', async (req, res) => {
      const news = await murianews.cekFakta();
      res.json(news);
   });

   app.get('/nasional', async (req, res) => {
      const news = await murianews.nasional();
      res.json(news);
   });

   app.get('/sport', async (req, res) => {
      const news = await murianews.sport();
      res.json(news);
   });
}
