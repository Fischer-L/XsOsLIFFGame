const mutations = {

  set_game_state(state, gameState) {
    state.gameState = gameState;
  },

  set_utouId(state, utouId) {
    state.utouId = utouId;
  },
  
  set_self_info(state, info) {
    let { userId, name, imgURL } = info;
    state.self = { userId, name, imgURL };
  },
  
  set_opponent_info(state, info) {
    let { userId, name, imgURL } = info;
    state.opponent = { userId, name, imgURL };
  },

  is_my_turn(state, isSelf) {
    state.currentPlayer = !!isSelf ? "self" : "opponent";
  },

  is_me_first(state, first) {
    state.isFirst = first;
  },

  update_game(state, game) {
    state.game = game;
  },
};

export { mutations };
