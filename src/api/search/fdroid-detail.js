const axios = require('axios');
const cheerio = require('cheerio');

module.exports = function(app) {
    // Endpoint untuk mendapatkan detail aplikasi di F-Droid
    app.get('/search/fdroiddetail', async (req, res) => {
        const { url } = req.query; // Mengambil URL dari parameter URL
        if (!url) {
            return res.status(400).json({ status: false, error: 'URL is required' });
        }
        try {
            // Mengambil detail aplikasi dari F-Droid
            const response = await axios.get(url);
            const html = response.data;
            const $ = cheerio.load(html);
            const appDetails = {};

            // Mengambil informasi detail aplikasi
            const versionElement = $('li.package-version#latest');
            const versionText = versionElement.find('.package-version-header').text().trim();
            const versionMatch = versionText.match(/Versi\s+([\d.]+)/);

            appDetails.version = versionMatch ? versionMatch[1] : versionText.replace(/[^0-9.]/g, '').split(/\s+/)[0];
            appDetails.addedOn = versionElement.find('.package-version-header').text().match(/Ditambahkan pada (.+)/)?.[1].trim();
            appDetails.requirement = versionElement.find('.package-version-requirement').text().trim();
            appDetails.sourceLink = versionElement.find('.package-version-source a').attr('href');
            appDetails.permissions = versionElement.find('.package-version-permissions .no-permissions').text().trim() || 'Permissions not listed';
            appDetails.downloadLink = versionElement.find('.package-version-download a').attr('href');
            appDetails.apkSize = versionElement.find('.package-version-download').contents().filter(function() {
                return this.nodeType === 3;
            }).text().trim().split('|')[0].trim();

            // Mengembalikan hasil detail aplikasi
            res.status(200).json({
                status: true,
                result: appDetails
            });
        } catch (error) {
            // Menangani kesalahan
            console.error('Error fetching app details:', error);
            res.status(500).json({ status: false, error: error.message });
        }
    });
};
