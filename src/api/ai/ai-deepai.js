const axios = require("axios");
const FormData = require("form-data");

module.exports = function (app) {
    // Fungsi untuk mengambil respons dari Hoshino
    async function fetchHoshinoResponse(content) {
        try {
            let formData = new FormData();
            formData.append("content", `User: ${content}`);
            formData.append("model", "@custom/hoshinoo-ba-idn.lang");

            const response = await axios.post("https://mind.hydrooo.web.id/v1/chat", formData, {
                headers: {
                    ...formData.getHeaders(),
                },
            });

            return response.data;
        } catch (error) {
            console.error("Error fetching response from Hoshino:", error);
            throw error;
        }
    }

    // Handler untuk route GET /ai/hoshino
    app.get("/ai/hoshino", async (req, res) => {
        try {
            const { text } = req.query; // Ambil parameter 'text' dari query
            if (!text) {
                return res.status(400).json({ status: false, error: "Text is required" });
            }

            const { result } = await fetchHoshinoResponse(text); // Panggil fungsi fetchHoshinoResponse
            res.status(200).json({
                status: true,
                result,
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    });
};
