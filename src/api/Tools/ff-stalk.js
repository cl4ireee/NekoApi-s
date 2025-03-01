const axios = require('axios');
const cheerio = require('cheerio');

module.exports = (app) => {
    app.get('/tools/ffstalk', async (req, res) => {
        try {
            const { id } = req.query;
            if (!id) {
                return res.status(400).json({ error: 'Missing id parameter' });
            }

            let formdata = new FormData();
            formdata.append('uid', id);

            let { data } = await axios.post('https://tools.freefireinfo.in/profileinfo.php?success=1', formdata, {
                headers: {
                    "content-type": "application/x-www-form-urlencoded",
                    "origin": "https://tools.freefireinfo.in",
                    "referer": "https://tools.freefireinfo.in/profileinfo.php?success=1",
                    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36"
                }
            });

            const $ = cheerio.load(data);
            let tr = $('div.result').html().split('<br>');
            let result = {
                name: tr[0]?.split('Name: ')[1] || 'Unknown',
                bio: tr[14]?.split(': ')[1] || 'No bio',
                like: tr[2]?.split(': ')[1] || '0',
                level: tr[3]?.split(': ')[1] || '0',
                exp: tr[4]?.split(': ')[1] || '0',
                region: tr[5]?.split(': ')[1] || 'Unknown',
                honorScore: tr[6]?.split(': ')[1] || '0',
                brRank: tr[7]?.split(': ')[1] || 'Unranked',
                brRankPoint: tr[8]?.split(': ')[1] || '0',
                csRankPoint: tr[9]?.split(': ')[1] || '0',
                accountCreated: tr[10]?.split(': ')[1] || 'Unknown',
                lastLogin: tr[11]?.split(': ')[1] || 'Unknown',
                preferMode: tr[12]?.split(': ')[1] || 'Unknown',
                language: tr[13]?.split(': ')[1] || 'Unknown',
                booyahPassPremium: tr[16]?.split(': ')[1] || 'No',
                booyahPassLevel: tr[17]?.split(': ')[1] || '0',
                petInformation: {
                    name: tr[20]?.split(': ')[1] || 'No pet',
                    level: tr[21]?.split(': ')[1] || '0',
                    exp: tr[22]?.split(': ')[1] || '0',
                    starMarked: tr[23]?.split(': ')[1] || 'No pet',
                    selected: tr[24]?.split(': ')[1] || 'No pet'
                },
                guild: {
                    name: tr[27]?.split(': ')[1] || 'No guild',
                    level: tr[28]?.split(': ')[1] || '0',
                    members: tr[29]?.split(': ')[1] || '0',
                    id: tr[30]?.split(': ')[1] || 'No guild'
                },
                equippedItems: []
            };

            $('.equipped-items .equipped-item').each((i, e) => {
                let name = $(e).find('p').text().trim();
                let img = $(e).find('img').attr('src');
                result.equippedItems.push({ name, img });
            });

            res.json(result);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch data', details: error.message });
        }
    });
};
