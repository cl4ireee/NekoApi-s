const axios = require('axios');
const cheerio = require('cheerio');

module.exports = function(app) {
    // Endpoint untuk mendapatkan daftar karakter Blue Archive
    app.get('/random/bluearchive', async (req, res) => {
        try {
            const response = await axios.get('https://bluearchive.wiki/wiki/Characters');
            const $ = cheerio.load(response.data);
            let characters = [];

            // Mengambil daftar karakter
            $(".sortable tbody tr td a").each((index, element) => {
                let name = $(element).text().trim();
                let url = "https://bluearchive.wiki" + $(element).attr("href");

                if (name) {
                    characters.push({
                        name,
                        url
                    });
                }
            });

            // Mengembalikan daftar karakter
            res.status(200).json({
                status: true,
                total_character: characters.length,
                list_character: characters
            });
        } catch (error) {
            console.error("Error while fetching character list:", error.message);
            res.status(500).json({
                status: false,
                error: 'Failed to fetch data from Blue Archive Wiki'
            });
        }
    });

    // Endpoint untuk mendapatkan detail karakter berdasarkan nama
app.get('/random/badetail', async (req, res) => {
    const { q } = req.query; // Mengambil parameter q dari query string

    // Validasi parameter q
    if (!q) {
        return res.status(400).json({
            status: false,
            error: 'Character name is required'
        });
    }

    try {
        // Mengambil daftar karakter
        const response = await axios.get('https://bluearchive.wiki/wiki/Characters');
        const $ = cheerio.load(response.data);
        const chara = $(".sortable tbody tr td a")
            .toArray()
            .find(el => $(el).text().trim().toLowerCase() === q.toLowerCase());

        if (!chara) {
            return res.status(404).json({
                status: false,
                error: 'Character not found'
            });
        }

        // Mendapatkan URL karakter dan mengambil data detailnya
        const characterUrl = "https://bluearchive.wiki" + $(chara).attr("href");
        const charDetailsResponse = await axios.get(characterUrl);
        const $chara = cheerio.load(charDetailsResponse.data);
        let result = {
            status: true,  // Menambahkan status true di sini
            metadata: {},
            voices: []
        };

        // Mengambil metadata karakter
        $chara(".character tbody tr").each((index, element) => {
            let key = $(element).find("th").text().trim().split(" ").join("_").toLowerCase();
            let value = $(element).find("td").text().trim();
            if (key && value) {
                result.metadata[key] = value;
            }
        });

        // Mengambil kartu karakter (gambar, rank, dll.)
        result.metadata.cards = $chara(".charactercard").map((index, element) => ({
            name: $chara(element).find(".name").text().trim(),
            role: $chara(element).find("div").last().attr("title"),
            ranks: $chara(element).find(".rank").text().trim(),
            image: "https:" + $chara(element).find(".portrait span > a > img").attr("src").split("/100px")[0],
            url: "https://bluearchive.wiki" + $chara(element).find(".portrait span > a").attr("href")
        })).get();

        // Mengambil suara karakter
        const voiceResponse = await axios.get(characterUrl + '/audio');
        const $voice = cheerio.load(voiceResponse.data);
        $voice(".wikitable tbody tr").each((index, element) => {
            let title = $voice(element).find("td").text().trim().split("\n")[0];
            let text = $voice(element).find("td p").eq(1).text().trim();
            let filename = $voice(element).find("td span span audio").attr("data-mwtitle");
            let duration = $voice(element).find("td span span audio").attr("data-durationhint") + " seconds";
            let audio = "https:" + $voice(element).find("td span span audio source").attr("src");

            if (title) {
                result.voices.push({
                    title,
                    filename,
                    duration,
                    text,
                    audio
                });
            }
        });

        // Mengembalikan detail karakter dengan status true
        res.status(200).json(result);

    } catch (error) {
        console.error("Error while fetching character details:", error.message);
        res.status(500).json({
            status: false,
            error: 'Failed to fetch character details'
        });
    }
});
