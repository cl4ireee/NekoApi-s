const axios = require("axios");
const cheerio = require("cheerio");

module.exports = function(app) {
    app.get("/info/libur", async (req, res) => {
        const q = req.query.q;

        if (!q) {
            return res.status(400).json({ error: "Tahun harus diberikan!" });
        }

        try {
            let { data } = await axios.get(`https://publicholidays.co.id/id/${q}-dates/`);
            let $ = cheerio.load(data);
            let holidays = [];

            $("table.publicholidays")
                .eq(0)
                .find("tbody .even")
                .each((a, i) => {
                    holidays.push({
                        date: $(i).find("td").eq(0).text(),
                        day: $(i).find("td").eq(1).text(),
                        name: $(i).find("td").eq(2).text().trim(),
                    });
                });

            return res.status(200).json(holidays);
        } catch (error) {
            console.error("Error fetching holiday data:", error);
            return res.status(500).json({ error: "Gagal mengambil data libur." });
        }
    });
};
