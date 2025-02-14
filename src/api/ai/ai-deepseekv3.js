const axios = require('axios');

// Fungsi untuk berinteraksi dengan DeepSeek-V3
async function fetchDeepSeekV3(content) {
  try {
    const response = await axios.post('https://api.blackbox.ai/api/chat', {
      model: 'deepseek-ai/DeepSeek-V3',  // Menyertakan model secara eksplisit
      messages: [{ content, role: 'user' }]  // Menggunakan struktur yang benar (messages dengan role 'user')
    }, {
      headers: { 
        'Content-Type': 'application/json'  // Pastikan header Content-Type benar
      }
    });
    
    // Periksa apakah ada data dalam response
    if (response.data && response.data.result) {
      return response.data.result;
    } else {
      throw new Error('No result found in API response');
    }
  } catch (error) {
    console.error("Error fetching from DeepSeek-V3:", error.message);
    throw error;  // Menghentikan eksekusi jika terjadi error
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
      const result = await fetchDeepSeekV3(text);
      res.status(200).json({
        status: true,
        result
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ 
        status: false, 
        error: 'Internal server error: ' + error.message 
      });
    }
  });
};
