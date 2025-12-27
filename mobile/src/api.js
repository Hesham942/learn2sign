import axios from 'axios';

export const predictSign = async (base64Image, apiUrl) => {
  try {
    // Use debug_predict endpoint to save images for debugging
    const response = await axios.post(`${apiUrl}/predict`, {
      image: base64Image,
    }, {
      timeout: 10000,
    });
    return response.data;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timed out. Check your connection.');
    }
    if (error.response) {
      throw new Error(error.response.data.error || 'Server error');
    }
    throw new Error('Network error. Make sure backend is running and you\'re on the same WiFi.');
  }
};

export const checkHealth = async (apiUrl) => {
  try {
    const response = await axios.get(`${apiUrl}/health`, { timeout: 5000 });
    return response.data.status === 'healthy';
  } catch {
    return false;
  }
};
