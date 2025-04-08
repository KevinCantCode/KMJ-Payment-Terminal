import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const WISE_API_URL = 'https://api.wise.com';
const WISE_API_VERSION = 'v1';

// Helper function to make Wise API requests
const makeWiseRequest = async (endpoint, options = {}) => {
  try {
    console.log('Making Wise API request to:', `${WISE_API_URL}/${WISE_API_VERSION}${endpoint}`);
    console.log('Request options:', {
      ...options,
      headers: {
        'Authorization': `Bearer ${process.env.VITE_WISE_API_KEY}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const response = await fetch(`${WISE_API_URL}/${WISE_API_VERSION}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${process.env.VITE_WISE_API_KEY}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const responseText = await response.text();
    console.log('Raw Wise API response:', responseText);

    if (!response.ok) {
      console.error('Wise API error response:', {
        status: response.status,
        statusText: response.statusText,
        body: responseText
      });
      throw new Error(`Wise API error: ${response.status} ${response.statusText} - ${responseText}`);
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse Wise API response as JSON:', e);
      throw new Error('Invalid JSON response from Wise API');
    }

    console.log('Wise API successful response:', data);
    return data;
  } catch (error) {
    console.error('Error in makeWiseRequest:', error);
    throw error;
  }
};

// Proxy endpoints
app.get('/api/wise/profiles', async (req, res) => {
  try {
    const data = await makeWiseRequest('/profiles');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/wise/currencies', async (req, res) => {
  try {
    const data = await makeWiseRequest('/currencies');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/wise/rates', async (req, res) => {
  try {
    const { source, target } = req.query;
    const data = await makeWiseRequest(`/rates?source=${source}&target=${target}`);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/wise/quotes', async (req, res) => {
  try {
    console.log('Received quote request body:', JSON.stringify(req.body, null, 2));
    const data = await makeWiseRequest('/quotes', {
      method: 'POST',
      body: JSON.stringify(req.body),
    });
    res.json(data);
  } catch (error) {
    console.error('Error in quotes endpoint:', error);
    res.status(500).json({ 
      error: error.message,
      details: error.stack
    });
  }
});

app.post('/api/wise/transfers', async (req, res) => {
  try {
    const data = await makeWiseRequest('/transfers', {
      method: 'POST',
      body: JSON.stringify(req.body),
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Proxy server running on port ${port}`);
}); 