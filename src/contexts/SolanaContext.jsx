import React, { createContext, useContext, useState, useEffect } from "react";
import {
  initializeSolanaConnection,
  getBalance,
  sendPayment,
  convertUsdToSol,
} from "../services/solana";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

const SolanaContext = createContext();

export const SolanaProvider = ({ children }) => {
  const [connection, setConnection] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const updateBalance = async () => {
    if (walletAddress) {
      try {
        const newBalance = await getBalance(walletAddress);
        setBalance(newBalance);
      } catch (error) {
        console.error("Error updating balance:", error);
        setError("Failed to update balance");
      }
    }
  };

  useEffect(() => {
    const initializeConnection = async () => {
      try {
        const solanaConnection = initializeSolanaConnection();
        setConnection(solanaConnection);
        setLoading(false);
      } catch (error) {
        console.error("Error initializing Solana connection:", error);
        setError("Failed to initialize Solana connection");
        setLoading(false);
      }
    };

    initializeConnection();
  }, []);

  useEffect(() => {
    updateBalance();
  }, [walletAddress]);

  const connectWallet = async () => {
    try {
      // Check if Phantom is installed
      const { solana } = window;
      if (!solana?.isPhantom) {
        throw new Error("Please install Phantom wallet");
      }

      // Connect to Phantom wallet
      const response = await solana.connect();
      setWalletAddress(response.publicKey.toString());
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setError("Failed to connect wallet");
      throw error;
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setBalance(null);
  };

  const sendSolanaPayment = async (recipientAddress, usdAmount) => {
    try {
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }

      console.log("Converting USD amount to SOL...");
      const solAmount = await convertUsdToSol(usdAmount);

      // Check if user has enough SOL
      const currentBalance = await getBalance(walletAddress);
      if (currentBalance < solAmount) {
        throw new Error(
          `Insufficient SOL balance. You have ${currentBalance} SOL but need ${solAmount} SOL`
        );
      }

      console.log("Creating payment transaction...");
      const transaction = await sendPayment(
        walletAddress,
        recipientAddress,
        solAmount
      );

      // Get the Phantom wallet provider
      const provider = window.solana;
      if (!provider) {
        throw new Error("Phantom wallet not found");
      }

      console.log("Requesting transaction signature...");
      // Request signature from the wallet
      const { signature } = await provider.signAndSendTransaction(transaction);
      console.log("Transaction signed and sent:", signature);

      // Wait for confirmation
      const connection = initializeSolanaConnection();
      const confirmation = await connection.confirmTransaction(
        signature,
        "confirmed"
      );
      console.log("Transaction confirmed:", confirmation);

      // Update balance after successful payment
      await updateBalance();

      return signature;
    } catch (error) {
      console.error("Error sending payment:", error);
      throw error;
    }
  };

  // Get wallet balance
  const getWalletBalance = async () => {
    if (!walletAddress) return 0;
    try {
      console.log("Fetching balance for wallet:", walletAddress);
      const connection = new Connection(
        "https://yolo-smart-valley.solana-mainnet.quiknode.pro/16eb06317a88b1891753216e9b7cf9a065ea646f/",
        {
          commitment: "confirmed",
          confirmTransactionInitialTimeout: 60000,
        }
      );
      const publicKey = new PublicKey(walletAddress);
      console.log("Created public key:", publicKey.toBase58());

      // Get balance with retry logic
      let retries = 3;
      let balance = null;

      while (retries > 0 && balance === null) {
        try {
          balance = await connection.getBalance(publicKey);
          console.log("Raw balance:", balance);
        } catch (error) {
          console.log(`Retry attempt ${4 - retries} failed:`, error);
          retries--;
          if (retries === 0) throw error;
          // Wait 1 second before retrying
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      const solBalance = balance / LAMPORTS_PER_SOL;
      console.log("SOL balance:", solBalance);
      return solBalance;
    } catch (error) {
      console.error("Error getting wallet balance:", error);
      throw error; // Re-throw the error so the component can handle it
    }
  };

  const value = {
    connection,
    walletAddress,
    balance,
    loading,
    error,
    connectWallet,
    disconnectWallet,
    sendSolanaPayment,
    updateBalance,
    getWalletBalance,
  };

  return (
    <SolanaContext.Provider value={value}>{children}</SolanaContext.Provider>
  );
};

export const useSolana = () => {
  const context = useContext(SolanaContext);
  if (!context) {
    throw new Error("useSolana must be used within a SolanaProvider");
  }
  return context;
};
