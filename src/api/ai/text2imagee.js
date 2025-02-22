const fetch = require('node-fetch'); // Tambahkan node-fetch

async function GenerateImg(text, ntext = '', opt = {}) {
    const r1 = await fetch(`https://image-generation.perchance.org/api/verifyUser?thread=1&__cacheBust=${Math.random()}`);
    const d1 = await r1.json();

    const id = Math.random();
    const r2 = await fetch(`https://image-generation.perchance.org/api/generate?text=${text}&seed=${opt.seed || -1}&resolution=${opt.size || '512x768'}&guidanceScale=${opt.guidance || 7}&negativePrompt=${ntext}&channel=ai-text-to-image-generator&subChannel=public&userKey=${d1.userKey}&adAccessCode=&requestId=${id}&__cacheBust=${Math.random()}`, { 
        method: 'POST' 
    });
    const d2 = await r2.json();

    for (let i = 0; i < 3; i++) {
        const r3 = await fetch(`https://image-generation.perchance.org/api/getUserQueuePosition?userKey=${d1.userKey}&requestId=${id}&__cacheBust=${Math.random()}`);
        const d3 = await r3.json();
        if (d3.status === 'success' && d3.total === 6) break;
    }

    const url = `https://image-generation.perchance.org/api/downloadTemporaryImage?imageId=${d2.imageId}`;
    return { url, ...d2, userKey: d1.userKey };
}

module.exports = function setupImageGenerationRoute(app) {
    app.get('/ai/generate-image', async (req, res) => {
        const { text, ntext, seed, size, guidance } = req.query;
        if (!text) {
            return res.status(400).json({ status: false, message: 'Prompt harus disediakan.' });
        }

        try {
            const imageData = await GenerateImg(text, ntext || '', {
                seed: seed ? parseInt(seed) : undefined,
                size: size || '512x768',
                guidance: guidance ? parseFloat(guidance) : 7
            });

            res.json({ status: true, results: imageData });
        } catch (error) {
            res.status(500).json({ status: false, message: 'Terjadi kesalahan saat menghasilkan gambar.', error: error.message });
        }
    });
};
