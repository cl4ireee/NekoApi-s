const axios = require("axios");
const FormData = require("form-data");

const gemini = {
    chat: async (question) => {
        let d = new FormData();
        d.append("content", `:User  ${question}`);
        d.append("model", "@google/gemini-2.0-flash-exp");

        let head = {
            headers: {
                ...d.getHeaders()
            }
        };

        let { data: ak } = await axios.post("https://mind.hydrooo.web.id/v1/chat", d, head);

        return ak.result;
    }
};

// Mengekspor fungsi yang menerima objek app
module.exports = function (app) {
    // Endpoint untuk Gemini menggunakan GET
    app.get('/gemini/chat', async (req, res) => {
        try {
            const { question } = req.query; // Ambil question dari query parameter

            if (!question) {
                return res.status(400).json({ error: 'Question diperlukan.' });
            }

            // Panggil fungsi gemini.chat dengan question yang diberikan
            const result = await gemini.chat(question);

            // Kirim response dari Gemini
            res.json({
                success: true,
                message: 'Response dari Gemini.',
                data: result
            });
        } catch (error) {
            console.error('Terjadi kesalahan:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
};
