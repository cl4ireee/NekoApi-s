const axios = require('axios');

module.exports = {
    name: 'TikTok Stalk',
    desc: 'Ambil data profil TikTok berdasarkan username',
    category: 'Stalking',
    params: ['username'],
    async run(req, res) {
        try {
            const { username } = req.query;

            if (!username) {
                return res.status(400).json({ status: false, error: 'Username is required' });
            }

            // Kirim request ke API scraping TikTok
            const response = await axios.post(
                'https://tokviewer.net/api/check-profile',
                { username },
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }
            );

            const data = response.data?.data;
            if (!data) {
                return res.status(404).json({ status: false, error: 'Data not found' });
            }

            // Ambil gambar profil (avatar) TikTok dan kirimkan sebagai image response
            const avatarImage = await axios.get(data.avatar, { responseType: 'arraybuffer' });

            res.writeHead(200, {
                'Content-Type': 'image/jpeg',
                'Content-Length': avatarImage.data.length,
                'TikTok-Username': username,
                'TikTok-Followers': data.followers.toString(),
                'TikTok-Following': data.following.toString(),
                'TikTok-Likes': data.likes.toString()
            });
            res.end(avatarImage.data);

        } catch (error) {
            console.error('Error:', error.message);
            res.status(500).json({ status: false, error: error.message });
        }
    }
};
