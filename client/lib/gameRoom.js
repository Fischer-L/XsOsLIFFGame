import config from "../../config/client.env";
import { GAME_STATE, GAME_MSG_TYPE } from "./constants";

/**
 * This gameRoom in charge of managing the progress and the state-dispatching of the game
 */
const gameRoom = {
  init({ utouId, player, store, gameSocket }) {
    if (this._socket) {
      console.error("Cannot init the gameRoom more than once.");
      return;
    }
    
    this._store = store;
    this._socket = gameSocket;
    this._gameMsgHandlers = {};

    this._initStoreListeners();
    this._dispatch("set_utouId", utouId);
    this._dispatch("set_self_info", player);
    this._dispatch("set_game_state", GAME_STATE.WAITING);
  },

  async playMove(cellIdx, value) {
    try {
      await this._dispatch("play_a_move", { cellIdx, value });
      this._socket.send({
        action: "update_game",
        game: this._store.state.game.slice()
      });
    } catch (e) {
      console.error(e);
    }
  },

  leave() {
    this._dispatch("end_game");
  },

  /**
   * @return {String|null}
   *    "self" or "opponent".
   *    `null` if no winner (game is even).
   *    `undefined` if game is not yet over
   */
  get winner() {
    this._checkWinner(this._store.state.game);
    return this._winner;
  },

  /**
   * @return {Array<Integer>|null}
   *    `[0,1,2]` if the cell 0, 1, 2 connect one line.
   *    `null` if no line (game is even).
   *    `undefined` if game is not yet over
   */
  get winCells() {
    this._checkWinner(this._store.state.game);
    return this._winCells;
  },

  _checkWinner(game) {
    if (this._winner !== undefined) return;

    let lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],

      [0, 4, 8],
      [2, 4, 6],
    ];
    let selfWinning = -3;
    let opponentWinning = 3;
    if (this._store.state.isFirst) {
      selfWinning = 3;
      opponentWinning = -3;
    }
    for (let i = 0; i < lines.length; ++i) {
      let score = lines[i].reduce((score, cellIdx) => {
        return score + game[cellIdx];
      }, 0);
      if (score === selfWinning) {
        this._winner = "self";
      } else if (score === opponentWinning) {
        this._winner = "opponent";
      }
      if (this._winner) {
        this._winCells = lines[i];
        break;
      };
    }
    if (this._winner === undefined) {
      if (game.find(cell => cell === 0) === undefined) {
        this._winner = this._winCells = null;
      }
    }
  },

  _dispatch(action, payload) { // This method is just a shorthand
    this._store.dispatch(action, payload);
  },

  _addGameMsgHandler(type, handler) {
    if (this._gameMsgHandlers[type]) return;
    this._gameMsgHandlers[type] = handler;
  },

  _removeGameMsgHandler(type) {
    if (type === "*") this._gameMsgHandlers = {};
    if (!this._gameMsgHandlers[type]) return;
    this._gameMsgHandlers[type] = undefined;
  },

  _startHandshake() {
    this._addGameMsgHandler(GAME_MSG_TYPE.JOIN, this.onOpponentJoin);
    this._addGameMsgHandler(GAME_MSG_TYPE.START_GAME, this.onStartGameRequest);
    this._addGameMsgHandler(GAME_MSG_TYPE.LEAVE_GAME, this.OnOpponentLeave);
    
    let { self, utouId } = this._store.state;
    // Have to save this bound function so as to remove later
    this.onSocketMsg = this.onSocketMsg.bind(this);
    this._socket.open({
      utouId,
      url: config.SOCKET_URL,
      userId: self.userId,
      onMsg: this.onSocketMsg,
      onClose: () => this._dispatch("end_game"),
    });
    this._socket.send({
      action: GAME_MSG_TYPE.JOIN,
      name: self.name,
      imgURL: self.imgURL,
    });
  },

  _initGameplay() {
    this._addGameMsgHandler(GAME_MSG_TYPE.UPDATE_GAME, this.onRecvUpdateGame);
    this._addGameMsgHandler(GAME_MSG_TYPE.GAME_OVER, this.onRecvGameOver);
    console.log("TMP> _initGameplay isFirst, currentPlayer =", this._store.state.isFirst, this._store.state.currentPlayer);
  },

  _uninitGameplay() {
    this._removeGameMsgHandler(GAME_MSG_TYPE.UPDATE_GAME);
    this._removeGameMsgHandler(GAME_MSG_TYPE.GAME_OVER);
  },

  _disconnect() {
    if (!this._socket) return;
    let socket = this._socket;
    this._socket = undefined;

    socket.send({ action: GAME_MSG_TYPE.LEAVE_GAME });
    this._removeGameMsgHandler("*");
    // In case we close the connect before sending the message,
    // give a buffer time then close the connection.
    setTimeout(() => {
      socket.close();
      socket = undefined;
    }, 50);
  },

  _subscribeStore(type, listener) {
    if (this._storeListeners[type]) return;
    this._storeListeners[type] = listener;
  },

  // Unfortunately Vuex dosen't supply `unsubscribe` to a store
  // so we have to implement by ourselves...
  _unsubscribeStore(type) {
    if (!this._storeListeners[type]) return;
    this._storeListeners[type] = undefined;
  },

  _initStoreListeners() {
    if (this._storeListeners) return;

    this._storeListeners = {};

    this._subscribeStore("set_game_state", (mutation, state) => {
      console.log("TMP> onMutation =", mutation.type, state.gameState);
      switch (state.gameState) {
        case GAME_STATE.WAITING:
          this._startHandshake();
          return;

        case GAME_STATE.PLAYING:
          this._initGameplay();
          return;

        case GAME_STATE.OVER:
          this._uninitGameplay();
          this._disconnect();
          return;
      }
    });

    this._store.subscribe((mutation, state) => {
      let listener = this._storeListeners[mutation.type];
      if (listener) {
        try {
          listener.call(this, mutation, state);
        } catch (e) {
          console.error(e);
        }
      }
    });
  },

  onSocketMsg(payload) {
    console.log("TMP> onSocketMsg =", payload);
    let handler = this._gameMsgHandlers[payload.action];
    if (handler) {
      requestAnimationFrame(() => handler.call(this, payload));
    }
  },

  onOpponentJoin(payload) {
    this._removeGameMsgHandler(GAME_MSG_TYPE.JOIN);
    this._removeGameMsgHandler(GAME_MSG_TYPE.START_GAME);
    this._addGameMsgHandler(GAME_MSG_TYPE.START_GAME_ACK, this.onStartGameAck);

    let { self } = this._store.state;
    this._socket.send({
      action: GAME_MSG_TYPE.START_GAME,
      name: self.name,
      imgURL: self.imgURL,
    });
    this._dispatch("set_opponent_info", {
      userId: payload.from,
      name: payload.name,
      imgURL: payload.imgURL || "",
    });
  },

  onStartGameRequest(payload) {
    this._removeGameMsgHandler(GAME_MSG_TYPE.JOIN);
    this._removeGameMsgHandler(GAME_MSG_TYPE.START_GAME);

    this._dispatch("set_opponent_info", {
      userId: payload.from,
      name: payload.name,
      imgURL: payload.imgURL || "",
    });
    this._dispatch("start_game", false);
    this._socket.send({ action: GAME_MSG_TYPE.START_GAME_ACK });
  },

  onStartGameAck() {
    this._removeGameMsgHandler(GAME_MSG_TYPE.START_GAME_ACK);
    this._dispatch("start_game", true);
  },

  async onRecvUpdateGame(payload) {
    let { game } = this._store.state;
    let newGame = payload.game;
    let cellIdx = -1;
    for (let i = 0; i < 9; i++) {
      if (game[i] !== payload.game[i]) {
        cellIdx = i;
        break;
      }
    }
    if (cellIdx < 0) {
      console.log("TMP> onRecvUpdateGame - nothing to update - game, newGame =", game, newGame);
      return;
    }
    try {
      let onUpdate = () => {
        this._unsubscribeStore("update_game");
        if (this.winner !== undefined) {
          // Tell our opponent that the game is over
          this._socket.send({ action: GAME_MSG_TYPE.GAME_OVER });
          this._dispatch("end_game");
        }
      };
      this._subscribeStore("update_game", onUpdate);
      await this._dispatch("receive_a_move", { cellIdx, value: newGame[cellIdx] });
    } catch(e) {
      this._unsubscribeStore("update_game");
      console.error(e);
    }
  },

  onRecvGameOver() {
    this._dispatch("end_game");
  },

  OnOpponentLeave() {
    this._dispatch("end_game");
  },
};

export default gameRoom;
