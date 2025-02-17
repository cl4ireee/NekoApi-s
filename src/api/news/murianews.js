const axios = require("axios");
const cheerio = require("cheerio");

const NOW_URL = "https://murianews.com/";
const SEARCH_URL = "https://murianews.com/search?keyword=";
const CEKFAKTA_URL = "https://berita.murianews.com/cek-fakta";
const NASIONAL_URL = "https://berita.murianews.com/nasional";
const SPORT_URL = "https://sport.murianews.com/";

module.exports = function(app) {
   // Endpoint untuk berita terkini
   app.get("/news/muria-now", async (req, res) => {
      try {
         const { data } = await axios.get(NOW_URL);
         const $ = cheerio.load(data);
         const news = [];

         $(".blockbox .card-box").each((_, el) => {
            const title = $(el).find("h3.title").text().trim();
            const link = $(el).find("a").attr("href");
            const image = $(el).find("img").attr("src");
            const category = $(el).find("h6.title a").text().trim();
            const date = $(el).find("h6.title span").text().trim();
            const description = $(el).find("p.line2").text().trim();

            if (title && link) {
               news.push({ title, link, image, category, date, description });
            }
         });

         res.status(200).json({ status: true, data: news });
      } catch (error) {
         console.error("Gagal mengambil data:", error);
         res.status(500).json({ status: false, error: "Gagal mengambil data" });
      }
   });

   // Endpoint untuk pencarian berita
   app.get("/news/muria-search", async (req, res) => {
      const { query } = req.query;

      if (!query) {
         return res.status(400).json({ status: false, error: "Parameter 'query' diperlukan" });
      }

      try {
         const { data } = await axios.get(SEARCH_URL + encodeURIComponent(query));
         const $ = cheerio.load(data);
         const results = [];

         $(".blockbox .card-box").each((_, el) => {
            const title = $(el).find("h3.title").text().trim();
            const link = $(el).find("a").attr("href");
            const image = $(el).find("img").attr("src");
            const category = $(el).find("h6.title span").first().text().trim();
            const date = $(el).find("h6.title span").last().text().trim();
            const description = $(el).find("p.line2").text().trim();

            if (title && link) {
               results.push({ title, link, image, category, date, description });
            }
         });

         res.status(200).json({ status: true, data: results });
      } catch (error) {
         console.error("Gagal mencari berita:", error);
         res.status(500).json({ status: false, error: "Gagal mencari berita" });
      }
   });

   // Endpoint untuk berita Cek Fakta
   app.get("/news/muria-cek-fakta", async (req, res) => {
      try {
         const { data } = await axios.get(CEKFAKTA_URL);
         const $ = cheerio.load(data);
         const cekFaktaNews = [];

         $(".blockbox .card-box").each((_, el) => {
            const title = $(el).find("h3.title").text().trim();
            const link = $(el).find("a").attr("href");
            const image = $(el).find("img").attr("src");
            const date = $(el).find("h6.title span").last().text().trim();
            const description = $(el).find("p.line2").text().trim();

            if (title && link) {
               cekFaktaNews.push({ title, link, image, date, description });
            }
         });

         res.status(200).json({ status: true, data: cekFaktaNews });
      } catch (error) {
         console.error("Gagal mengambil data Cek Fakta:", error);
         res.status(500).json({ status: false, error: "Gagal mengambil data Cek Fakta" });
      }
   });

   // Endpoint untuk berita Nasional
   app.get("/news/muria-nasional", async (req, res) => {
      try {
         const { data } = await axios.get(NASIONAL_URL);
         const $ = cheerio.load(data);
         const nasionalNews = [];

         $(".blockbox .card-box").each((_, el) => {
            const title = $(el).find("h3.title").text().trim();
            const link = $(el).find("a").attr("href");
            const image = $(el).find("img").attr("src");
            const date = $(el).find("h6.title span").last().text().trim();
            const description = $(el).find("p.line2").text().trim();

            if (title && link) {
               nasionalNews.push({ title, link, image, date, description });
            }
         });

         res.status(200).json({ status: true, data: nasionalNews });
      } catch (error) {
         console.error("Gagal mengambil data Nasional:", error);
         res.status(500).json({ status: false, error: "Gagal mengambil data Nasional" });
      }
   });

   // Endpoint untuk berita Olahraga
   app.get("/news/muria-sport", async (req, res) => {
      try {
         const { data } = await axios.get(SPORT_URL);
         const $ = cheerio.load(data);
         const sportNews = [];

         $(".card-box").each((_, el) => {
            const title = $(el).find("h3.title, h5.title").text().trim();
            const link = $(el).find("a").attr("href");
            let image = $(el).find("img").attr("src") || $(el).find(".img-card").css("background-image");

            if (image && image.startsWith('url(')) {
               image = image.replace(/^url\(['"]?|['"]?\)$/g, '');
            }

            if (title && link) {
               sportNews.push({ title, link, image });
            }
         });

         res.status(200).json({ status: true, data: sportNews });
      } catch (error) {
         console.error("Gagal mengambil data Sport:", error);
         res.status(500).json({ status: false, error: "Gagal mengambil data Sport" });
      }
   });
};
