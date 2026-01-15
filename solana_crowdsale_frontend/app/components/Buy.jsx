"use client";

import { useEffect, useRef, useState } from "react";
import { PublicKey } from "@solana/web3.js";

// Import config
import config from "@/app/config.json";

export default function Buy({
  crowdsaleCost,
  crowdsaleProgram,
  user,
  provider,
  anchorProvider,
  getUserBalance,
  getCrowdsaleBalance,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const buyRef = useRef(null);

  const buyHandler = async () => {
    const AMOUNT = Number(buyRef.current.value) * 10 ** 9;

    try {
      // Create the transaction
      const transaction = await crowdsaleProgram.methods
        .buyTokens(AMOUNT)
        .accounts({
          buyer: user.toString(),
          crowdsale: config.CROWDSALE_PDA,
          crowdsaleAuthority: config.CROWDSALE_AUTHORITY_PDA,
          mintAccount: config.TOKEN_MINT_ACCOUNT,
        })
        .transaction();

      // Get latest block data
      const { blockhash, lastValidBlockHeight } =
        await anchorProvider.connection.getLatestBlockhash();

      // Assign the fee payer and block hash
      transaction.feePayer = new PublicKey(user);
      transaction.recentBlockhash = blockhash;

      // Sign the transaction with Phantom wallet
      const { signature } = await provider.signAndSendTransaction(transaction);

      // Wait for transaction to finish
      await anchorProvider.connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });

      // This will trigger the useEffect to load the new balances
      setIsLoading(true);
    } catch (error) {
      console.log("error");
    }
  };

  useEffect(() => {
    if (user && isLoading) {
      getUserBalance(anchorProvider);
      getCrowdsaleBalance(anchorProvider);
      setIsLoading(false);
    }
  }, [isLoading]);

  return (
    <div className="buy">
      <h2>Buy Tokens</h2>

      <form action={buyHandler}>
        <input
          type="number"
          placeholder="1"
          min={0}
          max={100}
          step={0.01}
          ref={buyRef}
          required
        />
        <input type="submit" value="SUBMIT" className="button" />
        <p>Price: {crowdsaleCost.toFixed(2)} SOL</p>
      </form>
    </div>
  );
}
