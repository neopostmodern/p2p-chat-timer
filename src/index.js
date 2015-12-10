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
  var timeDifferences = [];
  var averageDelay;
  var averageTimeDifference;

  p2psocket.on('peer-msg', function(data) {
    var delay = Date.now() - averageTimeDifference - data.timestamp;

    var li = document.createElement("li");
    li.appendChild(document.createTextNode(`${ data.timestamp } [${ delay }ms]{${ delay - averageDelay }}: ${ data.text }`));
    msgList.appendChild(li);
  });

  p2psocket.on('down-beat', function (data) {
    var delay = (Date.now() - data.up) / 2;

    delays = delays.slice(-100);
    timeDifferences = timeDifferences.slice(-1000);

    delays.push(delay);
    averageDelay = delays.reduce((a, b) => a + b, 0) / delays.length;

    var timeDifference = (Date.now() - averageDelay) - data.down;
    timeDifferences.push(timeDifference);
    averageTimeDifference = timeDifferences.reduce((a, b) => a + b, 0) / timeDifferences.length;

    document.getElementById('delay').innerHTML = `${ averageDelay }ms <br/>(Offset: ${ averageTimeDifference }ms)`;
  });
  p2psocket.on('up-beat', (data) => {
    data.down = Date.now();
    p2psocket.emit('down-beat', data);
  });

  var hearbeat = setInterval(() => p2psocket.emit('up-beat', { up: Date.now() }), 100);

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
    clearInterval(hearbeat);
  }

}

document.addEventListener('DOMContentLoaded', init, false)
