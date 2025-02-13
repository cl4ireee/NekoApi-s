const express = require('express');
const axios = require('axios');

// Endpoint untuk mengakses API eksternal
app.get('/api/flux-schnell', async (req, res) => {
    const { text } = req.query; // Mengambil parameter 'text' dari query

    if (!text) {
        return res.status(400).json({ status: false, message: 'Parameter "text" is required.' });
    }

    try {
        const response = await axios.get(`https://api.rynn-archive.biz.id/ai/flux-schnell?text=${encodeURIComponent(text)}`);
        
        // Mengembalikan hasil dari API eksternal dengan struktur yang sesuai
        res.status(200).json({
            status: true,
            result: response.data // Mengembalikan data yang diterima dari API eksternal
        });
    } catch (error) {
        console.error('Error fetching data from external API:', error.message);
        res.status(500).json({ status: false, error: 'Error fetching data from external API' });
    }
});
