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
  set_game_state({ commit }, state) {
    commit("set_game_state", state);
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

  start_game({ commit }, isFirst) {
    commit("is_my_turn", isFirst);
    commit("is_me_first", isFirst);
    commit("set_game_state", GAME_STATE.PLAYING);
  },

  end_game({ commit }) {
    commit("set_game_state", GAME_STATE.OVER);
  },

  play_a_move({ commit, state }, params) {
    return new Promise((resolve, reject) => {
      let { cellIdx, value } = params;
      if (state.currentPlayer == "self" &&
          isValidMove(state, cellIdx, value)
      ) {
        console.log("TMP> action play_a_move", params);
        let newGame = state.game.slice();
        newGame[cellIdx] = value;
        commit("update_game", newGame);
        commit("is_my_turn", false);
        resolve();
        return;
      }
      console.log("TMP> action play_a_move fail", params, state.game);
      reject();
    });
  },

  receive_a_move({ commit, state }, params) {
    return new Promise((resolve, reject) => {
      let { cellIdx, value } = params;
      if (state.currentPlayer == "opponent" &&
          isValidMove(state, cellIdx, value)
      ) {
        console.log("TMP> action receive_a_move", params);
        let newGame = state.game.slice();
        newGame[cellIdx] = value;
        commit("update_game", newGame);
        commit("is_my_turn", true);
        resolve();
        return;
      }
      console.log("TMP> action receive_a_move fail", params, state.game);
      reject();
    });
  },
};

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
  const state = {
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

  // TMP FAKE State
  // state.game = [1, 0, 1, -1, 0, -1, 0, -1, 0];

  // state.self.userId = "123445678";
  // state.self.name = "Sally";
  // state.self.imgURL = "data:image/png;base64,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";

  // state.opponent.userId = "abcdefg";
  // state.opponent.name = "Brown";
  // state.opponent.imgURL = "/static/img/brown.7ebd41b.jpg"
  // TMP FAKE State END

  return state;
}

export default () => {
  return new Vuex.Store({
    state: getInitialState(),
    strict: true,
    mutations,
    actions,
  })
};