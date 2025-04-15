const axios = require('axios');
const cheerio = require('cheerio');

module.exports = {
    name: 'Instagram Stalk v2',
    desc: 'Mengambil informasi profil Instagram berdasarkan username.',
    category: 'Stalk',
    params: ['Username'],
    async run(req, res) {
        const { Username } = req.query;
        if (!Username) {
            return res.status(400).json({ status: false, error: 'Instagram Username is required' });
        }

        const endpoint = 'https://privatephotoviewer.com/wp-json/instagram-viewer/v1/fetch-profile';
        const payload = { find: Username };
        const headers = {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'X-Requested-With': 'XMLHttpRequest',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36',
            'Referer': 'https://privatephotoviewer.com/'
        };

        try {
            const { data } = await axios.post(endpoint, payload, { headers });

            if (!data || !data.html) {
                return res.status(500).json({ status: false, error: 'Gagal mendapatkan data dari situs' });
            }

            const html = data.html;
            const $ = cheerio.load(html);

            let profilePic = $('#profile-insta').find('.col-md-4 img').attr('src');
            if (profilePic && profilePic.startsWith('//')) {
                profilePic = 'https:' + profilePic;
            }

            const name = $('#profile-insta').find('.col-md-8 h4.text-muted').text().trim();
            const username = $('#profile-insta').find('.col-md-8 h5.text-muted').text().trim();

            const stats = {};
            $('#profile-insta')
                .find('.col-md-8 .d-flex.justify-content-between.my-3 > div')
                .each((i, el) => {
                    const statValue = $(el).find('strong').text().trim();
                    const statLabel = $(el).find('span.text-muted').text().trim().toLowerCase();
                    if (statLabel.includes('posts')) {
                        stats.posts = statValue;
                    } else if (statLabel.includes('followers')) {
                        stats.followers = statValue;
                    } else if (statLabel.includes('following')) {
                        stats.following = statValue;
                    }
                });

            const bio = $('#profile-insta').find('.col-md-8 p').text().trim();

            return res.json({
                status: true,
                result: {
                    name,
                    username,
                    profilePic,
                    posts: stats.posts,
                    followers: stats.followers,
                    following: stats.following,
                    bio
                }
            });

        } catch (error) {
            console.error('Error fetching Instagram profile:', error.message);
            return res.status(500).json({ status: false, error: error.message });
        }
    }
};
