var ERROR_CODES = {
  "success":0,
  "fileNotFound":404,
  "unknown":-1000
}
Object.freeze(ERROR_CODES)
module.exports.ERROR_CODES = ERROR_CODES;

class StatusMsg {
  constructor(code,progression,data){
    this.code = code;
    this.progression = progression;
    this.data = data;
  }
  
  getJson(){
    var status = {code:this.code, progression:this.progression, data:this.data};
    return JSON.stringify(status);
  }
}

class FinalMsg {
  constructor(code,msg,data){
    this.code = code;
    this.msg = msg;
    this.data = data;
  }
  
  getJson(){
    var status = {code:this.code, msg:this.progression, data:this.data};
    return JSON.stringify(status);
  }
}



module.exports.StatusMsg = StatusMsg
module.exports.FinalMsg = FinalMsg
