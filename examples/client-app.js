const WebSocket = require('ws');

const ws = new WebSocket('ws://127.0.0.1:8080/');

var args = [
  '-i',
  'input.mp4',
  '-y',
  '-an',
  '-sn',
  '-c:v',
  'libx264',
  '-b:v:0',
  '4800k',
  '-profile',
  'main',
  '-keyint_min',
  '120',
  '-g',
  '120',
  '-b_strategy',
  '0',
  '-use_timeline',
  '1',
  '-use_template',
  '1',
  '-single_file',
  '1',
  '-single_file_name',
  'video_1.mp4',
  '-f',
  'dash',
  'kk.mpg'
]


ws.on('open', function open() {
  var msg = {};
  msg.command = "ffmpeg";
  msg.niceness = 0;
  msg.args = args;
  sendAsJson(ws,msg);
  //ws.send(msg);
});

ws.on('message', function incoming(data) {
  console.log(data);
});

function sendAsJson(ws,msg){
  console.log('sending ',msg);
  ws.send(JSON.stringify(msg), function ack(error) {
    console.log('socket error',error);
    // If error is not defined, the send has been completed, otherwise the error
    // object will indicate what failed.
  });
}