import axios from 'axios';

const API_URL = 'http://localhost:3000'; 

export const getIssues = async () => {
  try {
    const response = await axios.get(`${API_URL}/issues`);
    return response.data;
  } catch (error) {
    console.error('Error fetching issues:', error);
    throw error;
  }
};

export const createIssue = async (issueData) => {
  try {
    const response = await axios.post(`${API_URL}/issues`, issueData);
    return response.data;
  } catch (error) {
    console.error('Error creating issue:', error);
    throw error;
  }
};
