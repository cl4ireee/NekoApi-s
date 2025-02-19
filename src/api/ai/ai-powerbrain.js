const axios = require('axios');

async function powerbrain(text) {
    // Mengonversi objek menjadi string format application/x-www-form-urlencoded
    const data = `message=${encodeURIComponent(text)}&messageCount=1`;

    const config = {
        method: 'POST',
        url: 'https://powerbrainai.com/chat.php',
        headers: {
            'User -Agent': 'Mozilla/5.0 (Android 10; Mobile; rv:131.0) Gecko/131.0 Firefox/131.0',
            'Content-Type': 'application/x-www-form-urlencoded',
            'accept-language': 'id-ID',
            'referer': 'https://powerbrainai.com/chat.html',
            'origin': 'https://powerbrainai.com',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'priority': 'u=0',
            'te': 'trailers'
        },
        data: data
    };

    const api = await axios.request(config);
    return api.data;
}

// Mengganti fungsi setupPowerbrainRoute menjadi module.exports
module.exports = function setupPowerbrainRoute(app) {
    app.get('/ai/powerbrain', async (req, res) => {
        const { text } = req.query; // Mengambil parameter dari query
        if (!text) {
            return res.json({ status: false, message: "Parameter 'text' diperlukan." });
        }
        try {
            const response = await powerbrain(text);
            res.json({ status: true, response });
        } catch (error) {
            console.error("Error from powerbrain API:", error.response ? error.response.data : error.message);
            res.json({ status: false, message: "Terjadi kesalahan saat memproses permintaan." });
        }
    });
};
