const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Extracts post data from a list of URLs.
 * @param {string[]} array - List of URLs to fetch and extract data from.
 * @returns {Promise<Object[]>} - Returns an array of post objects.
 */
async function extractPost(array) {
    let result = [];
    for (const url of array) {
        let request = await axios.get(url, {
            headers: {
                "User -Agent": "Posify/1.0.0",
                "Referer": "dumpor.io"
            }
        }).catch(e => e.response);

        if (request.status !== 200) return Promise.reject({
            msg: "Failed to fetch post data!",
            url
        });

        let $ = cheerio.load(request.data);
        $(".card").each((a, i) => {
            let items = [];
            $(i).find(".carousel .carousel-item").each((ul, el) => {
                let results = $(el).find("img").attr("src") || $(el).find("video").attr("src");
                items.push(results);
            });

            result.push({
                url,
                title: $(i).find(".card-body").find("p").text().trim(),
                likes: $(i).find(".card-body").eq(2).find("div").eq(0).text().trim(),
                comments: $(i).find(".card-body").eq(2).find("div").eq(1).text().trim(),
                uploaded: $(i).find(".card-body").eq(2).find("div").eq(2).text().trim(),
                downloads: items
            });
        });
    }
    return result;
}

/**
 * Fetches user profile and posts from Dumpor.
 * @param {string} query - The query to search for.
 * @returns {Promise<Object>} - Returns user metadata and a list of posts.
 */
async function stalk(query) {
    let request = await axios.get(`https://dumpor.io/v/${query.split(" ").join("_").toLowerCase()}`, {
        headers: {
            "User -Agent": "Posify/1.0.0",
            "Referer": "dumpor.io"
        }
    }).catch(e => e.response);

    if (request.status !== 200) throw {
        msg: "Failed to fetch user data!",
        error: request
    };

    let $ = cheerio.load(request.data);
    let array = [];
    let result = {
        metadata: {},
        posts: []
    };

    result.metadata.name = $(".items-top h2").text().trim();
    result.metadata.username = $(".items-top h1").text().trim();
    result.metadata.bio = $(".items-top .text-sm").text().trim();
    $(".stats .stat").each((a, i) => {
        let name = $(i).find(".stat-title").text().trim().toLowerCase();
        let value = $(i).find(".stat-value").text().trim();
        result.metadata[name] = value;
    });

    result.metadata.avatar = $(".avatar img").attr("src");
    $(".card").each((a, i) => {
        let url = "https://dumpor.io/" + $(i).find("a").attr("href");
        array.push(url);
    });

    result.posts = await extractPost(array);
    return result;
}

// Endpoint untuk mengambil profil pengguna dan postingan
app.get('/stalk/igstalk', async (req, res) => {
    const { q } = req.query; // Mengambil query parameter q
    if (!q) {
        return res.status(400).json({ msg: "Query parameter 'q' is required." });
    }
    try {
        const userData = await stalk(q);
        res.json(userData);
    } catch (error) {
        res.status(500).json({ msg: error.msg, error: error.error });
    }
});
