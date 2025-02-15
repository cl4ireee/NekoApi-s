import axios from "axios";

const fetchPixiv = async (q) => {
    try {
        const URI = `https://api.rynn-archive.biz.id/search/pixiv?q=${encodeURIComponent(q)}`;
        const { data } = await axios.get(URI);

        // Pastikan response memiliki struktur yang diharapkan
        if (data && Array.isArray(data.result)) {
            return { status: true, results: data.result };
        } else {
            return { status: false, error: "Invalid response format from API" };
        }
    } catch (error) {
        console.error("Error fetching Pixiv data:", error.message);
        return { status: false, error: "Failed to fetch Pixiv data" };
    }
};

export default function (app) {
    app.get("/search/pixiv", async (req, res) => {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({ status: false, error: "Query parameter (q) is required" });
        }

        const response = await fetchPixiv(q);

        if (!response.status) {
            return res.status(500).json(response);
        }

        res.status(200).json(response);
    });
}
