const axios = require('axios');

const headers = {
  "authority": "photoaid.com",
  "content-type": "text/plain;charset=UTF-8",
  "origin": "https://photoaid.com",
  "referer": "https://photoaid.com/en/tools/remove-background?srsltid=AfmBOoqBUTLrKXKSJLLo54PXv0RCH-53_H_OeNu8hhlmIhoV-b0CN5j8",
  "sec-ch-ua": '"Not A(Brand";v="8", "Chromium";v="132"',
  "sec-ch-ua-mobile": "?1",
  "sec-ch-ua-platform": '"Android"',
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-origin",
  "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36"
};

/**
 * Remove Background from Image
 * @param {Buffer} image - Image buffer
 * @returns {Promise<ArrayBuffer>} - Image buffer with background removed
 */
async function removebg(image) {
  try {
    let base64 = image.toString('base64');
    let { data } = await axios.post('https://photoaid.com/en/tools/api/tools/upload', {
      "base64": base64,
      "reqURL": "/remove-background/upload"
    }, {
      headers
    });

    let result = await axios.post('https://photoaid.com/en/tools/api/tools/result', {
      "request_id": data.request_id,
      "reqURL": "/remove-background/result"
    }, {
      headers
    });

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    while (result.data.result == null) {
      await delay(2000);
      result = await axios.post('https://photoaid.com/en/tools/api/tools/result', {
        "request_id": data.request_id,
        "reqURL": "/remove-background/result"
      }, {
        headers
      });
    }

    return result.data.result;
  } catch (error) {
    console.error('Error in removebg:', error.message);
    throw new Error('Failed to remove background. Please try again.');
  }
}

/**
 * Export the function to create the API endpoint
 * @param {Object} app - Express app object
 */
module.exports = function (app) {
  // Endpoint untuk menghapus latar belakang gambar
  app.get('/tools/remove', async (req, res) => {
    try {
      const { imageUrl } = req.query;

      // Cek apakah parameter `imageUrl` ada
      if (!imageUrl) {
        return res.status(400).json({ error: 'Parameter `imageUrl` is required' });
      }

      // Unduh gambar dari URL
      const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(imageResponse.data, 'binary');

      // Proses gambar menggunakan fungsi removebg
      const result = await removebg(imageBuffer);

      // Kirim gambar langsung sebagai respons
      res.set('Content-Type', 'image/png');
      res.send(Buffer.from(result, 'base64'));
    } catch (error) {
      console.error('Error di endpoint /remove-background:', error.message);
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  });
};
