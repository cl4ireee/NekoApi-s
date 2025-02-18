const axios = require('axios');
const FormData = require('form-data');

/**
 * Fungsi untuk mengupload gambar dari URL
 * @async
 * @function uploadImageFromUrl
 * @param {string} imageUrl - URL gambar yang akan diupload
 * @returns {Promise<string>} URL gambar setelah diupload
 * @throws {Error} Menghasilkan error jika upload gagal
 */
async function uploadImageFromUrl(imageUrl) {
    try {
        // Mengambil gambar dari URL
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imageBuffer = response.data;

        // Membuat objek FormData
        const form = new FormData();
        form.append('file', imageBuffer, {
            filename: 'image.jpg',
            contentType: 'image/jpeg'
        });

        // Konfigurasi header untuk request
        const headers = {
            ...form.getHeaders(),
            'Content-Length': form.getLengthSync()
        };

        // Mengirim request POST ke server
        const uploadResponse = await axios.post('https://www.pic.surf/upload.php', form, { headers });

        // Mengambil identifier dari respons
        const identifier = uploadResponse.data.identifier;

        // Mengembalikan URL gambar
        return `https://www.pic.surf/${identifier}`;
    } catch (error) {
        throw new Error(`Upload gagal: ${error.response ? error.response.data : error.message}`);
    }
}

// Fungsi untuk mengatur API
module.exports = function (app) {
    // Endpoint untuk mengupload gambar dari URL
    app.get('/tools/picsurf', async (req, res) => {
        const { url } = req.query; // Mengambil URL gambar dari query string

        if (!url) {
            return res.status(400).json({ error: "Query parameter 'url' is required" });
        }

        try {
            const imageUrlResponse = await uploadImageFromUrl(url); // Panggil fungsi uploadImageFromUrl
            res.status(200).json({ url: imageUrlResponse }); // Mengembalikan URL gambar
        } catch (error) {
            console.error("Error:", error.message);
            res.status(500).json({ error: error.message }); // Menangani kesalahan
        }
    });
};
