const axios = require('axios');
const FormData = require('form-data');

async function traceMoe(url, limit = 5, minSimilarity = 0.7) {
  const form = new FormData();
  form.append('url', url);

  try {
    const response = await axios.post('https://api.trace.moe/search', form, {
      headers: form.getHeaders(),
      params: {
        url: url,
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
    console.error('Error fetching trace.moe data:', error.message);
    throw new Error(error.response?.data || 'Failed to fetch trace.moe data');
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
    return null; // Return null if AniList details could not be fetched
  }
}

// Ekspor fungsi untuk digunakan dengan `app.get`
module.exports = function (app) {
  app.get('/tools/tracemoe', async (req, res) => {
    const { url, limit = 5, minSimilarity = 0.7 } = req.query;

    if (!url) {
      return res.status(400).json({ status: false, error: 'Query parameter (url) is required' });
    }

    try {
      const results = await traceMoe(url, parseInt(limit), parseFloat(minSimilarity));
      res.status(200).json({ status: true, results });
    } catch (error) {
      console.error('Error fetching trace.moe data:', error.message);
      res.status(500).json({ status: false, error: error.message });
    }
  });
};
