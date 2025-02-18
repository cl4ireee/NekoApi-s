const axios = require("axios");
const cheerio = require("cheerio");

function clean(str) {
    const regex = /['"]/g;
    return str.replace(regex, '');
}

async function downloadAppleMusic(url) {
    try {
        const baseurl = 'https://aaplmusicdownloader.com';
        const detail = await axios.get(baseurl + '/api/applesearch.php', {
            params: { url: url }
        });
        const { name, albumname, url: songUrl } = detail.data;

        const restk = await axios.get(baseurl + '/song.php');
        const $ = cheerio.load(restk.data);
        const token = $("div.media-info").find('a[href="#"]').attr("token");

        const data = new URLSearchParams();
        data.append('song_name', clean(name));
        data.append('artist_name', clean(albumname));
        data.append('url', songUrl);
        data.append('token', token);

        const dlrespon = await axios.post(baseurl + '/api/composer/swd.php', data, {
            headers: {
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
                'Cache-Control': 'no-cache',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Origin': baseurl,
                'Referer': baseurl + '/track.php',
                'User -Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        return {
            ...detail.data,
            dl: encodeURI(dlrespon.data.dlink)
        };
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

module.exports = function(app) {
    // Endpoint for downloading Apple Music tracks
    app.get("/download/apple-music", async (req, res) => {
        const { url } = req.query; // Get the Apple Music link from the query parameters

        if (!url) {
            return res.status(400).json({ error: "Query parameter 'url' is required" });
        }

        try {
            const result = await downloadAppleMusic(url); // Call the download function
            return res.status(200).json(result); // Return the result
        } catch (error) {
            console.error("Error fetching Apple Music download:", error.message);
            return res.status(500).json({ error: "Failed to fetch Apple Music download." });
        }
    });
};
