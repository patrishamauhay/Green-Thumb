import axios from 'axios';

const API_KEY = 'sk-J7W967a7e6f83fd9c8556';
const BASE_URL = 'https://perenual.com/api';

// Fetch plants based on a search query
export const fetchPlants = async (query) => {
  try {
    const response = await axios.get(`${BASE_URL}/species-list`, {
      params: {
        key: API_KEY,
        q: query, // Search term
      },
    });
    return response.data.data; // Return the array of plant data
  } catch (error) {
    console.error('Error fetching plants:', error);
    throw error;
  }
};

// Fetch details of a specific plant by its ID
export const fetchPlantDetails = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/species/${id}`, {
      params: {
        key: API_KEY,
      },
    });
    return response.data.data; // Return plant details
  } catch (error) {
    console.error('Error fetching plant details:', error);
    throw error;
  }
};
