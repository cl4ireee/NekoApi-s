const axios = require("axios");
const FormData = require("form-data");

module.exports = (app) => {
    // Fungsi untuk memproses video Douyin
    const DouyinProcess = async (url) => {
        try {
            let formData = new FormData();
            formData.append("url", url);

            let { data } = await axios.post("https://savedouyin.net/proxy.php", formData, {
                headers: { ...formData.getHeaders() },
            });

            return data;
        } catch (error) {
            console.error("Error processing Douyin video:", error.message);
            return { error: error.message };
        }
    };

    // Endpoint API untuk memproses video Douyin
    app.get("/download/douyin-download", async (req, res) => {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({ status: false, error: "URL diperlukan" });
        }

        const result = await DouyinProcess(url);

        if (result.error) {
            return res.status(500).json({ status: false, error: result.error });
        }

        res.json({ status: true, result });
    });
};
