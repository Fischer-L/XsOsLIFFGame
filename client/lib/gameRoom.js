import config from "../../config/client.env";
import { GAME_STATE, GAME_MSG_TYPE } from "./constants";

const gameRoom = {
  init({ utouId, player, store, gameSocket }) {
    if (this._socket) {
      console.error("Cannot init the gameRoom more than once.");
      return;
    }
    
    this._store = store;
    this._socket = gameSocket;
    this._gameMsgHandlers = {};

    this._store.subscribe(this.onMutation.bind(this));
    this._dispatch("set_utouId", utouId);
    this._dispatch("set_self_info", player);
    this._dispatch("set_game_state", GAME_STATE.WAITING);
  },

  _dispatch(action, payload) { // This method is just a shorthand
    this._store.dispatch(action, payload);
  },

  _addGameMsgHandler(type, handler) {
    if (this._gameMsgHandlers[type]) return;
    this._gameMsgHandlers[type] = handler;
  },

  _removeGameMsgHandler(type) {
    if (!this._gameMsgHandlers[type]) return;
    this._gameMsgHandlers[type] = undefined;
  },

  _startHandshake() {
    this._addGameMsgHandler(GAME_MSG_TYPE.JOIN, this.onOpponentJoin);
    this._addGameMsgHandler(GAME_MSG_TYPE.START_GAME, this.onStartGameRequest);
    
    let { self, utouId } = this._store.state;
    // Have to save this bound function so as to remove later
    this.onSocketMsg = this.onSocketMsg.bind(this);
    this._socket.connect({
      utouId,
      url: config.SOCKET_URL,
      userId: self.userId,
      listener: this.onSocketMsg,
    });    
    this._socket.send({
      action: GAME_MSG_TYPE.JOIN,
      name: self.name,
      imgURL: self.imgURL,
    });
  },

  _initGameplay() {
    this._addGameMsgHandler(GAME_MSG_TYPE.UPDATE_GAME, this.onUpdateGame);
    this._addGameMsgHandler(GAME_MSG_TYPE.GAME_OVER, this.onGameOver);
    console.log("TMP> _initGameplay isFirst, currentPlayer =", this._store.state.isFirst, this._store.state.currentPlayer);
  },

  onMutation(mutation, state) {
    console.log("TMP> onMutation =", mutation.type, state.gameState);
    if (mutation.type !== "set_game_state") return;

    switch (state.gameState) {

      case GAME_STATE.WAITING:
        this._startHandshake();
        return;

      case GAME_STATE.PLAYING:
        this._initGameplay();
        return;
    }
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

  onUpdateGame() {
    // TODO
  },

  onGameOver() {
    // TODO
  },
};

export default gameRoom;
