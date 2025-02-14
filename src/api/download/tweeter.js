const axios = require('axios');

module.exports = function(app) {
    async function vxtwitter(url) {
        if (/x.com/.test(url)) {
            url = url.replace("x.com", "twitter.com");
        }
        let { data } = await axios.get(url.replace("twitter.com", "api.vxtwitter.com")).catch(e => e.response);

        return {
            metadata: {
                title: data.text,
                id: data.tweetID,
                likes: data.likes.toLocaleString(),
                replies: data.replies.toLocaleString(),
                retweets: data.retweets.toLocaleString(),
                uploaded: new Date(data.date).toLocaleString(),
                author: data.user_name
            },
            downloads: data.media_extended.map((a) => ({
                mimetype: a.type === "image" ? "image/jpg" : "video/mp4",
                url: a.url
            }))
        };
    }

    app.get('/download/tweet', async (req, res) => {
        try {
            const { url } = req.query; // Mengambil parameter query 'url'
            if (!url) {
                return res.status(400).json({ status: false, error: 'URL tweet is required' });
            }
            const tweetData = await vxtwitter(url);
            const { metadata, downloads } = tweetData; // Mengambil metadata dan downloads dari respons

            // Mengembalikan respons yang terstruktur
            res.status(200).json({
                status: true,
                metadata: {
                    title: metadata.title,
                    id: metadata.id,
                    likes: metadata.likes,
                    replies: metadata.replies,
                    retweets: metadata.retweets,
                    uploaded: metadata.uploaded,
                    author: metadata.author
                },
                downloads
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    });
};
