const axios = require('axios');

// Fungsi untuk berinteraksi dengan DeepSeek-V3
async function fetchContentDeepSeekV3(content) {
  try {
    const response = await axios.post('https://api.blackbox.ai/api/chat', {
      messages: [{ content, role: 'user' }],
      model: 'deepseek-ai/DeepSeek-V3',
      max_tokens: 1024
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching content from DeepSeek-V3:", error);
    throw error;
  }
}

// Endpoint untuk DeepSeek-V3 chat
module.exports = function(app) {
  app.get('/ai/deepseek-v3', async (req, res) => {
    const { text } = req.query;

    if (!text || text.trim() === '') {
      return res.status(400).json({ status: false, error: 'Text is required' });
    }

    try {
      // Mengambil respons dari model DeepSeek-V3
      const modelResponse = await fetchContentDeepSeekV3(text);

      // Pastikan model response ada dan mengembalikan hasil
      if (modelResponse && modelResponse.result) {
        res.status(200).json({
          status: true,
          result: modelResponse.result  // Hanya memberikan hasil dari model
        });
      } else {
        res.status(500).json({ status: false, error: 'No result from model' });
      }
    } catch (error) {
      res.status(500).json({ status: false, error: error.message });
    }
  });
};
