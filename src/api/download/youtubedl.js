const axios = require('axios');
const FormData = require('form-data');

module.exports = function(app) {
    const BASE_URL = "https://www.saveyouvideo.com";
    const URL_LIST = "/get_list_formats";
    const URL_START = "/start_convert";
    const URL_QUEUE = "/query_convert_status";
    const TM = 742958;

    function getFormat(info, reso, music) {
        try {
            if (music) {
                return {
                    type: "mp3",
                    id: info.mp3[0].format_id
                };
            } else {
                switch (reso) {
                    case "720":
                        return { type: "mp4", id: info.mp4.find(v => v.height == "720").format_id };
                    case "1080":
                        return { type: "mp4", id: info.mp4.find(v => v.height == "1080").format_id };
                    case "1440":
                        return { type: "mp4", id: info.mp4.find(v => v.height == "1440").format_id };
                    case "2160":
                        return { type: "mp4", id: info.mp4.find(v => v.height == "2160").format_id };
                    default:
                        return { type: "mp4", id: info.mp4.find(v => v.height == "720").format_id };
                }
            }
        } catch {
            return null;
        }
    }

    function formData(obj) {
        const boundary = `----WebKitFormBoundary${Array.from({ length: 15 }).map(_ => "abCdEfGhIjKlMnOpQrStUvWxYZ1795".charAt(Math.random() * 30)).join("")}`;
        let data = `--${boundary}\r\nContent-Disposition: form-data; name="data"\nContent-Type: application/json\n\n${JSON.stringify(obj)}\r\n`;
        data += `--${boundary}--j`;
        return { data, boundary };
    }

    async function getInfo(url) {
        const { data, boundary } = formData({ "kw": url });
        const response = await axios.post(BASE_URL + URL_LIST, data, {
            headers: {
                "content-type": `multipart/form-data; boundary=${boundary}`
            }, 
            timeout: 10000
        });

        return response.data;
    }

    function download(info, resolusi, music = false) {
        return new Promise(async (resolve, reject) => {
            const getReso = getFormat(info, resolusi, music);
            if (getReso == null) {
                return reject("Resolusi tidak tersedia.");
            }
            const { data, boundary } = formData({ "kw": info.webpage_url, "type": getReso.type, "format_id": getReso.id });
            const response = await axios.post(BASE_URL + URL_START, data, {
                headers: {
                    "content-type": `multipart/form-data; boundary=${boundary}`
                }
            });

            const interval = setInterval(async () => {
                const queue = await axios.post(BASE_URL + URL_QUEUE, data, {
                    headers: {
                        "content-type": `multipart/form-data; boundary=${boundary}`
                    }
                });
                const jsn2 = queue.data;
                if (jsn2.progress === 100 || jsn2.state === 1) {
                    clearInterval(interval);
                    resolve({
                        status: true,
                        resolusi: resolusi,
                        videoId: `https://www.amdcdnnodea.xyz:8443/accdf/download_file/${jsn2.videoid + "_" + String(6) + (Number(getReso.id) + TM)}.mp4`
                    });
                }
            }, 2000);
        });
    }

    app.get('/download/ytdl', async (req, res) => {
        try {
            const { url, resolution = "720" } = req.query;
            if (!url) {
                return res.status(400).json({ status: false, error: 'URL is required' });
            }

            const info = await getInfo(url);
            const result = await download(info, resolution, false);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    });
            }
