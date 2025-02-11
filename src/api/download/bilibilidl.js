const axios = require('axios');

module.exports = function(app) {
    async function fetchBilibiliData(url) {
        try {
            const apiUrl = `https://api.suraweb.online/download/bilibili?url=${encodeURIComponent(url)}`;
            console.log("Fetching data from URL:", apiUrl); // Log URL yang sedang diakses
            const response = await axios.get(apiUrl);
            return response.data; // Mengembalikan data dari respons
        } catch (error) {
            console.error("Error fetching content from Bilibili API:", error.message);
            throw new Error('Failed to fetch content from Bilibili API'); // Error yang lebih jelas
        }
    }

    app.get('/download/bilibili', async (req, res) => {
        const { url } = req.query; // Mengambil parameter query 'url'
        if (!url) {
            return res.status(400).json({ status: false, error: 'URL is required' });
        }

        try {
            const apiResponse = await fetchBilibiliData(url); // Mengambil respons dari API
            
            // Memeriksa apakah respons memiliki status true dan data yang diperlukan
            if (apiResponse && apiResponse.status && apiResponse.data) {
                res.status(200).json({
                    status: true,
                    title: apiResponse.data.title || 'No title available', // Fallback jika tidak ada title
                    thumbnail: apiResponse.data.thumbnail || '', // Fallback jika tidak ada thumbnail
                    duration: apiResponse.data.duration || 0, // Fallback jika tidak ada durasi
                    downloadLinks: apiResponse.data.downloadLinks || [] // Fallback jika tidak ada download links
                });
            } else {
                res.status(500).json({ status: false, error: 'Failed to fetch data from Bilibili API' });
            }
        } catch (error) {
            console.error("Error in /download/bilibili:", error.message); // Log error yang lebih jelas
            res.status(500).json({ status: false, error: error.message || 'Terjadi kesalahan di server. Silakan coba lagi nanti.' });
        }
    });
};
