import { type Connection, Keypair, type Signer, Transaction, SystemProgram, sendAndConfirmTransaction } from '@solana/web3.js'
import { createMint, mintTo } from '@solana/spl-token'

/*
  Check out SPL token docs:
  https://spl.solana.com/token#example-creating-your-own-fungible-token
*/

// create a Mint account
export async function createMintAccount({
    connection,
    creator,
    decimals = 9
  } : {
    connection: Connection,
    creator: Signer,
    decimals?: number
  }) {
    // generate a Keypair for Mint account
    const mintKeypair = Keypair.generate();
  
    const mint = await createMint(
      connection, // Connection to the blockchain
      creator.payer, // Who is paying for the transaction
      creator.payer.publicKey, // Who is allowed to mint
      creator.payer.publicKey, // Who is allowed to freeze
      decimals, // Token decimals, usually 9
      mintKeypair // Initialize mint account to this keypair
    )

    const mintId = mint.toBase58()

    console.log(`Created Mint Account: ${mintId}`)

    return mintKeypair

}
// For Mint account to Mint tokens
export async function mintTokens({
  connection,
  creator,
  mintKeypair,
  tokenAccount,
  amount
}: {
  // set arguments
  connection: Connection,
  creator: Signer,
  mintKeypair: Keypair,
  tokenAccount: Keypair,
  amount: number
}) {
    const mintAuthority = creator // Who is allowed to mint

    await mintTo(
      connection,
      creator.payer,
      mintKeypair.publicKey,
      tokenAccount,
      mintAuthority,
      amount
    )

    console.log(`Minted ${amount / 10 ** 9} Tokens to ${tokenAccount}`)

}

// enable moving tokens during Buy and Withdraw
export async function transferLamports({
    connection,
    from,
    to,
    amount
}: {
    connection: Connection,
    from: Signer,
    to: Keypair,
    amount: number
}) {
    // Transaction function coming from @solana/web3 library, .add adding a instruction
    const transaction = new Transaction().add( 
        SystemProgram.transfer({
          fromPubkey: from.payer.publicKey,
          toPubkey: to.publicKey,
          lamports: amount,
        })
  );

  // this broadcast out tx to the network and wait for it to confirm
  await sendAndConfirmTransaction // sendAndConfirmTransaction function coming from @solana/web3 library
      await sendAndConfirmTransaction(
      connection,
      transaction,
      [from.payer]
  );

  console.log(`Sent ${amount / 10 ** 9} SOL to ${to.publicKey}\n`)

}
