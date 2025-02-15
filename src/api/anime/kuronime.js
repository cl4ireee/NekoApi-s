const axios = require("axios");
const cheerio = require("cheerio");

class Kuronime {
    constructor() {
        this.baseURL = "https://kuronime.biz";
    }

    latest = async function latest() {
        return new Promise(async (resolve, reject) => {
            try {
                const { data } = await axios.get(this.baseURL);
                const $ = cheerio.load(data);
                const array = [];
                $(".listupd .bsu").each((a, i) => {
                    array.push({
                        title: $(i).find(".bsux a").attr("title"),
                        url: $(i).find(".bsux a").attr("href"),
                        views: $(i).find(".limit .view .post-views-count").text(),
                        release: $(i).find(".bt .time").text().trim() + ' yang lalu',
                        thumbnail: $(i)
                            .find(".limit .lazyload")
                            .eq(1)
                            .attr("data-src")
                            .split("?")[0],
                    });
                });
                resolve(array);
            } catch (error) {
                reject(error);
            }
        });
    };

    search = async function search(q) {
        return new Promise(async (resolve, reject) => {
            try {
                const { data } = await axios.get(`${this.baseURL}?s=${q}`);
                const $ = cheerio.load(data);
                const array = [];
                $(".listupd .bs").each((a, i) => {
                    array.push({
                        title: $(i).find(".bsx a").attr("title"),
                        url: $(i).find(".bsx a").attr("href"),
                        type: $(i).find(".limit .bt .type").text(),
                        score: $(i).find(".rating i").text(),
                        thumbnail: $(i)
                            .find(".limit .lazyload")
                            .eq(1)
                            .attr("data-src")
                            .split("?")[0],
                    });
                });
                resolve(array);
            } catch (error) {
                reject(error);
            }
        });
    };

    detail = async function detail(url) {
        return new Promise(async (resolve, reject) => {
            try {
                const { data } = await axios.get(url);
                const $ = cheerio.load(data);
                const array = {
                    metadata: {},
                    episode: [],
                };
                $(".infodetail ul li").each((a, i) => {
                    const name = $(i).find("b").text();
                    const key = $(i)
                        .text()
                        .replace(name + ":", "")
                        .split("?resize=")[0]
                        .trim();
                    array.metadata[name.split(" ").join("_").toLowerCase()] = key;
                });
                array.metadata.thumbnail = $(".con .lazyload").attr("data-src");
                array.metadata.synopis = $(".con .const p").text().trim();
                $(".bxcl ul li").each((a, i) => {
                    array.episode.push({
                        title: $(i).find(".lchx a").text(),
                        url: $(i).find(".lchx a").attr("href"),
                    });
                });
                resolve(array);
            } catch (error) {
                reject(error);
            }
        });
    };
}

// Ekspor fungsi untuk digunakan dengan `app.get`
module.exports = function (app) {
    const kuronime = new Kuronime();

    // Route untuk mendapatkan anime terbaru
    app.get("/anime/kuronimelatest", async (req, res) => {
        try {
            const results = await kuronime.latest();
            res.status(200).json({ status: true, results });
        } catch (error) {
            console.error("Error fetching latest anime:", error.message);
            res.status(500).json({ status: false, error: "Failed to fetch latest anime" });
        }
    });

    // Route untuk mencari anime
    app.get("/anime/kuronimesearch", async (req, res) => {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({ status: false, error: "Query parameter (q) is required" });
        }

        try {
            const results = await kuronime.search(q);
            res.status(200).json({ status: true, results });
        } catch (error) {
            console.error("Error searching anime:", error.message);
            res.status(500).json({ status: false, error: "Failed to search anime" });
        }
    });

    // Route untuk mendapatkan detail anime
    app.get("/anime/kuronimedetail", async (req, res) => {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({ status: false, error: "Query parameter (url) is required" });
        }

        try {
            const results = await kuronime.detail(url);
            res.status(200).json({ status: true, results });
        } catch (error) {
            console.error("Error fetching anime details:", error.message);
            res.status(500).json({ status: false, error: "Failed to fetch anime details" });
        }
    });
};
