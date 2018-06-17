const GAME_STATE = {
  // Waiting the join of opponent to start a game
  WAITING: "WAITING",
  // Playing a game
  PLAYING: "PLAYING",
  // The game is over.
  OVER: "OVER",
};

function getInitialState() {
  return {
    // String. See GAME_STATE.
    gameState: GAME_STATE.waiting,
    // String. The LIFF utouId
    utouId: "",
    self: {
      // String. The LIFF userId
      userId: "",
      // String. The LIFF user's name
      name: "",
      // String. Optional. The LIFF user's picture url
      imgURL: "",
    },
    opponent: {
      userId: "",
      name: "",
      imgURL: "",
    },
    // String. "self" or "opponent"
    currentPlayer: "",
    // Boolean. `true` means go play first. The first one plays "O"
    isFirst: false,
    // Array<Number>. 1 == "O", -1 == "X", 0 == empty
    game: [0, 0, 0, 0, 0, 0, 0, 0, 0],
  };
}

export { getInitialState, GAME_STATE };