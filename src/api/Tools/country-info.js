const axios = require('axios');

// Fungsi untuk mengambil data informasi negara
async function fetchCountryInfo(countryName) {
  try {
    const response = await axios.get(`https://api.siputzx.my.id/api/tools/countryInfo?name=${countryName}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching data from API:", error);
    throw error;
  }
}

// Endpoint untuk mengambil informasi negara
module.exports = function(app) {
  app.get('/tools/country-info', async (req, res) => {
    const { q } = req.query;
    
    if (!q || q.trim() === '') {
      return res.status(400).json({ status: false, error: 'Country name is required' });
    }

    try {
      const { status, searchMetadata, data } = await fetchCountryInfo(q);
      
      if (status && data) {
        res.status(200).json({
          status: true,
          countryInfo: {
            name: data.name,
            capital: data.capital,
            flag: data.flag,
            phoneCode: data.phoneCode,
            googleMapsLink: data.googleMapsLink,
            continent: data.continent,
            coordinates: data.coordinates,
            area: data.area,
            landlocked: data.landlocked,
            languages: data.languages,
            famousFor: data.famousFor,
            constitutionalForm: data.constitutionalForm,
            neighbors: data.neighbors,
            currency: data.currency,
            drivingSide: data.drivingSide,
            alcoholProhibition: data.alcoholProhibition,
            internetTLD: data.internetTLD,
            isoCode: data.isoCode
          },
          searchMetadata: searchMetadata
        });
      } else {
        res.status(404).json({ status: false, error: 'Country not found' });
      }
    } catch (error) {
      res.status(500).json({ status: false, error: error.message });
    }
  });
};
