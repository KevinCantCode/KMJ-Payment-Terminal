// Wise API configuration
const PROXY_URL = 'http://localhost:3001/api/wise';

// Get profile information
export const getWiseProfile = async (apiKey) => {
  try {
    const response = await fetch(`${PROXY_URL}/profiles`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch Wise profile');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Wise profile:', error);
    throw error;
  }
};

// Get available currencies
export const getAvailableCurrencies = async (apiKey) => {
  try {
    const response = await fetch(`${PROXY_URL}/currencies`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch available currencies');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching available currencies:', error);
    throw error;
  }
};

// Get exchange rates
export const getExchangeRate = async (apiKey, sourceCurrency, targetCurrency) => {
  try {
    const response = await fetch(
      `${PROXY_URL}/rates?source=${sourceCurrency}&target=${targetCurrency}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rate');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    throw error;
  }
};

// Create a quote
export const createQuote = async (apiKey, quoteData) => {
  try {
    const response = await fetch(`${PROXY_URL}/quotes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(quoteData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create quote');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating quote:', error);
    throw error;
  }
};

// Create a transfer
export const createTransfer = async (apiKey, transferData) => {
  try {
    const response = await fetch(`${PROXY_URL}/transfers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transferData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create transfer');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating transfer:', error);
    throw error;
  }
}; 