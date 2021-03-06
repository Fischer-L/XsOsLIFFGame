function isObj(obj) {
  return obj && typeof obj == "object" && !Array.isArray(obj);
}

/**
 * This gameSocket in charge of managing the connection with the server.
 */
const gameSocket = {
  VERSION: 3,

  /**
   * @params socketIOClient {Object} The "socket.io-client" API object
   */
  init(socketIOClient) {
    if (this._socketIOClient) {
      console.error("gameSocket> Init the socket again more than once");
      return;
    }
    this._socketIOClient = socketIOClient;
  },

  /**
   * Open one socket connection to the server.
   *
   * @params url {String} The url to connect
   * @params userId {String} The LIFF userId
   * @params utouId {Strong} The LIFF utouId
   * @params onMsg {Function} Called with a payload message from the server.
   * @params onClose {Function} Called when the connection closed by the server.
   */
  open({ url, userId, utouId, onClose, onMsg }) {
    if (this._conn) {
      console.error("gameSocket> Connect the socket again with url =", url);
      return;
    }
    this._userId = userId;
    this._utouId = utouId;
    this._seq = 0;

    this.onMsg = onMsg;
    this.onClose = onClose;

    this._conn = this._socketIOClient(url);
    this._conn.on("connect", () => this.connected = true);
    this._conn.on("disconnect", () => {
      this.connected = false;
      this.onClose();
    });
    this._conn.on("server_msg", payload => requestAnimationFrame(() => this.onMsg(payload)));
  },

  close() {
    if (this._conn) {
      this._conn.close();
      this._conn = undefined;
      this.connected = false;
    }
  },

  /**
   * Format the payload sent to the server
   *
   * @param payload {Object}
   * @return {Object} an new formatted payload
   */
  formatPayload(payload) {
    if (!isObj(payload)) return null;
    return Object.assign({}, payload, {
      seq: this._seq++,
      from: this._userId,
      utouId: this._utouId,
      version: this.VERSION,
    });
  },

  send(payload) {
    let formatted = this.formatPayload(payload);
    if (!formatted) {
      console.error("gameSocket> Send a socket message with invalid payload =", payload);
      return;
    }
    console.log("gameSocket> send client_msg =", formatted);
    this._conn.emit("client_msg", formatted);
  },
};

export default gameSocket;
