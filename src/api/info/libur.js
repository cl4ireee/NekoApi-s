const axios = require("axios");
const cheerio = require("cheerio");

const liburSearch = async (year) => {
    try {
        const { data } = await axios.get(`https://publicholidays.co.id/id/${year}-dates/`);
        const $ = cheerio.load(data);
        const holidays = [];

        $("table.publicholidays")
            .eq(0)
            .find("tbody .even")
            .each((_, element) => {
                holidays.push({
                    date: $(element).find("td").eq(0).text(),
                    day: $(element).find("td").eq(1).text(),
                    name: $(element).find("td").eq(2).text().trim(),
                });
            });

        return { status: true, results: holidays };
    } catch (error) {
        console.error("Error fetching holiday data:", error.message);
        return { status: false, error: error.message };
    }
};

// Endpoint API untuk pencarian libur
module.exports = (app) => {
    app.get("/info/libur", async (req, res) => {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({ status: false, error: "Tahun harus diberikan!" });
        }

        const result = await liburSearch(q);

        if (!result.status) {
            return res.status(500).json({ status: false, error: result.error });
        }

        res.json(result);
    });
};
