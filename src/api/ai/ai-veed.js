const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json()); // Middleware untuk parsing JSON

// Endpoint untuk menggenerate gambar menggunakan Veed
app.get('/ai/veed', async (req, res) => {
    const { prompt, resolution } = req.query; // Mengambil prompt dan resolusi dari parameter query
    if (!prompt || !resolution) {
        return res.status(400).json({ status: false, error: 'Prompt and resolution are required' });
    }

    const data = JSON.stringify({
        "prompt": prompt,
        "resolution": resolution
    });

    const config = {
        method: 'POST',
        url: 'https://www.veed.io/api/v1/ai-images',
        headers: {
            'User -Agent': 'Mozilla/5.0 (Android 10; Mobile; rv:131.0) Gecko/131.0 Firefox/131.0',
            'Content-Type': 'application/json',
            'accept-language': 'id-ID',
            'referer': 'https://www.veed.io/tools/ai-image-generator',
            'origin': 'https://www.veed.io',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'priority': 'u=0',
            'te': 'trailers'
        },
        data: data
    };

    try {
        const apiResponse = await axios.request(config);
        res.status(200).json({
            status: true,
            result: apiResponse.data
        });
    } catch (error) {
        console.error("Error fetching from Veed API:", error.message);
        res.status(500).json({ status: false, error: error.message });
    }
});

// Ekspor app untuk digunakan di file lain
module.exports = app;
