// Code based on fluent-ffmpeg library sources but modified to 
// launch direct ffmpeg commands

const util = require('util');
const path = require('path');
var EventEmitter = require('events').EventEmitter;

//var utils = require('./node_modules/fluent-ffmpeg/lib/utils.js');
var utils = require('./utils');

function FfmpegCommand(workingDir/*options*/) {
    // Make 'new' optional
    if (!(this instanceof FfmpegCommand)) {
        return new FfmpegCommand(/*options*/);
    }

    EventEmitter.call(this);

    // Set default option values
    // options.stdoutLines = 'stdoutLines' in options ? options.stdoutLines : 100;
    // options.presets = options.presets || options.preset || path.join(__dirname, 'presets');
    // options.niceness = options.niceness || options.priority || 0;

    this.options = {};
    if(workingDir){
      this.options.cwd = workingDir;
    }else{
      this.options.cwd = "./";
    }
    

    // Save options
    //this.options = options;

    // Setup logger
    this.logger = /*options.logger ||*/ {
        debug: function() {},
        info: function() {},
        warn: function() {},
        error: function() {}
    };

}

util.inherits(FfmpegCommand, EventEmitter);



/* Add processor methods */
require('./capabilities.js')(FfmpegCommand.prototype);
require('./rawprocessor.js')(FfmpegCommand.prototype);
// require('./node_modules/fluent-ffmpeg/lib/options/inputs')(FfmpegCommand2.prototype);
// require('./node_modules/fluent-ffmpeg/lib/options/audio')(FfmpegCommand2.prototype);
// require('./node_modules/fluent-ffmpeg/lib/options/video')(FfmpegCommand2.prototype);
// require('./node_modules/fluent-ffmpeg/lib/options/videosize')(FfmpegCommand2.prototype);
// require('./node_modules/fluent-ffmpeg/lib/options/output')(FfmpegCommand2.prototype);
// require('./node_modules/fluent-ffmpeg/lib/options/custom')(FfmpegCommand2.prototype);
// require('./node_modules/fluent-ffmpeg/lib/options/misc')(FfmpegCommand2.prototype);

FfmpegCommand.setFfmpegPath = function(path) {
    (new FfmpegCommand()).setFfmpegPath(path);
  };
  
  FfmpegCommand.setFfprobePath = function(path) {
    (new FfmpegCommand()).setFfprobePath(path);
  };
  
  FfmpegCommand.setFlvtoolPath = function(path) {
    (new FfmpegCommand()).setFlvtoolPath(path);
  };
  
  FfmpegCommand.availableFilters =
  FfmpegCommand.getAvailableFilters = function(callback) {
    (new FfmpegCommand()).availableFilters(callback);
  };
  
  FfmpegCommand.availableCodecs =
  FfmpegCommand.getAvailableCodecs = function(callback) {
    (new FfmpegCommand()).availableCodecs(callback);
  };
  
  FfmpegCommand.availableFormats =
  FfmpegCommand.getAvailableFormats = function(callback) {
    (new FfmpegCommand()).availableFormats(callback);
  };
  
  FfmpegCommand.availableEncoders =
  FfmpegCommand.getAvailableEncoders = function(callback) {
    (new FfmpegCommand()).availableEncoders(callback);
  };

  /* Add ffprobe methods */

require('./ffprobe.js')(FfmpegCommand.prototype);

FfmpegCommand.ffprobe = function(file) {
  var instance = new FfmpegCommand(file);
  instance.ffprobe.apply(instance, Array.prototype.slice.call(arguments, 1));
};

/* Add high level functions */

FfmpegCommand.prototype.getInfos = async function(){
  ffmpeg = new FfmpegCommand();
  //Get all ffmpeg infos asynchronously
  var formats_promise = new Promise(function(resolve, reject) {
    ffmpeg.getAvailableFormats(
    function (err,data){
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    })
  });
  
  var codecs_promise = new Promise(function(resolve, reject) {
    ffmpeg.getAvailableCodecs(
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
    ffmpeg.getAvailableEncoders(
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
    ffmpeg.getAvailableFilters(
      function (err,data){
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      })
  });

  const [formats, codecs, encoders, filters] = await Promise.all([formats_promise, codecs_promise, encoders_promise,filters_promise]);
  var output = {};
  output.format = formats;
  output.codecs = codecs;
  output.encoders = encoders;
  output.filters = filters;

  return output; 
};

module.exports = FfmpegCommand;