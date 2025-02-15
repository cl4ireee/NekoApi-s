const axios = require('axios');

async function SimSimi(text, language = 'id') {
  try {
    const { data } = await axios.post(
      "https://api.simsimi.vn/v1/simtalk",
      new URLSearchParams({ text, lc: language }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      }
    );
    return { status: true, message: data.message };
  } catch (error) {
    console.error("Error fetching SimSimi data:", error.message);
    return { status: false, error: "Failed to fetch SimSimi data" };
  }
}

module.exports = function (app) {
  app.get('/ai/simsimi', async (req, res) => {
    const { text, language = 'id' } = req.query;

    if (!text) {
      return res.status(400).json({ status: false, error: "Query parameter (text) is required" });
    }

    const response = await SimSimi(text, language);

    if (!response.status) {
      return res.status(500).json(response);
    }

    res.status(200).json(response);
  });
};
