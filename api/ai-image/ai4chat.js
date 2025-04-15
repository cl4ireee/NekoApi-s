const axios = require('axios');
const cheerio = require('cheerio');
const FormData = require('form-data');

module.exports = {
    name: 'Clipart',
    desc: 'Mencari gambar dengan gaya lukisan berdasarkan prompt',
    category: 'Ai Image',
    params: ['prompt'],
    async run(req, res) {
        const { prompt } = req.query;
        if (!prompt) {
            return res.status(400).json({ status: false, error: 'Prompt is required' });
        }

        try {
            const formData = new FormData();
            formData.append("qq", prompt);
            const headers = {
                headers: {
                    ...formData.getHeaders()
                }
            };

            const { data: responseData } = await axios.post("https://1010clipart.com/", formData, headers);
            const $ = cheerio.load(responseData);

            let images = [];
            $('#image-container img').each((i, el) => {
                let src = $(el).attr('src');
                if (src) {
                    images.push({ img: src });
                }
            });

            if (images.length === 0) {
                return res.status(404).json({ status: false, error: 'No images found for the given prompt' });
            }

            return res.json({
                status: true,
                result: images
            });

        } catch (err) {
            return res.status(500).json({ status: false, error: err.message });
        }
    }
};
