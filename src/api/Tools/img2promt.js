const fetch = require('node-fetch');

/**
 * Fungsi untuk menghasilkan prompt dari URL gambar.
 * 
 * @async
 * @function getPromptFromUrl
 * @param {string} imageUrl - URL gambar untuk diproses
 * @returns {Promise<string>} Prompt yang dihasilkan
 * @throws {Error} Menghasilkan error jika permintaan pembuatan prompt gagal atau respons tidak valid
 */
async function getPromptFromUrl(imageUrl) {
    // Di sini Anda bisa menambahkan logika untuk menghasilkan prompt dari URL gambar
    // Misalnya, jika Anda memiliki API yang bisa menerima URL gambar langsung
    // Anda bisa menggunakan fetch untuk mendapatkan prompt dari API tersebut.

    // Contoh logika (ganti dengan logika yang sesuai):
    const response = await fetch(`https://example.com/generate-prompt?imageUrl=${encodeURIComponent(imageUrl)}`);
    const data = await response.json();

    if (!data || !data.prompt) {
        throw new Error("Failed to generate prompt");
    }

    return data.prompt;
}

// Fungsi untuk mengatur API
module.exports = function (app) {
    // Endpoint untuk menghasilkan prompt dari URL gambar
    app.get('/tools/generate-prompt', async (req, res) => {
        const { url } = req.query; // Mengambil URL gambar dari query string

        if (!url) {
            return res.status(400).json({ error: "URL gambar diperlukan" });
        }

        try {
            const prompt = await getPromptFromUrl(url); // Panggil fungsi untuk mendapatkan prompt
            res.status(200).json({ status: true, prompt }); // Mengembalikan prompt
        } catch (error) {
            console.error("Error:", error.message);
            res.status(500).json({ status: false, message: error.message }); // Menangani kesalahan
        }
    });
};
