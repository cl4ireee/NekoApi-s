const axios = require('axios');
const cheerio = require('cheerio');

module.exports = function (app) {
    // Endpoint untuk mencari aplikasi di APK.DOG
    app.get('/search/apkdog-search', async (req, res) => {
        const { q, limit = 3 } = req.query; // Mengambil parameter 'q' dan 'limit' dari query string

        if (!q) {
            return res.status(400).json({ status: false, error: "Query parameter 'q' is required" });
        }

        try {
            let response = await axios.get(`https://apk.dog/search/${q}`);
            let $ = cheerio.load(response.data);

            let results = [];
            $("div.wrap ul.apps_list li.item").each(function() {
                let title = $(this).find("a.app_link div.app_name").text().trim();
                let version = $(this).find("div.bottom_block div.version").text().trim().replace("version: ", "");
                let rating = $(this).find("div.bottom_block div.raging").text().trim().replace("rating: ★", "");
                let updated = $(this).find("div.bottom_block div.date").text().trim().replace("update: ", "");
                let icon = $(this).find("div.app_icon a img").attr("src");
                let url = $(this).find("a.app_link").attr("href");

                results.push({
                    appName: title,
                    appVersion: version,
                    ratingCount: rating,
                    publishedDate: updated,
                    appIcon: icon,
                    appUrl: url
                });
            });

            for (let result of results.slice(0, limit)) {
                try {
                    let html = await axios.get(result.appUrl);
                    let $$ = cheerio.load(html.data);
                    let details = {};
                    $$('div.full ul.file_info li').each((i, element) => {
                        const key = $$(element).find('div').text().trim();
                        const value = $$(element).contents().not($$(element).find('div')).text().trim();
                        if (key === 'Size') {
                            details.appSize = value;
                        } else if (key === 'Permissions') {
                            details.permissionsCount = value;
                        } else if (key === 'License') {
                            details.license = value;
                        } else if (key === 'Package name') {
                            details.packageName = value;
                        } else if (key === 'Category') {
                            details.category = value;
                        } else if (key === 'Developer') {
                            details.devName = value;
                        } else if (key === 'Developer email') {
                            details.devMail = value;
                        } else if (key === 'Android') {
                            details.androidVersion = value;
                        } else if (key === 'md5 hash') {
                            details.md5Hash = value;
                        } else if (key === 'Architecture') {
                            details.architecture = value;
                        }
                        details.description = $$("div.full div.descr p.descr_text").text().trim();
                    });
                    result.details = details;
                } catch (error) {
                    console.error(`Error fetching details for ${result.appName}: ${error.message}`);
                }
            }

            res.status(200).json(results.slice(0, limit));
        } catch (error) {
            console.error('Error fetching APK search data:', error.message);
            res.status(500).json({ status: false, error: 'Failed to fetch APK search data' });
        }
    });
};
