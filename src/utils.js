class Utils{
    computeBitrate(mode,codec,resolution_width){
        //TODO use interpolation with config
        return 4800;
    }
    
    replaceOptionsTokens(options,frames_per_seg){
        var outputOtions = [];
        for( var option in options){
            if(option.indexOf("%frames_per_seg") > -1){
            outputOtions.push(option.replace("%frames_per_seg",frames_per_seg.toString()));
            }else{
            outputOtions.push(option);
            }
        }
        return outputOtions;
    }

    parseFilePath(filepath){
        var fileInfos = {}
        fileInfos.filename = filepath.replace(/^.*[\\\/]/, '')
        fileInfos.ext = fileInfos.filename.substr(fileInfos.filename.lastIndexOf('.') + 1);
        fileInfos.baseName = fileInfos.filename.substr(0,fileInfos.filename.lastIndexOf('.'));
        return fileInfos;
    }
}

module.exports = new Utils()
