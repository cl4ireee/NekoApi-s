const axios = require("axios");
const cheerio = require("cheerio");

async function krakenfiles(url) {
    return new Promise(async (resolve, reject) => {
        if (!/krakenfiles.com/.test(url)) return reject(new Error("Input URL from Krakenfiles!"));

        let { data } = await axios.get(url, {
            headers: {
                "User -Agent": "Posify/1.0.0",
                "Referer": url,
                "Accept": "*/*"
            },
        }).catch((e) => reject(e.response));

        let $ = cheerio.load(data);
        let result = {
            metadata: {},
            downloadUrl: null
        };

        result.metadata.filename = $(".coin-info .coin-name h5").text().trim();

        $(".nk-iv-wg4 .nk-iv-wg4-overview li").each((a, i) => {
            let name = $(i).find(".sub-text").text().trim().split(" ").join("_").toLowerCase();
            let value = $(i).find(".lead-text").text();
            result.metadata[name] = value;
        });

        $(".nk-iv-wg4-list li").each((a, i) => {
            let name = $(i).find("div").eq(0).text().trim().split(" ").join("_").toLowerCase();
            let value = $(i).find("div").eq(1).text().trim().split(" ").join(",");
            result.metadata[name] = value;
        });

        if ($("video").html()) {
            result.metadata.thumbnail = "https:" + $("video").attr("poster");
            result.downloadUrl = "https:" + $("video source").attr("src");
        } else if ($(".lightgallery").html()) {
            result.metadata.thumbnail = "https:" + $(".lightgallery a").attr("href");
            result.downloadUrl = "https:" + $(".lightgallery a").attr("href");
        } else {
            result.metadata.thumbnail = "N/A";
            result.downloadUrl = null;
        }

        resolve(result);
    });
}

// Fungsi untuk mengatur rute API
module.exports = function setupKrakenfilesRoute(app) {
    app.get('/tools/krakenfiles', async (req, res) => {
        const { url } = req.query; // Mengambil URL dari parameter query
        if (!url) {
            return res.status(400).json({ status: false, message: 'URL harus disediakan.' });
        }

        try {
            const result = await krakenfiles(url);
            res.json({ status: true, result }); // Mengembalikan hasil dalam format JSON
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    });
};
