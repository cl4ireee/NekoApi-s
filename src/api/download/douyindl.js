const axios = require("axios");
const FormData = require("form-data");

module.exports = function (app) {
    // Fungsi untuk mendapatkan URL unduhan yang valid
    async function getDownloadValidUrls(url) {
        try {
            let { data } = await axios.get(url);
            return typeof data === "string" && data.startsWith("http") ? data : null;
        } catch (error) {
            console.error("Error fetching download URL:", error);
            return null;
        }
    }

    // Fungsi untuk memproses video Douyin
    async function DouyinProcess(url) {
        try {
            let formData = new FormData();
            formData.append("url", url);

            let headers = {
                headers: {
                    ...formData.getHeaders(),
                },
            };

            let { data: posts } = await axios.post(
                "https://savedouyin.net/proxy.php",
                formData,
                headers
            );

            return posts;
        } catch (error) {
            console.error("Error processing Douyin video:", error);
            return { error: error.message };
        }
    }

    // Endpoint API untuk memproses video Douyin
    app.get("/download/download-douyin", async (req, res) => {
        try {
            const { url } = req.query;

            if (!url) {
                return res.status(400).json({ status: false, error: "URL diperlukan" });
            }

            const result = await DouyinProcess(url);

            if (result.error) {
                return res.status(500).json({ status: false, error: result.error });
            }

            res.status(200).json({ status: true, result });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    });
};
