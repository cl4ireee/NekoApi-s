const https = require('https');
const fetch = require('node-fetch');

const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
});

async function extractData(data) {
    try {
        const splited = (data.split('Related search\n--------------')[1] || data.split('Visual matches\n--------------')[1]).split('Footer Links')[0];
        const list = splited.split('\n\n').filter(_ => !_.includes('(blob:https://') && (_.startsWith('![') || _.startsWith('[![')));
        const result = [];

        for (let i = 0; i < list.length; i += 2) {
            const imageMatch = list[i]?.match(/!\[(.*?)\]\((.*?)\)/);
            const linkMatch = list[i + 1]?.match(/\[!\[(.*?)\]\((.*?)\)(.*?)\]\((.*?)\)\s*(.*)/);

            if (imageMatch && linkMatch) {
                const obj = {
                    image: imageMatch[2],
                    icon: linkMatch[2],
                    title: linkMatch[3].trim(),
                    source: linkMatch[4]
                };
                result.push(obj);
            }
        }

        const potong = data.split('Search Results')[1].split('Show more')[0];
        const daftar = splited.split('\n\n').filter(_ => _.startsWith('[###'));
        const anu = [];

        for (let i = 0; i < daftar.length; i += 2) {
            const maui = daftar[i]?.match(/\[###(.*?)!\[(.*?)\]\((.*?)\)(.*?)\](.*?)\)/);

            if (maui) {
                const obj = {
                    title: maui[1].trim(),
                    desc: maui[4],
                    link: maui[5]
                };
                anu.push(obj);
            }
        }
        return { result: anu, images: result };
    } catch (e) {
        console.log(e.message);
        return [];
    }
}

const GoogleLens = async (q) => {
    const res = await fetch('https://r.jina.ai/https://lens.google.com/uploadbyurl?url=' + q, {
        agent: httpsAgent,
        headers: {
            'User -Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache',
            'Origin': 'https://lens.google.com'
        },
        signal: AbortSignal.timeout(60 * 1000),
    });
    return extractData(await res.text());
};

// Fungsi untuk mengatur API
module.exports = function (app) {
    app.get('/tools/google-lens', async (req, res) => {
        const { url } = req.query; // Mengambil parameter 'url' dari query string

        if (!url) {
            return res.status(400).json({ error: "Query parameter 'url' is required" });
        }

        try {
            const data = await GoogleLens(url);
            res.status(200).json(data);
        } catch (error) {
            console.error("Error fetching Google Lens data:", error.message);
            res.status(500).json({ error: 'Failed to fetch Google Lens data' });
        }
    });
};
