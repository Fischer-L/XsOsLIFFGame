const gameSocket = {
  init(httpServer, socketIO) {
		this.io = socketIO(httpServer);
		this.io.sockets.on('connection', function (socket) {
			
			console.log("gameSocket> server socket onconnection\n");

		  socket.on('client_msg', function (data) {
		    console.log("gameSocket> client_msg =", data, "\n");
		    if (!this.LIFF_UTOUID) {
		    	// Maybe it's not good to attach our property
		    	// onto the 3rd-party socket obj but this is simpler for a test app...
		    	this.LIFF_UTOUID = data.utouId;
		    	this.join(this.LIFF_UTOUID);
		    }
		    // Our server simply forwards the game message to another player.
		    this.to(this.LIFF_UTOUID).broadcast.emit("server_msg", data);
		    console.log("gameSocket> forward client_msg =", data, "\n");
		  });
		});
  },

};

module.exports = gameSocket;