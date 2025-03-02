const FormData = require("form-data"); // Gunakan `form-data` untuk kompatibilitas lebih baik di CJS
const fetch = require("node-fetch");
const crypto = require("crypto");

/**
 * Generate a unique client ID using random bytes.
 * 
 * @returns {string} A base64 encoded string representing the client ID.
 */
const generateClientId = () => {
  const bytes = new Uint8Array(32);
  crypto.randomFillSync(bytes);
  return Buffer.from(bytes)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

/**
 * Generate art based on the provided prompt.
 * 
 * @param {string} prompt - Prompt for generating the art.
 * @returns {Promise<ArrayBuffer|null>} A promise that resolves to the image data as an ArrayBuffer, or null if an error occurs.
 */
const generateArt = async (prompt) => {
  const form = new FormData();
  form.append("prompt", prompt);
  form.append("output_format", "bytes");
  form.append("user_profile_id", "null");
  form.append("anonymous_user_id", crypto.randomUUID());
  form.append("request_timestamp", (Date.now() / 1000).toFixed(3));
  form.append("user_is_subscribed", "false");
  form.append("client_id", generateClientId());

  try {
    const response = await fetch(
      "https://ai-api.magicstudio.com/api/ai-art-generator",
      {
        method: "POST",
        headers: {
          accept: "application/json, text/plain, */*",
          origin: "https://magicstudio.com",
          referer: "https://magicstudio.com/ai-art-generator/",
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0",
        },
        body: form,
      },
    );

    const buffer = await response.arrayBuffer();
    return buffer;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

/**
 * Export the function to create the API endpoint
 * @param {Object} app - Express app object
 */
module.exports = function (app) {
  // Endpoint untuk menghasilkan gambar berdasarkan prompt
  app.get("/ai/text2art", async (req, res) => {
    try {
      const { prompt } = req.query;

      // Cek apakah parameter `prompt` ada
      if (!prompt) {
        return res.status(400).json({ error: "Parameter `prompt` is required" });
      }

      // Generate gambar menggunakan fungsi generateArt
      const imageBuffer = await generateArt(prompt);

      if (!imageBuffer) {
        return res.status(500).json({ error: "Gagal menghasilkan gambar." });
      }

      // Kirim gambar sebagai respons
      res.set("Content-Type", "image/png");
      res.send(Buffer.from(imageBuffer));
    } catch (error) {
      console.error("Error di endpoint /generate-art:", error.message);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  });
};
