const axios = require('axios');
const FormData = require('form-data');

module.exports = function (app) {
    const Upscale = {
        async send(imageBuffer, ratio = 2) {
            const formData = new FormData();
            formData.append('myfile', imageBuffer, { filename: 'image.jpg', contentType: 'image/jpeg' });
            formData.append('scaleRadio', String(ratio));

            const headers = {
                ...formData.getHeaders(),
                'Accept': 'application/json, text/plain, */*',
                'User  -Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36',
            };

            try {
                const response = await axios.post(
                    'https://get1.imglarger.com/api/UpscalerNew/UploadNew',
                    formData,
                    { headers }
                );

                return { ...response.data, scale: ratio };
            } catch (error) {
                console.error('Error sending image:', error.response ? error.response.data : error.message);
                throw error;
            }
        },

        async wait(dat) {
            while (true) {
                const payload = {
                    code: dat.data.code,
                    scaleRadio: String(dat.scale),
                };

                const headers = {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                    'User  -Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36',
                };

                try {
                    const response = await axios.post(
                        'https://get1.imglarger.com/api/UpscalerNew/CheckStatusNew',
                        payload,
                        { headers }
                    );

                    if (response.data.data.status === 'success') {
                        return response.data;
                    }
                } catch (error) {
                    console.error('Error checking status:', error.response ? error.response.data : error.message);
                    throw error;
                }

                await new Promise((resolve) => setTimeout(resolve, 3000)); // Delay before checking status again
            }
        },
    };

    // Endpoint untuk meng-upscale gambar dari URL
    app.get('/tools/upscale', async (req, res) => {
        const { url } = req.query; // Mengambil URL gambar dari query string

        if (!url) {
            return res.status(400).json({ status: false, error: "Query parameter 'url' is required" });
        }

        try {
            // Mengunduh gambar dari URL
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            const imageBuffer = Buffer.from(response.data, 'binary');

            const uploadResponse = await Upscale.send(imageBuffer); // Menggunakan default ratio
            const finalResult = await Upscale.wait(uploadResponse);

            // Mengembalikan URL gambar hasil upscale
            res.status(200).json({ status: true, data: finalResult });
        } catch (error) {
            console.error('Error in upscale process:', error);
            res.status(500).json({ status: false, error: 'Failed to upscale image' });
        }
    });
};
