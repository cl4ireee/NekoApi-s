const axios = require('axios');
const FormData = require('form-data');

async function traceMoe(imageUrl, limit = 5, minSimilarity = 0.7) {
  const form = new FormData();
  form.append('url', imageUrl);

  try {
    const response = await axios.post('https://api.trace.moe/search', form, {
      headers: form.getHeaders(),
      params: {
        url: imageUrl,
        anilistInfo: true,
        cutBorders: false,
      },
    });

    // Filter hasil berdasarkan similarity
    const filteredResults = response.data.result
      .filter((item) => item.similarity >= minSimilarity)
      .slice(0, limit);

    // Bersihkan sinopsis dari tag HTML
    function cleanSynopsis(synopsis) {
      const cleanText = synopsis.replace(/<[^>]*>/g, ''); // Hapus tag HTML
      const lastPeriodIndex = cleanText.lastIndexOf('.'); // Cari titik terakhir
      return lastPeriodIndex !== -1 ? cleanText.substring(0, lastPeriodIndex + 1) : cleanText;
    }

    // Ambil detail dari AniList
    const resultsWithDetails = await Promise.all(
      filteredResults.map(async (item) => {
        const anilistDetails = await getAnilistDetails(item.anilist.id);
        return {
          anilistId: anilistDetails?.id || anilistDetails?.idMal,
          title: anilistDetails?.title?.native || anilistDetails?.title?.romaji || anilistDetails?.title?.english || 'Unknown Title',
          episodeScene: item.episode || 'Unknown episodeScene',
          time: `${formatTime(item.from)} - ${formatTime(item.to)}`,
          similarity: `${(item.similarity * 100).toFixed(2)}%`,
          urlVideo: item.video,
          urlImage: item.image,
          fileName: item.filename || 'Unknown fileName',
          details: {
            idMal: anilistDetails?.idMal || 'Unknown idMal',
            episodeTotal: anilistDetails?.episodes || 'Unknown episodeTotal',
            season: anilistDetails?.season || 'Unknown season',
            genres: anilistDetails?.genres || [],
            synonyms: anilistDetails?.synonyms || item.anilist.synonyms || [],
            synopsis: cleanSynopsis(anilistDetails?.description) || 'No synopsis available',
            isAdult: anilistDetails?.isAdult,
            status: anilistDetails?.status || 'Unknown status',
            studios: anilistDetails?.studios?.nodes?.map((studio) => studio.name) || [],
          },
        };
      }),
    );

    return resultsWithDetails;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}

// Format waktu dari milidetik ke menit:detik
function formatTime(milliseconds) {
  const totalSeconds = Math.floor(milliseconds);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Ambil detail dari AniList
async function getAnilistDetails(AniListId) {
  try {
    const query = `
      query ($id: Int) {
        Media(id: $id) {
          id
          idMal
          title {
            native
            romaji
            english
          }
          episodes
          season
          genres
          synonyms
          description
          isAdult
          status
          studios {
            nodes {
              name
            }
          }
        }
      }
    `;

    const response = await axios.post('https://graphql.anilist.co', {
      query,
      variables: { id: AniListId },
    });

    return response.data.data.Media;
  } catch (error) {
    console.error('Error fetching AniList details:', error.message);
    return error;
  }
}

// Ekspor fungsi untuk digunakan dengan `app.get`
module.exports = function (app) {
  app.get('/tools/tracemoe', async (req, res) => {
    const { imageUrl, limit = 5, minSimilarity = 0.7 } = req.query;

    if (!imageUrl) {
      return res.status(400).json({ status: false, error: 'Query parameter (imageUrl) is required' });
    }

    try {
      const results = await traceMoe(imageUrl, parseInt(limit), parseFloat(minSimilarity));
      res.status(200).json({ status: true, results });
    } catch (error) {
      console.error('Error fetching trace.moe data:', error.message);
      res.status(500).json({ status: false, error: 'Failed to fetch trace.moe data' });
    }
  });
};
