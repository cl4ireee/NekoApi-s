const axios = require('axios');
const FormData = require('form-data');

// Fungsi untuk mengunggah file dari URL
async function uploadFileFromUrl(fileUrl) {
    try {
        // Mengambil file dari URL
        const response = await axios.get(fileUrl, { responseType: 'stream' });

        const form = new FormData();
        form.append('files[]', response.data, { filename: 'uploaded_file' }); // Menyertakan stream data

        const uploadResponse = await axios.post('https://uguu.se/upload.php', form, {
            headers: form.getHeaders()
        });

        console.log('Upload Response:', uploadResponse.data); // Log respons dari Uguu

        // Memastikan bahwa kita mendapatkan URL gambar yang benar
        if (uploadResponse.data.files && uploadResponse.data.files[0]) {
            const imageUrl = uploadResponse.data.files[0].url;
            console.log('Image URL:', imageUrl); // Log URL gambar
            return { status: true, url: imageUrl };
        } else {
            return { status: false, error: 'File upload failed' };
        }
    } catch (err) {
        return { status: false, error: err.message };
    }
}

// Fungsi untuk mengatur rute API
module.exports = function setupUguuRoutes(app) {
    app.get('/tools/uguu', async (req, res) => {
        const { url } = req.query; // Mengambil URL dari query string
        if (!url) {
            return res.status(400).json({ status: false, error: 'Query parameter "url" is required.' });
        }

        const result = await uploadFileFromUrl(url);
        res.json(result);
    });
};
