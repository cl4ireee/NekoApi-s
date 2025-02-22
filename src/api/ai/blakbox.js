const axios = require('axios');

async function fetchBlackboxAI(text) { // Ganti parameter `prompt` menjadi `text`
    const url = 'https://www.blackbox.ai/api/chat';
    const headers = {
        'authority': 'www.blackbox.ai',
        'accept': '*/*',
        'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        'content-type': 'application/json',
        'origin': 'https://www.blackbox.ai',
        'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36'
    };

    const data = {
        "messages": [{ "role": "user", "content": text, "id": "54lcaEJ" }], // Ganti `prompt` menjadi `text`
        "agentMode": {},
        "id": "RDyqb0u",
        "previewToken": null,
        "userId": null,
        "codeModelMode": true,
        "trendingAgentMode": {},
        "isMicMode": false,
        "userSystemPrompt": null,
        "maxTokens": 1024,
        "playgroundTopP": null,
        "playgroundTemperature": null,
        "isChromeExt": false,
        "githubToken": "",
        "clickedAnswer2": false,
        "clickedAnswer3": false,
        "clickedForceWebSearch": false,
        "visitFromDelta": false,
        "isMemoryEnabled": false,
        "mobileClient": false,
        "userSelectedModel": null,
        "validated": "00f37b34-a166-4efb-bce5-1312d87f2f94",
        "imageGenerationMode": false,
        "webSearchModePrompt": true,
        "deepSearchMode": false,
        "domains": null,
        "vscodeClient": false,
        "codeInterpreterMode": false,
        "customProfile": {
            "name": "",
            "occupation": "",
            "traits": [],
            "additionalInfo": "",
            "enableNewChats": false
        },
        "session": null,
        "isPremium": false,
        "subscriptionCache": null,
        "beastMode": false
    };

    try {
        const response = await axios({
            method: 'post',
            url: url,
            headers: headers,
            data: data,
            responseType: 'stream'
        });

        let output = '';
        let search = [];

        return new Promise((resolve, reject) => {
            response.data.on('data', chunk => {
                const chunkStr = chunk.toString();
                output += chunkStr;

                const match = output.match(/\$~~~\$(.*?)\$~~~\$/);
                if (match) {
                    search = JSON.parse(match[1]);
                    const text = output.replace(match[0], '');
                    output = text.split('\n\n\n\n')[1];
                }
            });

            response.data.on('end', () => {
                resolve({ search, text: output.replace('**', '*').trim() });
            });

            response.data.on('error', err => {
                reject(err);
            });
        });
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

module.exports = function setupBlackboxAIRoute(app) {
    app.get('/ai/blackbox-ai', async (req, res) => {
        const { text } = req.query; // Ganti `prompt` menjadi `text`

        if (!text) {
            return res.status(400).json({ status: false, message: 'Parameter "text" harus disediakan.' });
        }

        try {
            const result = await fetchBlackboxAI(text); // Ganti `prompt` menjadi `text`
            res.json({ status: true, results: result });
        } catch (error) {
            res.status(500).json({ status: false, message: 'Terjadi kesalahan saat mengambil data dari Blackbox AI.' });
        }
    });
};
