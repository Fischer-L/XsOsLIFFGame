const path = require("path");
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const httpSvr = http.Server(app);
const io = socketIO(httpSvr);
const paths = {
  publicDir: path.resolve('./dist'),
  indexPage: path.resolve('./dist/index.html')
};

// Server static files
app.use(express.static(paths.publicDir));

app.get("/", (req, res) => {
  res.sendFile(paths.indexPage);
});

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my_event', function (data) {
    console.log(data);
  });
});

const PORT = process.env.PORT || 3000;

httpSvr.listen(PORT, function(){
  console.log('listening on *:', PORT, __dirname);
});