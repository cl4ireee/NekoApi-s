const axios = require("axios");
const cheerio = require("cheerio");

async function fetchKrakenfilesData(url) {
    try {
        // Fetch the page content
        let { data } = await axios.get(url, {
            headers: {
                "User -Agent": "Posify/1.0.0",
                "Referer": url,
                "Accept": "*/*",
            },
        });

        // Load the HTML into cheerio
        let $ = cheerio.load(data);
        let result = {
            metadata: {},
            buffer: null
        };

        // Extract metadata
        result.metadata.filename = $(".coin-info .coin-name h5").text().trim();
        $(".nk-iv-wg4 .nk-iv-wg4-overview li").each((_, element) => {
            let name = $(element).find(".sub-text").text().trim().split(" ").join("_").toLowerCase();
            let value = $(element).find(".lead-text").text();
            result.metadata[name] = value;
        });

        $(".nk-iv-wg4-list li").each((_, element) => {
            let name = $(element).find("div").eq(0).text().trim().split(" ").join("_").toLowerCase();
            let value = $(element).find("div").eq(1).text().trim().split(" ").join(",");
            result.metadata[name] = value;
        });

        // Determine the thumbnail
        if ($("video").html()) {
            result.metadata.thumbnail = "https:" + $("video").attr("poster");
        } else if ($(".lightgallery").html()) {
            result.metadata.thumbnail = "https:" + $(".lightgallery a").attr("href");
        } else {
            result.metadata.thumbnail = "N/A";
        }

        // Determine the download link
        let downloads = "";
        if ($("video").html()) {
            downloads = "https:" + $("video source").attr("src");
        } else {
            downloads = "https:" + $(".lightgallery a").attr("href");
        }

        // Fetch the download content
        const resDownload = await axios.get(downloads, {
            headers: {
                "User -Agent": "Posify/1.0.0",
                "Referer": url,
                "Accept": "*/*",
                "token": $("#dl-token").val(),
            },
            responseType: "arraybuffer"
        });

        // Check if the response is a buffer
        if (!Buffer.isBuffer(resDownload.data)) {
            throw new Error("Result is not a buffer!");
        }

        result.buffer = resDownload.data;

        return result;
    } catch (error) {
        console.error("Error while fetching Krakenfiles data:", error);
        throw error; // Rethrow the error to be handled in the endpoint
    }
}

module.exports = function(app) {
    // Endpoint for Krakenfiles
    app.get("/tools/krakenfiles", async (req, res) => {
        const url = req.query.url;

        // Validate the input URL
        if (!url || !/krakenfiles.com/.test(url)) {
            return res.status(400).json({ error: "Input URL must be from Krakenfiles!" });
        }

        try {
            const result = await fetchKrakenfilesData(url); // Fetch data using the helper function
            return res.status(200).json(result); // Return the result
        } catch (error) {
            console.error("Error fetching Krakenfiles data:", error.message);
            return res.status(500).json({ error: "Failed to fetch data from Krakenfiles." });
        }
    });
};
