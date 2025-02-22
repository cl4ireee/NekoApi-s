const axios = require("axios");

const BASE = "https://channelmonetizationcheck.net/";
const API = "https://api.channelmonetizationcheck.net/api/";
const REG_EXP = /<script\s?src\=['"](\/_next\/static\/chunks\/\d+-?\w+\.js)['"]\s?defer\=['"]+><\/script>/ig;
const REG_API = /\w+-\w+-\w+-\w+-\w+/i;

async function _req({ url, method = "GET", params = null }) {
    const options = {
        url: url,
        method: method,
        params: params,
        timeout: 30_000,
        validateStatus: (status) => {
            return status <= 500;
        }
    };
    const res = await axios.request(options);
    return res;
}

async function _initApiKey() {
    let result = null;

    const res = await _req({
        url: BASE,
        method: "GET"
    });
    let reg = [...res.data.matchAll(REG_EXP)];
    if (!reg) {
        console.log("[ ERROR ] Token not found");
    }
    reg = reg.reverse();
    for (let v of reg) {
        const res2 = await _req({
            url: BASE + v[1],
            method: "GET"
        });
        let mat = res2.data.match(REG_API);
        if (mat) {
            result = mat[0];
            break;
        }
    }
    if (result == null) {
        console.log("[ ERROR ] Token not found");
    }

    return result;
}

function _parseChannelID(url) {
    const uri = new URL(url.trim());
    if (!uri.host.match(/^(?:www.)?(youtube.com|youtu.be)/)) {
        console.log("[ ERROR ] Invalid Host");
        return null;
    }
    const path = uri.pathname.split("/").filter(flr => flr);
    if (path[0] === "shorts") {
        return {
            type: "video/shorts",
            data: {
                videoId: path[1]
            }
        };
    } else if (path[0] === "watch") {
        const urlr = uri.searchParams.get("v");
        if (!urlr) {
            console.log("[ ERROR ] Invalid Url");
            return null;
        }
        return {
            type: "video/normal",
            data: {
                videoId: urlr
            }
        };
    } else if (path[0] === "channel") {
        const chId = path[1];
        if (!chId) {
            console.log("[ ERROR ] Invalid Url");
            return null;
        }
        return {
            type: "channel",
            data: {
                channelId: chId
            }
        };
    } else {
        console.log("[ ERROR ] Invalid Url");
        return null;
    }
}

async function Monetization(url) {
    console.log("[ KEY ] Init...");
    const apiKey = await _initApiKey();
    console.log("[ ID ] Parse...");
    const data = _parseChannelID(url);
    if (!data) return null;

    console.log("[ GET ] Request...");
    let res = await _req({
        url: API + data.type,
        params: data.data,
        method: "GET"
    });

    return res.data;
}

// Fungsi untuk mengatur rute API
module.exports = function setupMonetizationRoute(app) {
    app.get('/tools/monet', async (req, res) => {
        const { url } = req.query; // Mengambil url dari parameter query
        if (!url) {
            return res.status(400).json({ status: false, message: 'Url harus disediakan.' });
        }

        try {
            const monetizationData = await Monetization(url);
            res.json({ status: true, results: monetizationData });
        } catch (error) {
            res.status(500).json({ status: false, message: 'Terjadi kesalahan saat mengambil data monetisasi.' });
        }
    });
};
