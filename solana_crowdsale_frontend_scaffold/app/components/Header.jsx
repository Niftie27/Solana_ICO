"use client"

export default function Header({ provider, user }) {
  const connectHandler = async () => {
    if (provider) {
      if (!provider?.isPhantom) {
        window.open('https://phantom.app/', '_blank')
        return
      }

      if (user === null) {
        await provider.request({ method: "connect" })
      } else {
        await provider.request({ method: "disconnect" })
      }

      return
    }

    window.open('https://phantom.app/', '_blank')
  }

  return (
    <header className="header">
      <p>Solana Crowdsale</p>
      <button onClick={connectHandler} className="button">
        {user ? `${user.toString().slice(0, 5)}...${user.toString().slice(38, -1)}` : "CONNECT"}
      </button>
    </header>
  );
}