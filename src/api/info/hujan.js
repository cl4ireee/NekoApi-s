const axios = require("axios");

module.exports = function (app) {
    // Endpoint untuk pencarian cuaca
    app.get("/info/cuaca", async (req, res) => {
        const { q } = req.query; // Mengambil parameter 'q' dari query string

        if (!q) {
            return res.status(400).json({ status: false, error: "Query parameter 'q' is required" });
        }

        try {
            // Mengambil data cuaca dari API
            const response = await axios.get(`https://api.siputzx.my.id/api/info/cuaca?q=${encodeURIComponent(q)}`);

            if (response.data && response.data.status) {
                const { lokasi, cuaca } = response.data.data[0]; // Mengambil data lokasi dan cuaca pertama

                // Membuat struktur hasil cuaca
                const result = {
                    lokasi: {
                        provinsi: lokasi.provinsi,
                        kotkab: lokasi.kotkab,
                        kecamatan: lokasi.kecamatan,
                        desa: lokasi.desa,
                        lon: lokasi.lon,
                        lat: lokasi.lat,
                        timezone: lokasi.timezone,
                    },
                    cuaca: cuaca.map((item) => ({
                        datetime: item[0].datetime,
                        temperature: item[0].t,
                        weather_description: item[0].weather_desc,
                        wind_direction: item[0].wd,
                        wind_speed: item[0].ws,
                        humidity: item[0].hu,
                        visibility: item[0].vs_text,
                        weather_icon: item[0].image,
                    }))
                };

                res.status(200).json({ status: true, result: result });
            } else {
                res.status(404).json({ status: false, error: "Weather data not found" });
            }
        } catch (error) {
            console.error("Error fetching weather data:", error.message);
            res.status(500).json({ status: false, error: "Failed to fetch weather data" });
        }
    });
};
