const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');

const FfmpegCmd = require('./src/ffmpeg/ffmpeg.js');
const Messages = require('./src/messages.js')

// Create http and ws server
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// load configuration
var config = {}
try{
  var confRaw = fs.readFileSync("conf.json");
  config = JSON.parse(confRaw);
}catch(error){
  console.error("Unable to load configuration: ",error);
  process.exit();
}
var workDir = config.working_dir;

// Return all ffmpeg infos on this computer
app.get('/ffmpeg_infos', function (req, res) {
  var ffmpegcmd = FfmpegCmd();
  ffmpegcmd.getInfos().then( (result) => {
    res.send(result);
  })
  .catch( (err) => {
    res.status(500);
    res.send(err);
  });  
});

// Setup websocket to process ffmpeg commands
wss.on('connection', function connection(ws) {
  var ffmpegProcess = null;
  console.log('New ws connection');

  ws.on('close', function close() {
    if(ffmpegProcess != null){
      ffmpegProcess.kill();
    }
  })
  ws.on('message', function incoming(message) {
    //console.log('Received %s', message);
      //Parse command
      var jsonContent;
      try {  
        jsonContent = JSON.parse(message);
        if(jsonContent.command === "ffmpeg" && !ffmpegProcess){
          ffmpegProcess = FfmpegCmd();

          //build option
          var options = {};
          if(jsonContent.niceness >= 0){
            options.niceness = jsonContent.niceness;
          }else{
            options.niceness = 0;
          }
          
          options.cwd = workDir,
          options.captureStdout = false;

          ffmpegProcess
          .on('progress', function(progression){
            sendAsJson(ws,new Messages.StatusMsg(progression.percent,progression));
          })
          .on('end', function(finalMessage){
            sendAsJson(ws,new Messages.FinalMsg(0,finalMessage.message,finalMessage));
          })
          .on('error', function(finalMessage){
            console.error("Ffmpeg error received",finalMessage.message);
            sendAsJson(ws,new Messages.FinalMsg(1,finalMessage.message,""));
          })
          .exec(jsonContent.args, options);
        }else if(jsonContent.command === "kill" && ffmpegProcess != null){
          //ffmpegProcess
          ffmpegProcess.kill(jsonContent.signal);
        }else if(jsonContent.command === "set_priority" && ffmpegProcess != null){
          //ffmpegProcess
          ffmpegProcess.renice(jsonContent.niceness);
        }else{
          //Invalid command cancel process
          if(ffmpegProcess != null){
            ffmpegProcess.kill();
            sendAsJson(ws,new Messages.FinalMsg(400,"Bad request invalid message while processing "+message));
          }else{
            sendAsJson(ws,new Messages.FinalMsg(400,"Bad request invalid control request while not processing "+message));
          } 
        }
      } catch (err) {
        console.error("Error received",err,command);
        sendAsJson(ws,new Messages.FinalMsg(500,"Unexpected error :"+err));
      }
  });
});

function sendAsJson(ws,msg){
  //console.log('sending ',msg);
  ws.send(JSON.stringify(msg), function ack(error) {
    // If error is not defined, the send has been completed, otherwise the error
    // object will indicate what failed.
    if(typeof error !== 'undefined'){
      //console.log('Socket error',error);
    }

  });
}

//// Web socket keep alive ////
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

//Start the server
server.listen(config.port, config.address, function listening() {
  console.log('Listening on %s:%d', server.address().address, server.address().port);
});