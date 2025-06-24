const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());



app.post('/api/chat', async (req, res) => {
  console.log('Pozvan /api/chat endpoint', req.body);
  const TOGETHER_API_KEY = 'tgp_v1_bgSrsQnbxVKTYnyTDcY4x0V20OCacGe-ZENfIZKgvsI'; // zamijeni sa svojim Together API ključem
  const userMessage = req.body.messages[req.body.messages.length - 1]?.content || '';
  try {
    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOGETHER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'mistralai/Mixtral-8x7B-Instruct-v0.1', // možeš koristiti i druge modele, vidi Together docs
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 500
      }),
    });
    const data = await response.json();
    console.log('Together response:', data);
    const aiText = data.choices?.[0]?.message?.content || data.error || 'Greška u odgovoru AI-a.';
    res.json({ choices: [{ message: { content: aiText } }] });
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Greška pri komunikaciji sa Together API-jem.' });
  }
});

app.listen(3001, () => console.log('Proxy listening on port 3001'));