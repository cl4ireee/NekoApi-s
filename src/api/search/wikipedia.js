const fetch = require('node-fetch');

module.exports = function (app) {
    app.get('/search/wikipedia', async (req, res) => {
        try {
            const q = req.query.q;
            if (!q) {
                return res.status(400).json({ status: false, message: "Query parameter 'q' is required" });
            }

            const response = await fetch(`https://api.siputzx.my.id/api/s/wikipedia?query=${encodeURIComponent(q)}`);
            const data = await response.json();

            return res.json(data);
        } catch (error) {
            return res.status(500).json({ status: false, message: "Internal Server Error", error: error.message });
        }
    });
};
