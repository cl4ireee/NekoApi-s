const axios = require("axios");
const cheerio = require("cheerio");

const animeFilter = async (animeName) => {
    try {
        let { data } = await axios.get(`https://www.animefillerlist.com/search/node/${animeName}`);
        let $ = cheerio.load(data);

        let results = [];

        $(".search-results .search-result").each((i, el) => {
            let title = $(el).find(".title a").text().trim();
            let link = "https://www.animefillerlist.com" + $(el).find(".title a").attr("href");
            let desc = $(el).find(".search-snippet").text().trim();

            results.push({ title, link, desc });
        });

        return results;
    } catch (error) {
        console.error("Error fetching data:", error.message);
        return [];
    }
};

const animeFilterGetDetailsByUrl = async (urlAnimes) => {
    try {
        let { data } = await axios.get(urlAnimes);
        let $ = cheerio.load(data);

        let animeTitle = $("h1").text().trim();
        let episodeNum = $(".field-name-field-number .field-item").text().trim();
        let japaneseReleaseDate = $(".field-name-field-japanese-airdate .date-display-single").text().trim();
        let englishReleaseDate = $(".field-name-field-english-airdate .date-display-single").text().trim();
        let animeType = $(".field-name-field-type .field-item").text().trim();

        let contributorsList = [];
        $(".Contributors a").each((_, el) => {
            let contributorName = $(el).attr("title");
            let contributorAvatar = $(el).find("img").attr("src");
            if (contributorName) {
                contributorsList.push({ contributorName, contributorAvatar });
            }
        });

        let previousEpisodeLink = $(".EpisodePager a").first().attr("href");
        let nextEpisodeLink = $(".EpisodePager a").last().attr("href");

        let response = {
            animeTitle,
            episodeNum,
            japaneseReleaseDate,
            englishReleaseDate,
            animeType,
            contributorsList,
            previousEpisode: previousEpisodeLink ? `https://www.animefillerlist.com${previousEpisodeLink}` : null,
            nextEpisode: nextEpisodeLink ? `https://www.animefillerlist.com${nextEpisodeLink}` : null,
        };

        if ($(".TitleExtra").length > 0) {
            let characterList = [];

            $(".EpisodeList tbody tr").each((_, el) => {
                let episodeIndex = $(el).find(".Number").text().trim();
                let characterName = $(el).find(".Title a").text().trim();
                let episodeUrl = $(el).find(".Title a").attr("href");
                let characterCategory = $(el).find(".Type span").text().trim();
                let lahir = $(el).find(".Date").text().trim();

                if (episodeIndex && characterName) {
                    characterList.push({
                        episodeIndex,
                        characterName,
                        characterUrls: episodeUrl ? `https://www.animefillerlist.com${episodeUrl}` : null,
                        characterCategory,
                        lahir,
                    });
                }
            });

            response.characterList = characterList;
        }

        return response;
    } catch (error) {
        console.error("Error fetching anime details:", error.message);
        return null;
    }
};

// Ekspor fungsi untuk digunakan dengan `app.get`
module.exports = function (app) {
    // Route untuk mencari anime
    app.get("/anime/filler-search", async (req, res) => {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({ status: false, error: "Query parameter (q) is required" });
        }

        try {
            const results = await animeFilter(q);
            res.status(200).json({ status: true, results });
        } catch (error) {
            console.error("Error searching anime:", error.message);
            res.status(500).json({ status: false, error: "Failed to search anime" });
        }
    });

    // Route untuk mendapatkan detail anime
    app.get("/anime/filler-details", async (req, res) => {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({ status: false, error: "Query parameter (url) is required" });
        }

        try {
            const results = await animeFilterGetDetailsByUrl(url);
            res.status(200).json({ status: true, results });
        } catch (error) {
            console.error("Error fetching anime details:", error.message);
            res.status(500).json({ status: false, error: "Failed to fetch anime details" });
        }
    });
};
