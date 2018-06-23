const GAME_STATE = {
  // No one is in the game
  EMPTY: "EMPTY",
  // The self is in the game and waiting the join of the opponent to start a game
  WAITING: "WAITING",
  // Playing a game
  PLAYING: "PLAYING",
  // The game is over.
  OVER: "OVER",
};

const GAME_MSG_TYPE = {
  JOIN: "join",
  START_GAME: "start_game",
  START_GAME_ACK: "start_game_ack",
  UPDATE_GAME: "update_game",
  GAME_OVER: "game_over",
};

export { GAME_STATE, GAME_MSG_TYPE };
