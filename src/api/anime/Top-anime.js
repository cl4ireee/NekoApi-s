const axios = require('axios');

async function TopAnime() {
    const url = 'https://www.anitrendz.com/charts/top-anime';
    try {
        const { data } = await axios.get(url);
        const jsonMatch = data.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);

        if (!jsonMatch) {
            throw new Error("JSON data tidak ditemukan!");
        }

        const jsonData = JSON.parse(jsonMatch[1]);
        const animeList = jsonData.props.pageProps.charts[0].choices.map(anime => ({
            rank: anime.position,
            title: anime.name,
            altTitle: anime.nameAlt,
            studio: anime.subText,
            image: anime.images.full,
            peak: anime.peak,
            lastPosition: anime.previously,
            weeksOnChart: anime.weeksAtTopTen
        }));

        return animeList;
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

// Mengganti fungsi setupAnimeRoute menjadi module.exports
module.exports = function setupAnimeRoute(app) {
    app.get('/anime/top-anime', async (req, res) => {
        const animeList = await TopAnime();
        res.json({ success: true, data: animeList });
    });
};
