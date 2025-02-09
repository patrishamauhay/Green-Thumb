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
      const response = await axios.get(`https://perenual.com/api/species/details/${id}`, {
        params: {
          key: API_KEY,
        },
      });
  
      console.log('Plant Details:', response.data);
      return response.data || null; // Return plant details
    } catch (error) {
      console.error('Error fetching plant details:', error);
      return null; // Return null if an error occurs
    }
  };
  
