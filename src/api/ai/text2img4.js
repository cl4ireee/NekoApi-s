const fetch = require('node-fetch'); // Jika menggunakan Node.js

/**
 * Text to Image.
 * @param {string} prompt - Prompt describing the desired image.
 * @param {string} [negative=""] - Negative prompt describing what to avoid in the image.
 * @param {string} [model="flux"] - Model to use for image generation. Available options: "flux", "PHOTOREALISTIC13".
 * @param {string} [size="1024x1024"] - Size of the generated image. Available options: "512x512", "512x768", "768x512", "1024x1024".
 * @returns {Promise<Buffer>} A promise that resolves to the image buffer if successful, or throws an error if the generation fails.
 */
const txt2img = async (
  prompt,
  negative = "",
  model = "flux",
  size = "1024x1024"
) => {
  const url = "https://aicreate.com/wp-admin/admin-ajax.php";

  const params = new URLSearchParams({
    action: "text_to_image_handle",
    caption: prompt,
    negative_prompt: negative,
    model_version: model,
    size,
  });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        accept: "*/*",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        origin: "https://aicreate.com",
        referer: "https://aicreate.com/text-to-image-generator/",
        "x-requested-with": "XMLHttpRequest",
        "user-agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/119.0.6045.169 Mobile/15E148 Safari/604.1",
      },
      body: params,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    const regex = /src="(https:\/\/aicdn\.picsart\.com\/[a-f0-9-]+\.jpg)"/g;
    const match = [...data.html.matchAll(regex)];

    if (match.length === 0) {
      throw new Error("No image URLs found in the response.");
    }

    // Ambil URL gambar pertama
    const imageUrl = match[0][1];

    // Unduh gambar dari URL
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image. Status: ${imageResponse.status}`);
    }

    // Konversi gambar ke buffer
    const imageBuffer = await imageResponse.buffer();
    return imageBuffer;
  } catch (error) {
    console.error("Error:", error);
    throw new Error("Failed to generate or download image. Please try again.");
  }
};

/**
 * Export the function to create the API endpoint
 * @param {Object} app - Express app object
 */
module.exports = function (app) {
  // Endpoint untuk menghasilkan gambar berdasarkan prompt
  app.get("/ai/aicreate", async (req, res) => {
    try {
      const { prompt, negative, model, size } = req.query;

      // Cek apakah parameter `prompt` ada
      if (!prompt) {
        return res.status(400).json({ error: "Parameter `prompt` is required" });
      }

      // Generate gambar menggunakan fungsi txt2img
      const imageBuffer = await txt2img(
        prompt,
        negative || "",
        model || "flux",
        size || "1024x1024"
      );

      // Kirim gambar langsung sebagai respons
      res.set("Content-Type", "image/jpeg");
      res.send(imageBuffer);
    } catch (error) {
      console.error("Error di endpoint /generate-image:", error.message);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  });
};
