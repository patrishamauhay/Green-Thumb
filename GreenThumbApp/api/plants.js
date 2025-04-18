import axios from 'axios';

const API_KEY = 'sk-J7W967a7e6f83fd9c8556';
const BASE_URL = 'https://perenual.com/api';

// Fetch plants based on a search query
export const fetchPlants = async (query) => {
  try {
    const response = await axios.get(`${BASE_URL}/species-list`, {
      params: {
        key: API_KEY,
        q: query,
      },
    });
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching plants:', error);
    return [];
  }
};

// Fetch details of a specific plant by its ID
export const fetchPlantDetails = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/species/details/${id}`, {
      params: {
        key: API_KEY,
      },
    });

    return response.data || null;
  } catch (error) {
    console.error('Error fetching plant details:', error);
    return null;
  }
};

// Fetch care guide for a specific plant by its ID
export const fetchCareGuide = async (speciesId) => {
  try {
    const response = await axios.get(`${BASE_URL}/species-care-guide-list`, {
      params: {
        key: API_KEY,
        species_id: speciesId, 
      },
    });

    console.log('Care Guide Response:', response.data);

    if (response.data?.data?.length > 0) {
      return response.data.data[0]?.section || [];
    }

    return [];
  } catch (error) {
    console.error('Error fetching care guide:', error);
    return [];
  }
};
