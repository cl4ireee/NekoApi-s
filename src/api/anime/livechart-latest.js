const axios = require('axios');
const cheerio = require('cheerio');

/*
*[!] SCRAPER LIVECHART*
👤 *author* : celci/catozolala
📮 *wm* : https://whatsapp.com/channel/0029VaVKIxBKQuJK32uAi33W
// wm sama author jangan di hapus
*/

// Fungsi scraper untuk mengambil data terbaru dari Livechart
async function livechartlatest() {
    return new Promise((resolve, reject) => {
        const abc = "https://www.livechart.me";
        try {
            axios.get(abc).then(({ data }) => {
                const $ = cheerio.load(data);
                const catoz = [];

                $('div[class="anime-card"]').each((a, b) => {
                    const o = $(b).find("img").attr("src");
                    const g = $(b).find("img").attr("alt");
                    const x = $(b).find(".poster-container").children(".episode-countdown").text();
                    const m = $(b).find('.anime-info').children(".anime-studios").text();
                    const h = $(b).find(".anime-synopsis").text();
                    const j = $(b).find(".anime-extras").text();
                    const w = $(b).find(".anime-info").text();
                    const f = $(b).find(".anime-tags li").map((i, el) => $(el).text()).get().join(" ");
                    const q = "scraper-by catozolala";
                    const u = $(b).find(`h3.main-title`).children("a").attr('href');

                    catoz.push({
                        author: q,
                        image: o,
                        title: g,
                        eps: x,
                        studio: m,
                        synopsis: h,
                        bintang: j,
                        inforilis: w,
                        tags: f,
                        link: abc + u
                    });
                });
                resolve({ status: true, result: catoz });
            });
        } catch (error) {
            console.error('Error:', error);
            resolve({ status: false, result: error.message });
        }
    });
}

// Fungsi API menggunakan app.get tanpa mengimpor Express secara langsung
const LivechartAPI = (app) => {
    // Endpoint untuk mengambil data anime terbaru dari Livechart
    app.get('/anime/livechart-latest', async (req, res) => {
        const latestData = await livechartlatest();
        res.json(latestData);
    });
}

module.exports = LivechartAPI;
