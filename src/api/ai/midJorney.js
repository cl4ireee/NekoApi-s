const axios = require('axios');

const session_hash = Math.random().toString(36).slice(2);
const negativePrompt = "(deformed iris, deformed pupils, semi-realistic, cgi, 3d, render, sketch, cartoon, drawing, anime:1.4), text, close up, cropped, out of frame, worst quality, low quality, jpeg artifacts, ugly, duplicate, morbid, mutilated, extra fingers, mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed, blurry, dehydrated, bad anatomy, bad proportions, extra limbs, cloned face, disfigured, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, fused fingers, too many fingers, long neck";
const models = ["Anime", "Photo", "Cinematic", "3D Model"];

const midjourney = {
    request: async (text, model) => {
        const data = JSON.stringify({
            "data": [
                text, // Ganti dari prompt ke text
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
            data: data,
            timeout: 30000 // Timeout 30 detik
        };

        try {
            const response = await axios.request(config);
            return response.data;
        } catch (error) {
            console.error("Error requesting image:", error.message);
            throw new Error("Failed to request image");
        }
    },

    cekStatus: async () => {
        let attempts = 0;
        const maxAttempts = 20; // Tambah batas polling
        const delay = 5000; // Delay 5 detik per polling

        while (attempts < maxAttempts) {
            try {
                const response = await axios.get(`https://mukaist-midjourney.hf.space/queue/data?session_hash=${session_hash}`, {
                    timeout: 10000
                });

                if (response.data.msg === "process_completed") {
                    return response.data;
                } else if (response.data.msg === "error") {
                    throw new Error("Error processing image");
                }

                await new Promise(resolve => setTimeout(resolve, delay));
            } catch (error) {
                console.error("Error checking status:", error.message);
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
            console.error("Error:", error.message);
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
