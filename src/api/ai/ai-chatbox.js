const axios = require('axios');
const FormData = require('form-data'); // Tambahkan package form-data

/**
 * AI Chat Function
 * @param {String} msg - Pesan yang akan dikirim ke chatbot
 * @returns {Object} - Respons dari chatbot
 */
async function ai(msg) {
  try {
    let formData = new FormData();
    formData.append('_wpnonce', '2bfb1eb0bb');
    formData.append('post_id', 11);
    formData.append('url', 'https://chatbotai.one');
    formData.append('action', 'wpaicg_chat_shortcode_message');
    formData.append('message', msg);
    formData.append('bot_id', 0);

    let { data } = await axios.post('https://chatbotai.one/wp-admin/admin-ajax.php', formData, {
      headers: {
        ...formData.getHeaders(), // Tambahkan headers dari FormData
        "sec-ch-ua": '"Not A(Brand";v="8", "Chromium";v="132"',
        "origin": "https://chatbotai.one",
        "referer": "https://chatbotai.one/",
        "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36"
      }
    });

    return {
      status: data.status,
      result: data.data
    };
  } catch (error) {
    console.error('Error di ai:', error.message);
    throw new Error('Gagal mengirim pesan ke chatbot. Silakan coba lagi.');
  }
}

/**
 * Export the function to create the API endpoint
 * @param {Object} app - Express app object
 */
module.exports = function (app) {
  // Endpoint untuk mengirim pesan ke chatbot
  app.get('/ai/chatbox', async (req, res) => {
    try {
      const { text } = req.query;

      // Cek apakah parameter `msg` ada
      if (!text) {
        return res.status(400).json({ error: 'Parameter `msg` is required' });
      }

      // Proses pesan menggunakan fungsi ai
      const result = await ai(msg);

      // Kirim respons JSON
      res.json(result);
    } catch (error) {
      console.error('Error di endpoint /chat:', error.message);
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  });
};
