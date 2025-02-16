const axios = require("axios");
const FormData = require("form-data");

// Objek gemini untuk menangani chat
const gemini = {
   chat: async (text) => {
      let d = new FormData();
      d.append("content", `:User       ${text}`);
      d.append("model", "@google/gemini-2.0-flash-exp");
      
      let head = {
         headers: {
            ...d.getHeaders()
         }
      };
      
      let { data: ak } = await axios.post("https://mind.hydrooo.web.id/v1/chat", d, head);
      
      return ak.result;
   }
};

// Endpoint untuk menangani request ke /ai/gemini
app.get('/ai/gemini', async (req, res) => {
   try {
      const { text } = req.query; // Ambil parameter 'text' dari query
      if (!text) {
         return res.status(400).json({ status: false, error: "Text is required" });
      }
      
      const result = await gemini.chat(text); // Panggil fungsi gemini.chat
      res.status(200).json({ status: true, result }); // Mengembalikan hasil
   } catch (error) {
      res.status(500).json({ status: false, error: error.message }); // Menangani kesalahan
   }
});
