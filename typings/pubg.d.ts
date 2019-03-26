declare namespace PUBG {
  interface Player {
    kills: number
    out: boolean
    player: string
  }

  interface GameInfo {
    players: Array<Player>
    currentPlayerName: string
  }
}
