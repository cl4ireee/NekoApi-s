const axios = require('axios');
const FormData = require('form-data');

const Upscale = {
  async send(imageBuffer, ratio = 2) {
    const formData = new FormData();
    formData.append('myfile', imageBuffer, { filename: 'image.jpg', contentType: 'image/jpeg' });
    formData.append('scaleRadio', String(ratio));

    const headers = {
      ...formData.getHeaders(),
      'Accept': 'application/json, text/plain, */*',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      'Connection': 'keep-alive',
      'Host': 'get1.imglarger.com',
      'Origin': 'https://imgupscaler.com',
      'Referer': 'https://imgupscaler.com/',
      'User -Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36',
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
        'Host': 'get1.imglarger.com',
        'Origin': 'https://imgupscaler.com',
        'Referer': 'https://imgupscaler.com/',
        'User -Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36',
      };

      try {
        const response = await axios.post(
          'https://get1.imglarger.com/api/UpscalerNew/CheckStatusNew',
          payload,
          { headers }
        );

        console.log(response.data);
        if (response.data.data.status === 'success') {
          return response.data;
        }
      } catch (error) {
        console.error('Error checking status:', error.response ? error.response.data : error.message);
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, 3000)); // Cek setiap 3 detik
    }
  },
};

// Fungsi untuk mengatur rute API
module.exports = function setupUpscaleRoute(app) {
  app.get('/tools/upscale', async (req, res) => {
    const { scale } = req.query; // Mengambil parameter skala dari query
    const ratio = scale ? parseInt(scale) : 2; // Default ke 2 jika tidak ada parameter

    // Mengambil gambar dari parameter URL
    const imageUrl = req.query.url; // Mengganti imageUrl menjadi url
    if (!imageUrl) {
      return res.status(400).json({ status: false, message: 'URL gambar harus disediakan.' });
    }

    try {
      const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(imageResponse.data, 'binary');

      const a = await Upscale.send(buffer, ratio); // Mengirim gambar
      const b = await Upscale.wait(a); // Menunggu hasil
      res.json({ status: true, result: b }); // Mengembalikan hasil
    } catch (error) {
      res.status(500).json({ status: false, message: 'Terjadi kesalahan saat memproses permintaan.', error: error.message });
    }
  });
};
