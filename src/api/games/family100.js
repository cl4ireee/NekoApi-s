const axios = require("axios");

module.exports = function (app) {
    // Endpoint untuk mendapatkan soal dari API Family 100
    app.get("/games/family100", async (req, res) => {
        try {
            // Mengambil data dari API Family 100
            const response = await axios.get("https://api.siputzx.my.id/api/games/family100");
            const result = response.data; // Mengambil data dari respons

            // Mengubah format respons sesuai dengan yang diinginkan
            const formattedResponse = {
                status: result.status,
                result: { // Mengganti 'data' menjadi 'result'
                    soal: result.data.soal,
                    jawaban: result.data.jawaban
                }
            };

            // Mengembalikan hasil
            res.status(200).json(formattedResponse);
        } catch (error) {
            console.error("Error fetching Family 100 data:", error.message);
            res.status(500).json({ status: false, error: "Failed to fetch Family 100 data" });
        }
    });
};
