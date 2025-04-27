const axios = require('axios');
require('dotenv').config();

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

/**
 * Generate a summary using Mistral-7B model
 * @param {string} prompt - The prompt to send to the model
 * @returns {Promise<string>} - The generated summary
 */
const generateSummary = async (prompt) => {
  if (!MISTRAL_API_KEY) {
    throw new Error('MISTRAL_API_KEY is not configured in environment variables');
  }

  try {
    const response = await axios.post(
      MISTRAL_API_URL,
      {
        model: 'mistral-7b-instruct-v0.2',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2048
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MISTRAL_API_KEY}`
        }
      }
    );

    if (!response.data || !response.data.choices || !response.data.choices[0]) {
      throw new Error('Invalid response from Mistral API');
    }

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error calling Mistral API:', error.response?.data || error.message);
    throw new Error(`Failed to generate summary: ${error.response?.data?.error?.message || error.message}`);
  }
};

module.exports = {
  generateSummary
}; 