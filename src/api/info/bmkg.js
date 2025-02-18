const axios = require("axios");

// Function to fetch data from BMKG API
async function getBMKGData() {
    try {
        const response = await axios.get("https://api.siputzx.my.id/api/info/bmkg");
        return response.data;
    } catch (error) {
        console.error("Error fetching BMKG data:", error);
        throw new Error("Failed to fetch BMKG data");
    }
}

// Directly export the setupBMKGAPI function
module.exports = async (app) => {
    app.get("/info/bmkg", async (req, res) => {
        try {
            const bmkgData = await getBMKGData();

            // Format data according to the expected structure with "results"
            const results = {
                status: true,
                results: {
                    auto: {
                        Infogempa: {
                            gempa: {
                                Tanggal: bmkgData.Infogempa.gempa.Tanggal,
                                Jam: bmkgData.Infogempa.gempa.Jam,
                                DateTime: bmkgData.Infogempa.gempa.DateTime,
                                Coordinates: bmkgData.Infogempa.gempa.Coordinates,
                                Lintang: bmkgData.Infogempa.gempa.Lintang,
                                Bujur: bmkgData.Infogempa.gempa.Bujur,
                                Magnitude: bmkgData.Infogempa.gempa.Magnitude,
                                Kedalaman: bmkgData.Infogempa.gempa.Kedalaman,
                                Wilayah: bmkgData.Infogempa.gempa.Wilayah,
                                Potensi: bmkgData.Infogempa.gempa.Potensi,
                                Dirasakan: bmkgData.Infogempa.gempa.Dirasakan,
                                Shakemap: bmkgData.Infogempa.gempa.Shakemap,
                            },
                        },
                    },
                    terkini: {
                        Infogempa: {
                            gempa: bmkgData.Infogempa.gempa_terkini.map((gempa) => ({
                                Tanggal: gempa.Tanggal,
                                Jam: gempa.Jam,
                                DateTime: gempa.DateTime,
                                Coordinates: gempa.Coordinates,
                                Lintang: gempa.Lintang,
                                Bujur: gempa.Bujur,
                                Magnitude: gempa.Magnitude,
                                Kedalaman: gempa.Kedalaman,
                                Wilayah: gempa.Wilayah,
                                Potensi: gempa.Potensi,
                            })),
                        },
                    },
                },
            };

            res.status(200).json(results); // Return 'results' as the main response
        } catch (error) {
            res.status(500).json({
                status: false,
                message: error.message,
            });
        }
    });
};
