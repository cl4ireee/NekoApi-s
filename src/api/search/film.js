const axios = require('axios');

/**
 * Fungsi untuk mengatur API pencarian film
 * @param {Object} app - Objek aplikasi
 */
module.exports = function (app) {
    // Endpoint untuk mencari film
    app.get('/search/film', async (req, res) => {
        const { q } = req.query; // Mengambil nama film dari query string

        if (!q) {
            return res.status(400).json({ error: "Mau cari film apa?" });
        }

        try {
            const response = await axios.get(
                `https://fastrestapis.fasturl.cloud/search/film?name=${encodeURIComponent(q)}&limit=5`
            );

            if (response.status === 200) {
                const data = response.data.result.results; // Struktur data yang benar

                if (data && Array.isArray(data)) {
                    let teks = "";
                    data.forEach((item) => {
                        item.hits.forEach((film) => {
                            teks +=
                                `Judul: ${film.title}\n` +
                                `Deskripsi: ${film.overview}\n` +
                                `Tanggal Rilis: ${film.release_date}\n` +
                                `Durasi: ${film.runtime} menit\n` +
                                `Rating: ${film.vote_average}/10\n` +
                                `Genre: ${film.genres.join(", ")}\n` + // Ambil genre
                                `Penyedia: ${film.provider_names.join(", ")}\n` + // Penyedia
                                `Pemain: ${film.cast
                                    .map((actor) => `${actor.name} sebagai ${actor.character}`)
                                    .join(", ")}
` + // Cast
                                `Sutradara: ${film.crew
                                    .filter((person) => person.job === "Director")
                                    .map((director) => director.name)
                                    .join(", ")}
` + // Sutradara
                                `Popularitas: ${film.popularity}
` + // Popularitas
                                `IMDB ID: ${film.external_ids.imdb_id}\n\n`; // Mengambil IMDB ID
                        });
                    });

                    res.status(200).json({ status: true, results: teks });
                } else {
                    res.status(404).json({ status: false, message: "Data tidak ditemukan" });
                }
            } else {
                res.status(response.status).json({ status: false, message: `Error ${response.status}: ${response.statusText}` });
            }
        } catch (err) {
            console.error(err);
            res.status(500).json({ status: false, message: "Hadehhh error" });
        }
    });
};
