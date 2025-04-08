import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getWiseProfile,
  getAvailableCurrencies,
  getExchangeRate,
  createQuote,
  createTransfer,
} from "../firebase/wiseService";

const WiseContext = createContext();

export function WiseProvider({ children }) {
  const [wiseProfile, setWiseProfile] = useState(null);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize Wise API with your API key
  const WISE_API_KEY = import.meta.env.VITE_WISE_API_KEY;

  useEffect(() => {
    const initializeWise = async () => {
      try {
        setLoading(true);
        // Fetch profile and available currencies
        const [profileData, currenciesData] = await Promise.all([
          getWiseProfile(WISE_API_KEY),
          getAvailableCurrencies(WISE_API_KEY),
        ]);

        setWiseProfile(profileData);
        setCurrencies(currenciesData);
        setError(null);
      } catch (err) {
        console.error("Error initializing Wise:", err);
        setError("Failed to initialize Wise API");
      } finally {
        setLoading(false);
      }
    };

    if (WISE_API_KEY) {
      initializeWise();
    } else {
      setError("Wise API key not configured");
      setLoading(false);
    }
  }, [WISE_API_KEY]);

  const getRate = async (sourceCurrency, targetCurrency) => {
    try {
      const rateData = await getExchangeRate(
        WISE_API_KEY,
        sourceCurrency,
        targetCurrency
      );
      return rateData;
    } catch (err) {
      console.error("Error getting exchange rate:", err);
      throw err;
    }
  };

  const createWiseQuote = async (quoteData) => {
    try {
      const quote = await createQuote(WISE_API_KEY, quoteData);
      return quote;
    } catch (err) {
      console.error("Error creating quote:", err);
      throw err;
    }
  };

  const createWiseTransfer = async (transferData) => {
    try {
      const transfer = await createTransfer(WISE_API_KEY, transferData);
      return transfer;
    } catch (err) {
      console.error("Error creating transfer:", err);
      throw err;
    }
  };

  const value = {
    wiseProfile,
    currencies,
    loading,
    error,
    getRate,
    createWiseQuote,
    createWiseTransfer,
  };

  return <WiseContext.Provider value={value}>{children}</WiseContext.Provider>;
}

export function useWise() {
  const context = useContext(WiseContext);
  if (!context) {
    throw new Error("useWise must be used within a WiseProvider");
  }
  return context;
}
