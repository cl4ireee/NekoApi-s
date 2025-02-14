const axios = require('axios');

// Menyimpan chat history
module.exports = function(app) {
    let chatHistory = [
        { role: "system", content: "Kamu adalah Neko, AI yang pintar dan ramah. Kamu dibuat dan dikembangkan oleh Claire. Kamu bisa membantu dengan menjawab berbagai pertanyaan. Ayo, mulai percakapanmu dengan Neko!" }
    ];

    // Fungsi untuk mengambil konten dari API
    async function fetchContent(content) {
        try {
            const API_URL = "https://api.siputzx.my.id/api/ai/llama33";

            // Menambahkan pesan user ke dalam chat history
            chatHistory.push({ role: "user", content });

            // Mengubah prompt agar lebih ramah dan berbicara lebih alami
            const promptText = `
                Kamu adalah Neko, asisten virtual yang cerdas dan menyenangkan. Kamu dibuat oleh Claire dan selalu siap membantu!
                Responlah dengan gaya yang santai dan tidak kaku, seperti berbicara dengan teman. Jangan ragu untuk memberikan jawaban yang sedikit kreatif dan penuh energi!
                Berikut adalah percakapan sebelumnya: ${chatHistory.map(msg => `${msg.role}: ${msg.content}`).join("\n")}
                Sekarang, pertanyaan: ${content}
            `;

            // Menambahkan chatHistory ke dalam permintaan API untuk menjaga konteks percakapan
            const response = await axios.get(API_URL, {
                params: { prompt: promptText, text: content }
            });

            const reply = response.data.data;

            // Menambahkan respon AI ke dalam chat history
            chatHistory.push({ role: "assistant", content: reply });

            // Mengembalikan hasil dari API dengan status true
            return { status: true, Neko: reply };

        } catch (error) {
            console.error("Error fetching content from API:", error);
            throw error;
        }
    }

    // Endpoint untuk menangani request ke /ai/neko
    app.get('/ai/neko', async (req, res) => {
        try {
            const { text } = req.query;
            if (!text) {
                return res.status(400).json({ status: false, error: 'Text is required' });
            }

            // Mengambil respons dari API
            const apiResponse = await fetchContent(text);

            // Kembalikan hasil dari API dengan status true
            res.status(200).json(apiResponse);

        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    });
};
