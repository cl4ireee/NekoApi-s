// lovetikRoutes.js
const fetch = require('node-fetch');

const LoveTik = {
    async dapatkan(url) {
        const response = await fetch('https://lovetik.com/api/ajax/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            },
            body: `query=${encodeURIComponent(url)}`
        });
        
        const data = await response.json();
        if(!data.images) data.images = [];
        const result = {
            video: [],
            audio: []
        };
        
        data.links.forEach(item => {
            if(!item.a) return;
            const formatted = {
                format: item.t.replace(/<.*?>|♪/g, '').trim(), // Menghapus tag HTML dan tanda ♪
                resolution: item.s || 'Audio Only',
                link: item.a
            };
        
            if (item.ft == 1) {
                result.video.push(formatted);
            } else {
                result.audio.push(formatted);
            }
        });
        data.render = async ()=>{
            const rendered = await fetch('https://lovetik.com/api/ajax/convert', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                },
                body: `c_data=${encodeURIComponent(data.links.filter(m=>m.c)[0].c)}`
            });
            return rendered.json();
        }
        return {...data, ...result};
    }
};

module.exports = function (app) {
    // Route untuk /download menggunakan GET
    app.get('/download/tiktok-download', async (req, res) => {
        try {
            const { url } = req.query; // Ambil URL dari query parameter
            if (!url) {
                return res.status(400).json({ error: 'URL is required' });
            }

            const result = await LoveTik.dapatkan(url);
            const responseData = {
                video: result.video,
                audio: result.audio,
                images: result.images
            };

            if (result.images) {
                const slides = await result.render();
                responseData.slideshow = slides;
            }

            res.json(responseData);
        } catch (error) {
            console.error('Terjadi kesalahan:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
};
