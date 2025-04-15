const axios = require('axios');

module.exports = {
    name: 'AI Image Generator',
    desc: 'Generate AI Image based on text and ratio.',
    category: 'aiiamge',
    params: ['text', 'ratio'],
    async run(req, res) {
        try {
            // Mengambil parameter text dan ratio dari query
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

            // Menyusun hasil dan mengirimkan respons
            res.status(200).json({
                status: true,
                imageUrl: response.data.url // Asumsikan API mengembalikan URL gambar
            });

        } catch (error) {
            // Menangani error dan mengirimkan respons error
            res.status(500).json({ status: false, error: error.message });
        }
    }
};
