const fetch = require("node-fetch");

const kamu3 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36";

function halahMbuh() {
    var entahlah = Math.round((Math.random() * 100000000000)) + "";
    var IntinyaInti = function() {
        for (var kntl = [], mmk = 0; 64 > mmk; )
            kntl[mmk] = 0 | 4294967296 * Math.sin(++mmk % Math.PI);
        return function(jmbt) {
            var puki, halah, iwak, ayam = [puki = 1732584193, halah = 4023233417, ~puki, ~halah], rizky = [], iyadeh = unescape(encodeURI(jmbt)) + "\u0080", bngst = iyadeh.length;
            jmbt = --bngst / 4 + 2 | 15;
            for (rizky[--jmbt] = 8 * bngst; ~bngst; )
                rizky[bngst >> 2] |= iyadeh.charCodeAt(bngst) << 8 * bngst--;
            for (mmk = iyadeh = 0; mmk < jmbt; mmk += 16) {
                for (bngst = ayam; 64 > iyadeh; bngst = [iwak = bngst[3], puki + ((iwak = bngst[0] + [puki & halah | ~puki & iwak, iwak & puki | ~iwak & halah, puki ^ halah ^ iwak, halah ^ (puki | ~iwak)][bngst = iyadeh >> 4] + kntl[iyadeh] + ~~rizky[mmk | [iyadeh, 5 * iyadeh + 1, 3 * iyadeh + 5, 7 * iyadeh][bngst] & 15]) << (bngst = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21][4 * bngst + iyadeh++ % 4]) | iwak >>> -bngst), puki, halah])
                    puki = bngst[1] | 0,
                    halah = bngst[2];
                for (iyadeh = 4; iyadeh; )
                    ayam[--iyadeh] += bngst[iyadeh]
            }
            for (jmbt = ""; 32 > iyadeh; )
                jmbt += (ayam[iyadeh >> 3] >> 4 * (1 ^ iyadeh++) & 15).toString(16);
            return jmbt.split("").reverse().join("")
        }
    }();
    return 'tryit-' + entahlah + '-' + IntinyaInti(kamu3 + IntinyaInti(kamu3 + IntinyaInti(kamu3 + entahlah + 'suditya_is_a_smelly_hacker')));
}

const DeepAI = {
    async image(q) {
        const body = `------WebKitFormBoundaryNm9NAbhIVIsN9Vn6\r\nContent-Disposition: form-data; name="text"\r\n\r\n${q}\r\n------WebKitFormBoundaryNm9NAbhIVIsN9Vn6\r\nContent-Disposition: form-data; name="image_generator_version"\r\n\r\nhd\r\n------WebKitFormBoundaryNm9NAbhIVIsN9Vn6\r\nContent-Disposition: form-data; name="use_old_model"\r\n\r\nfalse\r\n------WebKitFormBoundaryNm9NAbhIVIsN9Vn6\r\nContent-Disposition: form-data; name="turbo"\r\n\r\ntrue\r\n------WebKitFormBoundaryNm9NAbhIVIsN9Vn6\r\nContent-Disposition: form-data; name="genius_preference"\r\n\r\nclassic\r\n------WebKitFormBoundaryNm9NAbhIVIsN9Vn6--\r\n`;
        return this.kerjakan(body, 'api/text2img');
    },
    async video(q) {
        const body = `------WebKitFormBoundaryIgjn20k3Xs6BtvkS\r\nContent-Disposition: form-data; name=\"textPrompt\"\r\n\r\n${q}\r\n------WebKitFormBoundaryIgjn20k3Xs6BtvkS\r\nContent-Disposition: form-data; name=\"dimensions\"\r\n\r\n{\"width\":1024,\"height\":1024}\r\n------WebKitFormBoundaryIgjn20k3Xs6BtvkS--\r\n`;
        return this.kerjakan(body, 'generate_video');
    },
    async kerjakan(body, kesini) {
        try {
            const inidia = halahMbuh();
            const response = await fetch("https://api.deepai.org/" + kesini, {
                method: "POST",
                headers: {
                    "accept": "*/*",
                    "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
                    "api-key": inidia,
                    "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryNm9NAbhIVIsN9Vn6",
                    "user-agent": kamu3,
                    "sec-ch-ua": '"Not A(Brand";v="8", "Chromium";v="132"',
                    "sec-ch-ua-mobile": "?1",
                    "sec-ch-ua-platform": '"Android"',
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-site",
                    "cookie": "user_sees_ads=false"
                },
                referrerPolicy: "same-origin",
                body: body
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error disaat ngegeneret:", error);
            return null;
        }
    }
};

// Ekspor fungsi untuk digunakan dengan `app.get`
module.exports = function (app) {
    // Route untuk generate gambar
    app.get("/ai/deepai-image", async (req, res) => {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({ status: false, error: "Query parameter (q) is required" });
        }

        try {
            const results = await DeepAI.image(q);
            res.status(200).json({ status: true, results });
        } catch (error) {
            console.error("Error generating image:", error.message);
            res.status(500).json({ status: false, error: "Failed to generate image" });
        }
    });

    // Route untuk generate video
    app.get("/ai/deepai-video", async (req, res) => {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({ status: false, error: "Query parameter (q) is required" });
        }

        try {
            const results = await DeepAI.video(q);
            res.status(200).json({ status: true, results });
        } catch (error) {
            console.error("Error generating video:", error.message);
            res.status(500).json({ status: false, error: "Failed to generate video" });
        }
    });
};
