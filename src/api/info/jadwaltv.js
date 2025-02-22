const axios = require("axios"); const cheerio = require("cheerio");

async function getJadwalTV(q) { try { const url = https://www.jadwaltv.net/channel/${q.toLowerCase()}; const { data } = await axios.get(url); const $ = cheerio.load(data);

let jadwal = [];
    $('.table tbody tr').each((i, el) => {
        const jam = $(el).find('td').eq(0).text().trim();
        const acara = $(el).find('td').eq(1).text().trim();
        jadwal.push({ jam, acara });
    });
    
    return { status: true, channel: q, jadwal };
} catch (error) {
    return { status: false, message: 'Terjadi kesalahan', error: error.message };
}

}

module.exports = function(app) { 
    app.get('/api/jadwaltv', async (req, res) => { 
        const { q } = req.query;
        if (!q) { 
            return res.status(400).json({ status: false, message: 'Parameter q harus disediakan.' }); 
         }

const result = await getJadwalTV(q);
    res.json(result);
});

};

