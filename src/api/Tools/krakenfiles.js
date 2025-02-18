const axios = require("axios");
const cheerio = require("cheerio");

module.exports = function(app) {
    app.get("/tools/krakenfiles", async (req, res) => {
        const url = req.query.url;

        if (!url || !/krakenfiles.com/.test(url)) {
            return res.status(400).json({ error: "Input URL must be from Krakenfiles!" });
        }

        try {
            let { data } = await axios.get(url, {
                headers: {
                    "User-Agent": "Posify/1.0.0",
                    "Referer": url,
                    "Accept": "*/*",
                },
            }).catch((e) => e.response);

            let $ = cheerio.load(data);
            let result = {
                metadata: {},
                buffer: null
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
            } else if ($(".lightgallery").html()) {
                result.metadata.thumbnail = "https:" + $(".lightgallery a").attr("href");
            } else {
                result.metadata.thumbnail = "N/A";
            }

            let downloads = "";
            if ($("video").html()) {
                downloads = "https:" + $("video source").attr("src");
            } else {
                downloads = "https:" + $(".lightgallery a").attr("href");
            }

            const resDownload = await axios.get(downloads, {
                headers: {
                    "User-Agent": "Posify/1.0.0",
                    "Referer": url,
                    "Accept": "*/*",
                    "token": $("#dl-token").val(),
                },
                responseType: "arraybuffer"
            }).catch((e) => e.response);

            if (!Buffer.isBuffer(resDownload.data)) {
                return res.status(500).json({ error: "Result is not a buffer!" });
            }

            result.buffer = resDownload.data;

            return res.status(200).json(result);
        } catch (error) {
            console.error("Error fetching Krakenfiles data:", error);
            return res.status(500).json({ error: "Failed to fetch data from Krakenfiles." });
        }
    });
};
