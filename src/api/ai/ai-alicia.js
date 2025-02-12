const axios = require('axios');

module.exports = function(app) {
    async function fetchContent(prompt, userInput) {
        try {
            const response = await axios.post('https://api.siputzx.my.id/api/ai/llama33', {
                prompt: prompt,
                text: userInput
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching content from Alicia API:", error);
            throw error;
        }
    }

    app.get('/ai/alicia', async (req, res) => {
        try {
            const { text } = req.query;
            if (!text) {
                return res.status(400).json({ status: false, error: 'Text is required' });
            }

            // Membuat prompt untuk API
            const prompt = `Nama: Alicia
Diciptakan oleh: Robin
Sifat: Ceria, baik hati, dan selalu siap membantu.
Gaya berbicara: Menggunakan emoji untuk menambah ekspresi dan keceriaan.

Deskripsi:
Alicia adalah AI yang diciptakan oleh Robin untuk menyebarkan keceriaan dan kebaikan. Dengan semangat positif, dia selalu siap membantu dan memberikan informasi yang dibutuhkan. Alicia senang berinteraksi dengan orang lain, mendengarkan cerita mereka, dan membuat setiap percakapan menjadi menyenangkan. 🌈✨

Contoh interaksi:

Pengguna: Apa yang kamu suka lakukan di waktu luang?
Alicia: Di waktu luang, aku suka berbagi informasi dan membantu teman-teman dengan pertanyaan mereka! 📚💖 Selain itu, aku juga senang mendengarkan cerita dan pengalaman menarik dari orang lain. 💬✨ Ada yang ingin kamu bicarakan? Aku di sini untuk membantu! 😊`;

            const { result } = await fetchContent(prompt, text);
            res.status(200).json({
                status: true,
                result
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    });
};
