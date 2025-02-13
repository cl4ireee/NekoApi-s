const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());

// Endpoint untuk mengambil informasi negara
app.get('/tools/country-info', async (req, res) => {
    const { name } = req.query;

    if (!name) {
        return res.status(400).json({ status: false, message: 'Please provide a country name!' });
    }

    try {
        const response = await fetch(`https://api.siputzx.my.id/api/tools/countryInfo?name=${name}`);
        const data = await response.json();

        if (!data.status) {
            return res.status(404).json({ status: false, message: 'Country not found.' });
        }

        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching country info:', error);
        res.status(500).json({ status: false, message: 'Error fetching country information.' });
    }
});

// Ekspor app untuk digunakan di Vercel
module.exports = app;
