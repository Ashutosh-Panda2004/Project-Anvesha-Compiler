// src/apiService.js

import axios from 'axios';

export const compileCode = async (sourceCode, languageId, stdin = '') => {
  try {
    const response = await axios.post('/api/compile', {
      sourceCode,
      languageId,
      stdin,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error compiling code.');
  }
};














