const axios = require('axios');

// Daftar tipe yang valid
const validTypes = [
    'glitchtext', 'writetext', 'advancedglow', 'typographytext', 'pixelglitch',
    'neonglitch', 'flagtext', 'flag3dtext', 'deletingtext', 'blackpinkstyle',
    'glowingtext', 'underwatertext', 'logomaker', 'cartoonstyle', 'papercutstyle',
    'watercolortext', 'effectclouds', 'blackpinklogo', 'gradienttext', 'summerbeach',
    'luxurygold', 'multicoloredneon', 'sandsummer', 'galaxywallpaper', '1917style',
    'makingneon', 'royaltext', 'freecreate', 'galaxystyle', 'lighteffects'
];

module.exports = function(app) {
    app.get('/maker/ephoto', async (req, res) => {
        try {
            const { text, type } = req.query; // Mengambil parameter 'text' dan 'type' dari query

            // Validasi parameter
            if (!text || !type) {
                return res.status(400).json({ status: false, error: 'Text and Type are required' });
            }

            if (!validTypes.includes(type)) {
                return res.status(400).json({ status: false, error: `Invalid type. Valid types are: ${validTypes.join(', ')}` });
            }

            // Mengakses API eksternal dengan parameter 'text' dan 'type'
            const response = await axios.get(`https://api.rynn-archive.biz.id/maker/ephoto?text=${encodeURIComponent(text)}&type=${encodeURIComponent(type)}`, {
                responseType: 'arraybuffer' // Mengambil respons sebagai array buffer
            });

            // Mengatur header untuk mengembalikan gambar
            res.set('Content-Type', 'image/png'); // Mengatur Content-Type menjadi image/png
            res.set('Content-Length', response.data.length); // Mengatur Content-Length sesuai dengan ukuran data
            res.send(response.data); // Mengirimkan data gambar sebagai respons
        } catch (error) {
            console.error('Error fetching data from external API:', error.message);
            res.status(500).json({ status: false, error: 'Error fetching data from external API' });
        }
    });
};
