const axios = require('axios');
const cheerio = require('cheerio');

// Fungsi untuk mencari suara meme
const memeSound = async (nameSound) => {
    const URI = `https://www.myinstants.com/en/search/?name=${nameSound}`;
    const { data } = await axios.get(URI);
    const $ = cheerio.load(data);

    const results = [];

    $('.instant').each((index, element) => {
        const instant = {};

        instant.backgroundColor = $(element).find('.circle').attr('style');

        const onclickAttr = $(element).find('button.small-button').attr('onclick');
        const audioMatch = onclickAttr.match(/play\('(\/media\/sounds\/.*?\.mp3)'/);
        instant.audioUrl = audioMatch ? `https://www.myinstants.com${audioMatch[1]}` : null;

        instant.title = $(element).find('button.small-button').attr('title');
        instant.text = $(element).find('.instant-link').text();
        instant.url = $(element).find('.instant-link').attr('href');

        results.push(instant);
    });

    return results;
}

// Endpoint untuk mencari suara meme
app.get('/search/meme-sound', async (req, res) => {
    const { q } = req.query; // Mengambil parameter query 'q'

    // Memastikan query disediakan
    if (!q) {
        return res.status(400).json({ status: false, error: 'Parameter query diperlukan' });
    }

    try {
        const results = await memeSound(q); // Menggunakan 'q' sebagai parameter pencarian
        res.status(200).json({ status: true, results });
    } catch (error) {
        console.error("Kesalahan saat memproses permintaan:", error);
        res.status(500).json({ status: false, error: 'Terjadi kesalahan saat memproses permintaan.' });
    }
});
