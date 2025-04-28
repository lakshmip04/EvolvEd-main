const express = require('express');
const router = express.Router();
const { Configuration, OpenAIApi } = require('openai');

// Setup OpenAI with your API Key
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// POST /api/chat
router.post('/', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ reply: "Please provide a message!" });
  }

  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful AI assistant for students." },
        { role: "user", content: message },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const reply = response.data.choices[0]?.message?.content?.trim();
    return res.json({ reply: reply || "🤔 Sorry, I couldn't generate a reply." });

  } catch (error) {
    console.error('Error communicating with OpenAI:', error.response?.data || error.message);
    return res.status(500).json({ reply: "⚠️ Sorry, something went wrong while talking to ChatGPT!" });
  }
});

module.exports = router;
