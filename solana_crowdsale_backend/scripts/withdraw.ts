/*
  Even though we deploy the program via `anchor deploy`,
  we still need to initialize and create the actual crowdsale
  by interacting with the deployed program.
*/

// We include nocheck just to avoid 
// conflicts and simplify the script
// @ts-nocheck

import * as anchor from "@coral-xyz/anchor"
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js'

import IDL from "../target/idl/crowdsale.json"
import { Crowdsale } from "../target/types/crowdsale"

async function main() {
    // Setup wallet
    const creator = anchor.Wallet.local()

    // Setup provider
    const provider = new anchor.AnchorProvider(
        new Connection(clusterApiUrl("devnet")),
        creator,
        { preflightCommitment: "confirmed" }
    )

    anchor.setProvider(provider)

    const CROWDSALE_PROGRAM_ID = new PublicKey("7QDWng8Lkjt6kHBegYpUZdkLT16XTtq2bfNdU5XyRaxp")
    const CROWDSALE_PDA = new PublicKey("C5aeaxSdb8jCxDmEYYm1wEP9Dw4j1XUcrdTRfod3ScgF")

    console.log("Withdraw: Program ID =", CROWDSALE_PROGRAM_ID.toBase58());
    console.log("Withdraw: Crowdsale PDA =", CROWDSALE_PDA.toBase58(), "\n");

    const program = anchor.workspace.Crowdsale as anchor.Program<Crowdsale>

    console.log(program)


    try {
        const withdrawTransaction = await program.methods.withdraw().accounts({
            owner: creator.publicKey,
            crowdsale: CROWDSALE_PDA,
            systemProgram: anchor.web3.SystemProgram.programId
        }).signers([creator.payer]).rpc();



        console.log("Withdraw transaction signature:", withdrawTransaction);
        console.log("Withdraw complete!");

    } catch (err) {
        console.error("Error during the withdraw:", err);
    }

}

main().then(() => console.log("Script finished")).catch((err) => console.error(err));