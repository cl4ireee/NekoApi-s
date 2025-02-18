const fetch = require('node-fetch');

module.exports = function (app) {
    app.get('/ai/blackboxai-pro', async (req, res) => {
        try {
            const q = req.query.q;
            if (!q) {
                return res.status(400).json({ status: false, message: "Query parameter 'q' is required" });
            }

            const response = await fetch(`https://api.siputzx.my.id/api/ai/blackboxai-pro?content=${encodeURIComponent(q)}`);
            const data = await response.json();

            // Ubah key 'data' menjadi 'results'
            const modifiedData = {
                status: data.status,
                results: data.data
            };

            return res.json(modifiedData);
        } catch (error) {
            return res.status(500).json({ status: false, message: "Internal Server Error", error: error.message });
        }
    });
};
