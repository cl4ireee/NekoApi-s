const { fetch } = require("undici");
const cheerio = require("cheerio");

class NekoPoi {
    latest = async function latest() {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await fetch("https://nekopoi.care");
                const html = await response.text();
                const $ = cheerio.load(html);
                const series = [];
                const episode = [];

                $(".animeseries ul li").each((a, i) => {
                    const html = $(i).find("a").attr("original-title");
                    const exec = cheerio.load(html);
                    const info = {};
                    exec(".areadetail p").each((ah, oh) => {
                        const name = exec(oh).find("b").text().trim();
                        const key = exec(oh).text().replace(name + ":", "").trim();
                        info[name.split(" ").join("_").toLowerCase().trim()] = key;
                    });
                    series.push({
                        title: exec(".infoarea h2").eq(0).text(),
                        thumbnail: exec(".areabaru img").attr("src"),
                        ...info,
                        url: $(i).find("a").attr("href"),
                    });
                });

                $("#boxid .eropost").each((a, i) => {
                    episode.push({
                        title: $(i).find(".eroinfo h2 a").text().trim(),
                        release: $(i).find(".eroinfo span").eq(0).text().trim(),
                        url: $(i).find(".eroinfo h2 a").attr("href"),
                    });
                });

                resolve({ series, episode });
            } catch (error) {
                reject(error);
            }
        });
    };

    detail = async function detail(url) {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(url);
                const html = await response.text();
                const $ = cheerio.load(html);
                const result = {
                    metadata: {},
                    episode: [],
                };

                $(".animeinfos .listinfo ul li").each((a, i) => {
                    const name = $(i).find("b").text().trim();
                    const key = $(i).text().trim().replace(name + ":", "").trim();
                    result.metadata[name.toLowerCase()] = key;
                });

                result.metadata.thumbnail = $(".animeinfos .imgdesc img").attr("src");
                result.metadata.sinopsis = $(".animeinfos p").text();

                $(".animeinfos .episodelist ul li").each((a, i) => {
                    result.episode.push({
                        title: $(i).find("span").eq(0).find("a").text().trim(),
                        release: $(i).find("span").eq(1).text().trim(),
                        url: $(i).find("span").eq(0).find("a").attr("href"),
                    });
                });

                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    };

    episode = async function episode(url) {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(url);
                const html = await response.text();
                const $ = cheerio.load(html);
                const result = {
                    metadata: {},
                    download: [],
                };

                $(".contentpost").each((ul, el) => {
                    result.metadata.title = $(el).find("img").attr("title");
                    result.metadata.images = $(el).find("img").attr("src");
                    result.metadata.synopsis = $(el)
                        .find(".konten")
                        .find("p:nth-of-type(2)")
                        .text();
                });

                result.metadata.stream = $("#show-stream").find("#stream1 iframe").attr("src");

                $(".liner").each((ul, el) => {
                    const name = $(el).find(".name").text();
                    const links = [];
                    $(el)
                        .find(".listlink a")
                        .each((j, link) => {
                            links.push({
                                name: $(link).text().trim(),
                                url: $(link).attr("href"),
                            });
                        });
                    result.download.push({
                        title: name,
                        source: links,
                    });
                });

                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    };

    search = async function search(q) {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await fetch("https://nekopoi.care/?s=" + q);
                const html = await response.text();
                const $ = cheerio.load(html);
                const episode = [];

                $(".result ul li").each((ul, el) => {
                    const link = $(el).find("h2 a").attr("href");
                    episode.push({
                        title: $(el).find("h2 a").text().trim(),
                        type: link.split("/hentai/")[1] ? "Hentai Series" : "Hentai Episodes",
                        images: $(el).find("img").attr("src"),
                        url: link,
                    });
                });

                resolve(episode);
            } catch (error) {
                reject(error);
            }
        });
    };
}

// Ekspor fungsi untuk digunakan dengan `app.get`
module.exports = function (app) {
    const nekopoi = new NekoPoi();

    // Route untuk mendapatkan data terbaru
    app.get("/anime/nekopoi-latest", async (req, res) => {
        try {
            const results = await nekopoi.latest();
            res.status(200).json({ status: true, results });
        } catch (error) {
            console.error("Error fetching latest data:", error.message);
            res.status(500).json({ status: false, error: "Failed to fetch latest data" });
        }
    });

    // Route untuk mendapatkan detail
    app.get("/anime/nekopoi-detail", async (req, res) => {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({ status: false, error: "Query parameter (url) is required" });
        }

        try {
            const results = await nekopoi.detail(url);
            res.status(200).json({ status: true, results });
        } catch (error) {
            console.error("Error fetching detail:", error.message);
            res.status(500).json({ status: false, error: "Failed to fetch detail" });
        }
    });

    // Route untuk mendapatkan episode
    app.get("/anime/nekopoi-episode", async (req, res) => {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({ status: false, error: "Query parameter (url) is required" });
        }

        try {
            const results = await nekopoi.episode(url);
            res.status(200).json({ status: true, results });
        } catch (error) {
            console.error("Error fetching episode:", error.message);
            res.status(500).json({ status: false, error: "Failed to fetch episode" });
        }
    });

    // Route untuk mencari
    app.get("/anime/nekopoi-search", async (req, res) => {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({ status: false, error: "Query parameter (q) is required" });
        }

        try {
            const results = await nekopoi.search(q);
            res.status(200).json({ status: true, results });
        } catch (error) {
            console.error("Error searching:", error.message);
            res.status(500).json({ status: false, error: "Failed to search" });
        }
    });
};
