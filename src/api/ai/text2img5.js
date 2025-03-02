const axios = require('axios');

async function text2img(prompt, size = 512, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const { data } = await axios.post(
        'https://ftvwohriusaknrzfogjh.supabase.co/functions/v1/generate-image',
        {
          prompt: `${prompt}, professional photograph, raw photo, unedited photography, photorealistic, 8k uhd, high quality dslr photo, sharp focus, detailed, crystal clear, natural lighting`,
          width: size,
          height: size,
        },
        {
          headers: {
            authority: 'ftvwohriusaknrzfogjh.supabase.co',
            'Content-Type': 'application/json',
            Origin: 'https://aiimagegenerator.site',
            Referer: 'https://aiimagegenerator.site/',
            priority: 'u=0, i',
            'sec-ch-ua':
              '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'none',
            'sec-fetch-user': '?1',
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
            Apikey:
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0dndvaHJpdXNha25yemZvZ2poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQzNDc1NDMsImV4cCI6MjA0OTkyMzU0M30.JXPW9daK9AEov4sOt83qOgvx43-hE6QYfdO0h-nUHSs',
            Authorization:
              'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0dndvaHJpdXNha25yemZvZ2poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQzNDc1NDMsImV4cCI6MjA0OTkyMzU0M30.JXPW9daK9AEov4sOt83qOgvx43-hE6QYfdO0h-nUHSs',
          },
          timeout: 30000, // Timeout 30 detik
        }
      );

      if (data.status === 500) {
        throw new Error('Try again!');
      }

      const base64 = data.image
        .replace(/^data:image\/[a-zA-Z]+;base64,/, '')
        .replace(/-/g, '+')
        .replace(/_/g, '/');
      return Buffer.from(base64, 'base64');
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error.message);
      if (i === retries - 1) {
        throw new Error('Failed to generate image after multiple attempts.');
      }
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Tunggu 2 detik sebelum mencoba lagi
    }
  }
}

module.exports = function (app) {
  app.get('/ai/supabase', async (req, res) => {
    try {
      const { prompt, size } = req.query;

      if (!prompt) {
        return res.status(400).json({ error: 'Parameter `prompt` is required' });
      }

      const imageBuffer = await text2img(prompt, parseInt(size) || 512);

      res.set('Content-Type', 'image/png');
      res.send(imageBuffer);
    } catch (error) {
      console.error('Error di endpoint /generate-image:', error.message);
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  });
};
