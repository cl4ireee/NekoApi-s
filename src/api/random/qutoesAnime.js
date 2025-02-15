const axios = require("axios");

async function fetchAnimeQuote() {
    try {
        const URI = "https://jg160007-api.vercel.app/random-quotes-anime/select/random";
        const { data } = await axios.get(URI);
        return data;
    } catch (error) {
        return { error: error.message };
    }
}

module.exports = function (app) {
    app.get("/qutos/anime", async (req, res) => {
        try {
            const quote = await fetchAnimeQuote();
            res.status(200).json({
                status: true,
                result: quote
            });
        } catch (error) {
            console.error("Error fetching anime quote:", error.message);
            res.status(500).json({ status: false, error: "Failed to fetch anime quote" });
        }
    });
};
