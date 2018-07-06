import Vue from 'vue';
import Vuex from 'vuex';
import { GAME_STATE } from "../lib/constants";

Vue.use(Vuex);

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

const actions = {
  set_game_state({ commit, state }, value) {
    commitGameState({ commit, state }, value);
  },

  set_utouId({ commit }, utouId) {
    commit("set_utouId", utouId);
  },

  set_self_info({ commit }, info) {
    commit("set_self_info", info);
  },

  set_opponent_info({ commit }, info) {
    commit("set_opponent_info", info);
  },

  start_game({ commit, state }, isFirst) {
    commit("is_my_turn", isFirst);
    commit("is_me_first", isFirst);
    commitGameState({ commit, state }, GAME_STATE.PLAYING);
  },

  end_game({ commit, state }) {
    commitGameState({ commit, state }, GAME_STATE.OVER);
  },

  play_a_move({ commit, state }, params) {
    return new Promise((resolve, reject) => {
      let { cellIdx, value } = params;
      if (state.currentPlayer == "self" &&
          isValidMove(state, cellIdx, value)
      ) {
        let newGame = state.game.slice();
        newGame[cellIdx] = value;
        commit("update_game", newGame);
        commit("is_my_turn", false);
        resolve();
        return;
      }
      reject();
    });
  },

  receive_a_move({ commit, state }, params) {
    return new Promise((resolve, reject) => {
      let { cellIdx, value } = params;
      if (state.currentPlayer == "opponent" &&
          isValidMove(state, cellIdx, value)
      ) {
        let newGame = state.game.slice();
        newGame[cellIdx] = value;
        commit("update_game", newGame);
        commit("is_my_turn", true);
        resolve();
        return;
      }
      reject();
    });
  },
};

function commitGameState({ commit, state }, value) {
  if (state.gameState === value) return;
  commit("set_game_state", value);
}

function isValidMove(state, cellIdx, value) {
  if (cellIdx < 0 || cellIdx > 8) {
    console.error("Play a value on an invalid cell of", cellIdx);
    return false;
  }
  if (value !== 1 && value !== -1) {
    console.error("Play an invalid value of", value);
    return false;
  }
  if (state.game[cellIdx] !== 0) {
    console.error("Play a value on a occupied cell of", cellIdx, state.game);
    return false;
  }
  return true;
}

function getInitialState() {
  return {
    // String. See GAME_STATE.
    gameState: GAME_STATE.EMPTY,
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

export default () => {
  return new Vuex.Store({
    state: getInitialState(),
    strict: true,
    mutations,
    actions,
  })
};