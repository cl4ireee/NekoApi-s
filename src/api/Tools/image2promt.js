const axios = require('axios');

/**
 * Convert image to prompt
 * @param {Buffer} buffer - Image buffer
 * @returns {Promise<Object>} - Response from the API
 */
async function imageToPrompt(buffer) {
  let image64 = `data:image/jpeg;base64,${buffer.toString('base64')}`;
  let { data } = await axios.post('https://www.chat-mentor.com/api/ai/image-to-text/', {
    imageUrl: image64,
    prompt: "Generate a text prompt for this image, focusing on visual elements, style, and key features."
  }, {
    headers: {
      "content-type": "application/json",
      "origin": "https://www.chat-mentor.com",
      "referer": "https://www.chat-mentor.com/features/image-to-prompt/",
      "sec-ch-ua": '"Not A(Brand";v="8", "Chromium";v="132"',
      "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36"
    }
  });
  return data;
}

/**
 * Export the function to create the API endpoint
 * @param {Object} app - Express app object
 */
module.exports = function (app) {
  app.get('/tools/image2prompt', async (req, res) => {
    try {
      // Ambil URL gambar dari query parameter
      const { url } = req.query; // Ganti `imageUrl` dengan `url`

      if (!url) {
        return res.status(400).json({ error: 'Parameter `url` is required' });
      }

      // Unduh gambar dari URL yang diberikan
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(response.data, 'binary');

      // Proses gambar menggunakan fungsi imageToPrompt
      const result = await imageToPrompt(imageBuffer);

      // Kirim respons JSON
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
};
