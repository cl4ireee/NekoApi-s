const fetch = require('node-fetch'); // Jika menggunakan Node.js

/**
 * Generate an image using Flat AI image generator.
 * @param {string} prompt - The text prompt to generate the image from.
 * @param {string} [seed=""] - An optional seed for randomization; if empty, a random seed is used.
 * @param {string} [ratio="1:1"] - The aspect ratio of the generated image; available options are "1:1", "16:9", and "9:16".
 * @returns {Promise<Array<string>>} A promise that resolves to an array of image URLs if successful, or throws an error if the generation fails.
 * @throws {Error} Throws an error if the nonce is not found or if image generation fails.
 */
const flatAi = async (prompt, seed = "", ratio = "1:1") => {
  try {
    const getNonce = await fetch(
      "https://flatai.org/ai-image-generator-free-no-signup/",
      {
        method: "GET",
        headers: {
          accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          "accept-language": "en-US,en;q=0.9",
          "cache-control": "max-age=0",
          referer: "https://flatai.org/ai-image-generator-free-no-signup/",
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6827.64 Safari/537.36 OPR/115.0.5132.173",
        },
      }
    );

    const findNonce = await getNonce.text();
    const nonceMatch = findNonce.match(/ai_generate_image_nonce":"(.*?)"/);
    const nonce = nonceMatch ? nonceMatch[1] : null;

    if (!nonce) {
      throw new Error("Nonce not found.");
    }

    const generate = await fetch("https://flatai.org/wp-admin/admin-ajax.php", {
      method: "POST",
      headers: {
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        origin: "https://flatai.org",
        referer: "https://flatai.org/ai-image-generator-free-no-signup/",
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6827.64 Safari/537.36 OPR/115.0.5132.173",
        "x-requested-with": "XMLHttpRequest",
      },
      body: `action=ai_generate_image&nonce=${nonce}&prompt=${encodeURIComponent(prompt)}&aspect_ratio=${ratio}&seed=${seed}`,
    });

    const result = await generate.json();

    if (result.success) {
      return result.data.images;
    } else {
      throw new Error("Image generation failed");
    }
  } catch (error) {
    console.error("Error in flatAi:", error.message);
    throw new Error("Failed to generate image. Please try again.");
  }
};

/**
 * Export the function to create the API endpoint
 * @param {Object} app - Express app object
 */
module.exports = function (app) {
  // Endpoint untuk menghasilkan gambar berdasarkan prompt
  app.get("/ai/flat", async (req, res) => {
    try {
      const { prompt, seed, ratio } = req.query;

      // Cek apakah parameter `prompt` ada
      if (!prompt) {
        return res.status(400).json({ error: "Parameter `prompt` is required" });
      }

      // Generate gambar menggunakan fungsi flatAi
      const images = await flatAi(prompt, seed || "", ratio || "1:1");

      // Kirim respons JSON
      res.json({ images });
    } catch (error) {
      console.error("Error di endpoint /generate-image:", error.message);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  });
};
