import Stat from "./Stat"

export default function Analytics({ userBalance, userTokenBalance, crowdsaleTokenBalance, crowdsaleBalance }) {
  return (
    <div className="analytics">
      <h2>Analytics</h2>
      <div className="analytics__program">
        <h3>Fundraiser Stats</h3>
        <hr />
        
        <Stat title={"Tokens Available"} stat={crowdsaleTokenBalance} />

        <Stat title={"Total SOL raised"} stat={crowdsaleBalance} />

      </div>

      <div className="analytics__user">
        <h2>Account stats</h2>
        <hr />

        <Stat title={"Tokens Balance"} stat={userTokenBalance} />

        <Stat title={"SOL balance"} stat={userBalance} />

      </div>
    </div>
  )
}