const Ffmpeg = require('fluent-ffmpeg');
const Messages = require('./messages.js');
var fs = require('fs'); 

class Transcoder {
  constructor(){
    this.formats = "";
    this.codecs = "";
    this.encoders = "";
    this.filters = "";
    this.config={};
  }
  
  // Check ressources availables
  initialize(confFile){

    console.log("Checking ffmpeg encoders \n");
    var supported_encoders = [];
    var ffcommand = Ffmpeg();
    var self = this;
    
    //Get all ffmpeg infos asynchronously
    var formats_promise = new Promise(function(resolve, reject) {
      Ffmpeg.getAvailableFormats(
      function (err,data){
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      })
    });
    
    var codecs_promise = new Promise(function(resolve, reject) {
      Ffmpeg.getAvailableCodecs(
      function (err,data){
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      })
    });

    var encoders_promise = new Promise(function(resolve, reject) {
    	// Do async job
      Ffmpeg.getAvailableEncoders(
        function (err,data){
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        })
    });

    var filters_promise = new Promise(function(resolve, reject) {
    	// Do async job
      Ffmpeg.getAvailableFilters(
        function (err,data){
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        })
    });

    return Promise.all([formats_promise, codecs_promise, encoders_promise,filters_promise]).then(function(values) {
      console.log(values[2]);
      console.log("Loading configuration \n");
      //console.dir(codecs);
      self.formats = values[0];
      self.codecs = values[1];
      self.encoders = values[2];
      self.filters = values[3];
      return self.parseConfig(confFile,self.codecs);
    })
  }
    
  //Parse transcode command
  processCommand(jsonCommand, onProgression, onFinish){
    
    var command = jsonCommand.command,
    input = jsonContent.input,   // file name to transcode ( xxx.mp4
    output = jsonContent.output, // file name to transcode to or append (xxx.mpd or xxx.mp4)
    priority = jsonContent.priority;
    
    console.log("Processing command ",jsonCommand);
    if(jsonContent.command ){
      switch(jsonContent.command){
        case "transcode":
          var live = jsonCommand.live;
          if(live){
            transcodeLive(input,output,priority);
          }else{
            transcodeOffline(input,output,priority);
          }
        case "create_mp4":
          transcodeLive(input,output,priority);
        default:
          const err = new Error('Invalid command value received, ',jsonContent.command);
          console.log(err,command);
          throw err;
      }
    }else{
      const err = new Error('Invalid command received, (no command field)');
      console.log(err,command);
      throw err;
    }
  }
  
  transcodeOffline(input,output,priority, onProgression, onFinish){
    fs.exists(input, function(exists) { 
      if (exists) {
        console.log('running ffmpeg'); 
        // do        
        var filename = input.replace(/^.*[\\\/]/, '')
        var ext = filename.substr(filename.lastIndexOf('.') + 1);
        var baseName = filename.substr(0,filename.lastIndexOf('.'));
        var streamId = 0;
        var iframeDist = 24;
        var ffcommand = Ffmpeg(input)
        .noAudio()
        .addOptions([
          '-sn'
        ])
        .videoCodec('libx264')
        .addOptions([
          '-b:v:0 4800k',
          '-profile main',
          '-keyint_min '+iframeDist.toString(),
          '-g '+iframeDist.toString(),
          '-sc_threshold 0',
          '-b_strategy 0',
          '-use_timeline 1',
          '-use_template 1',
          '-single_file 1',
          '-single_file_name '+baseName+streamId.toString()+'.mp4'          
        ])
        .on('error', function(err) {
          console.log('An error occurred: ' + err.message);
        })
        .on('end', function() {
          console.log('Processing finished !');
        })
        .on('progress', function(progress) {
          console.log('Processing: ' + progress.percent + '% done');
        })
        .on('stderr', function(stderrLine) {
          console.log('Stderr output: ' + stderrLine);
        })
        .on('start', function() {
          console.log('Starting');
        })
        .addOutputOptions('-f dash')
        .save(output);
        console.log(ffcommand);
        //.save(output);
      }else{
        console.log("File node found "+input);
        onFinish(new Messages.FinalMsg(404,"File node found "+input,null));
      }
    }); 
    
    
  }
  
  transcodeLive(input,output,priority, onProgression, onFinish){
  
  }

  createMP4(input,output,streams,priority, onProgression, onFinish){
  
  }

  parseConfig(confFile, supportedEncoders){
    var confRaw = fs.readFileSync(confFile);
    var _config = JSON.parse(confRaw);

    this.config.segment_duration = _config.segment_duration;
    this.config.encoders = _config.encoders;
    
    // Extracting encoders
    for (var key in _config.encoders.offline) {
      if(key in supportedEncoders){
        this.config.encoders.offline[key] = _config.encoders.offline[key];
      }else{
        console.warn('Offline Encoder ',key,' not supported');
      }
    }

    for (var key in _config.encoders.live) {
      if(key in supportedEncoders){
        this.config.encoders.live[key] = _config.encoders.live[key];
      }else{
        console.warn('Live Encoder ',key,' not supported');
      }
    }

    if(Object.keys(this.config.encoders.offline) == 0){
      console.warn('No offline encoders supported');
    }

    if(Object.keys(this.config.encoders.offline) == 0){
      console.warn('No live encoders supported');
    }

    if(Object.keys(this.config.encoders.offline) == 0 && Object.keys(this.config.encoders.offline) == 0){
      return false;
    }else{
      return true;
    }
  }
    

}
  
  


module.exports = new Transcoder()
