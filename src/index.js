var Socketiop2p = require('socket.io-p2p');
var io = require('socket.io-client');

function init () {
  "use strict";

  var socket = io();
  var opts = {peerOpts: {trickle: false}, autoUpgrade: false};
  var p2psocket = new Socketiop2p(socket, opts, function () {
    privateButton.disabled = false;
    p2psocket.emit('peer-obj', 'Hello there. I am ' + p2psocket.peerId);
  });

  // Elements
  var privateButton = document.getElementById('private');
  var form = document.getElementById('msg-form');
  var box = document.getElementById('msg-box');
  var msgList = document.getElementById('msg-list');
  var upgradeMsg = document.getElementById('upgrade-msg');

  var delays = [];
  var averageDelay;

  p2psocket.on('peer-msg', function(data) {
    var delay = Date.now() - data.timestamp;

    var li = document.createElement("li");
    li.appendChild(document.createTextNode(`${ data.timestamp } [${ delay }ms]{${ delay - averageDelay }}: ${ data.text }`));
    msgList.appendChild(li);
  });

  p2psocket.on('down-beat', function (data) {
    console.log("Hearbeat", data);
    delays = delays.slice(-100);
    delays.push(Date.now() - data.up);
    averageDelay = delays.reduce((a, b) => a + b, 0) / delays.length;
    document.getElementById('delay').innerHTML = averageDelay + "ms";
  });
  p2psocket.on('up-beat', (data) => {
    data.down = Date.now();
    p2psocket.emit('down-beat', data);
  });

  setInterval(() => p2psocket.emit('up-beat', { up: Date.now() }), 100);

  form.addEventListener('submit', function(e, d) {
    e.preventDefault();
    var li = document.createElement("li");
    li.appendChild(document.createTextNode(box.value));
    msgList.appendChild(li);
    p2psocket.emit('peer-msg', { text: box.value, timestamp: Date.now() })
    box.value = '';
  });

  privateButton.addEventListener('click', function(e) {
    goPrivate();
    p2psocket.emit('go-private', true)
  })

  p2psocket.on('go-private', function () {
    goPrivate();
  });

  function goPrivate () {
    p2psocket.useSockets = false;
    upgradeMsg.innerHTML = "WebRTC connection established!";
    privateButton.disabled = true;
  }

}

document.addEventListener('DOMContentLoaded', init, false)
