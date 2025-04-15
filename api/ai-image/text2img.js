const axios = require('axios');

module.exports = {
    name: 'Text2Img',
    desc: 'Menghasilkan gambar dari teks menggunakan API Nekorinn (langsung kirim gambar)',
    category: 'AI',
    params: ['text'],
    async run(req, res) {
        const { text } = req.query;
        if (!text) {
            return res.status(400).json({ status: false, error: 'Parameter text diperlukan' });
        }

        try {
            const response = await axios.get(`https://api.nekorinn.my.id/ai-img/text2img?text=${encodeURIComponent(text)}`, {
                responseType: 'arraybuffer'
            });

            res.setHeader('Content-Type', 'image/png');
            res.send(response.data);
        } catch (error) {
            console.error('Gagal generate gambar:', error.message);
            return res.status(500).json({ status: false, error: 'Gagal mengambil gambar dari API' });
        }
    }
};
