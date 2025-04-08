import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAccount, createTransferInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';

const SOLANA_NETWORK = "mainnet-beta";
const SOLANA_RPC_URL = "https://yolo-smart-valley.solana-mainnet.quiknode.pro/16eb06317a88b1891753216e9b7cf9a065ea646f/";

// Initialize connection to Solana network
const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

export const initializeSolanaConnection = () => {
  console.log("Initializing Solana connection to", SOLANA_NETWORK);
  return new Connection(SOLANA_RPC_URL, "confirmed");
};

export const getBalance = async (address) => {
  console.log("Getting balance for address:", address);
  const connection = initializeSolanaConnection();
  const publicKey = new PublicKey(address);
  const balance = await connection.getBalance(publicKey);
  console.log("Balance:", balance / 1e9, "SOL");
  return balance / 1e9; // Convert lamports to SOL
};

export const sendPayment = async (fromAddress, toAddress, amount) => {
  console.log("Preparing payment transaction...");
  console.log("From:", fromAddress);
  console.log("To:", toAddress);
  console.log("Amount:", amount, "SOL");

  const connection = initializeSolanaConnection();
  const fromPublicKey = new PublicKey(fromAddress);
  const toPublicKey = new PublicKey(toAddress);

  // Convert amount to lamports (1 SOL = 1e9 lamports)
  const lamports = Math.floor(amount * 1e9);

  console.log("Creating transaction...");
  const transaction = new Transaction();

  // Get the latest blockhash
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  console.log("Got blockhash:", blockhash);
  
  // Set the transaction properties
  transaction.recentBlockhash = blockhash;
  transaction.lastValidBlockHeight = lastValidBlockHeight;
  transaction.feePayer = fromPublicKey;

  // Add the transfer instruction
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: fromPublicKey,
      toPubkey: toPublicKey,
      lamports: lamports,
    })
  );

  console.log("Transaction created:", {
    blockhash: transaction.recentBlockhash,
    feePayer: transaction.feePayer.toBase58(),
    instructions: transaction.instructions.length,
    lastValidBlockHeight: transaction.lastValidBlockHeight
  });

  return transaction;
};

export const getTokenBalance = async (tokenAccount) => {
  try {
    const accountInfo = await getAccount(connection, new PublicKey(tokenAccount));
    return accountInfo;
  } catch (error) {
    console.error('Error getting token balance:', error);
    throw error;
  }
};

export const sendTokenPayment = async (fromTokenAccount, toTokenAccount, amount, owner) => {
  try {
    const transaction = new Transaction().add(
      createTransferInstruction(
        new PublicKey(fromTokenAccount),
        new PublicKey(toTokenAccount),
        new PublicKey(owner),
        amount,
        [],
        TOKEN_PROGRAM_ID
      )
    );

    // Note: In a real implementation, you would need to sign this transaction
    // with the owner's private key using a wallet adapter
    return transaction;
  } catch (error) {
    console.error('Error creating token payment transaction:', error);
    throw error;
  }
};

export const getSolanaPrice = async () => {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
    const data = await response.json();
    return data.solana.usd;
  } catch (error) {
    console.error('Error fetching SOL price:', error);
    throw error;
  }
};

export const convertUsdToSol = async (usdAmount) => {
  try {
    const solPrice = await getSolanaPrice();
    const solAmount = usdAmount / solPrice;
    console.log(`Converting ${usdAmount} USD to SOL:`, {
      solPrice,
      solAmount,
      usdAmount
    });
    return solAmount;
  } catch (error) {
    console.error('Error converting USD to SOL:', error);
    throw error;
  }
}; 