const axios = require('axios');
const cheerio = require('cheerio');

module.exports = function(app) {
    // Endpoint untuk mengambil data dari profil Instagram menggunakan Dumpor
    app.get('/stalk/igstalk', async (req, res) => {
        const { q } = req.query; // Mengambil query parameter 'q' untuk nama pengguna Instagram

        if (!q) {
            return res.status(400).json({ msg: "Query parameter 'q' is required." });
        }

        const url = `https://dumpor.io/v/${q.split(" ").join("_").toLowerCase()}`;

        try {
            // Mengambil data dari Dumpor berdasarkan username
            const { data } = await axios.get(url, {
                headers: {
                    "User-Agent": "Posify/1.0.0",
                    "Referer": "dumpor.io"
                }
            });

            const $ = cheerio.load(data);
            let result = {
                metadata: {},
                posts: []
            };

            // Mengambil metadata profil pengguna
            result.metadata.name = $(".items-top h2").text().trim() || 'Nama tidak ditemukan';
            result.metadata.username = $(".items-top h1").text().trim() || 'Username tidak ditemukan';
            result.metadata.bio = $(".items-top .text-sm").text().trim() || 'Bio tidak ditemukan';
            $(".stats .stat").each((a, i) => {
                let name = $(i).find(".stat-title").text().trim().toLowerCase();
                let value = $(i).find(".stat-value").text().trim();
                result.metadata[name] = value;
            });
            result.metadata.avatar = $(".avatar img").attr("src") || '';

            // Mengambil link untuk setiap post
            let array = [];
            $(".card").each((a, i) => {
                let url = "https://dumpor.io/" + $(i).find("a").attr("href");
                array.push(url);
            });

            // Mengambil data detail untuk setiap post
            let postData = await extractPost(array);
            result.posts = postData;

            // Mengembalikan data pengguna dan postingan
            res.status(200).json({
                status: true,
                result: result
            });

        } catch (error) {
            console.error('Error fetching data:', error.message);
            res.status(500).json({ status: false, error: 'Error fetching data' });
        }
    });

    // Fungsi untuk mengambil data dari setiap post
    async function extractPost(array) {
        let result = [];
        for (const url of array) {
            let request = await axios.get(url, {
                headers: {
                    "User-Agent": "Posify/1.0.0",
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
                    title: $(i).find(".card-body").find("p").text().trim() || 'Tidak ada judul',
                    likes: $(i).find(".card-body").eq(2).find("div").eq(0).text().trim() || 'Tidak ada likes',
                    comments: $(i).find(".card-body").eq(2).find("div").eq(1).text().trim() || 'Tidak ada komentar',
                    uploaded: $(i).find(".card-body").eq(2).find("div").eq(2).text().trim() || 'Tidak ada waktu upload',
                    downloads: items || 'Tidak ada media'
                });
            });
        }
        return result;
    }
};
