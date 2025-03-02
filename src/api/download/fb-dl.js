const axios = require("axios");
const FormData = require("form-data");
const cheerio = require("cheerio");

/**
 * Get Facebook Video Download Links
 * @param {String} url - URL of the Facebook video
 * @returns {Object} - Video details (title, thumbnail, download links)
 */
async function getmyfb(url) {
  try {
    let dd = new FormData();
    dd.append("id", url);
    dd.append("locale", "en");

    let headers = {
      headers: {
        ...dd.getHeaders()
      }
    };

    // Kirim permintaan POST ke getmyfb.com
    let { data: post } = await axios.post("https://getmyfb.com/process", dd, headers);
    let $ = cheerio.load(post);

    // Ambil data dari HTML yang di-scrape
    let thumbnail = $(".results-item-image").attr("src");
    let title = $(".results-item-text").text().trim();
    let hdLink = $(".hd-button").attr("href");
    let sdLink = $(".sd-button").attr("href");

    return {
      title,
      thumbnail,
      downloads: {
        hd: hdLink,
        sd: sdLink
      }
    };
  } catch (err) {
    console.error("Error fetching video:", err.message);
    throw new Error("Gagal mengambil data video. Silakan coba lagi.");
  }
}

/**
 * Export the function to create the API endpoint
 * @param {Object} app - Express app object
 */
module.exports = function (app) {
  // Endpoint untuk mendapatkan link download video Facebook
  app.get("download/faacebook-download", async (req, res) => {
    try {
      const { url } = req.query;

      // Cek apakah parameter `url` ada
      if (!url) {
        return res.status(400).json({ error: "Parameter `url` is required" });
      }

      // Proses URL menggunakan fungsi getmyfb
      const result = await getmyfb(url);

      // Kirim respons JSON
      res.json(result);
    } catch (error) {
      console.error("Error di endpoint /download-fb-video:", error.message);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  });
};
