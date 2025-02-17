import axios from 'axios';
import cheerio from 'cheerio';

const bes = 'https://komikcast.bz'; // Base URL yang digunakan

const Komikcast = {
  // Fungsi untuk mendapatkan Hot Update
  async getHotUpdate() {
    try {
      const { data } = await axios.get(bes);
      const $ = cheerio.load(data);
      const result = [];

      // Ambil data dari hot update
      $('div.listupd.komikinfo .swiper-wrapper .splide-slide').each((i, el) => {
        let item = {};
        item.title = $(el).find('a[href]').attr('title');
        item.link = $(el).find('a[href]').attr('href');
        item.type = $(el).find('span.type').map((i, el) => $(el).text().trim()).get();
        item.thumbnail = $(el).find('img').attr('src');
        item.chapter = {
          number: $(el).find('div.chapter').text().trim(),
          link: $(el).find('div.chapter').attr('href'),
        };
        item.rating = +$(el).find('div.numscore').text().replace(',', '.').trim();
        item.star = Math.round(item.rating / 2);
        result.push(item);
      });
      return result;
    } catch (error) {
      console.error('Error in getHotUpdate:', error.message);
      throw new Error('Failed to get hot update');
    }
  },

  // Fungsi untuk mendapatkan Project List berdasarkan halaman
  async getProjectList(page = 0) {
    try {
      const { data } = await axios.get(`${bes}/project-list/page/${page}`);
      const $ = cheerio.load(data);
      const result = [];

      // Ambil data dari project list
      $('div.list-update_items-wrapper div.list-update_item').each((i, el) => {
        let item = {};
        item.title = $(el).find('h3').text().trim();
        item.link = $(el).find('a').attr('href');
        item.thumbnail = $(el).find('img').attr('src');
        item.type = $(el).find('span.type').map((i, el) => $(el).text().trim()).get();
        item.chapter = {
          number: $(el).find('div.chapter').text().trim(),
          link: $(el).find('div.chapter').attr('href'),
        };
        item.rating = +$(el).find('div.numscore').text().replace(',', '.').trim();
        item.star = Math.round(item.rating / 2);
        result.push(item);
      });
      return result;
    } catch (error) {
      console.error('Error in getProjectList:', error.message);
      throw new Error('Failed to fetch project list');
    }
  },

  // Fungsi untuk mendapatkan Komik List berdasarkan filter tertentu
  async getKomik({ status, type, orderby, page = 0 }) {
    try {
      const { data } = await axios.get(`${bes}/daftar-komik?page=${page}&status=${status}&type=${type}&orderby=${orderby}`);
      const $ = cheerio.load(data);
      const result = [];

      // Ambil data komik
      $('div.list-update_items-wrapper div.list-update_item').each((i, el) => {
        let item = {};
        item.title = $(el).find('h3').text().trim();
        item.link = $(el).find('a').attr('href');
        item.thumbnail = $(el).find('img').attr('src');
        item.type = $(el).find('span.type').map((i, el) => $(el).text().trim()).get();
        item.chapter = {
          number: $(el).find('div.chapter').text().trim(),
          link: $(el).find('div.chapter').attr('href'),
        };
        item.rating = +$(el).find('div.numscore').text().replace(',', '.').trim();
        item.star = Math.round(item.rating / 2);
        result.push(item);
      });
      return result;
    } catch (error) {
      console.error('Error in getKomik:', error.message);
      throw new Error('Failed to fetch komik list');
    }
  },

  // Fungsi untuk mencari komik berdasarkan query
  async search(query) {
    try {
      const { data } = await axios.get(`${bes}?s=${encodeURIComponent(query)}`);
      const $ = cheerio.load(data);
      const result = [];

      // Ambil data hasil pencarian
      $('div.list-update_items-wrapper div.list-update_item').each((i, el) => {
        let item = {};
        item.title = $(el).find('h3').text().trim();
        item.link = $(el).find('a').attr('href');
        item.thumbnail = $(el).find('img').attr('src');
        item.type = $(el).find('span.type').map((i, el) => $(el).text().trim()).get();
        item.chapter = {
          number: $(el).find('div.chapter').text().trim(),
          link: $(el).find('div.chapter').attr('href'),
        };
        item.rating = +$(el).find('div.numscore').text().replace(',', '.').trim();
        item.star = Math.round(item.rating / 2);
        result.push(item);
      });
      return result;
    } catch (error) {
      console.error('Error in search:', error.message);
      throw new Error('Failed to search komik');
    }
  },

  // Fungsi untuk mendapatkan detail komik berdasarkan URL
  async detail(url) {
    try {
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);
      const result = {};

      result.title = $('h1.komik-info-title').text().trim();
      result.thumbnail = $('img.komik-info-thumbnail').attr('src');
      result.synopsis = $('div.komik-info-synopsis').text().trim();
      // Ambil data lainnya sesuai kebutuhan

      return result;
    } catch (error) {
      console.error('Error in detail:', error.message);
      throw new Error('Failed to fetch komik detail');
    }
  },
};

// API Routes
module.exports = function (app) {
  // Endpoint untuk mendapatkan Hot Update
  app.get('/komik/hot-update', async (req, res) => {
    try {
      const results = await Komikcast.getHotUpdate();
      res.status(200).json({ status: true, data: results });
    } catch (error) {
      res.status(500).json({ status: false, error: error.message });
    }
  });

  // Endpoint untuk mendapatkan Project List
  app.get('/komik/project-list', async (req, res) => {
    const { page } = req.query;
    try {
      const results = await Komikcast.getProjectList(page);
      res.status(200).json({ status: true, data: results });
    } catch (error) {
      res.status(500).json({ status: false, error: error.message });
    }
  });

  // Endpoint untuk mendapatkan Daftar Komik
  app.get('/komik/komikcast-list', async (req, res) => {
    const { status, type, orderby, page } = req.query;
    try {
      const results = await Komikcast.getKomik({ status, type, orderby, page });
      res.status(200).json({ status: true, data: results });
    } catch (error) {
      res.status(500).json({ status: false, error: error.message });
    }
  });

  // Endpoint untuk mencari Komik
  app.get('/komik/search', async (req, res) => {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ status: false, error: "Query parameter 'query' is required" });
    }
    try {
      const results = await Komikcast.search(query);
      res.status(200).json({ status: true, data: results });
    } catch (error) {
      res.status(500).json({ status: false, error: error.message });
    }
  });

  // Endpoint untuk mendapatkan Detail Komik
  app.get('/komik/komikcast-detail', async (req, res) => {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ status: false, error: "Query parameter 'url' is required" });
    }
    try {
      const results = await Komikcast.detail(url);
      res.status(200).json({ status: true, data: results });
    } catch (error) {
      res.status(500).json({ status: false, error: error.message });
    }
  });
};
