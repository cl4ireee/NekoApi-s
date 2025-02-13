const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());

app.post('/tools/cloneweb', async (req, res) => {
    const { url } = req.body;

    // Memeriksa apakah URL disediakan
    if (!url) {
        return res.status(400).json({ status: false, message: 'Please provide a link!' });
    }

    try {
        const result = await SaveWeb2zip(url);
        if (!result) {
            return res.status(500).json({ status: false, message: 'Error downloading the file.' });
        }

        // Mengatur header untuk mengunduh file ZIP
        res.set({
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="${result.fileName}"`,
            'Content-Length': result.buffer.byteLength
        }).send(Buffer.from(result.buffer));
    } catch (e) {
        console.error('Error in cloneweb function:', e); // Log error for debugging
        res.status(500).json({ status: false, message: `Error: ${e.message}` });
    }
});

const SaveWeb2zip = async (link) => {
    const apiUrl = "https://copier.saveweb2zip.com";
    const copyResponse = await fetch(`${apiUrl}/api/copySite`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "User -Agent": "Mozilla/5.0", // Perbaiki spasi di sini
            "Referer": "https://saveweb2zip.com/en"
        },
        body: JSON.stringify({ url: link })
    });

    const copyResult = await copyResponse.json();
    const md5 = copyResult.md5;
    if (!md5) throw new Error("Failed to retrieve MD5 hash");

    for (let attempts = 0; attempts < 10; attempts++) {
        const statusResponse = await fetch(`${apiUrl}/api/getStatus/${md5}`);
        const statusResult = await statusResponse.json();
        if (statusResult.isFinished) {
            const downloadResponse = await fetch(`${apiUrl}/api/downloadArchive/${md5}`);
            const buffer = await downloadResponse.arrayBuffer();
            return { fileName: `${md5}.zip`, buffer: Buffer.from(buffer) }; // Mengonversi ArrayBuffer ke Buffer
        }
        await new Promise(resolve => setTimeout(resolve, 60000)); // Tunggu 60 detik
    }

    throw new Error("Timeout: Max attempts reached without completion");
};

module.exports = app; // Ekspor app untuk digunakan di Vercel
