const axios = require('axios');

async function muslimai(text) {
    const searchUrl = 'https://www.muslimai.io/api/search';
    const searchData = {
        query: text // Menggunakan 'text' sebagai parameter pencarian
    };
    const headers = {
        'Content-Type': 'application/json'
    };
    try {
        const searchResponse = await axios.post(searchUrl, searchData, { headers: headers });

        const passages = searchResponse.data.map(item => item.content).join('\n\n');

        const answerUrl = 'https://www.muslimai.io/api/answer';
        const answerData = {
            prompt: `Use the following passages to answer the query to the best of your ability as a world class expert in the Quran. Do not mention that you were provided any passages in your answer: ${text}\n\n${passages}`
        };

        const answerResponse = await axios.post(answerUrl, answerData, { headers: headers });

        const result = {
            answer: answerResponse.data,
            source: searchResponse.data
        };

        return result;
    } catch (error) {
        console.error('Error occurred:', error.response ? error.response.data : error.message);
        return { status: false, message: 'Terjadi kesalahan saat memproses permintaan.' };
    }
}

// Fungsi untuk mengatur rute API
module.exports = function setupMuslimaiRoute(app) {
    app.get('/ai/muslimai', async (req, res) => {
        const { text } = req.query; // Mengambil text dari parameter
        if (!text) {
            return res.status(400).json({ status: false, message: 'Text harus diisi.' });
        }

        try {
            const result = await muslimai(text);
            return res.json({ status: true, result });
        } catch (error) {
            return res.status(500).json({ status: false, message: 'Terjadi kesalahan saat memproses permintaan.' });
        }
    });
};
