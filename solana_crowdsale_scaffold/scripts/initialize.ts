// @ts-nocheck

import * as anchor from "@coral-xyz/anchor";
import { clusterApiUrl, Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";

import { Crowdsale } from "../target/types/crowdsale";

async function main() {
  // Wallet from ANCHOR_WALLET
  const creator = anchor.Wallet.local();

  // Provider (devnet)
  const provider = new anchor.AnchorProvider(
    new Connection(clusterApiUrl("devnet"), "confirmed"),
    creator,
    { preflightCommitment: "confirmed" }
  );
  anchor.setProvider(provider);

  // Program id (deployed)
  const CROWDSALE_PROGRAM_ID = new PublicKey(
    "HHEMku7SfVTSUnVobRawMC7pz54pebkG2W7ZRmCd357W"
  );

  // Mint
  const TOKEN_MINT_ACCOUNT = new PublicKey(
    "BxUX7gQuuyn2upVVJtzBAL7ZoyxG9XZbgCE7omBekLRp"
  );

  // ✅ Use workspace program (PnP-safe)
  const program = anchor.workspace.Crowdsale as anchor.Program<Crowdsale>;

  // Seed only (id is used for PDA seeds in Rust)
  const ID = anchor.web3.Keypair.generate().publicKey;
  const COST = 1;

  // crowdsale PDA: seeds = [id]
  const [crowdsalePDA] = PublicKey.findProgramAddressSync(
    [ID.toBuffer()],
    CROWDSALE_PROGRAM_ID
  );

  // authority PDA: seeds = [id, AUTHORITY_SEED]
  // NOTE: this assumes AUTHORITY_SEED == b"authority" in Rust
  const [crowdsaleAuthorityPDA] = PublicKey.findProgramAddressSync(
    [ID.toBuffer(), Buffer.from("authority")],
    CROWDSALE_PROGRAM_ID
  );

  // token ATA: mint + authority (allow off-curve because PDA)
  const tokenAccountPDA = getAssociatedTokenAddressSync(
    TOKEN_MINT_ACCOUNT,
    crowdsaleAuthorityPDA,
    true
  );

  console.log("ID:", ID.toBase58());
  console.log("crowdsalePDA:", crowdsalePDA.toBase58());
  console.log("crowdsaleAuthorityPDA:", crowdsaleAuthorityPDA.toBase58());
  console.log("tokenAccountPDA:", tokenAccountPDA.toBase58());

  try {
    const sig = await program.methods
      .initialize(ID, COST)
      .accounts({
        crowdsale: crowdsalePDA,
        mintAccount: TOKEN_MINT_ACCOUNT,
        tokenAccount: tokenAccountPDA,
        crowdsaleAuthority: crowdsaleAuthorityPDA,
        creator: provider.wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("✅ initialize tx:", sig);
  } catch (e) {
    console.error("❌ initialize failed:", e);
    if (e?.logs) console.error("logs:", e.logs);
    process.exit(1);
  }

  // Fetch state
  const crowdsaleState = await program.account.crowdsale.fetch(crowdsalePDA);

  console.log(`Successfully Initialized Crowdsale at ${crowdsalePDA.toBase58()}`);
  console.log(`Crowdsale Authority: ${crowdsaleAuthorityPDA.toBase58()}`);
  console.log(`ID: ${crowdsaleState.id.toBase58?.() ?? crowdsaleState.id}`);
  console.log(`COST: ${crowdsaleState.cost}`);
  console.log(`TOKEN MINT: ${crowdsaleState.mintAccount.toBase58?.() ?? crowdsaleState.mintAccount}`);
  console.log(`TOKEN ACCOUNT: ${crowdsaleState.tokenAccount.toBase58?.() ?? crowdsaleState.tokenAccount}`);
}

main();
