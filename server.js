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

  socket.on('hearbeat', function(data) {
    console.log(`Hearbeat ${ socket.id }:`, data);
    socket.broadcast.emit('heartbeat', data);
  });

  socket.on('go-private', function(data) {
    socket.broadcast.emit('go-private', data);
  });
})
