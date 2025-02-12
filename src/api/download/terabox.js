const axios = require('axios');

module.exports = function(app) {
    app.get('/download/terabox', async (req, res) => {
        const { url } = req.query; // Mengambil URL dari query parameter
        if (!url) {
            return res.status(400).json({ status: false, error: 'URL is required' });
        }

        try {
            // Mengambil metadata dari TeraBox
            const response = await axios.get(`https://terabox.hnn.workers.dev/api/get-info?shorturl=${encodeURIComponent(url)}&pwd=`);
            const data = response.data;

            // Memeriksa status dari respons
            if (data && data.status) {
                const teraboxData = {
                    status: true,
                    shareid: data.shareid,
                    uk: data.uk,
                    title: data.title,
                    fileList: data.list.map(file => ({
                        name: file.name,
                        size: file.size,
                        fs_id: file.fs_id,
                        downloadLink: `https://terabox.hnn.workers.dev/api/get-download?shareid=${data.shareid}&uk=${data.uk}&fs_id=${file.fs_id}`
                    }))
                };
                res.status(200).json(teraboxData);
            } else {
                res.status(400).json({ status: false, error: 'Failed to fetch file' });
            }
        } catch (error) {
            console.error('Error fetching data from TeraBox:', error.message);
            res.status(500).json({ status: false, error: error.message });
        }
    });
};
