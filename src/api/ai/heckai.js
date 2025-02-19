const axios = require("axios");

let models = [
  "openai/gpt-4o-mini",
  "google/gemini-2.0-flash-001",
  "deepseek/deepseek-r1",
];

const heckai = {
  generateSessionId: async (title) => {
    let payload = { title };
    let { data } = await axios.post(
      "https://api.heckai.weight-wave.com/api/ha/v1/session/create",
      payload
    );
    return data.id;
  },

  chatStream: async (text, model, onData) => {
    let sessionId = await heckai.generateSessionId(text);
    let modelInput = models[model];
    let payload = {
      language: "English",
      model: modelInput,
      previousAnswer: null,
      previousQuestion: null,
      question: text,
      sessionId: sessionId,
    };

    let response = await axios.post(
      "https://api.heckai.weight-wave.com/api/ha/v1/chat",
      payload,
      { responseType: "stream" }
    );

    response.data.on("data", (chunk) => {
      onData(chunk.toString());
    });
  },
};

// Export the setup function directly
module.exports = (app) => {
  app.get('/ai/heckai', async (req, res) => {
    const { text, model } = req.query; // Get text and model from query parameters
    if (!text || !model) {
      return res.status(400).json({ status: false, message: 'Text and model must be provided.' });
    }

    try {
      let result = [];
      await heckai.chatStream(text, model, (data) => {
        result.push(data);
      });

      return res.json({ status: true, result: result.join('') });
    } catch (error) {
      return res.status(500).json({ status: false, message: 'An error occurred while processing the request.' });
    }
  });
};
