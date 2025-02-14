const axios = require('axios');
const cheerio = require('cheerio');

module.exports = function(app) {
  // Endpoint for manga search
  app.get('/search/mangafox', async (req, res) => {
    const { query, limit } = req.query; // Get query and limit from URL parameters
    if (!query) {
      return res.status(400).json({ status: false, error: 'Query is required' });
    }

    const mangaLimit = parseInt(limit) || 5;

    try {
      const searchUrl = `http://m.fanfox.net/search?k=${encodeURIComponent(query)}`;
      const { data } = await axios.get(searchUrl);
      const $ = cheerio.load(data);
      const mangaUrls = [];
      
      // Get manga URLs from search results
      $('.post-list li a').each((index, element) => {
        if (mangaUrls.length < mangaLimit) {
          const mangaUrl = $(element).attr('href');
          mangaUrls.push(mangaUrl);
        }
      });

      const mangaDetails = [];
      
      // Fetch details for each manga
      for (const mangaUrl of mangaUrls) {
        const { data: mangaDetail } = await axios.get(mangaUrl);
        const $$ = cheerio.load(mangaDetail);
        
        const title = $$('p.title').text().trim();
        const imgSrc = $$('.detail-cover').attr('src');
        const imgUrl = imgSrc.replace('//fmcdn.mfcdn.net', 'https://fmcdn.fanfox.net');
        const author = $$('.detail-info p:nth-child(1) a').text().trim();
        const status = $$('.detail-info p:nth-child(2)').text().replace('Status: ', '').trim();
        const rank = $$('.detail-info p:nth-child(3)').text().replace('Rank: ', '').trim().split(' ')[0];
        const genre = $$('.manga-genres ul li a').map((i, el) => $(el).text().trim()).get();
        const totalChapter = $$('.chlist a').length;

        mangaDetails.push({
          title: title,
          image: imgUrl,
          author: author,
          status: status,
          rank: rank,
          genre: genre,
          chapter: totalChapter,
        });
      }

      // Return the search results
      res.status(200).json({
        status: true,
        result: mangaDetails,
      });

    } catch (error) {
      // Handle errors
      console.error('Error fetching manga details:', error);
      res.status(500).json({ status: false, error: error.message });
    }
  });
};
