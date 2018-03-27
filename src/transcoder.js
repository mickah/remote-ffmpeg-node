const Ffmpeg = require('fluent-ffmpeg');
const Messages = require('./messages.js');
var fs = require('fs'); 

class Transcoder {
  constructor(){
    this.formats = "";
    this.codecs = "";
    this.encoders = "";
    this.filters = "";
  }
  
  // Check ressources availables
  initialize(){
    var ffcommand = Ffmpeg();
    var self = this;
    Ffmpeg.getAvailableFormats(function(err, formats) {
      //console.log('Available formats:');
      //console.dir(formats);
      self.formats = formats;
    });
    
    Ffmpeg.getAvailableCodecs(function(err, codecs) {
      //console.log('Available codecs:');
      //console.dir(codecs);
      self.codecs = codecs;
    });

    Ffmpeg.getAvailableEncoders(function(err, encoders) {
      //console.log('Available encoders:');
      //console.dir(encoders);
      self.encoders = encoders;
    });

    Ffmpeg.getAvailableFilters(function(err, filters) {
      //console.log("Available filters:");
      //console.dir(filters);
      self.filters = filters;
    });
    return true;
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
  
  
}

module.exports = new Transcoder()
