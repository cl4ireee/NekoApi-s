const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());

app.post('/tools/cloneweb', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ status: false, message: 'Please provide a link!' });
    }

    try {
        const result = await SaveWeb2zip(url);

        if (!result) {
            return res.status(500).json({ status: false, message: 'An error occurred while downloading the file.' });
        }

        res.set({
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="${result.fileName}"`,
            'Content-Length': result.buffer.byteLength
        });

        res.send(Buffer.from(result.buffer));
    } catch (e) {
        console.error(e);
        res.status(500).json({ status: false, message: `Failed to execute command\nError: _${e.message}_` });
    }
});

const SaveWeb2zip = async (link, options = {}) => {
    const apiUrl = "https://copier.saveweb2zip.com";
    let attempts = 0;
    let md5;

    try {
        const copyResponse = await fetch(`${apiUrl}/api/copySite`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User -Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36",
                Referer: "https://saveweb2zip.com/en"
            },
            body: JSON.stringify({
                url: link,
                renameAssets: options.renameAssets || false,
                saveStructure: options.saveStructure || false,
                alternativeAlgorithm: options.alternativeAlgorithm || false,
                mobileVersion: options.mobileVersion || false
            })
        });

        const copyResult = await copyResponse.json();
        md5 = copyResult.md5;

        if (!md5) throw new Error("Failed to retrieve MD5 hash");

        while (attempts < 10) {
            const statusResponse = await fetch(`${apiUrl}/api/getStatus/${md5}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "User -Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36",
                    Referer: "https://saveweb2zip.com/en"
                }
            });

            const statusResult = await statusResponse.json();
            if (statusResult.isFinished) {
                const downloadResponse = await fetch(`${apiUrl}/api/downloadArchive/${md5}`, {
                    method: "GET",
                    headers: {
                        "User -Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36",
                        Referer: "https://saveweb2zip.com/en"
                    }
                });

                const buffer = await downloadResponse.arrayBuffer();
                const fileName = `${md5}.zip`;
                return {
                    fileName: fileName,
                    buffer: buffer,
                    link: `${apiUrl}/api/downloadArchive/${md5}`
                };
            }

            await new Promise(resolve => setTimeout(resolve, 60000));
            attempts++;
        }

        throw new Error("Timeout: Max attempts reached without completion");
    } catch (error) {
        console.error("Error:", error);
        return null;
    }
};

module.exports = app; // Ekspor app untuk digunakan di Vercel
