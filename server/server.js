const path = require("path");
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const gameSocket = require("./gameSocket");

const app = express();
const httpSvr = http.Server(app);
const paths = {
  publicDir: path.resolve('./dist'),
  indexPage: path.resolve('./dist/index.html')
};

// Server static files
app.use(express.static(paths.publicDir));

app.get("/", (req, res) => {
  res.sendFile(paths.indexPage);
});

gameSocket.init(httpSvr, socketIO);

const PORT = process.env.PORT || 3000;
httpSvr.listen(PORT, function(){
  console.log('listening on port:', PORT, __dirname);
});