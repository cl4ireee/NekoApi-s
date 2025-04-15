const axios = require('axios');

module.exports = {
    name: 'TikTok Stalk',
    desc: 'Ambil data profil TikTok berdasarkan username',
    category: 'STALK',
    params: ['username'],
    async run(req, res) {
        try {
            const { username } = req.query;
            if (!username) {
                return res.status(400).json({ status: false, error: 'Username is required' });
            }

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
                return res.status(404).json({ status: false, error: 'User not found' });
            }

            // Kirim JSON hasil stalk
            return res.json({
                status: true,
                result: {
                    username: `@${username}`,
                    name: data.name,
                    avatar: data.avatar,
                    followers: data.followers.toLocaleString(),
                    following: data.following.toLocaleString(),
                    likes: data.likes.toLocaleString(),
                    videos: data.video_count,
                    bio: data.bio,
                    verified: data.verified,
                }
            });
        } catch (err) {
            return res.status(500).json({ status: false, error: err.message });
        }
    }
};
