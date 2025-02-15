import WebSocket from 'ws';
import axios from 'axios';

export default function (app) {
    app.get('/api/s2c', async (req, res) => {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({ status: false, error: 'URL is required' });
        }

        try {
            const imageBuffer = await downloadImage(url);
            const { description, code } = await sendImageToWebSocket(imageBuffer);

            res.status(200).json({
                status: true,
                description,
                code
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ status: false, error: error.message });
        }
    });
}

// Fungsi untuk mengunduh gambar dari URL
async function downloadImage(imageUrl) {
    try {
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        return Buffer.from(response.data);
    } catch (error) {
        throw new Error(`Gagal mengunduh gambar: ${error.message}`);
    }
}

// Fungsi untuk mengirim gambar ke WebSocket dan mendapatkan kode HTML
async function sendImageToWebSocket(imageBuffer) {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket('wss://screenshot-to-code-xe2d.onrender.com/generate-code');
        let collectedText = '';
        let finalCode = '';

        ws.on('open', () => {
            const base64Image = imageBuffer.toString('base64');
            const data = {
                generationType: "create",
                image: `data:image/jpeg;base64,${base64Image}`,
                inputMode: "image",
                openAiApiKey: null,
                openAiBaseURL: null,
                anthropicApiKey: null,
                screenshotOneApiKey: null,
                isImageGenerationEnabled: true,
                editorTheme: "cobalt",
                generatedCodeConfig: "html_tailwind",
                codeGenerationModel: "gpt-4o-2024-05-13",
                isTermOfServiceAccepted: false
            };
            ws.send(JSON.stringify(data));
        });

        ws.on('message', (message) => {
            const response = JSON.parse(message.toString());
            if (response.type === 'chunk') collectedText += response.value;
            if (response.type === 'setCode') finalCode = response.value;
        });

        ws.on('close', () => resolve({ 
            description: collectedText.trim(), 
            code: finalCode.trim() 
        }));

        ws.on('error', (error) => reject(error));
    });
}
