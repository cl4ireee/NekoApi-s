const axios = require('axios');

module.exports = {
    name: 'TikTok Stalk',
    desc: 'Stalk profil TikTok by username',
    category: 'Tools',
    params: ['username', 'type'],
    async run(req, res) {
        try {
            const { username, type } = req.query;
            if (!username) return res.status(400).json({ status: false, error: 'Username is required' });

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
            if (!data) return res.status(404).json({ status: false, error: 'User not found' });

            if (type === 'json') {
                // Kirim JSON
                return res.json({
                    status: true,
                    result: {
                        username: `@${username}`,
                        followers: data.followers,
                        following: data.following,
                        likes: data.likes,
                        avatar: data.avatar
                    }
                });
            } else {
                // Kirim gambar langsung
                const img = await axios.get(data.avatar, { responseType: 'arraybuffer' });
                res.writeHead(200, {
                    'Content-Type': 'image/jpeg',
                    'Content-Length': img.data.length
                });
                return res.end(img.data);
            }

        } catch (err) {
            return res.status(500).json({ status: false, error: err.message });
        }
    }
};
