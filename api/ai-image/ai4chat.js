const axios = require('axios');

module.exports = {
    name: 'AI Image Generator',
    desc: 'Generate AI Image based on text and ratio.',
    category: 'AIIAMGE',
    params: ['text', 'ratio'],
    async run(req, res) {
        try {
            const { text, ratio } = req.query;

            // Daftar rasio yang tersedia
            const availableRatios = [
                "1:1", "16:9", "2:3", "3:2", "4:5", "5:4", "9:16", "21:9", "9:21"
            ];

            // Validasi input parameter
            if (!text || !ratio) {
                return res.status(400).json({ status: false, error: 'Text and Ratio are required' });
            }

            // Cek apakah ratio yang diberikan valid
            if (!availableRatios.includes(ratio)) {
                return res.status(400).json({ status: false, error: 'Invalid ratio. Supported ratios are: ' + availableRatios.join(', ') });
            }

            // Membuat URL untuk permintaan API
            const apiUrl = `https://api.nekorinn.my.id/ai-img/ai4chat?text=${encodeURIComponent(text)}&ratio=${encodeURIComponent(ratio)}`;

            // Mengirim permintaan GET ke API AI
            const response = await axios.get(apiUrl);

            // Cek jika API memberikan URL gambar
            if (!response.data || !response.data.url) {
                return res.status(500).json({ status: false, error: 'Failed to get image URL' });
            }

            // Ambil gambar dari URL yang diberikan oleh API
            const imageResponse = await axios.get(response.data.url, { responseType: 'arraybuffer' });

            // Mengirimkan gambar langsung ke pengguna
            res.writeHead(200, {
                'Content-Type': 'image/png',  // Tipe konten gambar PNG
                'Content-Length': imageResponse.data.length,  // Ukuran gambar
            });
            res.end(imageResponse.data);

        } catch (error) {
            // Menangani error dan mengirimkan respons error
            res.status(500).json({ status: false, error: error.message });
        }
    }
};
