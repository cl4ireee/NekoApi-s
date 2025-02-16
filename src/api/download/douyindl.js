const axios = require("axios");
const FormData = require("form-data");
const cheerio = require("cheerio");

class DouyinDl {
    async generateHash(input, insertStr, position) {
        let base64Encoded = Buffer.from(input).toString("base64");
        let result = base64Encoded.slice(0, position) + insertStr + base64Encoded.slice(position);
        return result;
    }

    async process(url) {
        try {
            let { data } = await axios.get("https://snapdouyin.app/id/");
            let pso = Math.floor(Buffer.from(url).toString("base64").length / 2);
            let hashh = await this.generateHash(url, "1034", pso);
            let $ = cheerio.load(data);
            let token = $("#token").val();
            let d = new FormData();
            d.append("url", url);
            d.append("token", token);
            d.append("hash", hashh);

            let headers = {
                headers: {
                    ...d.getHeaders(),
                },
            };

            let { data: result } = await axios.post("https://snapdouyin.app/wp-json/mx-downloader/video-data", d, headers);
            return result;
        } catch (error) {
            console.error("Error processing Douyin URL:", error.message);
            throw error;
        }
    }
}

// Ekspor fungsi untuk digunakan dengan `app.get`
module.exports = function (app) {
    const douyinDl = new DouyinDl();

    // Route untuk mengunduh video Douyin
    app.get("/download/douyin-download", async (req, res) => {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({ status: false, error: "Query parameter (url) is required" });
        }

        try {
            const results = await douyinDl.process(url);
            res.status(200).json({ status: true, results });
        } catch (error) {
            console.error("Error downloading Douyin video:", error.message);
            res.status(500).json({ status: false, error: "Failed to download Douyin video" });
        }
    });
};
