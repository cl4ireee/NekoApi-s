const axios = require('axios');
const cheerio = require('cheerio');

// Fungsi untuk mendapatkan URL gambar
async function getImageUrl(titleUrl) {
    try {
        const { data } = await axios.get(titleUrl);
        const $ = cheerio.load(data);
        const imgUrl = $('.hvpi-cover-container img').attr('src');
        return imgUrl || 'No image found'; 
    } catch (error) {
        console.error('Error fetching image URL:', error.message);
        return 'Error fetching image';
    }
}

// Fungsi untuk mendapatkan trending titles
async function trend(m) {
    try {
        const { data } = await axios.get('https://hanime.tv/browse/trending');
        const $ = cheerio.load(data);
        
        const titles = [];
        $('.layout.results .card a').each((index, element) => {
            const title = $(element).attr('title');
            const url = $(element).attr('href');

            if (title && url) {
                titles.push({ title, url: `https://hanime.tv${url}` });
            }
        });      
        for (const title of titles) {
            title.imgUrl = await getImageUrl(title.url);
        }    
        let responseMessage = 'Trending Titles:\n\n';
        titles.forEach(item => {
            responseMessage += `_Title:_ ${item.title}\n_URL:_ ${item.url}\n_Image URL:_ ${item.imgUrl}\n\n`;
        });
        if (m && typeof m.reply === 'function') {
            m.reply(responseMessage);
        } else {
            console.log(responseMessage); 
        }
    } catch (error) {
        if (m && typeof m.reply === 'function') {
            m.reply('Error fetching trending titles. Please try again later.');
        } else {
            console.error('Error fetching trending titles:', error.message);
        }
    }
}

// Fungsi untuk mendapatkan video berdasarkan tag
async function avzzz(query, m) {
    const url = `https://hanime.tv/browse/tags/${query}`;
    
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        
        let videoUrls = [];

        $('.layout.results.flex.row .flex.xs12.justify-center.align-center.wrap a.card').each((index, element) => {
            const videoUrl = `https://hanime.tv${$(element).attr('href')}`;
            videoUrls.push(videoUrl);
        });

        if (videoUrls.length > 0) {
            let allDetails = [];
            for (const videoUrl of videoUrls) {
                const details = await avus(videoUrl);
                allDetails.push(details);
            }

            const formattedDetails = allDetails.map(detail => `
Title: ${detail.title}
Views: ${detail.views}
Likes: ${detail.likes}
Dislikes: ${detail.dislikes}
Download Link: ${detail.downloadLink}
Image: ${detail.imgSrc}
Video URL: ${detail.videoUrl}  
            `).join('\n\n');
            
            m.reply(`Found video details:\n${formattedDetails}`);
        } else {
            m.reply('No videos.');
        }

    } catch (error) {
        console.error('Error:', error);
        m.reply('An error occurred while fetching videos.');
    }
}

// Fungsi untuk mendapatkan detail video
async function avus(videoUrl) {
    try {
        const { data } = await axios.get(videoUrl);
        const $ = cheerio.load(data);

        const title = $('h1.tv-title').text().trim();
        const views = $('.tv-views.grey--text').text().trim();
        
        const likes = $('.mdi-heart + .hvpabb-text').text().trim() || '0';
        const dislikes = $('.mdi-heart-off + .hvpabb-text').text().trim() || '0';
        
        const downloadLink = $('.mdi-cloud-download').closest('a').attr('href');
        const imgSrc = $('.hvpi-cover-container img').attr('src');

        return {
            title,
            views,
            likes,
            dislikes,
            downloadLink: `https://hanime.tv${downloadLink}`,
            imgSrc,
            videoUrl 
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            title: 'Unknown',
            views: 'Unknown',
            likes: 'Unknown',
            dislikes: 'Unknown',
            downloadLink: 'Unknown',
            imgSrc: 'Unknown',
            videoUrl: 'Unknown' 
        };
    }
}

// Fungsi untuk mengatur rute API
module.exports = function setupHanimeRoutes(app) {
    app.get('/anime/hanime-trend', async (req, res) => {
        const m = { reply: (msg) => res.send(msg) }; // Simulasi objek m
        await trend(m);
    });

    app.get('/anime/hanime-tags', async (req, res) => {
        const { q } = req.query;
        if (!q) {
            return res.send('Example: /anime/hanime-tags?q=futanari');
        }
        const query = encodeURIComponent(q);
        const m = { reply: (msg) => res.send(msg) }; // Simulasi objek m
        await avzzz(query, m);
    });
}; 
