const axios = require('axios');

const session_hash = Math.random().toString(36).slice(2);
const negativePrompt = "(deformed iris, deformed pupils, semi-realistic, cgi, 3d, render, sketch, cartoon, drawing, anime:1.4), text, close up, cropped, out of frame, worst quality, low quality, jpeg artifacts, ugly, duplicate, morbid, mutilated, extra fingers, mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed, blurry, dehydrated, bad anatomy, bad proportions, extra limbs, cloned face, disfigured, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, fused fingers, too many fingers, long neck";
const models = ["Anime", "Photo", "Cinematic", "3D Model"];

const midjourney = {
    request: async (text, model) => {
        const data = JSON.stringify({
            "data": [
                text,
                negativePrompt,
                true,
                model,
                0,
                1024,
                1024,
                6,
                true
            ],
            "event_data": null,
            "fn_index": 3,
            "trigger_id": 6,
            "session_hash": session_hash
        });

        const config = {
            method: 'POST',
            url: 'https://mukaist-midjourney.hf.space/queue/join?__theme=system',
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Content-Type': 'application/json'
            },
            data: data
        };

        const response = await axios.request(config);
        return response.data;
    },

    cekStatus: async () => {
        let attempts = 0;
        const maxAttempts = 10; // Batasi polling agar tidak infinite loop

        while (attempts < maxAttempts) {
            try {
                const response = await axios.get(`https://mukaist-midjourney.hf.space/queue/data?session_hash=${session_hash}`);

                if (response.data.msg === "process_completed") {
                    return response.data;
                } else if (response.data.msg === "error") {
                    throw new Error("Error processing image");
                }

                // Tunggu 3 detik sebelum polling lagi
                await new Promise(resolve => setTimeout(resolve, 3000));
            } catch (error) {
                console.error("Error checking status:", error);
                return { status: false, message: "Failed to check image status" };
            }

            attempts++;
        }

        return { status: false, message: "Image processing timeout" };
    },

    create: async (text, model) => {
        try {
            await midjourney.request(text, model);
            const statusResponse = await midjourney.cekStatus();
            return { status: true, result: statusResponse };
        } catch (error) {
            console.error("Error:", error);
            return { status: false, message: "Failed to generate image" };
        }
    }
};

// Fungsi untuk menambahkan API ke objek `app`
module.exports = (app) => {
    app.get('/ai/midjourney', async (req, res) => {
        const { text, model } = req.query;

        if (!text || !model) {
            return res.status(400).json({ status: false, message: 'Parameter "text" dan "model" diperlukan.' });
        }

        if (!models.includes(model)) {
            return res.status(400).json({ status: false, message: `Model tidak valid. Pilih salah satu: ${models.join(', ')}` });
        }

        const result = await midjourney.create(text, model);
        res.json(result);
    });
};
