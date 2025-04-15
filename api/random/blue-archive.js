const axios = require('axios');

module.exports = {
    name: 'BlueArchive Random Image',
    desc: 'Get a random image from Blue Archive',
    category: 'random',
    params: [],
    async run(req, res) {
        try {
            // Mengambil data URL gambar dari file JSON di GitHub
            const { data } = await axios.get('https://raw.githubusercontent.com/rynxzyy/blue-archive-r-img/refs/heads/main/links.json');
            
            // Memilih URL gambar secara acak dari daftar yang ada
            const randomImageUrl = data[Math.floor(data.length * Math.random())];
            
            // Mengunduh gambar dalam format arraybuffer
            const response = await axios.get(randomImageUrl, { responseType: 'arraybuffer' });
            
            // Menyusun header untuk mengirim gambar sebagai respons
            res.writeHead(200, {
                'Content-Type': 'image/png',  // Tipe konten gambar PNG
                'Content-Length': response.data.length,  // Ukuran gambar
            });
            
            // Mengirimkan gambar langsung
            res.end(response.data);
        } catch (error) {
            // Menangani error dan mengirimkan pesan error
            res.status(500).send(`Error: ${error.message}`);
        }
    }
};
