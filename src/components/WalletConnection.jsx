import React, { useState, useEffect } from "react";
import { useSolana } from "../contexts/SolanaContext";
import "../styles/WalletConnection.css";

const WalletConnection = () => {
  const { walletAddress, connectWallet, disconnectWallet, getWalletBalance } =
    useSolana();
  const [balance, setBalance] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchBalance = async () => {
      if (!walletAddress) {
        setBalance(null);
        setError(null);
        return;
      }

      try {
        setIsLoadingBalance(true);
        setError(null);
        console.log("Starting balance fetch for wallet:", walletAddress);
        const newBalance = await getWalletBalance();
        console.log("Received balance:", newBalance);
        if (mounted) {
          setBalance(newBalance);
        }
      } catch (error) {
        console.error("Error fetching balance:", error);
        if (mounted) {
          setError(error.message);
          setBalance(null);
        }
      } finally {
        if (mounted) {
          setIsLoadingBalance(false);
        }
      }
    };

    fetchBalance();

    return () => {
      mounted = false;
    };
  }, [walletAddress, getWalletBalance]);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      await connectWallet();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      setError(error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="wallet-connection">
      {walletAddress ? (
        <div className="wallet-info">
          <span className="wallet-address">
            {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
          </span>
          <span className="wallet-balance">
            {isLoadingBalance
              ? "Loading..."
              : error
              ? "Error"
              : balance !== null
              ? `${balance.toFixed(4)} SOL`
              : "0 SOL"}
          </span>
          <button
            onClick={disconnectWallet}
            className="btn btn-secondary disconnect-btn"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          className="btn btn-primary connect-btn"
          onClick={handleConnect}
          disabled={isConnecting}
        >
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </button>
      )}
    </div>
  );
};

export default WalletConnection;
