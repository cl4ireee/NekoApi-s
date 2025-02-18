const axios = require("axios");

module.exports = function (app) {
    // Endpoint untuk mendapatkan soal Caklontong
    app.get("/games/caklontong", async (req, res) => {
        try {
            // Mengambil data dari API Caklontong
            const response = await axios.get("https://api.siputzx.my.id/api/games/caklontong");
            const result = response.data; // Mengambil data dari respons

            // Mengubah format respons sesuai dengan yang diinginkan
            const formattedResponse = {
                status: result.status,
                result: { // Mengganti 'data' menjadi 'result'
                    index: result.data.index,
                    soal: result.data.soal,
                    jawaban: result.data.jawaban,
                    deskripsi: result.data.deskripsi
                }
            };

            // Mengembalikan hasil
            res.status(200).json(formattedResponse);
        } catch (error) {
            console.error("Error fetching Caklontong data:", error.message);
            res.status(500).json({ status: false, error: "Failed to fetch Caklontong data" });
        }
    });
};
