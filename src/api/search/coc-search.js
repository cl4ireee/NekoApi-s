const axios = require("axios");
const cheerio = require("cheerio");

module.exports = (app) => {
    // Fungsi untuk mengambil data base TH Clash of Clans
    const cocTh = async (thLevel) => {
        try {
            let { data } = await axios.get(`https://clashofclans-layouts.com/plans/th_${thLevel}/`);
            let $ = cheerio.load(data);

            let categories = [];
            $(".select_base_type a").each((_, el) => {
                let href = $(el).attr("href");
                let name = $(el).text().trim();
                if (href && name) categories.push({ name, url: `https://clashofclans-layouts.com${href}` });
            });

            let tags = [];
            $(".tags_block a").each((_, el) => {
                let href = $(el).attr("href");
                let name = $(el).text().trim();
                if (href && name) tags.push({ name, url: `https://clashofclans-layouts.com${href}` });
            });

            let bases = [];
            $(".base_grid_item").each((_, el) => {
                let link = $(el).find("a").attr("href");
                let title = $(el).find("a").attr("title");
                let img = $(el).find(".base_grid_img").attr("src");
                let views = $(el).find(".views_block_mg div").text().trim();

                if (link && title && img) {
                    bases.push({
                        title,
                        url: `https://clashofclans-layouts.com${link}`,
                        img: `https://clashofclans-layouts.com${img}`,
                        views
                    });
                }
            });

            return { status: true, categories, tags, bases };
        } catch (error) {
            console.error("Error fetching data:", error.message);
            return { status: false, error: error.message };
        }
    };

    // Endpoint API untuk mengambil layout berdasarkan Town Hall
    app.get("/search/coc-th", async (req, res) => {
        const { th } = req.query;

        if (!th) {
            return res.status(400).json({ status: false, error: "Town Hall level diperlukan" });
        }

        const result = await cocTh(th);

        if (!result.status) {
            return res.status(500).json({ status: false, error: result.error });
        }

        res.json(result);
    });
};
