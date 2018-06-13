const socketIO = require('socket.io');

const webSocket = {
  init(httpServer) {
	this.io = socketIO(httpServer);
	this.io.sockets.on('connection', function (socket) {
	  socket.emit('server_msg', { body: 'Hello world from server WebSocket' });
	  socket.on('client_msg', function (data) {
	    console.log(data);
	    socket.emit('server_msg', { body: `Server received ${data.body} by WebSocket` });
	  });
	});
  },

};

module.exports = webSocket;