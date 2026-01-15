'use client'

const { LAMPORTS_PER_SOL } = require('@solana/web3.js');

export default function Stat({ title, stat }) {
  return (
    <div className="flex--between">
      <h4>{title}</h4>
      <p>{stat / LAMPORTS_PER_SOL}</p>
    </div>

  );
}