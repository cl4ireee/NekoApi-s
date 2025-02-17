const axios = require("axios");
const cheerio = require("cheerio");

class Samehadaku {
    async newAnimes() {
        try {
            const { data } = await axios.get("https://samehadaku.mba/");
            const $ = cheerio.load(data);
            const animes = [];

            $(".post-show ul li").each((_, el) => {
                const title = $(el).find("h2.entry-title a").text().trim();
                const url = $(el).find("h2.entry-title a").attr("href");
                const img = $(el).find(".thumb img").attr("src");
                const episode = $(el).find("span b:contains('Episode')").parent().text().replace("Episode ", "").trim();
                const postedBy = $(el).find("span b:contains('Posted by')").parent().text().replace("Posted by: ", "").trim();
                const released = $(el).find("span b:contains('Released on')").parent().text().replace("Released on: ", "").trim();

                animes.push({
                    title,
                    url,
                    img,
                    episode,
                    postedBy,
                    released
                });
            });

            return animes;
        } catch (error) {
            console.error("Error fetching new animes:", error.message);
            return [];
        }
    }

    async listAnimes() {
        try {
            const { data } = await axios.get("https://samehadaku.mba/daftar-anime-2/?list");
            const $ = cheerio.load(data);
            const animeList = [];

            $(".listbar ul li a").each((_, el) => {
                const title = $(el).text().trim();
                const url = $(el).attr("href");

                animeList.push({
                    title,
                    url
                });
            });

            return animeList;
        } catch (error) {
            console.error("Error fetching anime list:", error.message);
            return [];
        }
    }

    async detailAnimes(urlAnimes) {
        try {
            const { data } = await axios.get(urlAnimes);
            const $ = cheerio.load(data);

            const title = $("h1.entry-title").text().trim();
            const img = $(".thumb img").attr("src");
            const description = $(".entry-content.entry-content-single p").first().text().trim();
            const genres = [];
            $(".genre-info a").each((_, el) => genres.push($(el).text().trim()));

            const rating = $("span[itemprop='ratingValue']").text().trim();
            const status = $(".spe span:contains('Status')").text().replace("Status ", "").trim();
            const type = $(".spe span:contains('Type')").text().replace("Type ", "").trim();
            const source = $(".spe span:contains('Source')").text().replace("Source ", "").trim();
            const duration = $(".spe span:contains('Duration')").text().replace("Duration ", "").trim();
            const totalEpisodes = $(".spe span:contains('Total Episode')").text().replace("Total Episode ", "").trim();
            const season = $(".spe span:contains('Season') a").text().trim();
            const studio = $(".spe span:contains('Studio') a").text().trim();
            const producer = $(".spe span:contains('Producers') a").text().trim();
            const released = $(".spe span:contains('Released:')").text().replace("Released: ", "").trim();

            const episodes = [];
            $(".listeps ul li").each((_, el) => {
                const epNumber = $(el).find(".epsright .eps a").text().trim();
                const epTitle = $(el).find(".epsleft .lchx a").text().trim();
                const epUrl = $(el).find(".epsleft .lchx a").attr("href");
                const epDate = $(el).find(".epsleft .date").text().trim();

                episodes.push({
                    epNumber,
                    epTitle,
                    epUrl,
                    epDate
                });
            });

            return {
                title,
                img,
                description,
                genres,
                rating,
                status,
                type,
                source,
                duration,
                totalEpisodes,
                season,
                studio,
                producer,
                released,
                episodes
            };
        } catch (error) {
            console.error("Error fetching anime details:", error.message);
            return null;
        }
    }

    async episodes(urlEpisodes) {
        try {
            const { data } = await axios.get(urlEpisodes);
            const $ = cheerio.load(data);
            const posts = $('link[rel="alternate"][type="application/json"]').attr("href");
            const postId = posts ? posts.match(/\/(\d+)$/)?.[1] : null;

            if (!postId) throw new Error("Post ID tidak ditemukan!");

            const formData = new URLSearchParams();
            formData.append("action", "player_ajax");
            formData.append("post", postId);
            formData.append("nume", 1);
            formData.append("type", "schtml");

            const { data: dl } = await axios.post("https://samehadaku.mba/wp-admin/admin-ajax.php", formData, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            });

            const $$ = cheerio.load(dl);
            const videoPageUrl = $$("iframe").attr("src")?.trim();

            return videoPageUrl ? await this.getDownloadUrlAndThumb(videoPageUrl) : null;
        } catch (error) {
            console.error("Error fetching episodes:", error.message);
            return null;
        }
    }

    async getDownloadUrlAndThumb(urlTokens) {
        try {
            if (!urlTokens) throw new Error("URL tidak boleh kosong!");

            const { data } = await axios.get(urlTokens, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
                }
            });

            const $ = cheerio.load(data);
            const scripts = $("script").toString();
            const videoConfigMatch = scripts.match(/var VIDEO_CONFIG\s*=\s*(\{.*?\});/s);

            if (!videoConfigMatch) throw new Error("VIDEO_CONFIG tidak ditemukan!");

            const videoConfig = JSON.parse(videoConfigMatch[1]);

            return {
                downloadUrl: videoConfig?.streams?.[0]?.play_url || null,
                thumbnail: videoConfig?.thumbnail || null
            };
        } catch (error) {
            console.error("Error:", error.message);
            return null;
        }
    }
}

// Ekspor fungsi untuk digunakan dengan `app.get`
module.exports = function (app) {
    const samehadaku = new Samehadaku();

    // Route untuk mendapatkan anime terbaru
    app.get("/anime/samehadaku-new", async (req, res) => {
        try {
            const results = await samehadaku.newAnimes();
            res.status(200).json({ status: true, results });
        } catch (error) {
            console.error("Error fetching new animes:", error.message);
            res.status(500).json({ status: false, error: "Failed to fetch new animes" });
        }
    });

    // Route untuk mendapatkan daftar anime
    app.get("/anime/samehadaku-list", async (req, res) => {
        try {
            const results = await samehadaku.listAnimes();
            res.status(200).json({ status: true, results });
        } catch (error) {
            console.error("Error fetching anime list:", error.message);
            res.status(500).json({ status: false, error: "Failed to fetch anime list" });
        }
    });

    // Route untuk mendapatkan detail anime
    app.get("/anime/samehadaku-detail", async (req, res) => {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({ status: false, error: "Query parameter (url) is required" });
        }

        try {
            const results = await samehadaku.detailAnimes(url);
            res.status(200).json({ status: true, results });
        } catch (error) {
            console.error("Error fetching anime details:", error.message);
            res.status(500).json({ status: false, error: "Failed to fetch anime details" });
        }
    });

    // Route untuk mendapatkan episode anime
    app.get("/anime/samehadaku-episode", async (req, res) => {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({ status: false, error: "Query parameter (url) is required" });
        }

        try {
            const results = await samehadaku.episodes(url);
            res.status(200).json({ status: true, results });
        } catch (error) {
            console.error("Error fetching anime episodes:", error.message);
            res.status(500).json({ status: false, error: "Failed to fetch anime episodes" });
        }
    });
};
