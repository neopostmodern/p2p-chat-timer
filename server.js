var ecstatic = require('ecstatic');
var server = require('http').createServer(
  ecstatic({ root: __dirname })
);
var p2pserver = require('socket.io-p2p-server').Server
var io = require('socket.io')(server);

server.listen(3030, function() {
  console.log("Listening on 3030");
});

io.use(p2pserver);

io.on('connection', function(socket) {
  socket.on('peer-msg', function(data) {
    console.log(`Message ${ socket.id }:`, data);
    socket.broadcast.emit('peer-msg', data);
  });

  socket.on('up-beat', function(data) {
    socket.broadcast.emit('up-beat', data);
  });
  socket.on('down-beat', function(data) {
    socket.broadcast.emit('down-beat', data);
  });

  socket.on('go-private', function(data) {
    socket.broadcast.emit('go-private', data);
  });
})
