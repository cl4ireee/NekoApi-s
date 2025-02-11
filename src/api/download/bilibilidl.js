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
            throw error; // Melempar error agar bisa ditangkap di catch block
        }
    }

    app.get('/download/bilibili', async (req, res) => {
        try {
            const { url } = req.query; // Mengambil parameter query 'url'
            if (!url) {
                return res.status(400).json({ status: false, error: 'URL is required' });
            }
            const apiResponse = await fetchBilibiliData(url); // Mengambil respons dari API
            
            // Memeriksa apakah respons memiliki status true
            if (apiResponse && apiResponse.status) {
                res.status(200).json({
                    status: true,
                    title: apiResponse.data.title, // Menggunakan judul dari respons API
                    thumbnail: apiResponse.data.thumbnail, // Menggunakan thumbnail dari respons API
                    duration: apiResponse.data.duration, // Menggunakan durasi dari respons API
                    downloadLinks: apiResponse.data.downloadLinks // Menggunakan link download dari respons API
                });
            } else {
                res.status(500).json({ status: false, error: 'Failed to fetch data' });
            }
        } catch (error) {
            console.error("Error in /download/bilibili:", error); // Log error
            res.status(500).json({ status: false, error: 'Terjadi kesalahan di server. Silakan coba lagi nanti.' });
        }
    });
};
