var express = require('express')
const Ffmpeg = require('fluent-ffmpeg');
const WebSocket = require('ws');
const transcoder = require('./src/transcoder.js');

if(!transcoder.initialize()){
  console.log("Streamy transcoder failed to initialize");
  exit(-1);
}

transcoder.transcodeOffline("tests/input.mp4","tests/output.mpd",0,
  function(msg){console.log(msg)},
  function(msg){console.log(msg)});


const wss = new WebSocket.Server({
  port: 8080
});

wss.on('connection', function connection(ws) {
  
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
      //Parse command
      var jsonContent;
      try {  
        jsonContent = JSON.parse(message);
        transcoder.processCommand(jsonContent, 
          function(progression){sendAsJson(ws,progression);},
          function(finalMessage){sendAsJson(ws,finalMessage);}
        );
      } catch (e) {
        console.log("Error received",e,command);
        
        //ws.send('something', function ack(error) {
          // If error is not defined, the send has been completed, otherwise the error
          // object will indicate what failed.
        //});
      }
  });
  

  try {
    jsonContent = JSON.parse(message);
    transcoder.processCommand(jsonContent,
      function(progression){sendAsJson(ws,progression);},
      function(finalMessage){sendAsJson(ws,finalMessage);}
    );
  }catch(error){
    res.status(400);
    res.send('Error parsing request: ',error);
  }
  
  transcoder.transcode();

  ws.send('something', function ack(error) {
    // If error is not defined, the send has been completed, otherwise the error
    // object will indicate what failed.
  });
});


function sendAsJson(ws,msg){
  ws.send(JSON.stringify(msg), function ack(error) {
    console.log('socket error',error);
    // If error is not defined, the send has been completed, otherwise the error
    // object will indicate what failed.
  });
}


// Heart beats to detect broken connections

function noop() {}

function heartbeat() {
  this.isAlive = true;
}

wss.on('connection', function connection(ws) {
  ws.isAlive = true;
  ws.on('pong', heartbeat);
});

const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) return ws.terminate();

    ws.isAlive = false;
    ws.ping(noop);
  });
}, 30000);

////////
//var app = express()

//var server = http.createServer(app);

//app.use(express.json());       // to support JSON-encoded bodies
//app.use(express.urlencoded()); // to support URL-encoded bodies

//app.use(cors());
//app.use(express.static('public'));

//app.get('/', function (req, res) {
//	res.send('Hello World!')
//})

// POST
//app.post('/transcode', function(req, res) {
//  try {
//    var fileName = req.body.filename, // file name to transcode
//	      mode = req.body.mode,        //offline / online
//	      priority = req.body.priority
	      
    // ...
//  }catch(error){
//    res.status(400);
//    res.send('Error parsing request: ',error);
//  }
//});

// 
//app.get('/stats', function(req, res) {
//  res.send('Not implemented!')
  // ...
//});

//var server = app.listen(80, function () {

//  var host = server.address().address
//  var port = server.address().port

//  console.log("Streamy node listening at http://%s:%s", host, port)
//})
