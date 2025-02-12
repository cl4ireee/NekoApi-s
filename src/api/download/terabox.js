const express = require('express');
const axios = require('axios');

const app = express();

const terabox = {
  metadata: async (url) => {
    let surl;
    const parsedUrl = new URL(url);
    const pathSegments = parsedUrl.pathname.split('/');
    if (pathSegments[1] === 's') {
      surl = pathSegments[2];
    } else {
      surl = parsedUrl.searchParams.get('surl');
    }

    const config = {
      method: 'GET',
      url: `https://terabox.hnn.workers.dev/api/get-info?shorturl=${surl}&pwd=`,
      headers: {
        'User -Agent': 'Mozilla/5.0 (Android 10; Mobile; rv:131.0) Gecko/131.0 Firefox/131.0',
        'accept-language': 'id-ID',
        'referer': 'https://terabox.hnn.workers.dev/',
        'alt-used': 'terabox.hnn.workers.dev',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'priority': 'u=0',
        'te': 'trailers'
      }
    };

    const api = await axios.request(config);
    return api.data;
  },
  getUrl: async (mdat, fs_id) => {
    const data = JSON.stringify({
      "shareid": mdat.shareid,
      "uk": mdat.uk,
      "sign": mdat.sign,
      "timestamp": mdat.timestamp,
      "fs_id": fs_id
    });

    const config = {
      method: 'POST',
      url: 'https://terabox.hnn.workers.dev/api/get-download',
      headers: {
        'User -Agent': 'Mozilla/5.0 (Android 10; Mobile; rv:131.0) Gecko/131.0 Firefox/131.0',
        'Content-Type': 'application/json',
        'accept-language': 'id-ID',
        'referer': 'https://terabox.hnn.workers.dev/',
        'origin': 'https://terabox.hnn.workers.dev',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'priority': 'u=0',
        'te': 'trailers'
      },
      data: data
    };

    const api = await axios.request(config);
    return api.data.downloadLink;
  },
  download: async (url) => {
    const mdat = await terabox.metadata(url);
    const listWithUrls = await Promise.all(mdat.list.map(async (file) => {
      const downloadUrl = await terabox.getUrl(mdat, file.fs_id);
      return { ...file, downloadUrl };
    }));

    return listWithUrls;
  }
};

// Endpoint untuk mengunduh file dari TeraBox
app.get('/download/terabox', async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ status: false, error: 'URL is required' });
  }

  try {
    const files = await terabox.download(url);
    res.status(200).json({ status: true, files });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ status: false, error: 'Error fetching data' });
  }
});

// Ekspor modul
module.exports = app;
