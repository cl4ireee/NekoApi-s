const axios = require('axios');
const cheerio = require('cheerio');

module.exports = function(app) {
    // Endpoint untuk mencari aplikasi di F-Droid
    app.get('/search/fdroidsearch', async (req, res) => {
        const { q } = req.query; // Mengambil query dari parameter URL
        if (!q) {
            return res.status(400).json({ status: false, error: 'Query is required' });
        }
        try {
            // Melakukan pencarian di F-Droid
            const response = await axios.get('https://search.f-droid.org/?q=' + encodeURIComponent(q) + '&lang=id');
            const html = response.data;
            const $ = cheerio.load(html);
            const apps = [];

            // Mengambil informasi aplikasi dari hasil pencarian
            $('a.package-header').each((index, element) => {
                const appName = $(element).find('h4.package-name').text().trim();
                const appDesc = $(element).find('span.package-summary').text().trim();
                const appLink = $(element).attr('href');
                const appIcon = $(element).find('img.package-icon').attr('src');
                const appLicense = $(element).find('span.package-license').text().trim();

                apps.push({
                    name: appName,
                    description: appDesc,
                    link: appLink,
                    icon: appIcon,
                    license: appLicense
                });
            });

            // Mengembalikan hasil pencarian
            res.status(200).json({
                status: true,
                result: apps
            });
        } catch (error) {
            // Menangani kesalahan
            console.error('Error fetching apps:', error);
            res.status(500).json({ status: false, error: error.message });
        }
    });
};
