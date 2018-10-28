const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const si = require('systeminformation');

const FfmpegCmd = require('./src/ffmpeg/ffmpeg.js');
const Messages = require('./src/messages.js')

// Create http and ws server
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// load configuration
var config = {};

if(process.argv.length <= 2){
  console.log("Using default config");
  config.working_dir="./";
  config.port=7000;
  config.address="0.0.0.0";
}else{
  let confPath = process.argv[2];
  try{
    var confRaw = fs.readFileSync(confPath);
    config = JSON.parse(confRaw);
  }catch(error){
    console.error("Unable to load configuration: ",error);
    process.exit();
  }
}


var workDir = config.working_dir;
console.log("Using working directory: ",workDir)

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

// Return hw infos on this computer
app.get('/hw_infos', function (req, res) {
  Promise.all([si.cpu(),si.graphics(),si.osInfo()]).then( (values) => {
      var output = {};
      output.cpu = values[0];
      output.graphics = values[1].controllers;
      output.os = values[2];
      res.send(output);
    })
    .catch( (err) => {
      res.status(500);
      res.send(err);
    });   
});

// Return load infos on this computer
app.get('/load_infos', function (req, res) {
  si.currentLoad().then( (values) => {
      res.send(values);
    })
    .catch( (err) => {
      res.status(500);
      res.send(err);
    }); 
});

// Return streams infos of file given in the url
app.get('/ffprobe/*', function (req, res) {
  var filePath = req.params[0];
  var ffmpegcmd = FfmpegCmd();
  var file = "";
  if(filePath[0] === '/'){
    file = filePath;
  }else{
    file = workDir+"/"+filePath;
  }
  ffmpegcmd.ffprobe(file, function(err, metadata) {
    if(err){
      res.status(500);
      res.send(err);
      console.error("Failed to run ffprobe on ",file, " error: ",err);
    }else{
      res.send(metadata);
    }
  });
});

// Setup websocket to process ffmpeg commands
wss.on('connection', function connection(ws) {
  console.log('New ws connection');
  var ffmpegProcess = null;
  var beforeStartingKillSignal = null; // handle kill signal received before the ffmpeg command
  var beforeStartingNiceness = null;  // handle priority request received before the ffmpeg command 

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
          ffmpegProcess = new FfmpegCmd();

          //build option
          var options = {};
          if(beforeStartingNiceness){
            options.niceness = beforeStartingNiceness;
          }else if(jsonContent.niceness){
            options.niceness = jsonContent.niceness;
          }else{
            options.niceness = 0;
          }
          
          options.cwd = workDir,
          options.captureStdout = false;

          var minTimeBetweenProgressions = 0;
          var lastProgression = null;
          if(jsonContent.min_time_btw_progressions){ // in msec
            minTimeBetweenProgressions = jsonContent.min_time_btw_progressions;
          }

          console.log("Launching command: ffmpeg "+jsonContent.args.join(" "));
          ffmpegProcess
          .on('progress', function(progression){
            let currentTime = new Date().getTime()
            if(lastProgression == null || (currentTime - lastProgression)>minTimeBetweenProgressions){
              if(!progression.percent){
                sendAsJson(ws,new Messages.StatusMsg(0,progression));
              }else{
                sendAsJson(ws,new Messages.StatusMsg(progression.percent,progression));
              }
              lastProgression = currentTime
            }
          })
          .on('end', function(finalMessage){
            sendAsJson(ws,new Messages.FinalMsg(0,finalMessage.message,finalMessage));
          })
          .on('error', function(finalMessage, stdout, stderr){
            console.error("Failed to transcode command ",finalMessage.message, stderr)
            sendAsJson(ws,new Messages.FinalMsg(1,finalMessage.message,""));
          })
          .exec(jsonContent.args, options);

          if(beforeStartingKillSignal){
            ffmpegProcess.kill(beforeStartingKillSignal);
          }
        }else if(jsonContent.command === "kill"){
          if(ffmpegProcess == null){
            beforeStartingKillSignal = jsonContent.signal;
          }else{
            ffmpegProcess.kill(jsonContent.signal);
          }
        }else if(jsonContent.command === "set_priority"){
          //ffmpegProcess
          if(ffmpegProcess == null){
            beforeStartingNiceness = jsonContent.niceness;
          }else{
            ffmpegProcess.renice(jsonContent.niceness);
          }
        }else{
          //Invalid command cancel process
          if(ffmpegProcess != null){
            ffmpegProcess.kill(); 
          }
          console.warn("Bad request invalid message: "+message);
          sendAsJson(ws,new Messages.FinalMsg(400,"Bad request invalid message: "+message));
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