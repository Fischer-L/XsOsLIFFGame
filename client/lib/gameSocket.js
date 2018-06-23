function isObj(obj) {
  return obj && typeof obj == "object" && !Array.isArray(obj);
}

/**
 * This gameSocket in charge of managing the connection with the server.
 * It only knows how to send/receive messages to/from the server.
 */
const gameSocket = {
  VERSION: 1,

  /**
   * Init the socket connection to the server.
   *
   * @params socketIOClient {Object} The "socket.io-client" API object
   */
  init(socketIOClient) {
    if (this._socketIOClient) {
      console.error("Init the socket again more than once");
      return;
    }
    this._socketIOClient = socketIOClient;
  },

  /**
   * Start the socket connection to the server.
   *
   * @params url {String} The url to connect
   * @params userId {String} The LIFF userId
   * @params utouId {Strong} The LIFF utouId
   * @params listener See `subscribe`
   */
  connect({ url, userId, utouId, listener }) {
    if (this._conn) {
      console.error("Connect the socket again with url =", url);
      return;
    }
    this._userId = userId;
    this._utouId = utouId;
    this._seq = 0;

    this._listeners = new Map();
    this.subscribe(listener);

    this._conn = this._socketIOClient(url);
    this._conn.on("server_msg", payload => this._notifyListeners(payload));
  },

  /**
   * Subscribe to messages from the server
   *
   * @params listener {Function} Will be invoked with a payload object from the server.
   */
  subscribe(listener) {
    if (typeof listener == "function" && !this._listeners.has(listener)) {
      this._listeners.set(listener, listener);
    }
  },

  unsubscribe(listener) {
    if (this._listeners.has(listener)) {
      this._listeners.delete(listener);
    }
  },

  _notifyListeners(payload) {
    if (!isObj(payload)) {
      console.error("Notify socket listeners with invalid payload =", payload);
      return;
    }
    this._listeners.forEach(listener => {
      requestAnimationFrame(() => {
        try {
          listener(payload);
        } catch (e) {
          console.error(e);
        }
      });
    });
  },

  /**
   * Format the payload sent to the server
   *
   * @param payload {Object}
   * @return {Object} an new formatted payload
   */
  formatPayload(payload) {
    return Object.assign({}, payload, {
      seq: this._seq++,
      from: this._userId,
      utouId: this._utouId,
      version: this.VERSION,
    });
  },

  send(payload) {
    let payload = this.formatPayload(payload);
    if (!payload) {
      console.error("Send a socket message without payload.");
      return;
    }
    this._conn.emit("client_msg", payload);
  },
};

export default gameSocket;
